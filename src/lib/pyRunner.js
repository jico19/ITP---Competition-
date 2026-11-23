const TIMEOUT_MS = 5000

let worker = null
let readyPromise = null
let pending = null
let ready = false
let engineError = ''
let failures = 0
let nextId = 1

const listeners = new Set()

function snapshot() {
  return { ready, error: engineError }
}

function notify() {
  for (const listener of listeners) listener(snapshot())
}

function changeReady(value) {
  if (ready === value) return
  ready = value
  notify()
}

function changeError(value) {
  if (engineError === value) return
  engineError = value
  notify()
}

function createWorker() {
  const nextWorker = new Worker(new URL('../workers/pyWorker.js', import.meta.url), {
    type: 'module',
  })

  nextWorker.onmessage = ({ data }) => {
    if (data.type === 'ready') {
      failures = 0
      changeError('')
      changeReady(true)
      return
    }
    if (data.type === 'load-error') {
      if (pending) {
        clearTimeout(pending.timer)
        const job = pending
        pending = null
        job.reject(new Error(data.message || 'Python failed to load.'))
      }
      changeError(`Python failed to load: ${data.message || 'Unknown error'}`)
      changeReady(false)
      return
    }
    if (!pending || data.id !== pending.id) return

    clearTimeout(pending.timer)
    const job = pending
    pending = null
    if (data.type === 'result') job.resolve(data)
    else job.reject(new Error(data.message || 'Python run failed.'))
  }

  nextWorker.onerror = (event) => {
    event.preventDefault?.()
    if (pending) {
      clearTimeout(pending.timer)
      const job = pending
      pending = null
      job.reject(new Error(event.message || 'Python worker failed.'))
    }
    failures += 1
    if (failures <= 2) restart()
    else {
      changeError('Python engine failed to start. Refresh the page and try again.')
      changeReady(false)
    }
  }

  return nextWorker
}

function ensureWorker() {
  if (!worker) worker = createWorker()
  if (ready || engineError) return Promise.resolve()
  if (!readyPromise) {
    readyPromise = new Promise((resolve) => {
      const unsubscribe = onEngineChange((state) => {
        if (!state.ready && !state.error) return
        unsubscribe()
        resolve()
      })
    })
  }
  return readyPromise
}

function restart() {
  const oldWorker = worker
  worker = null
  readyPromise = null
  changeReady(false)
  oldWorker?.terminate()
  ensureWorker()
}

export function preloadPyodide() {
  return ensureWorker()
}

export function getEngineState() {
  return snapshot()
}

export function onEngineChange(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function runPython(code, tests) {
  return ensureWorker().then(() => {
    if (engineError) throw new Error(engineError)

    return new Promise((resolve, reject) => {
      if (pending) {
        reject(new Error('A run is already in progress.'))
        return
      }

      const id = nextId++
      const timer = setTimeout(() => {
        if (!pending || pending.id !== id) return
        pending = null
        restart()
        reject(new Error('Time limit exceeded (infinite loop?)'))
      }, TIMEOUT_MS)

      pending = { id, resolve, reject, timer }
      worker.postMessage({ type: 'run', id, code, tests })
    })
  })
}
