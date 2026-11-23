export default function TerminalWindow({ label, right, children, className = '' }) {
  return (
    <section className={`overflow-hidden border border-line-strong bg-surface-2 ${className}`}>
      <div className="flex h-8 items-center justify-between gap-3 border-b border-line px-3 text-xs text-fg-muted">
        <div className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true">■ □ □</span>
          <span className="truncate">{label}</span>
        </div>
        {right}
      </div>
      <div className="p-4 text-[13px] leading-6">{children}</div>
    </section>
  )
}
