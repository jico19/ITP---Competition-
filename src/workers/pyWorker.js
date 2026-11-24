import { loadPyodide } from 'pyodide'
import { PYTHON_HARNESS } from './pythonHarness'

const indexURL = `${import.meta.env.BASE_URL}pyodide/`

let pyodide = null
let loading = null

async function getPyodide() {
  if (pyodide) return pyodide
  if (!loading) {
    loading = loadPyodide({ indexURL }).then((instance) => {
      pyodide = instance
      pyodide.runPython(PYTHON_HARNESS)
      self.postMessage({ type: 'ready' })
      return instance
    })
  }
  return loading
}

self.onmessage = async (event) => {
  const message = event.data
  if (message?.type !== 'run') return

  try {
    const py = await getPyodide()
    const tests = message.tests ?? []
    const results = []

    for (const test of tests) {
      const startTime = performance.now()
      py.globals.set(
        '_payload',
        JSON.stringify({
          code: message.code,
          stdin: test.stdin ?? '',
          call: test.call ?? null,
          expected: test.expected ?? '',
          visible: Boolean(test.visible),
        }),
      )
      const res = JSON.parse(py.runPython('_run_from_payload()'))
      res.duration = Math.max(1, Math.round(performance.now() - startTime))
      results.push(res)
    }

    self.postMessage({
      type: 'result',
      id: message.id,
      results,
      passed: results.filter((result) => result.passed).length,
      total: tests.length,
    })
  } catch (error) {
    self.postMessage({
      type: 'error',
      id: message.id,
      message: error?.message ?? String(error),
    })
  }
}

// Start loading immediately. Run is disabled until `ready`, so waiting for a
// run message would deadlock the UI.
getPyodide().catch((error) => {
  self.postMessage({ type: 'load-error', message: error?.message ?? String(error) })
})
