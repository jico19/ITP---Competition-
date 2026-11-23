import { Link } from 'react-router-dom'
import ChallengeCard from '../components/ChallengeCard'
import Countdown from '../components/Countdown'
import RoundBanner from '../components/RoundBanner'
import StatusGlyph from '../components/StatusGlyph'
import { useChallenges } from '../hooks/useChallenges'
import { useRoom } from '../hooks/useRoom'
import { useSession } from '../hooks/useSession'

const tiers = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
]

function Progress({ solved, total, points }) {
  const ratio = total === 0 ? 0 : solved / total
  const filled = Math.round(ratio * 10)
  const cells = '■'.repeat(filled) + '□'.repeat(10 - filled)

  return (
    <p className="mt-4 text-xs text-fg-muted" aria-label={`${solved} of ${total} solved, ${points} points`}>
      <span aria-hidden="true">[{cells}]</span> {solved}/{total} solved · {points} pts
    </p>
  )
}

function NeedRoom() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10 md:px-6">
      <div className="border border-line-strong bg-surface-1 p-6">
        <h1 className="text-2xl font-bold tracking-tight"># Join a room first</h1>
        <p className="mt-3 text-sm text-fg-muted">
          You need to join a room before viewing challenges.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg hover:shadow-hard-sm"
        >
          $ go to join
        </Link>
      </div>
    </main>
  )
}

export default function Challenges() {
  const { profile, hydrated } = useSession()
  const roomQuery = useRoom(profile?.room_id)
  const { challenges, solvedIds, loading, error } = useChallenges(profile?.id)

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <StatusGlyph status="loading" label="Loading session..." />
      </main>
    )
  }

  if (!profile) return <NeedRoom />

  const solvedPoints = challenges
    .filter((c) => solvedIds.has(c.id))
    .reduce((sum, c) => sum + c.points, 0)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <section className="relative border border-line-strong bg-surface-1 p-6 md:p-9">
        <div className="absolute inset-0 bg-grid-dots opacity-30 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" aria-hidden="true" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest text-fg-muted">ITP Competition</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-fg"># Challenge Board</h1>
          <Progress
            solved={solvedIds.size}
            total={challenges.length}
            points={solvedPoints}
          />
          <p className="mt-2 text-xs text-fg-muted">
            Joined as @{profile.display_name}
            {roomQuery.room?.code ? ` in room ${roomQuery.room.code}` : ''}.
          </p>
        </div>
      </section>

      <RoundBanner
        room={roomQuery.room}
        loading={roomQuery.loading}
        error={roomQuery.error}
        onRetry={roomQuery.reload}
      />
      <Countdown room={roomQuery.room} loading={roomQuery.loading} error={roomQuery.error} />

      {error ? (
        <div className="mt-6 border border-dashed border-line-strong p-4" role="alert">
          <StatusGlyph status="error" label={error} />
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 bg-dots-dense p-6">
          <StatusGlyph status="loading" label="Loading challenges..." />
        </div>
      ) : null}

      {!loading && !error && challenges.length === 0 ? (
        <div className="mt-6 bg-dots-dense p-9 text-center">
          <StatusGlyph status="unsolved" label="No challenges published yet." />
        </div>
      ) : null}

      {!loading && !error
        ? tiers.map((tier) => {
            const items = challenges.filter((c) => c.tier === tier.key)
            if (items.length === 0) return null

            return (
              <section key={tier.key} className="mt-9">
                <h2 className="text-sm font-bold uppercase tracking-widest text-fg-muted">
                  ## {tier.label} <span className="tabular-nums">({items.length})</span>
                </h2>
                <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      solved={solvedIds.has(challenge.id)}
                    />
                  ))}
                </div>
              </section>
            )
          })
        : null}
    </main>
  )
}
