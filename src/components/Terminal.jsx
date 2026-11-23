import StatusGlyph from './StatusGlyph'
import TerminalWindow from './TerminalWindow'

const lineClass = {
  info: 'text-fg-muted',
  stdout: 'text-fg',
  error: 'border border-dashed border-line-strong px-2 text-fg',
  pass: 'text-fg',
  fail: 'border border-dashed border-line-strong px-2 font-bold text-fg',
  muted: 'text-fg-muted',
  summary: 'bg-invert-bg px-2 font-bold text-invert-fg',
  accepted: 'bg-invert-bg px-2 font-bold text-invert-fg',
  wrong: 'border border-dashed border-line-strong px-2 font-bold text-fg',
  time: 'border border-dashed border-line-strong px-2 font-bold text-fg',
  loading: 'text-fg-muted',
}

export default function Terminal({ lines, engine, className = '' }) {
  return (
    <TerminalWindow
      label="~/tests/output"
      className={className}
      right={
        <StatusGlyph
          status={engine.ready ? 'solved' : 'loading'}
          label={engine.ready ? 'python ready' : 'loading python'}
        />
      }
    >
      <div className="max-h-96 space-y-1 overflow-auto">
        {!engine.ready ? (
          <p className="text-fg-muted">{engine.error || 'Loading Python...'}</p>
        ) : null}
        {engine.ready && lines.length === 0 ? (
          <p className="text-fg-muted">Run your code to see results.</p>
        ) : null}
        {lines.map((line, index) => (
          <p
            key={index}
            className={`whitespace-pre-wrap ${lineClass[line.kind] ?? 'text-fg'}`}
          >
            {line.text}
          </p>
        ))}
      </div>
    </TerminalWindow>
  )
}
