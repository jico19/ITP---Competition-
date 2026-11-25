import { animate, createScope, scrambleText, stagger } from 'animejs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { useScrambleAnimation } from '../hooks/useScrambleAnimation'

// ── Stat card — numeric values count up from 0; text values scramble in ───────
function StatCard({ value, label, delay = 0 }) {
  const isNumeric = /^\d+$/.test(value)
  const animated = useAnimatedNumber(isNumeric ? Number(value) : 0, { duration: 900 })

  const [display, setDisplay] = useState(isNumeric ? value : '')
  const { scrambleTo } = useScrambleAnimation({ defaultRevealRate: 25 })
  const triggered = useRef(false)

  useEffect(() => {
    if (isNumeric || triggered.current) return
    const t = setTimeout(() => {
      triggered.current = true
      scrambleTo('', value, setDisplay)
    }, delay)
    return () => clearTimeout(t)
  }, [value, delay, isNumeric, scrambleTo])

  return (
    <div className="anim-stat opacity-0 flex flex-col items-center justify-center py-5 gap-1 hover:bg-surface-3 transition-colors">
      <span className="text-2xl font-bold tabular-nums tracking-tight text-fg">
        {isNumeric ? animated : (display || '\u00a0')}
      </span>
      <span className="text-[11px] uppercase tracking-widest text-fg-muted">
        {label}
      </span>
    </div>
  )
}

// ── ScrambleText — inline text that scrambles in after `delay` ms ─────────────
function ScrambleText({ text, delay = 0, revealRate = 32, className = '' }) {
  const spanRef = useRef(null)

  useEffect(() => {
    const el = spanRef.current
    if (!el) return

    let anim = null
    el.style.opacity = '0'
    el.textContent = text

    const timer = setTimeout(() => {
      el.style.opacity = '1'
      anim = animate(el, {
        textContent: scrambleText({
          text,
          revealRate,
          chars: 'A-Z0-9!%#_[]· ',
        }),
        onComplete: () => {
          if (spanRef.current) {
            spanRef.current.textContent = text
          }
        },
      })
    }, delay)

    return () => {
      clearTimeout(timer)
      if (anim) anim.cancel()
      if (spanRef.current) {
        spanRef.current.textContent = text
        spanRef.current.style.opacity = '1'
      }
    }
  }, [text, delay, revealRate])

  return <span ref={spanRef} className={className}>{text}</span>
}

function formatClock(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const s = String(totalSeconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

// ── Static showcase data ───────────────────────────────────────────────────────
const STATS = [
  { value: '5', label: 'Challenges', delay: 460 },
  { value: '3', label: 'Difficulty Tiers', delay: 530 },
  { value: '20', label: 'Players', delay: 600 },
  { value: 'Nov 27', label: 'Live Event', delay: 670 },
]

const PREVIEW_TABS = [
  { id: 'editor', label: '01 EDITOR + TERMINAL' },
  { id: 'board', label: '02 CHALLENGE BOARD' },
  { id: 'podium', label: '03 TV PODIUM' },
]

const SAMPLE_CODE = [
  'def sum_even(nums: list[int]) -> int:',
  '    """Return the sum of all even integers."""',
  '    total = 0',
  '    for n in nums:',
  '        if n % 2 == 0:',
  '            total += n',
  '    return total',
]

const SIMULATED_TESTS = [
  { label: 'sum_even([1, 2, 3, 4])', detail: 'expected 6, got 6' },
  { label: 'sum_even([1, 3, 5])', detail: 'expected 0, got 0' },
  { label: 'hidden edge cases', detail: 'passed' },
]

const BOARD_ITEMS = [
  { tier: '[■□□] EASY', pts: '+10 pts', title: 'Sum of Evens', status: '[✓] SOLVED' },
  { tier: '[■■□] MEDIUM', pts: '+20 pts', title: 'Bracket Validator', status: '[✓] SOLVED' },
  { tier: '[■■■] HARD', pts: '+35 pts', title: 'Shortest Grid Path', status: '[ ] OPEN' },
  { tier: '[WEB] RUBRIC', pts: '+50 pts', title: 'Task Queue UI', status: '[ ] JUDGED' },
]

const PODIUM_ROWS = [
  { rank: '#1', name: '@ada_lovelace', solved: '4/5', pts: '85' },
  { rank: '#2', name: '@linus_t', solved: '3/5', pts: '70' },
  { rank: '#3', name: '@grace_h', solved: '3/5', pts: '55' },
  { rank: '#4', name: '@alan_m', solved: '2/5', pts: '30' },
]

const STEPS = [
  {
    num: '01',
    title: 'JOIN ROOM',
    desc: 'Pick a display name and enter the room code. No account, no password, no setup.',
  },
  {
    num: '02',
    title: 'CODE & TEST',
    desc: 'Write Python in VS Code or the browser editor. Every test runs locally via Pyodide.',
  },
  {
    num: '03',
    title: 'CLIMB PODIUM',
    desc: 'Passing runs score points immediately and stream to the live TV leaderboard.',
  },
]

// ── Interactive App Preview ────────────────────────────────────────────────────
function AppPreview() {
  const [activeTab, setActiveTab] = useState('editor')
  const [autoPlay, setAutoPlay] = useState(true)
  const [isInView, setIsInView] = useState(false)
  const [runPhase, setRunPhase] = useState('idle') // 'idle' | 'running' | 'done'
  const [passedCount, setPassedCount] = useState(0)
  const [clockSeconds, setClockSeconds] = useState(42 * 60 + 18)
  const sectionRef = useRef(null)
  const timersRef = useRef([])
  const panelRef = useRef(null)
  const summaryRef = useRef(null)

  const clearRunTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  useEffect(() => clearRunTimers, [clearRunTimers])

  // Detect when "## INSIDE THE ARENA" is scrolled into view
  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.25 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const triggerTestRun = useCallback(() => {
    clearRunTimers()
    setRunPhase('running')
    setPassedCount(0)

    timersRef.current.push(
      setTimeout(() => setPassedCount(1), 320),
      setTimeout(() => setPassedCount(2), 680),
      setTimeout(() => {
        setPassedCount(3)
        setRunPhase('done')
      }, 1050),
    )
  }, [clearRunTimers])

  // Auto-cycle tabs and trigger the editor test run only while scrolled into view
  useEffect(() => {
    if (!autoPlay || !isInView) return

    let nextTimer
    if (activeTab === 'editor') {
      const autoRun = setTimeout(() => triggerTestRun(), 650)
      nextTimer = setTimeout(() => setActiveTab('board'), 4200)
      return () => {
        clearTimeout(autoRun)
        clearTimeout(nextTimer)
      }
    }

    nextTimer = setTimeout(() => {
      setActiveTab((prev) => (prev === 'board' ? 'podium' : 'editor'))
    }, 3600)

    return () => clearTimeout(nextTimer)
  }, [autoPlay, isInView, activeTab, triggerTestRun])

  // Live ticking countdown for the TV Podium tab
  useEffect(() => {
    if (!isInView) return
    const id = setInterval(() => {
      setClockSeconds((s) => (s > 0 ? s - 1 : 42 * 60 + 18))
    }, 1000)
    return () => clearInterval(id)
  }, [isInView])

  // Animate tab content when in view or when switching tabs
  useEffect(() => {
    const panel = panelRef.current
    if (!panel || !isInView) return

    const anims = []
    anims.push(
      animate(panel, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 280,
        ease: 'outCubic',
      }),
    )

    if (activeTab === 'editor') {
      const lines = panel.querySelectorAll('.anim-code-line')
      if (lines.length) {
        anims.push(
          animate(lines, {
            opacity: [0, 1],
            translateX: [-8, 0],
            delay: stagger(35, { start: 40 }),
            duration: 240,
            ease: 'outCubic',
          }),
        )
      }
    } else if (activeTab === 'board') {
      const cards = panel.querySelectorAll('.anim-board-card')
      if (cards.length) {
        anims.push(
          animate(cards, {
            opacity: [0, 1],
            translateY: [12, 0],
            delay: stagger(60, { start: 40 }),
            duration: 300,
            ease: 'outCubic',
          }),
        )
      }
    } else if (activeTab === 'podium') {
      const blocks = panel.querySelectorAll('.anim-podium-block')
      const rows = panel.querySelectorAll('.anim-podium-row')
      if (blocks.length) {
        anims.push(
          animate(blocks, {
            opacity: [0, 1],
            translateY: [18, 0],
            delay: stagger(80, { start: 40 }),
            duration: 360,
            ease: 'outCubic',
          }),
        )
      }
      if (rows.length) {
        anims.push(
          animate(rows, {
            opacity: [0, 1],
            translateX: [-10, 0],
            delay: stagger(50, { start: 180 }),
            duration: 260,
            ease: 'outCubic',
          }),
        )
      }
    }

    return () => anims.forEach((a) => a?.revert?.())
  }, [activeTab, isInView])

  // Animate summary line when simulated run completes
  useEffect(() => {
    if (runPhase !== 'done' || !summaryRef.current) return
    const anim = animate(summaryRef.current, {
      opacity: [0.2, 1],
      translateY: [4, 0],
      duration: 280,
      ease: 'outCubic',
    })
    return () => anim?.revert?.()
  }, [runPhase])

  function handleSelectTab(tabId) {
    setAutoPlay(false)
    setActiveTab(tabId)
  }

  function handleManualRun() {
    if (runPhase === 'running') return
    setAutoPlay(false)
    triggerTestRun()
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="preview-heading"
      className="anim-preview opacity-0 mx-auto w-full max-w-5xl px-4 md:px-6 py-12"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="preview-heading" className="text-sm font-bold uppercase tracking-widest text-fg">
            ## INSIDE THE ARENA
          </h2>
          <p className="mt-1 text-xs text-fg-muted">
            Auto-cycling preview — click any tab or <span className="text-fg">&gt; run</span> to inspect.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAutoPlay((v) => !v)}
          className="h-7 border border-line-strong bg-surface-1 px-2.5 text-[11px] font-bold uppercase tracking-widest text-fg-muted hover:text-fg hover:bg-surface-3 transition-colors cursor-pointer"
        >
          {autoPlay ? '[●] AUTO' : '[❚❚] PAUSED'}
        </button>
      </div>

      <div className="border border-line-strong bg-surface-1 shadow-hard">
        {/* Window header + tab bar */}
        <div className="flex flex-col border-b border-line-strong bg-surface-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 px-4 py-2.5 text-xs text-fg-muted border-b border-line sm:border-b-0">
            <span className="text-fg font-bold" aria-hidden="true">&gt;_</span>
            <span>itp_competition</span>
          </div>

          <div role="tablist" aria-label="App preview views" className="flex flex-wrap">
            {PREVIEW_TABS.map((tab) => {
              const selected = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wider border-l border-line transition-colors cursor-pointer ${
                    selected
                      ? 'bg-invert-bg text-invert-fg'
                      : 'text-fg-muted hover:text-fg hover:bg-surface-3'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        <div ref={panelRef}>
          {activeTab === 'editor' && (
            <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-line-strong">
              {/* Code pane */}
              <div className="flex flex-col bg-surface-2">
                <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                  <span className="text-xs text-fg-muted">
                    solution.py · <span className="text-fg">Pyodide</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleManualRun}
                    disabled={runPhase === 'running'}
                    className={`h-8 border px-3 text-xs font-bold uppercase tracking-wider transition-transform ${
                      runPhase === 'running'
                        ? 'border-line-strong bg-hatch text-fg-muted opacity-50 cursor-not-allowed'
                        : 'border-invert-bg bg-invert-bg text-invert-fg hover:shadow-hard-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer'
                    }`}
                  >
                    {runPhase === 'running' ? '[…] running' : runPhase === 'done' ? '> run again' : '> run'}
                  </button>
                </div>

                <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-fg">
                  <code>
                    {SAMPLE_CODE.map((line, i) => (
                      <div key={i} className="anim-code-line flex gap-4">
                        <span className="w-4 shrink-0 select-none text-right text-fg-faint tabular-nums">
                          {i + 1}
                        </span>
                        <span className={i === 1 ? 'text-fg-muted' : 'text-fg'}>{line}</span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>

              {/* Terminal pane */}
              <div className="flex flex-col justify-between bg-surface-3 p-4 text-[13px] leading-6">
                <div>
                  <div className="mb-3 flex items-center justify-between border-b border-dashed border-line pb-2 text-xs uppercase tracking-widest text-fg-muted">
                    <span>TERMINAL OUTPUT</span>
                    <span>+15 PTS</span>
                  </div>

                  {runPhase === 'idle' ? (
                    <p className="text-fg-muted">
                      $ pyodide ready — click <span className="text-fg font-bold">&gt; run</span> to execute tests.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {SIMULATED_TESTS.map((t, idx) => {
                        const isPassed = idx < passedCount
                        const isCurrent = runPhase === 'running' && idx === passedCount
                        if (!isPassed && !isCurrent) return null
                        return (
                          <li key={t.label} className="flex items-start gap-2">
                            <span className={isPassed ? 'text-fg font-bold' : 'text-fg-muted'}>
                              {isPassed ? '[✓]' : '[…]'}
                            </span>
                            <div className="min-w-0">
                              <span className="text-fg">{t.label}</span>
                              <span className="ml-2 text-xs text-fg-muted">
                                {isPassed ? `— ${t.detail}` : '— executing...'}
                              </span>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>

                <div ref={summaryRef} className="mt-6 border-t border-dashed border-line pt-3 text-xs">
                  {runPhase === 'done' ? (
                    <p className="font-bold text-fg tabular-nums">
                      Passed 3/3 tests  +15 points
                    </p>
                  ) : (
                    <p className="text-fg-faint">
                      5s timeout · fresh globals per test
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Challenge Board */}
          {activeTab === 'board' && (
            <div className="p-4 sm:p-6 bg-surface-1">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
                  <span className="bg-invert-bg text-invert-fg px-2.5 py-1">ALL</span>
                  <span className="border border-line-strong px-2.5 py-1 text-fg-muted">EASY</span>
                  <span className="border border-line-strong px-2.5 py-1 text-fg-muted">MEDIUM</span>
                  <span className="border border-line-strong px-2.5 py-1 text-fg-muted">HARD</span>
                  <span className="border border-line-strong px-2.5 py-1 text-fg-muted">WEB</span>
                </div>
                <span className="text-xs text-fg-muted tabular-nums">ROOM: TEST1 · 45 PTS</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {BOARD_ITEMS.map((item) => (
                  <div
                    key={item.title}
                    className="anim-board-card border border-line-strong bg-surface-2 p-4 flex flex-col justify-between gap-3 hover:shadow-hard-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold tracking-wider">
                      <span className="text-fg-muted">{item.tier}</span>
                      <span className="text-fg tabular-nums">{item.pts}</span>
                    </div>
                    <div className="text-sm font-bold text-fg">{item.title}</div>
                    <div className="text-xs text-fg-muted">{item.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Live TV Podium */}
          {activeTab === 'podium' && (
            <div className="p-4 sm:p-6 bg-surface-1 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-fg">
                  [TEST1] LIVE STANDINGS
                </span>
                <span className="text-sm font-bold tabular-nums text-fg">
                  {formatClock(clockSeconds)}
                </span>
              </div>

              {/* Top 3 podium blocks on a dense dot-matrix stage */}
              <div className="border border-line bg-dots-dense p-4">
                <div className="grid grid-cols-3 items-end gap-3">
                  <div className="anim-podium-block border border-line-strong bg-surface-2 p-3 text-center">
                    <div className="text-xs text-fg-muted">#2</div>
                    <div className="mt-1 truncate text-xs font-bold text-fg">@linus_t</div>
                    <div className="mt-1 text-sm font-bold tabular-nums text-fg">70 pts</div>
                  </div>
                  <div className="anim-podium-block border border-invert-bg bg-invert-bg p-4 text-center text-invert-fg shadow-hard-sm">
                    <div className="text-xs font-bold">#1 LEADER</div>
                    <div className="mt-1 truncate text-sm font-bold">@ada_lovelace</div>
                    <div className="mt-1 text-base font-bold tabular-nums">85 pts</div>
                  </div>
                  <div className="anim-podium-block border border-line-strong bg-surface-2 p-3 text-center">
                    <div className="text-xs text-fg-muted">#3</div>
                    <div className="mt-1 truncate text-xs font-bold text-fg">@grace_h</div>
                    <div className="mt-1 text-sm font-bold tabular-nums text-fg">55 pts</div>
                  </div>
                </div>
              </div>

              {/* Compact table */}
              <div className="border border-line-strong divide-y divide-line text-xs">
                {PODIUM_ROWS.map((row) => (
                  <div key={row.rank} className="anim-podium-row flex items-center justify-between px-3 py-2 bg-surface-2">
                    <div className="flex items-center gap-4">
                      <span className="w-6 font-bold tabular-nums text-fg-muted">{row.rank}</span>
                      <span className="font-bold text-fg">{row.name}</span>
                    </div>
                    <div className="flex items-center gap-6 tabular-nums">
                      <span className="text-fg-muted">{row.solved}</span>
                      <span className="w-14 text-right font-bold text-fg">{row.pts} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()
  const root = useRef(null)
  const scope = useRef(null)

  useEffect(() => {
    const observers = []

    scope.current = createScope({ root }).add(() => {
      animate('.anim-nav', {
        opacity: [0, 1],
        translateY: [-16, 0],
        duration: 480,
        ease: 'outCubic',
      })

      animate('.anim-hero > *', {
        opacity: [0, 1],
        translateY: [28, 0],
        delay: stagger(100, { start: 100 }),
        duration: 520,
        ease: 'outCubic',
      })

      animate('.anim-stat', {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(70, { start: 420 }),
        duration: 440,
        ease: 'outCubic',
      })

      animate('.anim-scroll-cue', {
        translateY: [0, 5, 0],
        duration: 1800,
        loop: true,
        ease: 'inOutSine',
      })
    })

    // Scroll-triggered reveals for below-the-fold sections
    const rootEl = root.current
    if (rootEl && typeof IntersectionObserver !== 'undefined') {
      const revealTargets = [
        { selector: '.anim-preview', staggerMs: 0, y: 28, duration: 520 },
        { selector: '.anim-step', staggerMs: 90, y: 24, duration: 460 },
        { selector: '.anim-cta', staggerMs: 0, y: 20, duration: 460 },
      ]

      revealTargets.forEach(({ selector, staggerMs, y, duration }) => {
        const els = Array.from(rootEl.querySelectorAll(selector))
        if (!els.length) return

        const trigger = () => {
          animate(els, {
            opacity: [0, 1],
            translateY: [y, 0],
            delay: staggerMs ? stagger(staggerMs) : 0,
            duration,
            ease: 'outCubic',
          })
        }

        const observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              trigger()
              observer.disconnect()
            }
          },
          { threshold: 0.15 },
        )

        els.forEach((el) => observer.observe(el))
        observers.push(observer)
      })
    }

    return () => {
      observers.forEach((o) => o.disconnect())
      scope.current.revert()
    }
  }, [])

  function handleJoin(e) {
    e.preventDefault()
    const code = e.target.elements.room.value.trim().toUpperCase()
    navigate(code ? `/join?room=${code}` : '/join')
  }

  return (
    <div ref={root} className="relative flex flex-col overflow-x-hidden font-mono">
      <main className="relative z-10 flex-1">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="flex min-h-[calc(100svh-3rem)] flex-col items-center justify-center px-4 py-16 text-center">
          <div className="anim-hero flex flex-col items-center">
            <div className="opacity-0 inline-flex items-center gap-2 border border-line-strong bg-surface-1 bg-dots-dense px-3 h-7 mb-8 text-[11px] uppercase tracking-widest text-fg-muted shadow-hard-sm">
              <span className="text-fg font-bold">/</span>
              <ScrambleText text="Live Coding Competition · ITP 2026" delay={180} />
            </div>

            <h1 className="opacity-0 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-fg max-w-3xl mb-6">
              <ScrambleText text="Code Fast." delay={260} revealRate={30} />
              {' '}
              <em className="not-italic italic font-normal">
                <ScrambleText text="Think Sharp" delay={480} revealRate={30} />
              </em>
              <span className="text-fg-muted">.</span>
            </h1>

            <p className="opacity-0 text-sm leading-7 text-fg-muted max-w-xl mb-10">
              <ScrambleText
                delay={650}
                revealRate={90}
                text="Solve Python and web challenges against the clock. Every submission runs instantly in your browser — no installs, no server, just you and the problem."
              />
            </p>

            <form
              onSubmit={handleJoin}
              className="opacity-0 flex w-full max-w-md border border-line-strong bg-surface-2 shadow-hard-sm transition-shadow focus-within:border-fg focus-within:shadow-hard"
            >
              <label htmlFor="landing-room" className="sr-only">Room code</label>
              <div className="flex items-center flex-1 px-4 gap-3">
                <span className="text-fg-faint text-xs select-none" aria-hidden="true">#</span>
                <input
                  id="landing-room"
                  name="room"
                  type="text"
                  maxLength={12}
                  autoComplete="off"
                  placeholder="ENTER ROOM CODE..."
                  className="flex-1 h-12 bg-transparent text-xs font-bold uppercase tracking-widest text-fg placeholder:text-fg-faint placeholder:font-normal placeholder:normal-case placeholder:tracking-normal outline-none"
                />
              </div>
              <button
                type="submit"
                aria-label="Join room"
                className="h-12 w-12 flex items-center justify-center bg-invert-bg text-invert-fg text-lg font-bold hover:shadow-hard-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform active:translate-x-0 active:translate-y-0 active:shadow-none shrink-0 cursor-pointer"
              >
                →
              </button>
            </form>

            <div className="opacity-0 mt-5 flex flex-wrap items-center justify-center gap-6 text-xs text-fg-muted">
              <Link to="/join" className="hover:text-fg underline-offset-4 hover:underline">
                $ join without code
              </Link>
              <Link to="/leaderboard" className="hover:text-fg underline-offset-4 hover:underline">
                &gt; watch live tv
              </Link>
            </div>

            <div className="opacity-0 mt-10 text-[11px] uppercase tracking-widest text-fg-faint" aria-hidden="true">
              <span className="anim-scroll-cue inline-block">↓ scroll to preview</span>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ────────────────────────────────────────────────────── */}
        <section aria-label="Event stats" className="mx-auto w-full max-w-5xl px-4 md:px-6 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 border border-line-strong bg-surface-1 shadow-hard-sm divide-y md:divide-y-0 md:divide-x divide-line">
            {STATS.map((stat) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                delay={stat.delay}
              />
            ))}
          </div>
        </section>

        {/* ── Interactive App Preview ──────────────────────────────────────── */}
        <AppPreview />

        {/* ── How It Works ─────────────────────────────────────────────────── */}
        <section aria-labelledby="how-heading" className="mx-auto w-full max-w-5xl px-4 md:px-6 py-8">
          <h2 id="how-heading" className="mb-4 text-sm font-bold uppercase tracking-widest text-fg">
            ## HOW IT WORKS
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="anim-step opacity-0 border border-line-strong bg-surface-1 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm"
              >
                <div className="border-b border-line bg-dots-dense px-5 py-2.5 text-xs font-bold tracking-widest text-fg">
                  {step.num} / {step.title}
                </div>
                <p className="p-5 text-sm leading-6 text-fg-muted">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
        <section aria-label="Get started" className="mx-auto w-full max-w-5xl px-4 md:px-6 pt-4 pb-16">
          <div className="anim-cta opacity-0 flex flex-col items-start justify-between gap-4 border border-line-strong bg-surface-1 bg-dots-dense p-6 shadow-hard-sm sm:flex-row sm:items-center">
            <div className="bg-surface-1 border border-line px-4 py-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-fg">
                READY TO COMPETE?
              </h2>
              <p className="mt-1 text-xs text-fg-muted">
                Enter a room code to start solving, or open the live TV board.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/join"
                className="inline-flex h-10 items-center border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm active:translate-x-0 active:translate-y-0 active:shadow-none"
              >
                $ join room
              </Link>
              <Link
                to="/leaderboard"
                className="inline-flex h-10 items-center border border-line-strong bg-surface-1 px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3"
              >
                &gt; view leaderboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
