import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { animate, scrambleText, steps, stagger } from 'animejs'
import LeaderboardTable from '../components/LeaderboardTable'
import Podium from '../components/Podium'
import StatusGlyph from '../components/StatusGlyph'
import { useCountdown } from '../hooks/useCountdown'
import { useTvData } from '../hooks/useTvData'
import { formatDuration } from '../lib/formatDuration'
import { prefersReducedMotion, snapIn } from '../lib/motion'
import { useSessionStore } from '../stores/sessionStore'

function FullScreenMessage({ children }) {
  return (
    <main className="flex min-h-svh items-center justify-center px-8 text-center text-2xl text-fg font-mono">
      {children}
    </main>
  )
}

export default function Tv() {
  const { roomCode } = useParams()
  const profile = useSessionStore((s) => s.profile)
  const { room, rows, totalChallenges, updatedAt, loading, error } = useTvData(roomCode)
  const remaining = useCountdown(room?.ends_at)

  const [activeTab, setActiveTab] = useState('global')
  const [now, setNow] = useState(() => Date.now())

  const containerRef = useRef(null)
  const hasAnimatedRef = useRef(false)
  const titleRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const secondsAgo = updatedAt ? Math.max(0, Math.floor((now - updatedAt) / 1000)) : 0

  if (loading) {
    return <FullScreenMessage>[…] loading leaderboard</FullScreenMessage>
  }

  if (error) {
    return (
      <FullScreenMessage>
        <div className="border border-dashed border-line-strong p-6">
          <StatusGlyph status="error" label={error} />
        </div>
      </FullScreenMessage>
    )
  }

  if (!room) {
    return (
      <FullScreenMessage>
        <div>
          <p className="text-3xl font-bold">Room not found</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-lg text-fg-muted">
            <Link to="/leaderboard" className="underline">
              Try another code
            </Link>
            <Link to="/" className="underline">
              Go to join
            </Link>
          </div>
        </div>
      </FullScreenMessage>
    )
  }

  const ended = Boolean(
    room.status === 'ended' || (room.ends_at && remaining !== null && remaining <= 0),
  )

  let timerLabel = ''
  if (ended) timerLabel = "Time's up"
  else if (room.status === 'lobby') timerLabel = 'Lobby'
  else if (remaining !== null && remaining > 0) timerLabel = `${formatDuration(remaining)} left`

  const updatedMinutes = String(Math.floor(secondsAgo / 60)).padStart(2, '0')
  const updatedSeconds = String(secondsAgo % 60).padStart(2, '0')
  const updatedString = `updated ${updatedMinutes}:${updatedSeconds} ago`

  const top3 = rows.slice(0, 3)
  const restRows = rows.slice(3)

  return (
    <TvContent
      containerRef={containerRef}
      hasAnimatedRef={hasAnimatedRef}
      titleRef={titleRef}
      loading={loading}
      room={room}
      ended={ended}
      timerLabel={timerLabel}
      updatedString={updatedString}
      top3={top3}
      restRows={restRows}
      totalChallenges={totalChallenges}
      profile={profile}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  )
}

function TvContent({
  containerRef,
  hasAnimatedRef,
  titleRef,
  loading,
  room,
  ended,
  timerLabel,
  updatedString,
  top3,
  restRows,
  totalChallenges,
  profile,
  activeTab,
  setActiveTab,
}) {
  const standingsRef = useRef(null)

  useEffect(() => {
    if (standingsRef.current && hasAnimatedRef.current) {
      snapIn(standingsRef.current, { y: 6, duration: 150 })
    }
  }, [activeTab, hasAnimatedRef])

  // Entrance animation — runs once when data is ready
  useEffect(() => {
    if (loading || hasAnimatedRef.current || !containerRef.current) return
    if (prefersReducedMotion()) return
    hasAnimatedRef.current = true

    const container = containerRef.current

    // Header slide-in
    const header = container.querySelector('.tv-header')
    if (header) {
      animate(header, {
        translateY: [-12, 0],
        opacity: [0, 1],
        duration: 200,
        ease: steps(3),
      })
    }

    // Title scramble decrypt
    if (titleRef.current) {
      animate(titleRef.current, {
        textContent: scrambleText({
          text: '# Leaderboard',
          revealRate: 25,
          chars: 'A-Z0-9#_[]·',
        }),
      })
    }

    // Podium cards stagger-in
    const podiumCards = container.querySelectorAll('.tv-podium-card')
    if (podiumCards.length) {
      animate(podiumCards, {
        translateY: [16, 0],
        opacity: [0, 1],
        duration: 220,
        ease: steps(3),
        delay: stagger(80, { start: 100 }),
      })
    }

    // Standings table slide-in
    const standings = container.querySelector('.tv-standings')
    if (standings) {
      animate(standings, {
        translateY: [12, 0],
        opacity: [0, 1],
        duration: 200,
        ease: steps(3),
        delay: 280,
      })
    }
  }, [loading, containerRef, hasAnimatedRef, titleRef])

  return (
    <main ref={containerRef} className="min-h-svh px-4 py-6 md:px-8 text-fg">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <section className="tv-header flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-line pb-6">
          <div>
            <h1
              ref={titleRef}
              className="font-mono text-3xl md:text-4xl font-bold tracking-tight text-fg"
            >
              # Leaderboard
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-xs text-fg-muted">
              <span>~/leaderboard</span>
              <span>·</span>
              {room.status === 'live' && !ended ? (
                <span className="flex items-center gap-1.5 text-fg font-bold">
                  <span className="inline-block h-2 w-2 rounded-full bg-fg live-pulse" />
                  <span>live</span>
                </span>
              ) : ended ? (
                <span>[✓] ended</span>
              ) : (
                <span>[ ] waiting</span>
              )}
              {timerLabel ? (
                <>
                  <span>·</span>
                  <span className="tabular-nums font-bold">{timerLabel}</span>
                </>
              ) : null}
              <span>·</span>
              <span className="tabular-nums">{updatedString}</span>
              {room.code ? (
                <>
                  <span>·</span>
                  <span className="font-bold">[{room.code}]</span>
                </>
              ) : null}
            </div>
          </div>

          {/* Scope Filter Tabs */}
          <div
            className="flex items-center gap-1.5 self-start sm:self-auto font-mono text-xs"
            role="group"
            aria-label="Leaderboard scope filters"
          >
            {['global', 'today', 'team'].map((tab) => {
              const active = activeTab === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`h-7 px-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    active
                      ? 'bg-invert-bg text-invert-fg border border-invert-bg'
                      : 'border border-line-strong text-fg-muted hover:text-fg hover:bg-surface-3'
                  }`}
                >
                  {tab}
                </button>
              )
            })}
          </div>
        </section>

        {/* PODIUM SECTION */}
        <section className="mt-8">
          <h2 className="font-mono text-xs md:text-sm font-bold uppercase tracking-widest text-fg-muted">
            ## PODIUM
          </h2>
          <div className="mt-4">
            <Podium players={top3} totalChallenges={totalChallenges} />
          </div>
        </section>

        {/* STANDINGS TABLE SECTION */}
        <section ref={standingsRef} className="tv-standings mt-10">
          <LeaderboardTable
            players={restRows}
            currentUserId={profile?.id}
            totalChallenges={totalChallenges}
            pageSize={10}
          />
        </section>
      </div>
    </main>
  )
}
