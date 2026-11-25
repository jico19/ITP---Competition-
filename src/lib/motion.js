import { animate, steps, stagger } from 'animejs'

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

export function snapIn(targets, { y = 10, x = 0, duration = 180, delay = 0 } = {}) {
  if (!targets || prefersReducedMotion()) return null

  return animate(targets, {
    opacity: [0, 1],
    translateY: [y, 0],
    translateX: [x, 0],
    duration,
    delay,
    ease: 'outCubic',
  })
}

export function staggerReveal(targets, { y = 10, x = 0, duration = 180, step = 35, start = 0 } = {}) {
  if (!targets || prefersReducedMotion()) return null

  return animate(targets, {
    opacity: [0, 1],
    translateY: [y, 0],
    translateX: [x, 0],
    duration,
    delay: stagger(step, { start }),
    ease: 'outCubic',
  })
}

export function shakeError(element, { duration = 240 } = {}) {
  if (!element || prefersReducedMotion()) return null

  return animate(element, {
    translateX: [-6, 6, -4, 4, 0],
    duration,
    ease: 'outQuad',
  })
}

export function popStamp(element, { duration = 170 } = {}) {
  if (!element || prefersReducedMotion()) return null

  return animate(element, {
    scale: [0.94, 1],
    opacity: [0.6, 1],
    duration,
    ease: 'outExpo',
  })
}
