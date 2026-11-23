import { Link, useParams } from 'react-router-dom'
import LeaderboardTable from '../components/LeaderboardTable'
import Podium from '../components/Podium'
import { useCountdown } from '../hooks/useCountdown'
import { useTvData } from '../hooks/useTvData'
import { formatDuration } from '../lib/formatDuration'

export default function Tv() {
  const { roomCode } = useParams()
  const { room, rows, loading, error } = useTvData(roomCode)
  const remaining = useCountdown(room?.ends_at)

  if (loading) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-slate-950 text-2xl text-slate-400">
        Loading leaderboard...
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-slate-950 px-8 text-center text-2xl text-red-300">
        {error}
      </main>
    )
  }

  if (!room) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-950 text-white">
        <p className="text-3xl font-semibold">Room not found</p>
        <Link to="/" className="text-lg text-slate-400 underline">
          Go to join
        </Link>
      </main>
    )
  }

  const ended = Boolean(
    room.status === 'ended' || (room.ends_at && remaining !== null && remaining <= 0),
  )

  let timerLabel = 'Timer not set'
  if (ended) timerLabel = "Time's up"
  else if (room.status === 'lobby') timerLabel = 'Waiting for start'
  else if (remaining !== null && remaining <= 0) timerLabel = "Time's up"
  else if (remaining !== null) timerLabel = formatDuration(remaining)

  return (
    <main className="min-h-svh bg-slate-950 px-10 py-6 text-white">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex items-start justify-between gap-8 border-b border-slate-800 pb-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-slate-500">
              ITP Competition · {room.code}
            </p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight">{room.name}</h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium uppercase tracking-widest text-slate-500">Time left</p>
            <p className="font-mono text-5xl font-semibold tabular-nums text-amber-300">{timerLabel}</p>
          </div>
        </header>

        {ended ? (
          <p className="mt-5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-5 py-3 text-center text-2xl font-semibold text-amber-200">
            Final results
          </p>
        ) : null}

        <section className="mt-6">
          <h2 className="text-xl font-semibold uppercase tracking-wide text-slate-400">
            {ended ? 'Final podium' : 'Top 3'}
          </h2>
          <Podium players={rows.slice(0, 3)} />
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-xl font-semibold uppercase tracking-wide text-slate-400">
            {ended ? 'All players' : 'Standings'}
          </h2>
          <LeaderboardTable players={ended ? rows : rows.slice(3)} />
        </section>
      </div>
    </main>
  )
}
