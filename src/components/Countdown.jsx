import { useEffect, useRef } from 'react'
import { useCountdown } from '../hooks/useCountdown'
import { formatDuration } from '../lib/formatDuration'
import { flashHighlight } from '../lib/motion'

export default function Countdown({ room, loading, error }) {
  const remaining = useCountdown(room?.ends_at)
  const timerRef = useRef(null)

  const isUrgent =
    room?.status === 'live' && remaining !== null && remaining > 0 && remaining <= 60_000
  const secondBucket = remaining !== null ? Math.floor(remaining / 1000) : null

  useEffect(() => {
    if (isUrgent && timerRef.current) {
      flashHighlight(timerRef.current, { duration: 220 })
    }
  }, [isUrgent, secondBucket])

  let label = 'Timer not set'
  if (error) label = 'Timer unavailable'
  else if (room?.status === 'ended') label = "Time's up"
  else if (!loading && room?.status === 'lobby') label = 'Waiting for GO'
  else if (remaining !== null && remaining <= 0) label = "Time's up"
  else if (remaining !== null) label = formatDuration(remaining)

  return (
    <div
      className={`mt-3 flex flex-wrap items-center justify-between gap-3 border px-4 py-3 ${
        isUrgent
          ? 'border-invert-bg bg-invert-bg text-invert-fg'
          : 'border-line-strong bg-surface-1 text-fg'
      }`}
    >
      <span
        className={`text-xs font-bold uppercase tracking-widest ${
          isUrgent ? 'text-invert-fg' : 'text-fg-muted'
        }`}
      >
        {isUrgent ? '[!] final minute' : 'time left'}
      </span>
      <span ref={timerRef} className="text-sm font-bold tabular-nums">
        {label}
      </span>
    </div>
  )
}
