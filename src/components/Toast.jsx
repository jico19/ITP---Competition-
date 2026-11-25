import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { snapIn } from '../lib/motion'
import { useToastStore } from '../stores/toastStore'

function ToastItem({ item, onDismiss }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      snapIn(ref.current, { y: 12, x: 0, duration: 160 })
    }
  }, [])

  const glyph = item.kind === 'error' ? '[!]' : item.kind === 'info' ? '[…]' : '[ok]'
  const isInverted = item.kind === 'ok'

  return (
    <div
      ref={ref}
      role="status"
      className={`pointer-events-auto flex items-center justify-between gap-3 border px-3 py-2 font-mono text-xs shadow-hard-sm ${
        isInverted
          ? 'border-invert-bg bg-invert-bg text-invert-fg font-bold'
          : 'border-line-strong bg-surface-1 text-fg'
      }`}
    >
      <span className="truncate">
        <span className="mr-2 font-bold">{glyph}</span>
        {item.message}
      </span>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="shrink-0 opacity-75 hover:opacity-100 cursor-pointer"
      >
        <X size={14} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const dismissToast = useToastStore((s) => s.dismissToast)

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-4 z-50 flex max-w-sm flex-col gap-2"
    >
      {toasts.map((item) => (
        <ToastItem key={item.id} item={item} onDismiss={dismissToast} />
      ))}
    </div>
  )
}
