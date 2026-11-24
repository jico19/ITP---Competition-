import { useState, useMemo } from 'react'
import { ClipboardPaste } from 'lucide-react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'
import StatusGlyph from './StatusGlyph'
import { useTheme } from '../hooks/useTheme'

function createEditorTheme(isDark) {
  return EditorView.theme(
    {
      '&': {
        color: 'var(--fg)',
        backgroundColor: 'var(--surface-2)',
        fontSize: '13px',
        height: '100%',
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
      '.cm-tooltip': {
        backgroundColor: 'var(--surface-1)',
        color: 'var(--fg)',
        border: '1px solid var(--line-strong)',
        boxShadow: 'var(--shadow-hard-sm)',
      },
      '.cm-tooltip.cm-tooltip-autocomplete': {
        '& > ul': {
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          maxHeight: '220px',
        },
        '& > ul > li': {
          color: 'var(--fg)',
          padding: '3px 8px',
          lineHeight: '20px',
        },
        '& > ul > li[aria-selected]': {
          backgroundColor: 'var(--invert-bg)',
          color: 'var(--invert-fg)',
        },
        '& > ul > li[aria-selected] .cm-completionMatchedText': {
          color: 'var(--invert-fg)',
          fontWeight: 'bold',
          textDecoration: 'underline',
        },
        '& > ul > li[aria-selected] .cm-completionDetail': {
          color: 'var(--invert-fg)',
          opacity: 0.8,
        },
        '& > ul > li[aria-selected] .cm-completionIcon': {
          color: 'var(--invert-fg)',
        },
      },
      '.cm-completionMatchedText': {
        color: 'var(--fg)',
        fontWeight: 'bold',
        textDecoration: 'underline',
      },
      '.cm-completionDetail': {
        color: 'var(--fg-muted)',
        fontStyle: 'italic',
      },
      '.cm-completionIcon': {
        color: 'var(--fg-muted)',
      },
      '.cm-tooltip.cm-completionInfo': {
        backgroundColor: 'var(--surface-1)',
        color: 'var(--fg)',
        border: '1px solid var(--line-strong)',
        padding: '6px 10px',
        fontSize: '12px',
      },
      '.cm-matchingBracket, .cm-nonmatchingBracket': {
        backgroundColor: 'var(--surface-3)',
        outline: '1px solid var(--line-strong)',
        color: 'var(--fg)',
      },
      '.cm-panels': {
        backgroundColor: 'var(--surface-2)',
        color: 'var(--fg)',
        borderTop: '1px solid var(--line-strong)',
      },
    },
    { dark: isDark },
  )
}

const monochromeHighlight = HighlightStyle.define([
  { tag: t.keyword, fontWeight: '700', color: 'var(--fg)' },
  { tag: [t.comment, t.lineComment, t.blockComment], fontStyle: 'italic', color: 'var(--fg-faint)' },
  { tag: [t.string, t.special(t.string)], textDecoration: 'underline dotted', color: 'var(--fg)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--fg)' },
  { tag: [t.function(t.variableName), t.definition(t.variableName)], fontWeight: '700', color: 'var(--fg)' },
  { tag: [t.variableName, t.propertyName], color: 'var(--fg)' },
  { tag: [t.operator, t.punctuation], color: 'var(--fg)' },
])

export default function CodeEditor({
  value,
  onChange,
  onCursorChange,
  showHeader = false,
  title = 'Your code',
  readOnly = false,
  minHeight = '320px',
}) {
  const [notice, setNotice] = useState('')
  const theme = useTheme()
  const isDark = theme === 'dark'

  async function handlePaste() {
    if (readOnly) return
    setNotice('')
    try {
      onChange(await navigator.clipboard.readText())
    } catch {
      setNotice('Clipboard blocked. Paste manually with Ctrl+V.')
    }
  }

  const editorThemeExtension = useMemo(() => {
    return createEditorTheme(isDark)
  }, [isDark])

  const cursorExtension = useMemo(() => {
    return EditorView.updateListener.of((update) => {
      if (update.selectionSet || update.docChanged) {
        const head = update.state.selection.main.head
        const line = update.state.doc.lineAt(head)
        onCursorChange?.({ line: line.number, col: head - line.from + 1 })
      }
    })
  }, [onCursorChange])

  return (
    <div className="flex flex-col h-full bg-surface-2 font-mono">
      {showHeader ? (
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
      ) : null}

      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={[python(), editorThemeExtension, syntaxHighlighting(monochromeHighlight), cursorExtension]}
          theme="none"
          minHeight={minHeight}
          editable={!readOnly}
          readOnly={readOnly}
          basicSetup={{ foldGutter: false }}
        />
      </div>

      {notice ? (
        <div className="border-t border-dashed border-line-strong p-2" role="alert">
          <StatusGlyph status="error" label={notice} />
        </div>
      ) : null}
    </div>
  )
}
