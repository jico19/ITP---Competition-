import { useCountdown } from '../hooks/useCountdown'
import { formatDuration } from '../lib/formatDuration'

export default function Countdown({ room, loading, error }) {
  const remaining = useCountdown(room?.ends_at)

  let label = 'Timer not set'
  if (error) label = 'Timer unavailable'
  else if (room?.status === 'ended') label = "Time's up"
  else if (!loading && room?.status === 'lobby') label = 'Waiting for start'
  else if (remaining !== null && remaining <= 0) label = "Time's up"
  else if (remaining !== null) label = `Ends in ${formatDuration(remaining)}`

  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Time left</span>
      <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">{label}</span>
    </div>
  )
}
