import { Link, useParams } from 'react-router-dom'
import LeaderboardTable from '../components/LeaderboardTable'
import Podium from '../components/Podium'
import StatusGlyph from '../components/StatusGlyph'
import { useCountdown } from '../hooks/useCountdown'
import { useTvData } from '../hooks/useTvData'
import { formatDuration } from '../lib/formatDuration'

function FullScreenMessage({ children }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-bg px-8 text-center text-2xl text-fg">
      {children}
    </main>
  )
}

export default function Tv() {
  const { roomCode } = useParams()
  const { room, rows, loading, error } = useTvData(roomCode)
  const remaining = useCountdown(room?.ends_at)

  if (loading) return <FullScreenMessage>[…] loading leaderboard</FullScreenMessage>

  if (error) {
    return (
      <FullScreenMessage>
        <div className="border border-dashed border-line-strong p-6">
          <StatusGlyph status="error" label={error} />
        </div>
      </FullScreenMessage>
    )
  }

  if (!room) {
    return (
      <FullScreenMessage>
        <div>
          <p className="text-3xl font-bold">Room not found</p>
          <Link to="/" className="mt-4 inline-block text-lg text-fg-muted underline">
            Go to join
          </Link>
        </div>
      </FullScreenMessage>
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
    <main className="min-h-svh bg-bg px-6 py-6 text-fg md:px-10">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-line-strong pb-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-fg-muted">
              ITP Competition · {room.code}
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">{room.name}</h1>
          </div>
          <div className="border border-line-strong bg-surface-1 px-5 py-3 text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-fg-muted">time left</p>
            <p className="mt-1 text-4xl font-bold tabular-nums md:text-5xl">{timerLabel}</p>
          </div>
        </header>

        {room.status === 'live' && !ended ? (
          <div className="mt-5 flex justify-end">
            <StatusGlyph status="live" label="live round" />
          </div>
        ) : null}

        {ended ? (
          <div className="mt-5 bg-invert-bg px-5 py-3 text-center text-2xl font-bold text-invert-fg">
            [✓] Final results
          </div>
        ) : null}

        <section className="mt-9">
          <h2 className="text-sm font-bold uppercase tracking-widest text-fg-muted">
            ## {ended ? 'Final podium' : 'Top 3'}
          </h2>
          <div className="mt-4">
            <Podium players={rows.slice(0, 3)} />
          </div>
        </section>

        <section className="mt-9">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-fg-muted">
            ## {ended ? 'All players' : 'Standings'}
          </h2>
          <LeaderboardTable players={ended ? rows : rows.slice(3)} />
        </section>
      </div>
    </main>
  )
}
