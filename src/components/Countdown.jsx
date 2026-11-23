import { useCountdown } from '../hooks/useCountdown'
import { formatDuration } from '../lib/formatDuration'

export default function Countdown({ room, loading, error }) {
  const remaining = useCountdown(room?.ends_at)

  let label = 'Timer not set'
  if (error) label = 'Timer unavailable'
  else if (room?.status === 'ended') label = "Time's up"
  else if (!loading && room?.status === 'lobby') label = 'Waiting for GO'
  else if (remaining !== null && remaining <= 0) label = "Time's up"
  else if (remaining !== null) label = formatDuration(remaining)

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-line-strong bg-surface-1 px-4 py-3">
      <span className="text-xs font-bold uppercase tracking-widest text-fg-muted">time left</span>
      <span className="text-sm font-bold tabular-nums text-fg">{label}</span>
    </div>
  )
}
