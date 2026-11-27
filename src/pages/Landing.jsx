import { animate, createScope, scrambleText, stagger } from 'animejs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDuration } from '../lib/formatDuration'

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

const SAMPLE_POINTS = 3
const SAMPLE_TOTAL = 25

function progressBlocks(solved, total) {
  const filled = Math.min(10, Math.round((solved / total) * 10))
  return '■'.repeat(filled) + '□'.repeat(10 - filled)
}

const PREVIEW_TABS = [
  { id: 'editor', label: '01 EDITOR + TERMINAL' },
  { id: 'board', label: '02 CHALLENGE BOARD' },
  { id: 'podium', label: '03 LEADERBOARD' },
]

const SAMPLE_CODE = [
  'def even_sum(numbers):',
  '    """Return the sum of even numbers."""',
  '    total = 0',
  '    for n in numbers:',
  '        if n % 2 == 0:',
  '            total += n',
  '    return total',
]

const SIMULATED_TESTS = [
  { label: 'case 1 AC', detail: 'even_sum([1, 2, 3, 4])' },
  { label: 'case 2 AC', detail: 'even_sum([])' },
  { label: 'case 3 AC', detail: 'even_sum([1, 3])' },
  { label: 'case 4 AC', detail: 'even_sum([-2, 0, 8])' },
  { label: 'case 5 (hidden) AC', detail: '' },
]

const BOARD_ITEMS = [
  { num: '026', tier: 'EASY', status: '[✓]', title: 'Star Staircase', blocks: '■□□□□', pts: '3 pts' },
  { num: '027', tier: 'EASY', status: '[✓]', title: 'Hollow Frame', blocks: '■□□□□', pts: '3 pts' },
  { num: '030', tier: 'MEDIUM', status: '[~]', title: 'Pyramid Parade', blocks: '■■■□□', pts: '6 pts' },
  { num: '034', tier: 'HARD', status: '[ ]', title: 'Robot Courier', blocks: '■■■■■', pts: '11 pts' },
]

const PODIUM_ROWS = [
  { rank: '01', name: '@SwiftFalcon42', solved: 12, pts: '0131' },
  { rank: '02', name: '@BrightOtter17', solved: 10, pts: '0104' },
  { rank: '03', name: '@CleverPanda83', solved: 9, pts: '0087' },
  { rank: '04', name: '@BraveComet26', solved: 7, pts: '0062' },
]

const STEPS = [
  {
    num: '01',
    title: 'JOIN ROOM',
    desc: "Pick a display name and enter the room code. You don't need an account or a password.",
  },
  {
    num: '02',
    title: 'CODE & TEST',
    desc: 'Python tests run locally through Pyodide. Web challenges are scored in person.',
  },
  {
    num: '03',
    title: 'CLIMB PODIUM',
    desc: 'Each revealed hint costs 1 point. The first full solve in a room adds 5 bonus points.',
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

  // Detect when "## APP PREVIEW" is scrolled into view
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

    for (let i = 1; i < SIMULATED_TESTS.length; i += 1) {
      timersRef.current.push(setTimeout(() => setPassedCount(i), i * 180))
    }
    timersRef.current.push(
      setTimeout(() => {
        setPassedCount(SIMULATED_TESTS.length)
        setRunPhase('done')
      }, SIMULATED_TESTS.length * 210),
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
            ## APP PREVIEW
          </h2>
          <p className="mt-1 text-xs text-fg-muted">
            Sample standings and shipped puzzles. Click any tab or <span className="text-fg">&gt; run</span> to inspect.
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
                  className={`px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wider border-l border-line transition-colors cursor-pointer ${selected
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
                    className={`h-8 border px-3 text-xs font-bold uppercase tracking-wider transition-transform ${runPhase === 'running'
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
                    <span>+{SAMPLE_POINTS} PTS</span>
                  </div>

                  {runPhase === 'idle' ? (
                    <p className="text-fg-muted">
                      $ pyodide ready. Click <span className="text-fg font-bold">&gt; run</span> to execute tests.
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
                              {isPassed ? (
                                t.detail ? (
                                  <span className="ml-2 text-xs text-fg-muted">- {t.detail}</span>
                                ) : null
                              ) : (
                                <span className="ml-2 text-xs text-fg-muted">- executing...</span>
                              )}
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
                      Passed {SIMULATED_TESTS.length}/{SIMULATED_TESTS.length} tests  +{SAMPLE_POINTS} points
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
                <span className="text-xs text-fg-muted tabular-nums">
                  [{progressBlocks(2, SAMPLE_TOTAL)}] 2/{SAMPLE_TOTAL} solved
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {BOARD_ITEMS.map((item) => (
                  <div
                    key={item.title}
                    className="anim-board-card flex flex-col border border-line-strong bg-surface-2 hover:shadow-hard-sm transition-shadow"
                  >
                    <div className="flex h-8 items-center justify-between border-b border-line-strong px-3 text-[11px] font-bold tracking-wider">
                      <span className="tabular-nums text-fg">{item.num}</span>
                      <span className="border border-line-strong px-2 text-fg-muted">[{item.tier}]</span>
                      <span className="tabular-nums text-fg">{item.status}</span>
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-4 p-4">
                      <div className="text-sm font-bold text-fg">{item.title}</div>
                      <div className="flex items-center justify-between text-[11px] text-fg-muted">
                        <span aria-hidden="true">{item.blocks}</span>
                        <span className="font-bold tabular-nums">{item.pts}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Live leaderboard */}
          {activeTab === 'podium' && (
            <div className="p-4 sm:p-6 bg-surface-1 space-y-6">
              <div className="border-b border-line pb-3">
                <div className="text-sm font-bold uppercase tracking-widest text-fg">
                  # Leaderboard
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                  <span>~/leaderboard</span>
                  <span>·</span>
                  <span className="font-bold text-fg">live</span>
                  <span>·</span>
                  <span className="tabular-nums font-bold text-fg">
                    {formatDuration(clockSeconds * 1000)} left
                  </span>
                  <span>·</span>
                  <span className="font-bold">[TEST1]</span>
                </div>
              </div>

              {/* Top 3 podium blocks on a dense dot-matrix stage */}
              <div className="border border-line bg-dots-dense p-4">
                <div className="grid grid-cols-3 items-end gap-3">
                  {[PODIUM_ROWS[1], PODIUM_ROWS[0], PODIUM_ROWS[2]].map((row, idx) => {
                    const isLeader = idx === 1
                    return (
                      <div
                        key={row.rank}
                        className={`anim-podium-block border p-3 text-center ${
                          isLeader
                            ? 'border-invert-bg bg-invert-bg text-invert-fg shadow-hard-sm'
                            : 'border-line-strong bg-surface-2 text-fg'
                        }`}
                      >
                        <div className={`flex items-center justify-between text-xs ${isLeader ? '' : 'text-fg-muted'}`}>
                          <span className="tabular-nums">{row.rank}</span>
                          <span aria-hidden="true">[★]</span>
                        </div>
                        <div className={`mt-1 truncate text-xs font-bold ${isLeader ? '' : 'text-fg'}`}>
                          {row.name}
                        </div>
                        <div className="mt-1 text-sm font-bold tabular-nums">{row.pts} pts</div>
                        <div
                          className={`mt-1 truncate text-[10px] tracking-tight ${isLeader ? '' : 'text-fg-muted'}`}
                          aria-label={`${row.solved} of ${SAMPLE_TOTAL} solved`}
                        >
                          [{progressBlocks(row.solved, SAMPLE_TOTAL)}]
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Compact table */}
              <div className="border border-line-strong divide-y divide-line text-xs">
                <div className="flex items-center justify-between border-b border-line-strong px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-fg-muted">
                  <span className="w-6">#</span>
                  <span className="flex-1">HANDLE</span>
                  <span className="text-right">POINTS</span>
                </div>
                {PODIUM_ROWS.map((row) => (
                  <div key={row.rank} className="anim-podium-row flex items-center justify-between px-3 py-2 bg-surface-2">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="w-6 font-bold tabular-nums text-fg-muted">{row.rank}</span>
                      <span className="truncate font-bold text-fg">{row.name}</span>
                    </div>
                    <div className="flex items-center gap-3 tabular-nums">
                      <span
                        className="hidden text-fg-muted sm:inline"
                        aria-label={`${row.solved} of ${SAMPLE_TOTAL} solved`}
                      >
                        [{progressBlocks(row.solved, SAMPLE_TOTAL)}]
                      </span>
                      <span className="w-16 text-right font-bold text-fg">{row.pts} pts</span>
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
                text="Solve Python and web challenges against the clock. Tests run in your browser, so there is nothing to install."
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
                JOIN A ROOM
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
