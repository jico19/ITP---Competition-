const slots = {
  1: { left: '35%', height: '16rem', accent: 'border-t-amber-400' },
  2: { left: '2%', height: '12rem', accent: 'border-t-slate-300' },
  3: { left: '68%', height: '10rem', accent: 'border-t-orange-400' },
}

export default function Podium({ players }) {
  if (players.length === 0) {
    return <p className="py-16 text-center text-xl text-slate-500">No results yet.</p>
  }

  return (
    <div className="relative h-72">
      {players.map((player) => {
        const slot = slots[player.rank] ?? slots[3]
        return (
          <div
            key={player.user_id}
            style={{ left: slot.left, height: slot.height }}
            className={`absolute bottom-0 flex w-[30%] flex-col justify-end rounded-t-xl border border-b-0 border-slate-700 border-t-4 bg-gradient-to-t from-slate-900 to-slate-800 p-4 text-center shadow-lg transition-all duration-500 ease-out motion-reduce:transition-none ${slot.accent}`}
          >
            <span className="text-sm font-semibold text-slate-400">#{player.rank}</span>
            <span className="truncate text-2xl font-bold text-white" title={player.display_name}>
              {player.display_name}
            </span>
            <span className="mt-1 text-xl font-semibold text-amber-300">{player.total_points} pts</span>
            <span className="text-sm text-slate-400">{player.solved} solved</span>
          </div>
        )
      })}
    </div>
  )
}
