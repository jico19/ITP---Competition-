import { useEffect, useRef } from 'react'
import { useTheme } from '../hooks/useTheme'
import { prefersReducedMotion } from '../lib/motion'

/**
 * StaggerBackground
 * High-performance HTML5 canvas dot matrix background with continuous mouse ripple stagger.
 * Complies with dark/light theme switching and design.md monochrome guidelines.
 */
export default function StaggerBackground({
  gridSize = 24,
  baseDotRadius = 1.25,
  activeDotRadius = 2.5,
  liftAmount = 4.5, // 3D elevation lift height in px
  rippleMaxRadius = 180,
  rippleSpeed = 360, // px per second
  rippleDuration = 420, // ms decay per dot
  direction = 'inward', // 'inward' (converges to cursor) or 'outward'
}) {
  const canvasRef = useRef(null)
  const theme = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId = null
    let isRunning = false
    let width = 0
    let height = 0
    let dpr = 1

    // Theme color palette (cached and updated on theme change)
    let dotColor = '#6b6b6b'
    let activeColor = '#ffffff'
    let shadowColor = '#1c1c1c'

    function updateColors() {
      const styles = getComputedStyle(document.documentElement)
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
      dotColor = styles.getPropertyValue('--dot').trim() || (isDark ? '#6b6b6b' : '#c4c4c4')
      activeColor = styles.getPropertyValue('--fg').trim() || (isDark ? '#ffffff' : '#4a4a4a')
      shadowColor = isDark ? '#1c1c1c' : '#a8a8a8'
    }
    updateColors()

    // Active ripples queue
    // Each ripple: { x, y, startTime, maxRadius }
    const ripples = []
    let lastRippleTime = 0
    const MIN_RIPPLE_INTERVAL = 45 // spawn ripple at most every ~45ms on mousemove

    let lastPointerX = -9999
    let lastPointerY = -9999
    let lastInteractionTime = 0

    function handleResize() {
      dpr = window.devicePixelRatio || 1
      width = window.innerWidth
      height = window.innerHeight

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)

      renderFrame(performance.now())
    }

    function addRipple(x, y) {
      const now = performance.now()
      if (now - lastRippleTime >= MIN_RIPPLE_INTERVAL) {
        lastRippleTime = now
        ripples.push({
          x,
          y,
          startTime: now,
          maxRadius: rippleMaxRadius,
        })
        // Keep at most 6 concurrent ripples to maintain zero lag
        if (ripples.length > 6) {
          ripples.shift()
        }
      }
    }

    function isOverComponent(target) {
      if (!target || target === document.body || target === document.documentElement) {
        return false
      }

      if (target.id === 'root') {
        return false
      }

      // Buttons, links, inputs, selects, textareas are interactive controls
      if (target.closest('button, a, input, select, textarea, [role="button"]')) {
        return true
      }

      // Empty states: allow the background 3D hover/ripple effect to fire!
      const isEmptyState = target.closest(
        '[class*="border-dashed"], [class*="bg-dots-dense"], [data-empty-state]'
      )
      if (isEmptyState) {
        return false
      }

      return Boolean(
        target.closest(
          'form, header, footer, nav, table, dialog, section, article, aside, pre, code, ul, ol, [role="dialog"], [role="alert"], [role="tab"], .cm-editor, .challenge-card-item, .tv-podium-card, [class*="bg-surface-"], [class*="bg-invert-"], [class*="border-line-strong"], [class*="border-line"]'
        )
      )
    }

    function onPointerMove(e) {
      if (prefersReducedMotion()) return

      // Do nothing when cursor is on top of any UI component
      if (isOverComponent(e.target)) {
        if (lastPointerX !== -9999 || lastPointerY !== -9999) {
          lastPointerX = -9999
          lastPointerY = -9999
          if (!isRunning) {
            isRunning = true
            animationFrameId = requestAnimationFrame(loop)
          }
        }
        return
      }

      lastPointerX = e.clientX
      lastPointerY = e.clientY
      lastInteractionTime = performance.now()

      addRipple(e.clientX, e.clientY)

      if (!isRunning) {
        isRunning = true
        animationFrameId = requestAnimationFrame(loop)
      }
    }

    function onPointerLeave() {
      if (lastPointerX !== -9999 || lastPointerY !== -9999) {
        lastPointerX = -9999
        lastPointerY = -9999
        if (!isRunning) {
          isRunning = true
          animationFrameId = requestAnimationFrame(loop)
        }
      }
    }

    function renderFrame(now) {
      ctx.clearRect(0, 0, width, height)

      // Clean up finished ripples
      const maxRippleLifetime = (rippleMaxRadius / rippleSpeed) * 1000 + rippleDuration
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - ripples[i].startTime > maxRippleLifetime) {
          ripples.splice(i, 1)
        }
      }

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
      // Clearly visible resting state
      const baseAlpha = isDark ? 0.65 : 0.70

      const cols = Math.ceil(width / gridSize) + 1
      const rows = Math.ceil(height / gridSize) + 1

      for (let r = 0; r < rows; r++) {
        const y = r * gridSize
        for (let c = 0; c < cols; c++) {
          const x = c * gridSize

          let intensity = 0

          // Proximity to current pointer (immediate hover lift and glow)
          const distToPointer = Math.hypot(x - lastPointerX, y - lastPointerY)
          if (distToPointer < 54) {
            intensity = Math.max(intensity, (1 - distToPointer / 54) * 0.9)
          }

          // Ripple waves calculation with stagger delay
          for (let i = 0; i < ripples.length; i++) {
            const rip = ripples[i]
            const d = Math.hypot(x - rip.x, y - rip.y)
            if (d > rip.maxRadius) continue

            // Stagger arrival time:
            // - 'inward': wave travels from outer perimeter (d = maxRadius) inward toward cursor (d = 0)
            // - 'outward': wave travels from cursor (d = 0) outward to perimeter (d = maxRadius)
            const tArrive =
              direction === 'inward'
                ? rip.startTime + ((rip.maxRadius - d) / rippleSpeed) * 1000
                : rip.startTime + (d / rippleSpeed) * 1000
            const elapsedSinceWave = now - tArrive

            if (elapsedSinceWave >= 0 && elapsedSinceWave < rippleDuration) {
              const progress = elapsedSinceWave / rippleDuration
              // Inward wave intensifies as it focuses toward the cursor center
              const centerWeight =
                direction === 'inward'
                  ? 0.45 + 0.55 * (1 - d / rip.maxRadius)
                  : 1 - d / rip.maxRadius
              const waveIntensity = Math.sin(progress * Math.PI) * centerWeight
              if (waveIntensity > intensity) {
                intensity = waveIntensity
              }
            }
          }

          // Draw with 3D tactile elevation & ground shadow
          if (intensity > 0.02) {
            // 1. Ground Shadow (subtle floor anchor matching hard shadow aesthetic)
            const shadowOffsetX = 1.4 * intensity
            const shadowOffsetY = 1.4 * intensity
            ctx.beginPath()
            ctx.fillStyle = shadowColor
            ctx.globalAlpha = 0.55 * intensity
            ctx.arc(x + shadowOffsetX, y + shadowOffsetY, baseDotRadius * 0.9, 0, Math.PI * 2)
            ctx.fill()

            // 2. 3D Perspective Parallax + Elevation Lift
            const normX = distToPointer > 0 ? (x - lastPointerX) / distToPointer : 0
            const normY = distToPointer > 0 ? (y - lastPointerY) / distToPointer : 0
            const perspectivePush = 2.4 * intensity
            const pushX = normX * perspectivePush
            const pushY = normY * perspectivePush

            // Isometric elevation lift (-X and -Y offset)
            const liftX = -1.2 * intensity
            const liftY = -liftAmount * intensity

            const elevatedX = x + pushX + liftX
            const elevatedY = y + pushY + liftY
            const radius = baseDotRadius + (activeDotRadius - baseDotRadius) * intensity
            const alpha = Math.min(1, baseAlpha + (1 - baseAlpha) * intensity)

            // Draw elevated dot in 3D space
            ctx.beginPath()
            ctx.fillStyle = activeColor
            ctx.globalAlpha = alpha
            ctx.arc(elevatedX, elevatedY, radius, 0, Math.PI * 2)
            ctx.fill()
          } else {
            // Resting flat dot
            ctx.beginPath()
            ctx.fillStyle = dotColor
            ctx.globalAlpha = baseAlpha
            ctx.arc(x, y, baseDotRadius, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
      ctx.globalAlpha = 1
    }

    function loop(timestamp) {
      renderFrame(timestamp)

      const idleDuration = timestamp - lastInteractionTime
      const isStillRippling = ripples.length > 0 || idleDuration < 400

      if (isStillRippling && !prefersReducedMotion()) {
        animationFrameId = requestAnimationFrame(loop)
      } else {
        isRunning = false
        // Final render to ensure clean resting state
        renderFrame(timestamp)
      }
    }

    // Observer for theme changes on <html data-theme="...">
    const observer = new MutationObserver(() => {
      updateColors()
      renderFrame(performance.now())
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    })

    window.addEventListener('resize', handleResize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)

    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      observer.disconnect()
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [theme, gridSize, baseDotRadius, activeDotRadius, liftAmount, rippleMaxRadius, rippleSpeed, rippleDuration, direction])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  )
}
