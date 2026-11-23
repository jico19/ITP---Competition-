import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminNav from '../../components/AdminNav'
import CodeEditor from '../../components/CodeEditor'
import Terminal from '../../components/Terminal'
import { usePyEngine } from '../../hooks/usePyEngine'
import { getReadableError } from '../../lib/errors'
import { formatTestResults } from '../../lib/formatTestResults'
import { runPython } from '../../lib/pyRunner'
import { supabase } from '../../lib/supabase'

const emptyForm = {
  title: '',
  tier: 'easy',
  type: 'python',
  description: '',
  starter_code: '',
  points: 10,
  sort_order: 0,
  published: false,
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

function blankTest() {
  return { key: makeId(), kind: 'stdin', stdin: '', call: '', expected: '', visible: false }
}

function blankRubric() {
  return { key: makeId(), label: '', points: 10 }
}

function rowsFromTests(tests) {
  if (!Array.isArray(tests) || tests.length === 0) return [blankTest()]
  return tests.map((test) => ({
    key: makeId(),
    kind: test.call ? 'call' : 'stdin',
    stdin: test.stdin ?? '',
    call: test.call ?? '',
    expected: test.expected ?? '',
    visible: Boolean(test.visible),
  }))
}

function testsFromRows(rows) {
  return rows.map((row) =>
    row.kind === 'call'
      ? { call: row.call, expected: row.expected, visible: row.visible }
      : { stdin: row.stdin, expected: row.expected, visible: row.visible },
  )
}

function rowsFromRubric(rubric) {
  if (!Array.isArray(rubric) || rubric.length === 0) return []
  return rubric.map((item) => ({
    key: makeId(),
    label: item.label ?? '',
    points: item.points ?? 0,
  }))
}

function rubricFromRows(rows) {
  return rows.map((row) => ({ label: row.label.trim(), points: Number(row.points) }))
}

function TestRow({ row, index, onChange, onRemove }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-700">Test {index + 1}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-medium text-rose-700 hover:underline"
        >
          Remove
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-slate-600">
          Type
          <select
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
            value={row.kind}
            onChange={(event) => onChange({ kind: event.target.value })}
          >
            <option value="stdin">stdin / stdout</option>
            <option value="call">function call</option>
          </select>
        </label>

        <label className="flex items-end gap-2 pb-1.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={row.visible}
            onChange={(event) => onChange({ visible: event.target.checked })}
          />
          Visible to players
        </label>
      </div>

      {row.kind === 'stdin' ? (
        <label className="mt-3 block text-xs font-medium text-slate-600">
          Input (stdin)
          <textarea
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 font-mono text-sm"
            rows={2}
            value={row.stdin}
            onChange={(event) => onChange({ stdin: event.target.value })}
            placeholder="Ana"
          />
        </label>
      ) : (
        <label className="mt-3 block text-xs font-medium text-slate-600">
          Call expression
          <input
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 font-mono text-sm"
            value={row.call}
            onChange={(event) => onChange({ call: event.target.value })}
            placeholder="evens([1, 2, 3])"
          />
        </label>
      )}

      <label className="mt-3 block text-xs font-medium text-slate-600">
        Expected
        <textarea
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 font-mono text-sm"
          rows={2}
          value={row.expected}
          onChange={(event) => onChange({ expected: event.target.value })}
          placeholder={row.kind === 'call' ? '[2]' : 'Hello, Ana!'}
        />
      </label>
      <p className="mt-1 text-xs text-slate-500">
        {row.kind === 'call'
          ? 'Use Python repr, e.g. [2, 4] or'
          : 'One line per input() call. Trailing whitespace is ignored.'}
        {row.kind === 'call' ? " 'cy'." : ''}
      </p>
    </div>
  )
}

function RubricRow({ row, index, onChange, onRemove }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <label className="min-w-[12rem] flex-1 text-xs font-medium text-slate-600">
        Criterion {index + 1}
        <input
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          value={row.label}
          onChange={(event) => onChange({ label: event.target.value })}
          placeholder="Add a task"
        />
      </label>
      <label className="text-xs font-medium text-slate-600">
        Points
        <input
          className="mt-1 w-24 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          type="number"
          min="1"
          value={row.points}
          onChange={(event) => onChange({ points: event.target.value })}
        />
      </label>
      <button
        type="button"
        onClick={onRemove}
        className="pb-1.5 text-xs font-medium text-rose-700 hover:underline"
      >
        Remove
      </button>
    </div>
  )
}

function TestItPanel({ tests, initialCode }) {
  const engine = usePyEngine()
  const [solution, setSolution] = useState(initialCode)
  const [lines, setLines] = useState([])
  const [running, setRunning] = useState(false)

  async function handleRun() {
    if (running || !engine.ready) return
    setRunning(true)

    const revealedTests = tests.map((test) => ({ ...test, visible: true }))
    setLines([{ kind: 'info', text: `Running ${revealedTests.length} test(s)...` }])

    try {
      const result = await runPython(solution, revealedTests)
      setLines([
        ...formatTestResults(result.results),
        {
          kind: 'summary',
          text: `Passed ${result.passed}/${result.total} tests`,
        },
      ])
    } catch (err) {
      setLines([{ kind: 'error', text: getReadableError(err, 'Python run failed.') }])
    } finally {
      setRunning(false)
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Test it</h2>
        <button
          type="button"
          onClick={() => setSolution(initialCode)}
          className="text-xs font-medium text-slate-600 hover:underline"
        >
          Reset to starter code
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Run a reference solution through the same engine. Nothing is submitted or scored.
      </p>

      <div className="mt-4">
        <CodeEditor title="Reference solution" value={solution} onChange={setSolution} />
      </div>
      <button
        type="button"
        onClick={handleRun}
        disabled={running || !engine.ready}
        className="mt-4 w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {running ? 'Running tests...' : 'Run tests'}
      </button>
      <Terminal lines={lines} engine={engine} />
    </section>
  )
}

export default function ChallengeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(emptyForm)
  const [testRows, setTestRows] = useState([blankTest()])
  const [rubricRows, setRubricRows] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return

    let active = true

    async function load() {
      try {
        const { data, error: fetchError } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', id)
          .maybeSingle()
        if (!active) return
        if (fetchError) throw fetchError
        if (!data) {
          setLoadError('Challenge not found.')
          setLoading(false)
          return
        }

        setForm({
          title: data.title ?? '',
          tier: data.tier ?? 'easy',
          type: data.type ?? 'python',
          description: data.description ?? '',
          starter_code: data.starter_code ?? '',
          points: data.points ?? 10,
          sort_order: data.sort_order ?? 0,
          published: Boolean(data.published),
        })
        setTestRows(rowsFromTests(data.tests))
        setRubricRows(rowsFromRubric(data.rubric))
        setLoading(false)
      } catch (err) {
        if (!active) return
        setLoadError(getReadableError(err, 'Could not load challenge.'))
        setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [id, isEdit])

  function updateField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  function updateRow(setter, key, patch) {
    setter((previous) =>
      previous.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    )
  }

  function validate(cleanTests, cleanRubric, points, order) {
    if (!form.title.trim()) return 'Title is required.'
    if (!form.description.trim()) return 'Description is required.'
    if (!Number.isInteger(points) || points <= 0) return 'Points must be a positive whole number.'
    if (!Number.isInteger(order)) return 'Order must be a whole number.'

    if (form.type === 'python') {
      if (cleanTests.length === 0) return 'Add at least one test.'
      for (const [index, test] of cleanTests.entries()) {
        if (test.call !== undefined && !test.call.trim()) {
          return `Test ${index + 1} needs a call expression.`
        }
      }
      return null
    }

    if (cleanRubric.length === 0) return 'Add at least one rubric criterion.'
    const seenLabels = new Set()
    for (const [index, item] of cleanRubric.entries()) {
      const label = item.label.trim()
      if (!label) return `Criterion ${index + 1} needs a label.`
      if (seenLabels.has(label.toLowerCase())) return 'Rubric labels must be unique.'
      seenLabels.add(label.toLowerCase())
      if (!Number.isInteger(item.points) || item.points <= 0) {
        return `Criterion ${index + 1} needs positive whole-number points.`
      }
    }
    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const points = Number(form.points)
    const order = Number(form.sort_order)
    const cleanTests = form.type === 'python' ? testsFromRows(testRows) : []
    const cleanRubric = form.type === 'web' ? rubricFromRows(rubricRows) : []

    const validationError = validate(cleanTests, cleanRubric, points, order)
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        tier: form.tier,
        type: form.type,
        description: form.description.trim(),
        starter_code: form.type === 'python' ? form.starter_code : '',
        tests: cleanTests,
        rubric: cleanRubric,
        points,
        sort_order: order,
        published: form.published,
      }

      const result = isEdit
        ? await supabase.from('challenges').update(payload).eq('id', id)
        : await supabase.from('challenges').insert(payload)
      if (result.error) throw result.error

      navigate('/admin/challenges')
    } catch (err) {
      setError(getReadableError(err, 'Could not save challenge.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-svh bg-slate-50 px-4 py-10 text-slate-900">
        <p className="text-sm text-slate-600">Loading challenge...</p>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="min-h-svh bg-slate-50 px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p>{loadError}</p>
          <Link to="/admin/challenges" className="mt-3 inline-block underline">
            Back to challenges
          </Link>
        </div>
      </main>
    )
  }

  const rubricTotal = rubricRows.reduce(
    (sum, row) => sum + (Number(row.points) || 0),
    0,
  )

  return (
    <main className="min-h-svh bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header>
          <p className="text-sm font-medium text-slate-500">ITP Competition</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {isEdit ? 'Edit challenge' : 'New challenge'}
          </h1>
          <AdminNav />
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Title
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  required
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Tier
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  value={form.tier}
                  onChange={(event) => updateField('tier', event.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Type
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(event) => updateField('type', event.target.value)}
                >
                  <option value="python">Python</option>
                  <option value="web">Web</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Max points
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  type="number"
                  min="1"
                  value={form.points}
                  onChange={(event) => updateField('points', event.target.value)}
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Order
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  type="number"
                  value={form.sort_order}
                  onChange={(event) => updateField('sort_order', event.target.value)}
                />
              </label>

              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Description
                <textarea
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  rows={5}
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  required
                />
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(event) => updateField('published', event.target.checked)}
                />
                Published
              </label>
            </div>
          </section>

          {form.type === 'python' ? (
            <>
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <CodeEditor
                  title="Starter code"
                  value={form.starter_code}
                  onChange={(value) => updateField('starter_code', value)}
                />
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Tests</h2>
                  <button
                    type="button"
                    onClick={() => setTestRows((previous) => [...previous, blankTest()])}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Add test
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {testRows.map((row, index) => (
                    <TestRow
                      key={row.key}
                      row={row}
                      index={index}
                      onChange={(patch) => updateRow(setTestRows, row.key, patch)}
                      onRemove={() =>
                        setTestRows((previous) => previous.filter((item) => item.key !== row.key))
                      }
                    />
                  ))}
                </div>
              </section>

              <TestItPanel
                key={id ?? 'new'}
                tests={testsFromRows(testRows)}
                initialCode={form.starter_code}
              />
            </>
          ) : (
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Scoring rubric</h2>
                <button
                  type="button"
                  onClick={() => setRubricRows((previous) => [...previous, blankRubric()])}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Add criterion
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {rubricRows.map((row, index) => (
                  <RubricRow
                    key={row.key}
                    row={row}
                    index={index}
                    onChange={(patch) => updateRow(setRubricRows, row.key, patch)}
                    onRemove={() =>
                      setRubricRows((previous) => previous.filter((item) => item.key !== row.key))
                    }
                  />
                ))}
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Rubric total: <span className="font-medium">{rubricTotal}</span> · Max points:{' '}
                <span className="font-medium">{Number(form.points) || 0}</span>
              </p>
              {rubricTotal !== Number(form.points) ? (
                <p className="mt-1 text-sm text-amber-700">
                  These do not match. Judges cannot award more than the max points.
                </p>
              ) : null}
            </section>
          )}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save challenge'}
            </button>
            <Link
              to="/admin/challenges"
              className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
