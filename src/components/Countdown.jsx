import { useEffect, useRef } from 'react'
import { animate, scrambleText } from 'animejs'
import { useCountdown } from '../hooks/useCountdown'
import { formatDuration } from '../lib/formatDuration'
import { prefersReducedMotion } from '../lib/motion'

export default function Countdown({ room, loading, error }) {
  const remaining = useCountdown(room?.ends_at)
  const labelRef = useRef(null)
  const prevLabelRef = useRef('')

  let label = 'Timer not set'
  if (error) label = 'Timer unavailable'
  else if (room?.status === 'ended') label = "Time's up"
  else if (!loading && room?.status === 'lobby') label = 'Waiting for GO'
  else if (remaining !== null && remaining <= 0) label = "Time's up"
  else if (remaining !== null) label = formatDuration(remaining)

  useEffect(() => {
    if (!labelRef.current || prefersReducedMotion()) return
    if (label === prevLabelRef.current) return
    prevLabelRef.current = label

    animate(labelRef.current, {
      textContent: scrambleText({
        text: label,
        revealRate: 40,
        chars: '0-9:',
      }),
    })
  }, [label])

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-line-strong bg-surface-1 px-4 py-3">
      <span className="text-xs font-bold uppercase tracking-widest text-fg-muted">time left</span>
      <span ref={labelRef} className="text-sm font-bold tabular-nums text-fg">{label}</span>
    </div>
  )
}
