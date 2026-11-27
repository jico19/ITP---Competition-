import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import AdminNav from '../../components/AdminNav'
import CodeEditor from '../../components/CodeEditor'
import StatusGlyph from '../../components/StatusGlyph'
import Terminal from '../../components/Terminal'
import { usePyEngine } from '../../hooks/usePyEngine'
import { getReadableError } from '../../lib/errors'
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

const panelClass = 'border border-line-strong bg-surface-1 p-6'
const labelClass = 'block text-xs font-bold uppercase tracking-widest text-fg-muted'
const inputClass =
  'mt-2 h-11 w-full border border-line-strong bg-surface-2 px-3 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-fg'
const textareaClass =
  'mt-2 w-full border border-line-strong bg-surface-2 px-3 py-2 text-sm leading-6 text-fg outline-none placeholder:text-fg-faint focus:border-fg'
const secondaryButton =
  'inline-flex h-11 items-center justify-center gap-2 border border-line-strong bg-transparent px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3 disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50'
const primaryButton =
  'inline-flex h-11 items-center justify-center border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50 disabled:text-fg-muted'

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
    <div className="border border-line-strong bg-surface-2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-fg-muted">
          ## test {String(index + 1).padStart(2, '0')}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-11 items-center justify-center gap-2 border border-dashed border-line-strong px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3"
        >
          <X size={14} strokeWidth={1.75} aria-hidden="true" />
          remove
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>type</span>
          <select
            className={inputClass}
            value={row.kind}
            onChange={(event) => onChange({ kind: event.target.value })}
          >
            <option value="stdin">stdin / stdout</option>
            <option value="call">function call</option>
          </select>
        </label>

        <label className="flex items-end gap-3 pb-1 text-sm text-fg">
          <input
            type="checkbox"
            checked={row.visible}
            onChange={(event) => onChange({ visible: event.target.checked })}
            className="size-4 border border-line-strong bg-surface-2 accent-current"
          />
          visible to players
        </label>
      </div>

      {row.kind === 'stdin' ? (
        <label className={labelClass}>
          input (stdin)
          <textarea
            className={`${textareaClass} font-mono`}
            rows={2}
            value={row.stdin}
            onChange={(event) => onChange({ stdin: event.target.value })}
            placeholder="Ana"
          />
        </label>
      ) : (
        <label className={labelClass}>
          call expression
          <input
            className={`${inputClass} font-mono`}
            value={row.call}
            onChange={(event) => onChange({ call: event.target.value })}
            placeholder="evens([1, 2, 3])"
          />
        </label>
      )}

      <label className={labelClass}>
        expected
        <textarea
          className={`${textareaClass} font-mono`}
          rows={2}
          value={row.expected}
          onChange={(event) => onChange({ expected: event.target.value })}
          placeholder={row.kind === 'call' ? '[2]' : 'Hello, Ana!'}
        />
      </label>
      <p className="mt-2 text-xs text-fg-muted">
        {row.kind === 'call'
          ? "Function call test: the runner evals this call and compares the return value. Use Python repr for expected, e.g. [2, 4] or 'cy'. Players should return the value, not print it."
          : 'stdin/stdout test: one line per input() call. The runner compares captured stdout; trailing whitespace is ignored.'}
      </p>
    </div>
  )
}

function RubricRow({ row, index, onChange, onRemove }) {
  return (
    <div className="flex flex-wrap items-end gap-3 border border-line-strong bg-surface-2 p-4">
      <label className="min-w-[12rem] flex-1">
        <span className={labelClass}>criterion {String(index + 1).padStart(2, '0')}</span>
        <input
          className={inputClass}
          value={row.label}
          onChange={(event) => onChange({ label: event.target.value })}
          placeholder="Add a task"
        />
      </label>
      <label>
        <span className={labelClass}>points</span>
        <input
          className={`${inputClass} w-24 tabular-nums`}
          type="number"
          min="1"
          value={row.points}
          onChange={(event) => onChange({ points: event.target.value })}
        />
      </label>
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-11 items-center justify-center gap-2 border border-dashed border-line-strong px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3"
      >
        <X size={14} strokeWidth={1.75} aria-hidden="true" />
        remove
      </button>
    </div>
  )
}

function TestItPanel({ tests, initialCode }) {
  const engine = usePyEngine()
  const [solution, setSolution] = useState(initialCode)
  const [results, setResults] = useState(null)
  const [summary, setSummary] = useState(null)
  const [stdoutText, setStdoutText] = useState('')
  const [running, setRunning] = useState(false)

  async function handleRun() {
    if (running || !engine.ready) return
    setRunning(true)
    setResults(null)
    setStdoutText('')
    setSummary({ kind: 'running', text: `[…] RUNNING · running ${tests.length} test(s)` })

    const revealedTests = tests.map((test) => ({ ...test, visible: true }))

    try {
      const result = await runPython(solution, revealedTests)
      setResults(result.results)
      const stdouts = result.results
        .map((res, i) => (res.stdout ? `--- case ${i + 1} ---\n${res.stdout}` : null))
        .filter(Boolean)
        .join('\n\n')
      setStdoutText(stdouts)
      const allPassed = revealedTests.length > 0 && result.passed === result.total
      setSummary({
        kind: allPassed ? 'accepted' : 'wrong',
        text: allPassed
          ? `[✓] ACCEPTED · all ${result.total} tests passed`
          : `[!] WRONG ANSWER · ${result.passed}/${result.total} passed`,
      })
    } catch (err) {
      setSummary({
        kind: 'error',
        text: `[!] ERROR · ${getReadableError(err, 'Python run failed.')}`,
      })
    } finally {
      setRunning(false)
    }
  }

  return (
    <section className={panelClass}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-fg-muted">## test it</h2>
        <button
          type="button"
          onClick={() => setSolution(initialCode)}
          className="text-xs font-bold uppercase tracking-wider text-fg-muted underline-offset-4 hover:text-fg hover:underline"
        >
          reset to starter code
        </button>
      </div>
      <p className="mt-2 text-sm text-fg-muted">
        Run a reference solution through the same engine. Nothing is submitted or scored.
      </p>

      <div className="mt-4">
        <CodeEditor title="Reference solution" value={solution} onChange={setSolution} />
      </div>
      <button
        type="button"
        onClick={handleRun}
        disabled={running || !engine.ready}
        className={`mt-4 ${primaryButton}`}
      >
        {running ? '[...] running tests' : '> run'}
      </button>
      <div className="mt-6">
        <Terminal
          tests={tests.map((test) => ({ ...test, visible: true }))}
          results={results}
          running={running}
          engine={engine}
          summary={summary}
          stdoutText={stdoutText}
        />
      </div>
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
      <main className="flex min-h-svh items-center justify-center px-4 text-fg">
        <StatusGlyph status="loading" label="Loading challenge..." />
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <div className="border border-dashed border-line-strong p-6" role="alert">
          <StatusGlyph status="error" label={loadError} />
          <Link
            to="/admin/challenges"
            className="mt-4 inline-flex h-11 items-center border border-line-strong px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3"
          >
            back to challenges
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
    <main className="min-h-svh px-4 py-8 text-fg md:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <header>
          <p className="text-xs font-bold uppercase tracking-widest text-fg-muted">ITP: Exit Code 0</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-fg">
            # {isEdit ? 'Edit challenge' : 'New challenge'}
          </h1>
          <AdminNav />
        </header>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <section className={panelClass}>
            <h2 className="text-sm font-bold uppercase tracking-widest text-fg-muted">## details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className={labelClass}>title</span>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  placeholder="Sum of evens"
                  required
                />
              </label>

              <label>
                <span className={labelClass}>tier</span>
                <select
                  className={inputClass}
                  value={form.tier}
                  onChange={(event) => updateField('tier', event.target.value)}
                >
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </select>
              </label>

              <label>
                <span className={labelClass}>type</span>
                <select
                  className={inputClass}
                  value={form.type}
                  onChange={(event) => updateField('type', event.target.value)}
                >
                  <option value="python">python</option>
                  <option value="web">web</option>
                </select>
              </label>

              <label>
                <span className={labelClass}>max points</span>
                <input
                  className={`${inputClass} tabular-nums`}
                  type="number"
                  min="1"
                  value={form.points}
                  onChange={(event) => updateField('points', event.target.value)}
                />
              </label>

              <label>
                <span className={labelClass}>order</span>
                <input
                  className={`${inputClass} tabular-nums`}
                  type="number"
                  value={form.sort_order}
                  onChange={(event) => updateField('sort_order', event.target.value)}
                />
              </label>

              <label className="sm:col-span-2">
                <span className={labelClass}>description</span>
                <textarea
                  className={textareaClass}
                  rows={5}
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  placeholder="Write the full problem statement."
                  required
                />
              </label>
              <p className="text-xs text-fg-muted sm:col-span-2">
                Tip: use `backticks` around code, function names, and exact output labels to highlight them.
              </p>

              <label className="flex items-center gap-3 text-sm text-fg sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(event) => updateField('published', event.target.checked)}
                  className="size-4 border border-line-strong bg-surface-2 accent-current"
                />
                published
              </label>
            </div>
          </section>

          {form.type === 'python' ? (
            <>
              <section className={panelClass}>
                <h2 className="text-sm font-bold uppercase tracking-widest text-fg-muted">## starter code</h2>
                <div className="mt-4">
                  <CodeEditor
                    title="Starter code"
                    value={form.starter_code}
                    onChange={(value) => updateField('starter_code', value)}
                  />
                </div>
              </section>

              <section className={panelClass}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-fg-muted">## tests</h2>
                  <button
                    type="button"
                    onClick={() => setTestRows((previous) => [...previous, blankTest()])}
                    className={secondaryButton}
                  >
                    <Plus size={14} strokeWidth={1.75} aria-hidden="true" />
                    add test
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
            <section className={panelClass}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-fg-muted">## scoring rubric</h2>
                <button
                  type="button"
                  onClick={() => setRubricRows((previous) => [...previous, blankRubric()])}
                  className={secondaryButton}
                >
                  <Plus size={14} strokeWidth={1.75} aria-hidden="true" />
                  add criterion
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
              <p className="mt-4 text-xs text-fg-muted tabular-nums">
                rubric total: {rubricTotal} · max points: {Number(form.points) || 0}
              </p>
              {rubricTotal !== Number(form.points) ? (
                <div className="mt-3 border border-dashed border-line-strong p-3">
                  <StatusGlyph
                    status="error"
                    label="These do not match. Judges cannot award more than the max points."
                  />
                </div>
              ) : null}
            </section>
          )}

          {error ? (
            <div className="border border-dashed border-line-strong p-3" role="alert">
              <StatusGlyph status="error" label={error} />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className={primaryButton}>
              {saving ? '[...] saving' : '> save challenge'}
            </button>
            <Link to="/admin/challenges" className={secondaryButton}>
              cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
