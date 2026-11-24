import { useEffect, useRef, useState } from 'react'
import { animateNumber } from '../lib/motion'

export function useAnimatedNumber(targetValue = 0, { duration = 400 } = {}) {
  const numValue = Number(targetValue) || 0
  const [displayValue, setDisplayValue] = useState(numValue)
  const prevRef = useRef(numValue)

  useEffect(() => {
    const from = prevRef.current
    const to = numValue
    prevRef.current = numValue

    if (from === to) return

    const anim = animateNumber({
      from,
      to,
      duration,
      onUpdate: (val) => setDisplayValue(Math.round(val)),
      onComplete: () => setDisplayValue(to),
    })

    return () => {
      anim?.cancel()
    }
  }, [numValue, duration])

  return displayValue
}
