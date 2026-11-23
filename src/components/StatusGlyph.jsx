const statuses = {
  solved: { glyph: '[✓]', label: 'solved' },
  attempted: { glyph: '[~]', label: 'attempted' },
  unsolved: { glyph: '[ ]', label: 'unsolved' },
  locked: { glyph: '[×]', label: 'locked' },
  first: { glyph: '[★]', label: 'first solve' },
  accepted: { glyph: '[✓]', label: 'accepted' },
  wrong: { glyph: '[!]', label: 'wrong answer' },
  time: { glyph: '[…]', label: 'time limit' },
  error: { glyph: '[!]', label: 'error' },
  loading: { glyph: '[…]', label: 'loading' },
  live: { glyph: '[•]', label: 'live' },
}

export default function StatusGlyph({ status, label, inverted = false, className = '' }) {
  const item = statuses[status] ?? statuses.unsolved
  const text = label ?? item.label

  return (
    <span
      className={`inline-flex h-6 items-center gap-1 px-2 text-[11px] font-bold uppercase tracking-widest ${
        inverted ? 'bg-invert-bg text-invert-fg' : 'text-fg-muted'
      } ${className}`}
    >
      <span aria-hidden="true" className={status === 'live' ? 'live-pulse' : undefined}>
        {item.glyph}
      </span>
      <span>{text}</span>
    </span>
  )
}
