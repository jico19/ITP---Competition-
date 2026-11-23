import { Link } from 'react-router-dom'
import DifficultyBlocks from './DifficultyBlocks'
import StatusGlyph from './StatusGlyph'

export default function ChallengeCard({ challenge, solved }) {
  const number = String(challenge.sort_order ?? '').padStart(3, '0')
  const type = challenge.type === 'web' ? 'WEB' : 'PY'

  return (
    <Link
      to={`/challenge/${challenge.id}`}
      className="block border border-line-strong bg-surface-1 text-fg transition-transform duration-100 ease-[steps(2)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
    >
      {solved ? (
        <div className="flex h-7 items-center justify-between bg-invert-bg px-4 text-[11px] font-bold uppercase tracking-widest text-invert-fg">
          <span className="tabular-nums">{number}</span>
          <StatusGlyph status="solved" inverted label="solved" />
        </div>
      ) : null}

      <div className="p-4">
        <div className="flex items-center justify-between gap-3 border-b border-dashed border-line pb-3">
          {!solved ? <span className="text-xs tabular-nums text-fg-muted">{number}</span> : <span />}
          <span className="inline-flex h-6 items-center border border-line-strong px-2 text-[11px] uppercase tracking-widest text-fg-muted">
            [{type}]
          </span>
          {!solved ? <StatusGlyph status="unsolved" /> : <span className="w-[76px]" />}
        </div>

        <h3 className="mt-4 text-base font-bold leading-6">{challenge.title}</h3>

        <div className="mt-4 flex items-center justify-between gap-3">
          <DifficultyBlocks tier={challenge.tier} />
          <span className="text-xs font-bold tabular-nums text-fg-muted">+{challenge.points} pts</span>
        </div>
      </div>
    </Link>
  )
}
