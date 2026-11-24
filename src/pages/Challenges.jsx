import { useEffect, useRef, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { animate, scrambleText, stagger } from 'animejs'
import ChallengeCard from '../components/ChallengeCard'
import ConfirmModal from '../components/ConfirmModal'
import Countdown from '../components/Countdown'
import RoundBanner from '../components/RoundBanner'
import StatusGlyph from '../components/StatusGlyph'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { useChallenges } from '../hooks/useChallenges'
import { useRoom } from '../hooks/useRoom'
import { useSession } from '../hooks/useSession'
import { prefersReducedMotion } from '../lib/motion'
import { supabase } from '../lib/supabase'
import { useSessionStore } from '../stores/sessionStore'

const filters = [
  { key: 'all', label: 'ALL' },
  { key: 'easy', label: 'EASY' },
  { key: 'medium', label: 'MEDIUM' },
  { key: 'hard', label: 'HARD' },
  { key: 'web', label: 'WEB' },
]

function NeedRoom() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10 md:px-6">
      <div className="border border-line-strong bg-surface-1 p-6">
        <h1 className="text-2xl font-bold tracking-tight"># Join a room first</h1>
        <p className="mt-3 text-sm text-fg-muted">
          You need to join a room before viewing challenges.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg hover:shadow-hard-sm"
        >
          $ go to join
        </Link>
      </div>
    </main>
  )
}

export default function Challenges() {
  const { profile, hydrated } = useSession()
  const clearSession = useSessionStore((s) => s.clearSession)
  const navigate = useNavigate()
  const roomQuery = useRoom(profile?.room_id)
  const { challenges, solvedIds, attemptedIds = new Set(), loading, error } = useChallenges(profile?.id)

  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const solvedCount = useAnimatedNumber(solvedIds.size, { duration: 400 })

  const isRoomEnded = roomQuery.room?.status === 'ended'
  const gridRef = useRef(null)
  const containerRef = useRef(null)
  const hasAnimatedRef = useRef(false)
  const titleRef = useRef(null)
  const progressRef = useRef(null)
  const prevProgressRef = useRef('')

  async function handleLeaveConfirm() {
    setLeaving(true)
    try {
      await supabase.auth.signOut()
    } catch {
      // Best-effort: clear local session either way.
    }
    clearSession()
    navigate('/')
  }

  // Entrance animation — runs once when data is ready
  useEffect(() => {
    if (loading || hasAnimatedRef.current || !containerRef.current || !profile) return
    if (prefersReducedMotion()) return
    hasAnimatedRef.current = true

    const container = containerRef.current

    const banner = container.querySelector('.ch-banner')
    if (banner) {
      animate(banner, {
        translateY: [-10, 0],
        opacity: [0, 1],
        duration: 180,
        ease: 'steps(3)',
      })
    }

    const header = container.querySelector('.ch-header')
    if (header) {
      animate(header, {
        translateY: [-12, 0],
        opacity: [0, 1],
        duration: 200,
        ease: 'steps(3)',
        delay: 60,
      })
    }

    if (titleRef.current) {
      animate(titleRef.current, {
        textContent: scrambleText({
          text: '# Challenge Board',
          revealRate: 25,
          chars: 'A-Z0-9#_[]·',
        }),
      })
    }

    const filtersEl = container.querySelector('.ch-filters')
    if (filtersEl) {
      animate(filtersEl, {
        translateX: [-12, 0],
        opacity: [0, 1],
        duration: 180,
        ease: 'steps(3)',
        delay: 140,
      })
    }
  }, [loading, profile])

  // Progress readout scramble
  const totalCount = challenges.length
  useEffect(() => {
    if (!progressRef.current || prefersReducedMotion()) return
    const text = `${solvedCount}/${totalCount} solved`
    if (text === prevProgressRef.current) return
    prevProgressRef.current = text

    animate(progressRef.current, {
      textContent: scrambleText({
        text,
        revealRate: 30,
        chars: '0-9/',
      }),
    })
  }, [solvedCount, totalCount])

  // Filtered challenges based on activeFilter and grep search
  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      if (activeFilter === 'easy' && c.tier !== 'easy') return false
      if (activeFilter === 'medium' && c.tier !== 'medium') return false
      if (activeFilter === 'hard' && c.tier !== 'hard') return false
      if (activeFilter === 'web' && c.type !== 'web') return false

      if (search.trim()) {
        const term = search.trim().toLowerCase()
        const titleMatch = c.title.toLowerCase().includes(term)
        const tagMatch = (c.type === 'web' ? 'web' : c.tier).toLowerCase().includes(term)
        const numMatch = String(c.sort_order ?? '').includes(term)
        if (!titleMatch && !tagMatch && !numMatch) return false
      }
      return true
    })
  }, [challenges, activeFilter, search])

  useEffect(() => {
    if (!gridRef.current) return
    const cards = gridRef.current.querySelectorAll('.challenge-card-item')
    if (cards.length > 0) {
      animate(cards, {
        opacity: [0, 1],
        translateY: [12, 0],
        delay: stagger(40),
        duration: 180,
        ease: 'steps(3)',
      })
    }
  }, [filteredChallenges, activeFilter])

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <StatusGlyph status="loading" label="Loading session..." />
      </main>
    )
  }

  if (!profile) return <NeedRoom />

  const ratio = totalCount === 0 ? 0 : solvedCount / totalCount
  const filledBlocks = Math.round(ratio * 10)
  const progressCells = '■'.repeat(filledBlocks) + '□'.repeat(10 - filledBlocks)

  return (
    <main ref={containerRef} className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      {/* Room Status & Timer */}
      <div className="ch-banner">
        <RoundBanner
        room={roomQuery.room}
        loading={roomQuery.loading}
        error={roomQuery.error}
        onRetry={roomQuery.reload}
      />
      <Countdown room={roomQuery.room} loading={roomQuery.loading} error={roomQuery.error} />
      </div>

      {/* Header section matching ui-pics/2 · Challenge Board */}
      <section className="ch-header mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            ref={titleRef}
            className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-fg"
          >
            # Challenge Board
          </h1>
          <p className="mt-1 font-mono text-xs text-fg-muted">~/board</p>
          <button
            type="button"
            onClick={() => setLeaveModalOpen(true)}
            disabled={leaving}
            className="mt-3 inline-flex h-8 items-center border border-line-strong px-3 font-mono text-xs font-bold uppercase tracking-wider text-fg-muted hover:bg-surface-3 hover:text-fg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            $ back to join
          </button>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-fg-muted block mb-1">
            PROGRESS
          </span>
          <div
            className="font-mono text-base md:text-lg font-bold tabular-nums text-fg flex items-center sm:justify-end gap-2.5"
            aria-label={`${solvedCount} of ${totalCount} solved`}
          >
            <span className="tracking-widest" aria-hidden="true">[{progressCells}]</span>
            <span ref={progressRef}>{solvedCount}/{totalCount} solved</span>
          </div>
        </div>
      </section>

      {/* Divider */}
      <hr className="my-6 border-dashed border-line" />

      {/* Filter tabs and grep search toolbar */}
      <section className="ch-filters flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Challenge category filters">
          {filters.map((f) => {
            const active = activeFilter === f.key
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFilter(f.key)}
                className={`h-7 px-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  active
                    ? 'bg-invert-bg text-invert-fg border border-invert-bg'
                    : 'border border-line-strong text-fg-muted hover:text-fg hover:bg-surface-3'
                }`}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Terminal Grep Search */}
        <div className="flex items-center border border-line-strong bg-surface-2 px-3 py-1 focus-within:border-fg">
          <span className="font-mono text-xs text-fg-muted mr-2 select-none" aria-hidden="true">
            $
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="grep puzzle_name"
            className="w-44 md:w-56 bg-transparent font-mono text-xs text-fg outline-none placeholder:text-fg-faint"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="ml-1 text-xs text-fg-muted hover:text-fg font-mono cursor-pointer"
              aria-label="Clear search"
            >
              ×
            </button>
          ) : null}
        </div>
      </section>

      {/* Status or loading states */}
      {error ? (
        <div className="mt-6 border border-dashed border-line-strong p-4" role="alert">
          <StatusGlyph status="error" label={error} />
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 bg-dots-dense p-9 text-center">
          <StatusGlyph status="loading" label="Loading challenges..." />
        </div>
      ) : null}

      {!loading && !error && challenges.length === 0 ? (
        <div className="mt-8 bg-dots-dense p-9 text-center">
          <StatusGlyph status="unsolved" label="No challenges published yet." />
        </div>
      ) : null}

      {/* Search empty state */}
      {!loading && !error && challenges.length > 0 && filteredChallenges.length === 0 ? (
        <div className="mt-8 border border-dashed border-line p-8 text-center">
          <p className="font-mono text-sm text-fg-muted">
            $ grep: pattern &apos;{search}&apos; did not match any challenges in &apos;{activeFilter}&apos;.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveFilter('all')
              setSearch('')
            }}
            className="mt-4 inline-flex h-8 items-center border border-line-strong px-3 font-mono text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3 cursor-pointer"
          >
            $ reset filters
          </button>
        </div>
      ) : null}

      {/* Challenge Cards Grid */}
      {!loading && !error && filteredChallenges.length > 0 ? (
        <div ref={gridRef} className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              solved={solvedIds.has(challenge.id)}
              attempted={attemptedIds.has(challenge.id)}
              locked={isRoomEnded}
            />
          ))}
        </div>
      ) : null}

      <ConfirmModal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        onConfirm={handleLeaveConfirm}
        title="# Leave Room?"
        message="Leaving signs you out. Rejoining creates a new player, so your current progress and handle will be lost."
        confirmLabel="yes, leave"
        cancelLabel="stay"
        loading={leaving}
      />
    </main>
  )
}
