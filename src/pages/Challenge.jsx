import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import CodeEditor from '../components/CodeEditor'
import Countdown from '../components/Countdown'
import DifficultyBlocks from '../components/DifficultyBlocks'
import ProblemDescription from '../components/ProblemDescription'
import RoundBanner from '../components/RoundBanner'
import StatusGlyph from '../components/StatusGlyph'
import Terminal from '../components/Terminal'
import { useChallengeDetail } from '../hooks/useChallengeDetail'
import { useCountdown } from '../hooks/useCountdown'
import { usePyEngine } from '../hooks/usePyEngine'
import { useRoom } from '../hooks/useRoom'
import { useSession } from '../hooks/useSession'
import { getReadableError } from '../lib/errors'
import { formatTestResults } from '../lib/formatTestResults'
import { runPython } from '../lib/pyRunner'
import { supabase } from '../lib/supabase'

function PythonWorkspace({ challenge, roomId, userId, locked, lockNote }) {
  const navigate = useNavigate()
  const engine = usePyEngine()
  const [code, setCode] = useState(challenge.starter_code ?? '')
  const [lines, setLines] = useState([])
  const [running, setRunning] = useState(false)
  const [canSubmit, setCanSubmit] = useState(false)

  async function handleRun() {
    if (locked || running || !engine.ready) return
    setRunning(true)
    setCanSubmit(false)

    const tests = Array.isArray(challenge.tests) ? challenge.tests : []
    setLines([{ kind: 'info', text: `[…] running ${tests.length} test(s)` }])

    let outcome
    try {
      const result = await runPython(code, tests)
      outcome = result
      setLines(formatTestResults(result.results))
    } catch (err) {
      const message = getReadableError(err, 'Python run failed.')
      outcome = { passed: 0, total: tests.length }
      setLines([
        {
          kind: message.includes('Time limit exceeded') ? 'time' : 'error',
          text: `${message.includes('Time limit exceeded') ? '[…] TLE' : '[!] error'}: ${message}`,
        },
      ])
    }

    const allPassed = tests.length > 0 && outcome.passed === outcome.total
    try {
      const { data, error } = await supabase
        .from('submissions')
        .insert({
          challenge_id: challenge.id,
          code,
          passed: outcome.passed,
          total: outcome.total,
        })
        .select('points')
        .single()
      if (error) throw error

      setLines((previous) => [
        ...previous,
        {
          kind: allPassed ? 'accepted' : 'wrong',
          text: `${allPassed ? '[✓] AC' : '[!] WA'} · passed ${outcome.passed}/${outcome.total} tests · +${data.points} pts`,
        },
      ])

      try {
        const { data: bonus } = await supabase
          .from('first_solves')
          .select('points')
          .eq('room_id', roomId)
          .eq('challenge_id', challenge.id)
          .eq('user_id', userId)
          .maybeSingle()
        if (bonus?.points) {
          setLines((previous) => [
            ...previous,
            { kind: 'summary', text: `[★] first solve bonus · +${bonus.points} pts` },
          ])
        }
      } catch {}

      if (allPassed) {
        setCanSubmit(true)
        setLines((previous) => [
          ...previous,
          { kind: 'info', text: '[i] all tests passed. Submit your code when ready.' },
        ])
      }
    } catch (err) {
      setLines((previous) => [
        ...previous,
        {
          kind: 'error',
          text: `[!] submission not saved: ${getReadableError(err, 'Could not save submission.')}`,
        },
      ])
    } finally {
      setRunning(false)
    }
  }

  return (
    <>
      {locked ? (
        <div className="mt-6 border border-dashed border-line-strong p-4" role="status">
          <StatusGlyph status="locked" label={lockNote} />
        </div>
      ) : null}

      <section className={`mt-6 ${locked ? 'bg-hatch p-1' : ''}`}>
        <CodeEditor
          key={challenge.id}
          value={code}
          onChange={(next) => {
            setCode(next)
            setCanSubmit(false)
          }}
          readOnly={locked}
        />
        <button
          type="button"
          onClick={canSubmit ? () => navigate('/challenges') : handleRun}
          disabled={locked || running || !engine.ready}
          className={`mt-3 h-10 w-full border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:bg-hatch disabled:text-fg-muted disabled:opacity-50`}
        >
          {locked
            ? '[×] solving locked'
            : running
              ? '[...] running tests'
              : canSubmit
                ? '> submit'
                : '> run'}
        </button>
      </section>

      <Terminal lines={lines} engine={engine} className="mt-6" />
    </>
  )
}

function Rubric({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <StatusGlyph status="unsolved" label="No rubric provided." />
  }

  return (
    <ul className="mt-4 border border-line-strong">
      {items.map((item, index) => (
        <li
          key={`${item.label}-${index}`}
          className="flex items-center justify-between gap-4 border-b border-dashed border-line px-4 py-3 text-sm last:border-b-0"
        >
          <span>{item.label}</span>
          <span className="shrink-0 font-bold tabular-nums text-fg-muted">+{item.points} pts</span>
        </li>
      ))}
    </ul>
  )
}

function Message({ title, message, link, linkLabel }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="border border-line-strong bg-surface-1 p-6">
        <h1 className="text-2xl font-bold tracking-tight"># {title}</h1>
        <p className="mt-3 text-sm text-fg-muted">{message}</p>
        <Link to={link} className="mt-6 inline-flex h-10 items-center border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg">
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
  const { challenge, solved, loading, error } = useChallengeDetail(id, profile?.id)
  const remaining = useCountdown(roomQuery.room?.ends_at)

  if (!hydrated || loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <StatusGlyph status="loading" label="Loading challenge..." />
      </main>
    )
  }

  if (!profile) {
    return (
      <Message
        title="Join a room first"
        message="You need to join a room before solving challenges."
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
    : 'Solving unlocks when the admin presses GO.'

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <Link
        to="/challenges"
        className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-wider text-fg-muted hover:text-fg"
      >
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
        board
      </Link>

      <RoundBanner
        room={roomQuery.room}
        loading={roomQuery.loading}
        error={roomQuery.error}
        onRetry={roomQuery.reload}
      />
      <Countdown room={roomQuery.room} loading={roomQuery.loading} error={roomQuery.error} />

      <section className="mt-6 border border-line-strong bg-surface-1 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-6 items-center border border-line-strong px-2 text-[11px] uppercase tracking-widest text-fg-muted">
            [{isWeb ? 'WEB' : 'PY'}]
          </span>
          <DifficultyBlocks tier={challenge.tier} />
          <span className="text-xs font-bold tabular-nums text-fg-muted">+{challenge.points} pts</span>
          {solved ? <StatusGlyph status="solved" inverted /> : null}
          {isWeb ? <StatusGlyph status="unsolved" label="judged in person" /> : null}
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight"># {challenge.title}</h1>
      </section>

      <section className="mt-6 border border-line-strong bg-surface-1 p-6">
        <h2 className="border-b border-line-strong pb-3 text-base font-bold tracking-tight text-fg">
          ## problem
        </h2>
        <ProblemDescription text={challenge.description} />
      </section>

      {isWeb ? (
        <>
          <section className="mt-6 border border-line-strong bg-surface-1 p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-fg-muted">## scoring rubric</h2>
            <Rubric items={challenge.rubric} />
            <p className="mt-4 text-sm text-fg-muted">
              Build your app, then show it to a judge. Points are entered in person.
            </p>
          </section>
          <Countdown room={roomQuery.room} loading={roomQuery.loading} error={roomQuery.error} />
        </>
      ) : (
        <PythonWorkspace
          key={challenge.id}
          challenge={challenge}
          roomId={profile.room_id}
          userId={profile.id}
          locked={locked}
          lockNote={lockNote}
        />
      )}
    </main>
  )
}
