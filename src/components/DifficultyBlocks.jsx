const filled = { easy: 1, medium: 3, hard: 5 }

export default function DifficultyBlocks({ tier }) {
  const count = filled[tier] ?? 0
  const blocks = '■'.repeat(count) + '□'.repeat(5 - count)

  return (
    <span
      className="text-xs tracking-[0.2em] text-fg-muted"
      aria-label={`${tier ?? 'unknown'} difficulty ${count} of 5`}
      title={`${tier ?? 'unknown'} difficulty ${count} of 5`}
    >
      <span aria-hidden="true">{blocks}</span>
    </span>
  )
}
