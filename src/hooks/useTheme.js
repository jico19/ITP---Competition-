import { useEffect, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const attribute = document.documentElement.getAttribute('data-theme')
    if (attribute === 'light' || attribute === 'dark') return attribute
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const next = document.documentElement.getAttribute('data-theme')
      if (next === 'light' || next === 'dark') {
        setTheme(next)
      }
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  return theme
}
