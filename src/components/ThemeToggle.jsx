import { useEffect, useRef, useState } from 'react'
import { popStamp } from '../lib/motion'

function currentTheme() {
  const attribute = document.documentElement.getAttribute('data-theme')
  if (attribute === 'light' || attribute === 'dark') return attribute
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme)
  const lightRef = useRef(null)
  const darkRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {}
  }, [theme])

  function toggleTo(next) {
    if (next === theme) return
    document.documentElement.classList.add('theme-transitioning')
    setTheme(next)
    const targetRef = next === 'light' ? lightRef : darkRef
    if (targetRef.current) {
      popStamp(targetRef.current, { duration: 150 })
    }
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning')
    }, 250)
  }

  return (
    <div
      className="inline-flex h-8 items-center border border-line-strong px-2 font-mono text-xs select-none"
      role="group"
      aria-label="Theme toggle"
    >
      <span className="text-fg-muted mr-1" aria-hidden="true">[</span>
      <button
        ref={lightRef}
        type="button"
        onClick={() => toggleTo('light')}
        aria-label="Use light theme"
        aria-pressed={theme === 'light'}
        className={`px-1.5 py-0.5 transition-colors cursor-pointer ${
          theme === 'light'
            ? 'bg-invert-bg text-invert-fg font-bold'
            : 'text-fg-muted hover:text-fg'
        }`}
      >
        ✱
      </button>
      <span className="text-line mx-1" aria-hidden="true">|</span>
      <button
        ref={darkRef}
        type="button"
        onClick={() => toggleTo('dark')}
        aria-label="Use dark theme"
        aria-pressed={theme === 'dark'}
        className={`px-1.5 py-0.5 transition-colors cursor-pointer ${
          theme === 'dark'
            ? 'bg-invert-bg text-invert-fg font-bold'
            : 'text-fg-muted hover:text-fg'
        }`}
      >
        ☾
      </button>
      <span className="text-fg-muted ml-1" aria-hidden="true">]</span>
    </div>
  )
}
