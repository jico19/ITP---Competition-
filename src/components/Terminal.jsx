import { useEffect, useRef, useState } from 'react'
import { animate, scrambleText, steps, stagger } from 'animejs'
import { popStamp, prefersReducedMotion, snapIn } from '../lib/motion'

export default function Terminal({
  tests = [],
  results = null,
  running = false,
  engine = {},
  summary = null,
  stdoutText = '',
  submissions = [],
  className = '',
}) {
  const [activeTab, setActiveTab] = useState('tests')

  // Derive summary status
  let bannerKind = 'info'
  let bannerText = ''

  if (!engine.ready) {
    bannerKind = 'loading'
    bannerText = engine.error || '[…] LOADING PYTHON · initializing runtime'
  } else if (running) {
    bannerKind = 'running'
    bannerText = `[…] RUNNING · executing ${tests.length} test case(s)`
  } else if (summary) {
    bannerKind = summary.kind
    bannerText = summary.text
  } else if (results) {
    const passed = results.filter((r) => r.passed).length
    const total = tests.length
    if (passed === total && total > 0) {
      bannerKind = 'accepted'
      bannerText = `[✓] ACCEPTED · all ${total} tests passed`
    } else {
      const firstFailedIndex = results.findIndex((r) => !r.passed)
      bannerKind = 'wrong'
      bannerText = `[!] WRONG ANSWER · case ${firstFailedIndex >= 0 ? firstFailedIndex + 1 : 1}/${total}`
    }
  } else {
    bannerKind = 'ready'
    bannerText = `[ ] READY · ${tests.length} test case(s) loaded`
  }

  const casesContainerRef = useRef(null)
  const tabBodyRef = useRef(null)
  const bannerRef = useRef(null)
  const prevBannerRef = useRef(bannerText)
  const animRef = useRef(null)

  useEffect(() => {
    if (tabBodyRef.current) {
      snapIn(tabBodyRef.current, { y: 6, duration: 150 })
    }
  }, [activeTab])

  useEffect(() => {
    if (bannerKind === 'accepted' && bannerRef.current) {
      popStamp(bannerRef.current, { duration: 180 })
    }
  }, [bannerKind])

  useEffect(() => {
    if (prevBannerRef.current === bannerText) return
    prevBannerRef.current = bannerText

    if (prefersReducedMotion() || !bannerRef.current) return

    if (animRef.current) {
      animRef.current.cancel()
    }

    animRef.current = animate(bannerRef.current, {
      textContent: scrambleText({
        text: bannerText,
        revealRate: 25,
        chars: 'A-Z0-9!%#_[]· ',
      }),
      onComplete: () => {
        if (bannerRef.current) {
          bannerRef.current.textContent = bannerText
        }
        animRef.current = null
      },
    })

    return () => {
      if (animRef.current) {
        animRef.current.cancel()
      }
    }
  }, [bannerText])

  useEffect(() => {
    if (!results || prefersReducedMotion() || !casesContainerRef.current) return
    const rows = casesContainerRef.current.querySelectorAll('.terminal-case-row')
    if (rows.length > 0) {
      animate(rows, {
        opacity: [0, 1],
        translateX: [-16, 0],
        delay: stagger(90),
        duration: 220,
        ease: steps(3),
      })
    }
  }, [results])

  return (
    <div className={`flex flex-col border-t border-line-strong bg-surface-2 font-mono text-xs ${className}`}>
      {/* Top Tabs */}
      <div className="flex items-center gap-2 border-b border-line px-4 py-2 bg-surface-1">
        <button
          type="button"
          onClick={() => setActiveTab('tests')}
          className={`h-6 px-3 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'tests'
              ? 'bg-invert-bg text-invert-fg'
              : 'border border-line text-fg-muted hover:text-fg'
          }`}
        >
          TESTS
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stdout')}
          className={`h-6 px-3 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'stdout'
              ? 'bg-invert-bg text-invert-fg'
              : 'border border-line text-fg-muted hover:text-fg'
          }`}
        >
          STDOUT
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`h-6 px-3 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-invert-bg text-invert-fg'
              : 'border border-line text-fg-muted hover:text-fg'
          }`}
        >
          SUBMISSIONS
        </button>
      </div>

      {/* Tab Panels */}
      <div ref={tabBodyRef} className="flex-1 overflow-auto p-4 min-h-[180px] max-h-[300px]">
        {activeTab === 'tests' && (
          <div className="space-y-4">
            {/* Result Summary Banner */}
            <div
              ref={bannerRef}
              className={`border border-dashed p-3 font-bold uppercase tracking-wide text-xs ${
                bannerKind === 'accepted'
                  ? 'border-fg bg-surface-3 text-fg'
                  : bannerKind === 'wrong' || bannerKind === 'error'
                  ? 'border-line-strong text-fg'
                  : 'border-line text-fg-muted'
              }`}
            >
              {bannerText}
            </div>

            {/* Test Cases List */}
            <div ref={casesContainerRef} className="space-y-2 pt-1 font-mono text-xs">
              {tests.map((test, index) => {
                const res = results ? results[index] : null
                const caseLabel = `case ${index + 1}`

                if (!results) {
                  return (
                    <div key={index} className="terminal-case-row flex items-center justify-between text-fg-muted">
                      <span>[ ] {caseLabel}</span>
                      <span className="tabular-nums">ready</span>
                    </div>
                  )
                }

                if (res) {
                  if (res.passed) {
                    return (
                      <div key={index} className="terminal-case-row flex items-center justify-between text-fg">
                        <span className="flex items-center gap-3">
                          <span className="font-bold text-fg">[✓]</span>
                          <span>{caseLabel}</span>
                        </span>
                        <span className="tabular-nums text-fg-muted">
                          {res.duration ? `${res.duration}ms` : 'passed'}
                        </span>
                      </div>
                    )
                  }

                  // Failed test
                  return (
                    <div key={index} className="terminal-case-row space-y-1 text-fg">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-3">
                          <span className="font-bold text-fg">[!]</span>
                          <span className="font-bold">{caseLabel}</span>
                        </span>
                        {res.duration ? (
                          <span className="tabular-nums text-fg-muted">{res.duration}ms</span>
                        ) : null}
                      </div>

                      {res.visible ? (
                        <div className="pl-6 text-[11px] text-fg-muted space-y-0.5">
                          {res.error ? (
                            <p className="text-fg font-bold">
                              error: {res.error} {res.line ? `(line ${res.line})` : ''}
                            </p>
                          ) : (
                            <p>
                              expected <code className="text-fg">{JSON.stringify(res.expected)}</code>{' '}
                              got <code className="text-fg">{JSON.stringify(res.got)}</code>
                            </p>
                          )}
                          {res.stdout ? (
                            <p>
                              stdout <code className="text-fg">{JSON.stringify(res.stdout)}</code>
                            </p>
                          ) : null}
                          {res.hint ? <p className="text-fg">{res.hint}</p> : null}
                        </div>
                      ) : (
                        <div className="pl-6 text-[11px] text-fg-muted space-y-0.5">
                          <p>(hidden test failed)</p>
                          {res.hint ? <p className="text-fg">{res.hint}</p> : null}
                        </div>
                      )}
                    </div>
                  )
                }

                // Not run
                return (
                  <div key={index} className="terminal-case-row flex items-center justify-between text-fg-muted opacity-60">
                    <span className="flex items-center gap-3">
                      <span>[ ]</span>
                      <span>{caseLabel}</span>
                    </span>
                    <span>not run</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'stdout' && (
          <div className="text-xs">
            {stdoutText ? (
              <pre className="whitespace-pre-wrap font-mono text-fg leading-5">
                {stdoutText}
              </pre>
            ) : (
              <p className="text-fg-muted">No stdout output captured from code execution.</p>
            )}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div>
            {submissions.length === 0 ? (
              <p className="text-fg-muted">No previous submissions recorded for this challenge.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-line-strong text-fg-muted uppercase text-[10px] tracking-wider">
                      <th className="py-1">Status</th>
                      <th className="py-1">Tests</th>
                      <th className="py-1">Points</th>
                      <th className="py-1 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => {
                      const isAc = sub.passed === sub.total && sub.total > 0
                      const date = new Date(sub.created_at)
                      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                      return (
                        <tr key={sub.id} className="border-b border-line hover:bg-surface-3">
                          <td className="py-2">
                            <span className={isAc ? 'font-bold text-fg' : 'text-fg-muted'}>
                              {isAc ? '[✓] AC' : '[!] WA'}
                            </span>
                          </td>
                          <td className="py-2 tabular-nums">
                            {sub.passed}/{sub.total}
                          </td>
                          <td className="py-2 tabular-nums">
                            +{sub.points} pts
                          </td>
                          <td className="py-2 text-right tabular-nums text-fg-muted">
                            {timeStr}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
