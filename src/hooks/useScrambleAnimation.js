import { useEffect, useRef, useCallback } from 'react'
import { animate, scrambleText } from 'animejs'
import { prefersReducedMotion } from '../lib/motion'

export function useScrambleAnimation({ defaultRevealRate = 20, chars } = {}) {
  const animRef = useRef(null)

  useEffect(() => {
    return () => {
      if (animRef.current) {
        animRef.current.cancel()
      }
    }
  }, [])

  const scrambleTo = useCallback((currentValue, targetValue, onUpdate, options = {}) => {
    if (animRef.current) {
      animRef.current.cancel()
    }

    if (prefersReducedMotion()) {
      onUpdate(targetValue)
      return
    }

    const revealRate = options.revealRate ?? defaultRevealRate
    const charSet = options.chars ?? chars
    const proxy = { textContent: currentValue || '' }

    animRef.current = animate(proxy, {
      textContent: scrambleText({
        text: targetValue,
        revealRate,
        ...(charSet ? { chars: charSet } : {}),
      }),
      onUpdate: () => {
        onUpdate(proxy.textContent)
      },
      onComplete: () => {
        onUpdate(targetValue)
        animRef.current = null
      },
    })
  }, [defaultRevealRate, chars])

  return { scrambleTo }
}
