import StatusGlyph from './StatusGlyph'

const slots = {
  1: { order: 'order-1 sm:order-2', height: 'h-64', label: 'bg-invert-bg text-invert-fg' },
  2: { order: 'order-2 sm:order-1', height: 'h-52', label: 'border border-line-strong text-fg' },
  3: { order: 'order-3 sm:order-3', height: 'h-44', label: 'border border-line-strong text-fg' },
}

export default function Podium({ players }) {
  if (players.length === 0) {
    return <StatusGlyph status="unsolved" label="No results yet." />
  }

  return (
    <div className="grid grid-cols-1 items-end gap-6 sm:grid-cols-3">
      {players.map((player) => {
        const slot = slots[player.rank] ?? slots[3]
        return (
          <div
            key={player.user_id}
            className={`${slot.order} ${slot.height} flex flex-col justify-end border border-line-strong bg-surface-1 p-4 text-center transition-all duration-[120ms] ease-[steps(2)] motion-reduce:transition-none`}
          >
            <div className={`flex h-8 items-center justify-center text-xs font-bold uppercase tracking-widest ${slot.label}`}>
              {player.rank === 1 ? (
                <StatusGlyph status="first" inverted label="rank 1" />
              ) : (
                <span>#{player.rank}</span>
              )}
            </div>
            <p className="mt-4 truncate text-2xl font-bold text-fg" title={player.display_name}>
              @{player.display_name}
            </p>
            <p className="mt-2 text-xl font-bold tabular-nums text-fg">{player.total_points} pts</p>
            <p className="text-sm text-fg-muted tabular-nums">{player.solved} solved</p>
          </div>
        )
      })}
    </div>
  )
}
