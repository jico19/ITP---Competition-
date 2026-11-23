const ROW_HEIGHT = 56

export default function LeaderboardTable({ players }) {
  if (players.length === 0) {
    return <p className="py-8 text-center text-lg text-slate-500">No other players yet.</p>
  }

  const half = Math.ceil(players.length / 2)

  return (
    <div>
      <div className="mb-2 flex items-center gap-3 px-4 text-xs font-medium uppercase tracking-wide text-slate-500">
        <span className="w-16">Rank</span>
        <span className="flex-1">Player</span>
        <span className="w-28 text-right">Points</span>
        <span className="w-24 text-right">Solved</span>
      </div>
      <div className="relative" style={{ height: half * ROW_HEIGHT }}>
        {players.map((player, index) => {
          const column = index < half ? 0 : 1
          const row = column === 0 ? index : index - half

          return (
            <div
              key={player.user_id}
              style={{
                left: column === 0 ? '0%' : '50%',
                top: row * ROW_HEIGHT,
                width: 'calc(50% - 0.5rem)',
                height: ROW_HEIGHT - 4,
              }}
              className="absolute flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 transition-all duration-500 ease-out motion-reduce:transition-none"
            >
              <span className="w-16 text-lg font-semibold text-slate-400">#{player.rank}</span>
              <span className="flex-1 truncate text-xl font-medium text-white" title={player.display_name}>
                {player.display_name}
              </span>
              <span className="w-28 text-right text-xl font-semibold text-amber-300">
                {player.total_points}
              </span>
              <span className="w-24 text-right text-lg text-slate-400">{player.solved}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
