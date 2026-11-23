const lineColor = {
  info: 'text-slate-400',
  stdout: 'text-slate-200',
  error: 'text-red-400',
  pass: 'text-green-400',
  fail: 'text-rose-400',
  muted: 'text-slate-400',
  summary: 'text-amber-300 font-semibold',
}

export default function Terminal({ lines, engine }) {
  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
        <span className="font-mono text-xs uppercase tracking-wide text-slate-400">Terminal</span>
        <span
          className={`h-2 w-2 rounded-full ${engine.ready ? 'bg-green-400' : 'bg-amber-400'}`}
          aria-hidden="true"
        />
      </div>
      <div className="max-h-96 overflow-auto p-4 font-mono text-xs leading-relaxed sm:text-sm">
        {!engine.ready ? (
          <p className="text-amber-300">{engine.error || 'Loading Python...'}</p>
        ) : null}
        {engine.ready && lines.length === 0 ? (
          <p className="text-slate-500">Run your code to see results.</p>
        ) : null}
        {lines.map((line, index) => (
          <p
            key={index}
            className={`whitespace-pre-wrap ${lineColor[line.kind] ?? 'text-slate-200'}`}
          >
            {line.text}
          </p>
        ))}
      </div>
    </section>
  )
}
