import StatusGlyph from './StatusGlyph'

export default function LeaderboardTable({ players }) {
  if (players.length === 0) {
    return <StatusGlyph status="unsolved" label="No other players yet." />
  }

  const half = Math.ceil(players.length / 2)

  return (
    <div>
      <div className="mb-3 hidden px-4 text-xs font-bold uppercase tracking-widest text-fg-muted sm:flex">
        <span className="w-16">#</span>
        <span className="flex-1">handle</span>
        <span className="w-24 text-right">points</span>
        <span className="w-24 text-right">solved</span>
      </div>

      <div
        className="relative sm:h-[calc(var(--rows)*56px)]"
        style={{ '--rows': half }}
      >
        {players.map((player, index) => {
          const column = index < half ? 0 : 1
          const row = column === 0 ? index : index - half

          return (
            <div
              key={player.user_id}
              style={{ '--rank-col': column, '--rank-row': row }}
              className="mb-3 flex min-h-14 items-center gap-3 border border-line-strong bg-surface-1 px-4 transition-[top,left] duration-[120ms] ease-[steps(2)] motion-reduce:transition-none sm:absolute sm:left-[calc(var(--rank-col)*50%)] sm:top-[calc(var(--rank-row)*56px)] sm:mb-0 sm:w-[calc(50%-0.5rem)]"
            >
              <span className="w-12 text-lg font-bold tabular-nums text-fg-muted sm:w-16">
                #{String(player.rank).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1 truncate text-lg font-bold text-fg" title={player.display_name}>
                @{player.display_name}
              </span>
              <span className="w-20 text-right text-xl font-bold tabular-nums text-fg sm:w-24">
                {player.total_points}
              </span>
              <span className="hidden w-24 text-right text-lg tabular-nums text-fg-muted sm:block">
                {player.solved}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
