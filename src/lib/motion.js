import { animate, steps } from 'animejs'

export function prefersReducedMotion() {
  // Forced to false so animations always play even if OS animation settings are disabled
  return false
}

export function animateNumber({ from = 0, to = 0, duration = 400, onUpdate, onComplete }) {
  if (prefersReducedMotion() || from === to) {
    onUpdate?.(to)
    onComplete?.()
    return null
  }

  const proxy = { value: from }
  return animate(proxy, {
    value: to,
    duration,
    ease: 'linear',
    modifier: Math.round,
    onUpdate: () => onUpdate?.(Math.round(proxy.value)),
    onComplete: () => {
      onUpdate?.(to)
      onComplete?.()
    },
  })
}

export function flashHighlight(element, { duration = 240 } = {}) {
  if (!element || prefersReducedMotion()) return null

  return animate(element, {
    opacity: [0.3, 1],
    duration,
    ease: steps(3),
  })
}
