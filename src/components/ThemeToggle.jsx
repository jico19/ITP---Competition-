import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

function currentTheme() {
  const attribute = document.documentElement.getAttribute('data-theme')
  if (attribute === 'light' || attribute === 'dark') return attribute
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {}
  }, [theme])

  return (
    <div className="flex h-11 items-center border border-line-strong" role="group" aria-label="Theme">
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-label="Use light theme"
        aria-pressed={theme === 'light'}
        className={`flex h-full w-11 items-center justify-center border-r border-line-strong ${
          theme === 'light' ? 'bg-invert-bg text-invert-fg' : 'text-fg-muted hover:bg-surface-3 hover:text-fg'
        }`}
      >
        <Sun size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-label="Use dark theme"
        aria-pressed={theme === 'dark'}
        className={`flex h-full w-11 items-center justify-center ${
          theme === 'dark' ? 'bg-invert-bg text-invert-fg' : 'text-fg-muted hover:bg-surface-3 hover:text-fg'
        }`}
      >
        <Moon size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  )
}
