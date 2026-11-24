import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CodeEditor from '../components/CodeEditor'
import ConfirmModal from '../components/ConfirmModal'
import DifficultyBlocks from '../components/DifficultyBlocks'
import ProblemDescription from '../components/ProblemDescription'
import StatusGlyph from '../components/StatusGlyph'
import Terminal from '../components/Terminal'
import ThemeToggle from '../components/ThemeToggle'
import { useChallengeDetail } from '../hooks/useChallengeDetail'
import { useCountdown } from '../hooks/useCountdown'
import { usePyEngine } from '../hooks/usePyEngine'
import { useRoom } from '../hooks/useRoom'
import { useSession } from '../hooks/useSession'
import { getReadableError } from '../lib/errors'
import { runPython } from '../lib/pyRunner'
import { supabase } from '../lib/supabase'

function formatTimer(ms) {
  if (ms === null || ms === undefined) return '--:--'
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const seconds = String(total % 60).padStart(2, '0')
  return hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`
}

function RubricList({ items, judgeScore }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <StatusGlyph status="unsolved" label="No rubric provided." />
  }

  const rubricScores = judgeScore?.rubric_scores ?? {}

  return (
    <ul className="border border-line-strong divide-y divide-dashed divide-line">
      {items.map((item, index) => {
        const awarded = rubricScores[item.label]
        const hasScore = awarded !== undefined

        return (
          <li
            key={`${item.label}-${index}`}
            className="flex items-center justify-between gap-4 px-4 py-3 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-bold text-fg-muted" aria-hidden="true">
                {hasScore ? (awarded > 0 ? '[✓]' : '[×]') : '[ ]'}
              </span>
              <span className="truncate">{item.label}</span>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              {hasScore ? (
                <span className="font-bold tabular-nums text-fg">
                  {awarded} / {item.points} pts
                </span>
              ) : (
                <span className="font-bold tabular-nums text-fg-muted">
                  +{item.points} pts
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function Message({ title, message, link, linkLabel }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 font-mono">
      <div className="border border-line-strong bg-surface-1 p-6">
        <h1 className="text-2xl font-bold tracking-tight text-fg"># {title}</h1>
        <p className="mt-3 text-sm text-fg-muted">{message}</p>
        <Link
          to={link}
          className="mt-6 inline-flex h-10 items-center border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg hover:shadow-hard-sm"
        >
          {linkLabel}
        </Link>
      </div>
    </main>
  )
}

export default function Challenge() {
  const { id } = useParams()
  const { hydrated, profile } = useSession()
  const roomQuery = useRoom(profile?.room_id)
  const {
    challenge,
    solved,
    submissions = [],
    judgeScore = null,
    loading,
    error,
  } = useChallengeDetail(id, profile?.id)
  const remaining = useCountdown(roomQuery.room?.ends_at)
  const engine = usePyEngine()

  // Solving state
  const [code, setCode] = useState('')
  const [initializedCode, setInitializedCode] = useState(false)
  const [cursor, setCursor] = useState({ line: 1, col: 1 })
  const [running, setRunning] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [stdoutText, setStdoutText] = useState('')
  const [summary, setSummary] = useState(null)
  const [leftTab, setLeftTab] = useState('desc')
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [localSubmissions, setLocalSubmissions] = useState([])

  // Initialize code when challenge loads
  if (challenge && !initializedCode) {
    setCode(challenge.starter_code ?? '')
    setInitializedCode(true)
  }

  if (!hydrated || loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 font-mono">
        <StatusGlyph status="loading" label="Loading challenge..." />
      </main>
    )
  }

  if (!profile) {
    return (
      <Message
        title="Join a room first"
        message="You need to join a room before viewing challenges."
        link="/"
        linkLabel="$ go to join"
      />
    )
  }

  if (error || !challenge) {
    return (
      <Message
        title={error ? 'Could not load challenge' : 'Challenge not found'}
        message={error || 'It may be unpublished or the link may be wrong.'}
        link="/challenges"
        linkLabel="← back to board"
      />
    )
  }

  const isWeb = challenge.type === 'web'
  const timeUp = roomQuery.room?.status === 'ended' || (remaining !== null && remaining <= 0)
  const locked = roomQuery.room?.status !== 'live' || timeUp
  const lockNote = timeUp
    ? "Time's up. Submissions are closed."
    : 'Solving unlocks when the admin starts the round.'

  const tests = Array.isArray(challenge.tests) ? challenge.tests : []
  const rubricItems = Array.isArray(challenge.rubric) ? challenge.rubric : []
  const allSubmissions = [...localSubmissions, ...submissions]
  const challengeNumber = String(challenge.sort_order ?? 1).padStart(3, '0')
  const tag = isWeb ? 'WEB' : (challenge.tier ? challenge.tier.toUpperCase() : 'ALGO')

  const passedCount = testResults ? testResults.filter((r) => r.passed).length : 0

  // Run tests logic (Python only)
  async function executeRun() {
    if (locked || running || !engine.ready || isWeb) return null
    setRunning(true)
    setSummary({ kind: 'running', text: `[…] RUNNING · running ${tests.length} test(s)` })

    let outcome
    try {
      outcome = await runPython(code, tests)
      setTestResults(outcome.results)

      // Collect stdout
      const stdouts = outcome.results
        .filter((r) => r.stdout)
        .map((r, i) => `--- case ${i + 1} ---\n${r.stdout}`)
        .join('\n\n')
      setStdoutText(stdouts)

      const allPassed = tests.length > 0 && outcome.passed === outcome.total
      if (allPassed) {
        setSummary({ kind: 'accepted', text: `[✓] ACCEPTED · all ${tests.length} tests passed` })
      } else {
        const firstFail = outcome.results.findIndex((r) => !r.passed)
        setSummary({
          kind: 'wrong',
          text: `[!] WRONG ANSWER · case ${firstFail >= 0 ? firstFail + 1 : 1}/${tests.length}`,
        })
      }
      return outcome
    } catch (err) {
      const message = getReadableError(err, 'Python run failed.')
      setSummary({ kind: 'error', text: `[!] ERROR · ${message}` })
      return null
    } finally {
      setRunning(false)
    }
  }

  // Submit logic (Python only - Option A)
  async function handleSubmit() {
    if (locked || running || isWeb) return

    let outcome = null
    const alreadyAllPassed = testResults && testResults.length > 0 && testResults.every((r) => r.passed)

    if (alreadyAllPassed) {
      outcome = { passed: testResults.length, total: testResults.length }
    } else {
      outcome = await executeRun()
    }

    if (!outcome) return

    const allPassed = tests.length > 0 && outcome.passed === outcome.total

    try {
      const { data, error: subError } = await supabase
        .from('submissions')
        .insert({
          challenge_id: challenge.id,
          code,
          passed: outcome.passed,
          total: outcome.total,
        })
        .select('id, passed, total, points, created_at')
        .single()

      if (subError) throw subError

      if (data) {
        setLocalSubmissions((prev) => [data, ...prev])
      }

      if (allPassed) {
        setSummary({
          kind: 'accepted',
          text: `[✓] ACCEPTED · solution submitted! +${data.points} pts`,
        })
      }
    } catch (err) {
      setSummary({
        kind: 'error',
        text: `[!] SUBMISSION FAILED · ${getReadableError(err, 'Could not save submission.')}`,
      })
    }
  }

  function handleResetConfirm() {
    setCode(challenge.starter_code ?? '')
    setTestResults(null)
    setStdoutText('')
    setSummary(null)
    setResetModalOpen(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg text-fg font-mono">
      {/* Top Header Bar matching ui-pics/3 · Puzzle Solving View */}
      <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-line-strong bg-bg px-4 md:px-6">
        <div className="flex items-center gap-6 min-w-0">
          <Link
            to="/challenges"
            className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs text-fg hover:underline cursor-pointer"
          >
            &lt; BOARD
          </Link>
          <span className="font-bold text-sm tracking-tight truncate text-fg">
            {challengeNumber} {challenge.title}
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span
            className="font-bold text-sm tabular-nums tracking-wider text-fg"
            aria-label={`Time remaining: ${formatTimer(remaining)}`}
          >
            {formatTimer(remaining)}
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Two-Pane Split View */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Left Pane: Problem Description & Info */}
        <section className="flex flex-col border-b lg:border-b-0 lg:border-r border-line-strong bg-surface-1 overflow-y-auto">
          {/* Left Pane Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-line px-6 py-3 bg-surface-1">
            <button
              type="button"
              onClick={() => setLeftTab('desc')}
              className={`h-7 px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                leftTab === 'desc'
                  ? 'bg-invert-bg text-invert-fg'
                  : 'border border-line text-fg-muted hover:text-fg'
              }`}
            >
              DESC
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('examples')}
              className={`h-7 px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                leftTab === 'examples'
                  ? 'bg-invert-bg text-invert-fg'
                  : 'border border-line text-fg-muted hover:text-fg'
              }`}
            >
              {isWeb ? 'REQUIREMENTS' : 'EXAMPLES'}
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('hints')}
              className={`h-7 px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                leftTab === 'hints'
                  ? 'bg-invert-bg text-invert-fg'
                  : 'border border-line text-fg-muted hover:text-fg'
              }`}
            >
              HINTS
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('discuss')}
              className={`h-7 px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                leftTab === 'discuss'
                  ? 'bg-invert-bg text-invert-fg'
                  : 'border border-line text-fg-muted hover:text-fg'
              }`}
            >
              {isWeb ? 'RUBRIC' : 'DISCUSS'}
            </button>
          </div>

          {/* Left Pane Content Body */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Title & Metadata */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-fg">
                # {challenge.title}
              </h1>

              <div className="mt-4 flex items-center gap-3">
                <span className="inline-flex h-6 items-center border border-line-strong px-2 text-[11px] uppercase tracking-widest text-fg-muted">
                  [{tag}]
                </span>
                <DifficultyBlocks tier={challenge.tier} />
                <span className="text-xs font-bold tabular-nums text-fg-muted">
                  {challenge.points} pts
                </span>
                {solved ? (
                  <StatusGlyph status="solved" inverted label="solved" />
                ) : null}
              </div>
            </div>

            {/* Tab: DESC */}
            {leftTab === 'desc' && (
              <div className="space-y-6">
                <ProblemDescription text={challenge.description} />
              </div>
            )}

            {/* Tab: EXAMPLES / REQUIREMENTS */}
            {leftTab === 'examples' && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-fg border-b border-line pb-2">
                  ## {isWeb ? 'Specifications & Requirements' : 'Worked Examples'}
                </h2>
                <ProblemDescription
                  text={challenge.description}
                  className={!isWeb ? '[&>*:not(:has(pre))]:hidden' : ''}
                />
              </div>
            )}

            {/* Tab: HINTS */}
            {leftTab === 'hints' && (
              <div className="space-y-4 text-xs leading-6 text-fg">
                <h2 className="text-sm font-bold uppercase tracking-wider text-fg border-b border-line pb-2">
                  ## Hints & Strategy
                </h2>
                {isWeb ? (
                  <>
                    <p className="text-fg-muted">
                      • Build the page with plain HTML/CSS/JS or React. Focus on fulfilling each rubric criterion.
                    </p>
                    <p className="text-fg-muted">
                      • Ensure state changes (like form submission and badges) update cleanly without page reload issues.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-fg-muted">
                      • Check input formats and constraints carefully. Ensure edge cases like 0, negative values, or single elements are handled.
                    </p>
                    <p className="text-fg-muted">
                      • Standard Python modules (e.g. <code>math</code>, <code>collections</code>, <code>itertools</code>, <code>re</code>) are available in the runtime.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Tab: DISCUSS / RUBRIC */}
            {leftTab === 'discuss' && (
              <div className="space-y-4">
                {isWeb ? (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-fg border-b border-line pb-2">
                      ## Scoring Rubric Breakdown
                    </h2>
                    <div className="mt-4">
                      <RubricList items={rubricItems} judgeScore={judgeScore} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs leading-6 text-fg">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-fg border-b border-line pb-2">
                      ## Challenge Discussion & Guidelines
                    </h2>
                    <p className="text-fg-muted">
                      • Solutions are executed directly in browser WebAssembly via Pyodide.
                    </p>
                    <p className="text-fg-muted">
                      • You can write solutions in your favorite local IDE (VS Code) and paste your code here to run test cases.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Right Pane: CONDITIONAL (Web: In-Person Judging Station; Python: Code Editor & Terminal) */}
        {isWeb ? (
          /* Web Challenge: Dedicated In-Person Judging Station */
          <section className="flex flex-col bg-surface-2 overflow-y-auto">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-line px-6 py-3 bg-surface-1">
              <span className="border border-line-strong px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-fg-muted">
                TYPE: WEB CHALLENGE
              </span>

              <div>
                {judgeScore ? (
                  <span className="bg-invert-bg text-invert-fg px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                    [✓] JUDGED · {judgeScore.points}/{challenge.points} PTS
                  </span>
                ) : (
                  <span className="border border-line-strong px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-fg-muted">
                    [•] PENDING EVALUATION
                  </span>
                )}
              </div>
            </div>

            {/* Judging Station Content */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Instructions Box */}
              <div className="border border-line-strong bg-surface-1 p-5 space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-fg border-b border-line pb-2">
                  &gt; In-Person Judging Workflow
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-xs leading-6 text-fg-muted">
                  <li>
                    <strong className="text-fg">Code locally:</strong> Develop your solution in your favorite local IDE (VS Code, browser, Vite, React, or plain HTML/CSS/JS). No backend required.
                  </li>
                  <li>
                    <strong className="text-fg">Verify rubric:</strong> Test your app thoroughly against all criteria listed in the rubric below.
                  </li>
                  <li>
                    <strong className="text-fg">Call a judge:</strong> When your application is ready, raise your hand or notify an event judge to evaluate your app at your station.
                  </li>
                </ol>
              </div>

              {/* Rubric Criteria Table */}
              <div className="border border-line-strong bg-surface-1 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-fg">
                    ## Scoring Rubric Criteria
                  </h2>
                  <span className="text-xs font-bold tabular-nums text-fg-muted">
                    Total: {challenge.points} pts
                  </span>
                </div>

                <RubricList items={rubricItems} judgeScore={judgeScore} />
              </div>

              {/* Live Judged Score Status Card */}
              <div className="border border-dashed border-line-strong bg-surface-1 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-fg-muted">
                      Evaluation Status
                    </p>
                    <p className="mt-1 text-base font-bold text-fg">
                      {judgeScore
                        ? `Score Awarded: +${judgeScore.points} pts`
                        : 'Awaiting Judge Evaluation'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold tabular-nums text-fg">
                      {judgeScore ? judgeScore.points : 0} / {challenge.points}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-fg-muted">points</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-fg-muted border-t border-line pt-3">
                  {judgeScore
                    ? 'Your web challenge has been evaluated by an event judge and your score is recorded.'
                    : 'The judge will enter your score directly from /admin/judge.'}
                </p>
              </div>
            </div>
          </section>
        ) : (
          /* Python Challenge: Code Editor & Execution Terminal */
          <section className="flex flex-col bg-surface-2 overflow-hidden">
            {/* Editor Top Bar matching ui-pics/3 */}
            <div className="flex items-center justify-between border-b border-line px-4 py-2 bg-surface-1">
              <span className="border border-line-strong px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-fg-muted">
                LANG: PYTHON
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  disabled={locked || running}
                  className="h-8 border border-line-strong px-3 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3 disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50 cursor-pointer"
                >
                  RESET
                </button>

                <button
                  type="button"
                  onClick={executeRun}
                  disabled={locked || running || !engine.ready}
                  className="h-8 border border-line-strong px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3 disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50 cursor-pointer"
                >
                  {running ? '… RUNNING' : '&gt; RUN'}
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={locked || running || !engine.ready}
                  className="h-8 border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg hover:shadow-hard-sm transition-transform active:translate-x-0 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50 cursor-pointer"
                >
                  &gt; SUBMIT
                </button>
              </div>
            </div>

            {locked ? (
              <div className="border-b border-dashed border-line-strong bg-surface-3 p-3 text-xs" role="status">
                <StatusGlyph status="locked" label={lockNote} />
              </div>
            ) : null}

            {/* Editor Area */}
            <div className="flex-1 min-h-[300px]">
              <CodeEditor
                key={challenge.id}
                value={code}
                onChange={setCode}
                onCursorChange={setCursor}
                readOnly={locked}
                minHeight="280px"
              />
            </div>

            {/* Terminal / Output Panel */}
            <Terminal
              tests={tests}
              results={testResults}
              running={running}
              engine={engine}
              summary={summary}
              stdoutText={stdoutText}
              submissions={allSubmissions}
            />
          </section>
        )}
      </main>

      {/* Bottom Status Bar */}
      <footer className="flex h-7 items-center justify-between border-t border-line-strong bg-bg px-4 text-xs text-fg-muted font-mono select-none">
        {isWeb ? (
          <div className="flex items-center gap-6">
            <span>web</span>
            <span className="tabular-nums">
              status: {judgeScore ? 'judged' : 'pending judge evaluation'}
            </span>
            <span className="tabular-nums">rubric: {rubricItems.length} criteria</span>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <span>py</span>
            <span className="tabular-nums">ln {cursor.line}, col {cursor.col}</span>
            <span className="tabular-nums">tests {passedCount}/{tests.length}</span>
            <span className="tabular-nums">attempts {allSubmissions.length}</span>
          </div>
        )}

        <div className="font-bold tabular-nums text-fg">
          {isWeb && judgeScore ? `${judgeScore.points} / ` : ''}
          {challenge.points} pts
        </div>
      </footer>

      {/* Reset Confirmation Modal (Python only) */}
      {!isWeb && (
        <ConfirmModal
          isOpen={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          onConfirm={handleResetConfirm}
          title="# Reset Editor Code"
          message="Are you sure you want to reset your code to the starter template? All unsaved changes will be lost."
          confirmLabel="yes, reset"
          cancelLabel="no, keep code"
          isDestructive={true}
        />
      )}
    </div>
  )
}
