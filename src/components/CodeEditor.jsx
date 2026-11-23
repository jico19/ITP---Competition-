import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'

export default function CodeEditor({ value, onChange, title = 'Your code' }) {
  const [notice, setNotice] = useState('')

  async function handlePaste() {
    setNotice('')
    try {
      onChange(await navigator.clipboard.readText())
    } catch {
      setNotice('Clipboard blocked. Paste manually with Ctrl+V.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={handlePaste}
          className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Paste from clipboard
        </button>
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-300 bg-white">
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={[python()]}
          theme="light"
          minHeight="220px"
          basicSetup={{ foldGutter: false }}
        />
      </div>
      {notice ? (
        <p className="mt-2 text-xs text-amber-700" role="alert">
          {notice}
        </p>
      ) : null}
    </div>
  )
}
