import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { popStamp } from '../lib/motion'
import DifficultyBlocks from './DifficultyBlocks'

export default function ChallengeCard({ challenge, solved, attempted = false, locked = false }) {
  const cardRef = useRef(null)
  const prevSolvedRef = useRef(solved)

  useEffect(() => {
    if (!prevSolvedRef.current && solved && cardRef.current) {
      popStamp(cardRef.current, { duration: 200 })
    }
    prevSolvedRef.current = solved
  }, [solved])

  const number = String(challenge.sort_order ?? '').padStart(3, '0')
  const tag = challenge.type === 'web' ? 'WEB' : (challenge.tier ? challenge.tier.toUpperCase() : 'ALGO')

  let statusGlyph = '[ ]'
  if (solved) statusGlyph = '[✓]'
  else if (attempted) statusGlyph = '[~]'
  else if (locked) statusGlyph = '[×]'

  return (
    <Link
      ref={cardRef}
      to={`/challenge/${challenge.id}`}
      className={`challenge-card-item group block border border-line-strong bg-surface-1 text-fg transition-transform duration-100 ease-[steps(2)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard active:translate-x-0 active:translate-y-0 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg ${
        locked ? 'bg-hatch opacity-75 pointer-events-none' : ''
      }`}
    >
      {/* Top Header Strip */}
      <div
        className={`flex h-10 items-center justify-between px-4 text-xs font-mono border-b ${
          solved
            ? 'bg-invert-bg text-invert-fg border-invert-bg font-bold'
            : 'border-line-strong bg-surface-1 text-fg'
        }`}
      >
        <span className="tabular-nums font-bold tracking-wider">{number}</span>

        {solved ? (
          <span className="inline-flex h-6 items-center border border-invert-fg px-2 text-[11px] font-bold uppercase tracking-wider">
            [{tag}]
          </span>
        ) : (
          <span className="inline-flex h-6 items-center border border-line-strong px-2 text-[11px] font-bold uppercase tracking-wider text-fg-muted">
            [{tag}]
          </span>
        )}

        <span
          className={`font-bold tabular-nums ${
            solved ? 'text-invert-fg' : attempted ? 'text-fg font-bold' : 'text-fg-muted'
          }`}
        >
          {statusGlyph}
        </span>
      </div>

      {/* Card Body */}
      <div className="flex flex-col justify-between p-5 min-h-[140px]">
        <h3 className="text-base font-bold font-mono leading-snug tracking-tight text-fg group-hover:underline">
          {challenge.title}
        </h3>

        <div className="mt-6 flex items-center justify-between gap-3">
          <DifficultyBlocks tier={challenge.tier} />
          <span className="text-xs font-mono font-bold tabular-nums text-fg-muted">
            {challenge.points} pts
          </span>
        </div>
      </div>
    </Link>
  )
}
