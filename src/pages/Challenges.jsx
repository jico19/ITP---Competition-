import { Link } from 'react-router-dom'
import ChallengeCard from '../components/ChallengeCard'
import Countdown from '../components/Countdown'
import { useChallenges } from '../hooks/useChallenges'
import { useRoom } from '../hooks/useRoom'
import { useSession } from '../hooks/useSession'

const tiers = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
]

export default function Challenges() {
  const { profile, hydrated } = useSession()
  const roomQuery = useRoom(profile?.room_id)
  const { challenges, solvedIds, loading, error } = useChallenges(profile?.id)

  if (!hydrated) {
    return (
      <main className="min-h-svh bg-slate-50 px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-4xl">
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
          <p className="mt-2 text-sm text-slate-600">
            You need to join a room before viewing challenges.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Go to join
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">ITP Competition</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Challenges</h1>
          <p className="mt-2 text-sm text-slate-600">
            Joined as <span className="font-medium text-slate-900">{profile.display_name}</span>
            {roomQuery.room?.code ? ` in room ${roomQuery.room.code}` : ''}.
          </p>
          <Countdown room={roomQuery.room} loading={roomQuery.loading} error={roomQuery.error} />
        </div>

        {error ? (
          <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-6 text-sm text-slate-600">Loading challenges...</p>
        ) : null}

        {!loading && !error && challenges.length === 0 ? (
          <p className="mt-6 rounded-md border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
            No challenges published yet.
          </p>
        ) : null}

        {!loading && !error
          ? tiers.map((tier) => {
              const items = challenges.filter((c) => c.tier === tier.key)
              if (items.length === 0) return null

              return (
                <section key={tier.key} className="mt-8">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {tier.label}
                    <span className="ml-2 text-sm font-normal text-slate-500">{items.length}</span>
                  </h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
      </div>
    </main>
  )
}
