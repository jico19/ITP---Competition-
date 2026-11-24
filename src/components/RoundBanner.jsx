import { useEffect, useRef } from 'react'
import { animate, scrambleText } from 'animejs'
import { RotateCcw } from 'lucide-react'
import { useCountdown } from '../hooks/useCountdown'
import { formatDuration } from '../lib/formatDuration'
import { prefersReducedMotion } from '../lib/motion'
import StatusGlyph from './StatusGlyph'

export default function RoundBanner({ room, loading, error, onRetry }) {
  const remaining = useCountdown(room?.ends_at)
  const msgRef = useRef(null)
  const prevMsgRef = useRef('')

  let status = 'loading'
  let title = 'Checking round status'
  let message = 'Loading room status. You can still read the problems.'

  if (error) {
    status = 'error'
    title = 'Room status unavailable'
    message = 'Could not load the room status. Try again.'
  } else if (loading || !room) {
    status = 'loading'
  } else if (room.status === 'lobby') {
    status = 'locked'
    title = 'Waiting for GO'
    message = 'You can read the problems now. Solving unlocks when the admin presses GO.'
  } else if (room.status === 'ended' || (remaining !== null && remaining <= 0)) {
    status = 'locked'
    title = "Time's up"
    message = 'Submissions are closed.'
  } else if (room.status === 'live' && remaining !== null) {
    status = 'live'
    title = 'Round is live'
    message = `Time left ${formatDuration(remaining)}.`
  } else if (room.status === 'live') {
    status = 'live'
    title = 'Round is live'
    message = 'No end time is set.'
  } else {
    status = 'locked'
    title = "Time's up"
    message = 'Submissions are closed.'
  }

  // Scramble message text on status change
  useEffect(() => {
    if (!msgRef.current || prefersReducedMotion()) return
    if (message === prevMsgRef.current) return
    prevMsgRef.current = message

    animate(msgRef.current, {
      textContent: scrambleText({
        text: message,
        revealRate: 30,
        chars: 'a-z0-9. ',
      }),
    })
  }, [message])

  return (
    <div
      className={`mt-6 border bg-surface-1 p-4 ${
        status === 'error' ? 'border-dashed border-line-strong' : 'border-line-strong'
      }`}
      role={status === 'error' ? 'alert' : 'status'}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <StatusGlyph status={status} label={title} />
          <p ref={msgRef} className="mt-2 text-sm text-fg-muted">{message}</p>
        </div>
        {status === 'error' && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center gap-2 border border-line-strong bg-transparent px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3"
          >
            <RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />
            retry
          </button>
        ) : null}
      </div>
    </div>
  )
}
