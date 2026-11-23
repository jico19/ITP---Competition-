import { Link } from 'react-router-dom'

const tierClass = {
  easy: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  hard: 'border-rose-200 bg-rose-50 text-rose-700',
}

export default function ChallengeCard({ challenge, solved }) {
  const tierLabel = challenge.tier.charAt(0).toUpperCase() + challenge.tier.slice(1)

  return (
    <Link
      to={`/challenge/${challenge.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${tierClass[challenge.tier]}`}>
          {tierLabel}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
          {challenge.type === 'web' ? 'Web' : 'Python'}
        </span>
        {solved ? (
          <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            Solved
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 text-base font-semibold text-slate-900">{challenge.title}</h3>
      <p className="mt-1 text-sm text-slate-600">+{challenge.points} points</p>
    </Link>
  )
}
