import { useState } from 'react'
import { ClipboardPaste } from 'lucide-react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'
import StatusGlyph from './StatusGlyph'

const editorTheme = EditorView.theme({
  '&': {
    color: 'var(--fg)',
    backgroundColor: 'var(--surface-2)',
    fontSize: '13px',
  },
  '.cm-scroller': {
    fontFamily: 'var(--font-mono)',
    lineHeight: '24px',
  },
  '.cm-content': {
    caretColor: 'var(--fg)',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--fg)',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--surface-3)',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--surface-3)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--surface-2)',
    color: 'var(--fg-faint)',
    border: 'none',
    borderRight: '1px solid var(--line)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--surface-3)',
    color: 'var(--fg-muted)',
  },
})

const monochromeHighlight = HighlightStyle.define([
  { tag: t.keyword, fontWeight: '700', color: 'var(--fg)' },
  { tag: [t.comment, t.lineComment, t.blockComment], fontStyle: 'italic', color: 'var(--fg-faint)' },
  { tag: [t.string, t.special(t.string)], textDecoration: 'underline dotted' },
  { tag: [t.number, t.bool, t.null], color: 'var(--fg)' },
  { tag: [t.function(t.variableName), t.definition(t.variableName)], fontWeight: '700' },
])

export default function CodeEditor({ value, onChange, title = 'Your code', readOnly = false }) {
  const [notice, setNotice] = useState('')

  async function handlePaste() {
    if (readOnly) return
    setNotice('')
    try {
      onChange(await navigator.clipboard.readText())
    } catch {
      setNotice('Clipboard blocked. Paste manually with Ctrl+V.')
    }
  }

  return (
    <div>
      <div className="border border-line-strong bg-surface-2">
        <div className="flex h-8 items-center justify-between gap-3 border-b border-line px-3 text-xs text-fg-muted">
          <span className="truncate">~/editor/{title}</span>
          <button
            type="button"
            onClick={handlePaste}
            disabled={readOnly}
            className="inline-flex h-8 shrink-0 items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-fg-muted hover:text-fg disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50"
          >
            <ClipboardPaste size={14} strokeWidth={1.75} aria-hidden="true" />
            paste
          </button>
        </div>
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={[python(), editorTheme, syntaxHighlighting(monochromeHighlight)]}
          theme="none"
          minHeight="280px"
          editable={!readOnly}
          readOnly={readOnly}
          basicSetup={{ foldGutter: false }}
        />
      </div>
      {notice ? (
        <div className="mt-2 border border-dashed border-line-strong p-2" role="alert">
          <StatusGlyph status="error" label={notice} />
        </div>
      ) : null}
    </div>
  )
}
