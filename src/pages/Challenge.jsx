import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CodeEditor from '../components/CodeEditor'
import Countdown from '../components/Countdown'
import Terminal from '../components/Terminal'
import { useChallengeDetail } from '../hooks/useChallengeDetail'
import { usePyEngine } from '../hooks/usePyEngine'
import { useRoom } from '../hooks/useRoom'
import { useSession } from '../hooks/useSession'
import { getReadableError } from '../lib/errors'
import { formatTestResults } from '../lib/formatTestResults'
import { runPython } from '../lib/pyRunner'
import { supabase } from '../lib/supabase'

function PythonWorkspace({ challenge, roomQuery, roomId, userId }) {
  const engine = usePyEngine()
  const [code, setCode] = useState(challenge.starter_code ?? '')
  const [lines, setLines] = useState([])
  const [running, setRunning] = useState(false)

  async function handleRun() {
    if (running || !engine.ready) return
    setRunning(true)

    const tests = Array.isArray(challenge.tests) ? challenge.tests : []
    setLines([{ kind: 'info', text: `Running ${tests.length} test(s)...` }])

    let outcome
    try {
      const result = await runPython(code, tests)
      outcome = result
      setLines(formatTestResults(result.results))
    } catch (err) {
      const message = getReadableError(err, 'Python run failed.')
      outcome = { passed: 0, total: tests.length }
      setLines([{ kind: 'error', text: message }])
    }

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
          kind: 'summary',
          text: `Passed ${outcome.passed}/${outcome.total} tests, +${data.points} points`,
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
            { kind: 'summary', text: `+${bonus.points} first solve bonus` },
          ])
        }
      } catch {
        // Bonus display is optional; the submission itself is already saved.
      }
    } catch (err) {
      setLines((previous) => [
        ...previous,
        {
          kind: 'error',
          text: `Submission not saved: ${getReadableError(err, 'Could not save submission.')}`,
        },
      ])
    } finally {
      setRunning(false)
    }
  }

  return (
    <>
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <CodeEditor key={challenge.id} value={code} onChange={setCode} />
        <button
          type="button"
          onClick={handleRun}
          disabled={running || !engine.ready}
          className="mt-4 w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {running ? 'Running tests...' : 'Run tests'}
        </button>
      </section>

      <Terminal lines={lines} engine={engine} />
      <Countdown room={roomQuery.room} loading={roomQuery.loading} error={roomQuery.error} />
    </>
  )
}

function Rubric({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="mt-3 text-sm text-slate-600">No rubric provided.</p>
  }

  return (
    <ul className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
          <span className="text-slate-800">{item.label}</span>
          <span className="shrink-0 font-medium text-slate-600">+{item.points} pts</span>
        </li>
      ))}
    </ul>
  )
}

export default function Challenge() {
  const { id } = useParams()
  const { hydrated, profile } = useSession()
  const roomQuery = useRoom(profile?.room_id)
  const { challenge, solved, loading, error } = useChallengeDetail(id, profile?.id)

  if (!hydrated || loading) {
    return (
      <main className="min-h-svh bg-slate-50 px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-svh bg-slate-50 px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Join a room first</h1>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-slate-900 underline">
            Go to join
          </Link>
        </div>
      </main>
    )
  }

  if (error || !challenge) {
    return (
      <main className="min-h-svh bg-slate-50 px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">
            {error ? 'Could not load challenge' : 'Challenge not found'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {error || 'It may be unpublished or the link may be wrong.'}
          </p>
          <Link to="/challenges" className="mt-4 inline-block text-sm font-medium text-slate-900 underline">
            Back to challenges
          </Link>
        </div>
      </main>
    )
  }

  const isWeb = challenge.type === 'web'
  const tierLabel = challenge.tier.charAt(0).toUpperCase() + challenge.tier.slice(1)

  return (
    <main className="min-h-svh bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link to="/challenges" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ← Back to challenges
        </Link>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
              {tierLabel}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
              {isWeb ? 'Web' : 'Python'}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
              +{challenge.points} points
            </span>
            {solved ? (
              <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                Solved
              </span>
            ) : null}
            {isWeb ? (
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                Judged in person
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight">{challenge.title}</h1>
        </div>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Problem</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {challenge.description}
          </p>
        </section>

        {isWeb ? (
          <>
            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Scoring rubric</h2>
              <Rubric items={challenge.rubric} />
              <p className="mt-4 text-sm text-slate-600">
                Build your app, then show it to a judge. Points are entered in person.
              </p>
            </section>
            <Countdown room={roomQuery.room} loading={roomQuery.loading} error={roomQuery.error} />
          </>
        ) : (
          <PythonWorkspace
            key={challenge.id}
            challenge={challenge}
            roomQuery={roomQuery}
            roomId={profile.room_id}
            userId={profile.id}
          />
        )}
      </div>
    </main>
  )
}
