import { useEffect, useRef, useState } from 'react'
import { animate, stagger } from 'animejs'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { flashHighlight, prefersReducedMotion } from '../lib/motion'
import StatusGlyph from './StatusGlyph'

function formatRelativeTime(dateStr) {
  if (!dateStr) return '-'
  const elapsed = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (isNaN(elapsed) || elapsed < 0) return '-'
  if (elapsed < 60) return 'now'
  if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`
  if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`
  return `${Math.floor(elapsed / 86400)}d ago`
}

function getProgressBlocks(solved = 0, total = 10) {
  const cap = total > 0 ? total : 10
  const ratio = Math.min(1, Math.max(0, solved / cap))
  const filled = Math.round(ratio * 10)
  return '■'.repeat(filled) + '□'.repeat(10 - filled)
}

function DeltaGlyph({ delta }) {
  if (!delta || delta === 0) return <span>-</span>
  if (delta > 0) {
    return <span className="font-bold">▲{delta}</span>
  }
  return <span className="opacity-80">▼{Math.abs(delta)}</span>
}

function LeaderboardRow({ player, isMe, totalChallenges, rankStr }) {
  const animatedPoints = useAnimatedNumber(player.total_points, { duration: 400 })
  const animatedSolved = useAnimatedNumber(player.solved, { duration: 400 })
  const pointsStr = String(animatedPoints).padStart(4, '0')
  const lastStr = formatRelativeTime(player.last_scored_at)
  const bar = getProgressBlocks(animatedSolved, totalChallenges)
  const rowRef = useRef(null)

  useEffect(() => {
    if (player.delta > 0 && rowRef.current) {
      flashHighlight(rowRef.current, { duration: 240 })
    }
  }, [player.delta, player.total_points])

  return (
    <div
      ref={rowRef}
      className={`lb-row flex h-13 items-center gap-2 px-2 md:px-4 font-mono transition-colors duration-[120ms] ease-[steps(2)] ${
        isMe
          ? 'bg-invert-bg text-invert-fg font-bold'
          : 'hover:bg-surface-3 text-fg'
      }`}
    >
      <span
        className={`w-10 sm:w-14 text-sm md:text-base font-bold tabular-nums ${
          isMe ? 'text-invert-fg' : 'text-fg-muted'
        }`}
      >
        {rankStr}
      </span>
      <span
        className="flex-1 min-w-0 truncate text-sm md:text-base font-bold"
        title={player.display_name}
      >
        @{player.display_name}
        {isMe ? ' (you)' : ''}
      </span>
      <span
        className={`w-28 sm:w-36 text-center text-xs tracking-widest hidden xs:block ${
          isMe ? 'text-invert-fg' : 'text-fg-muted'
        }`}
        aria-label={`${player.solved} of ${totalChallenges} solved`}
      >
        {bar}
      </span>
      <span className="w-16 sm:w-24 text-right text-sm md:text-base font-bold tabular-nums">
        {pointsStr}
      </span>
      <span
        className={`w-16 sm:w-20 text-right text-xs tabular-nums hidden sm:block ${
          isMe ? 'text-invert-fg' : 'text-fg-muted'
        }`}
      >
        {lastStr}
      </span>
      <span className="w-10 sm:w-14 text-right text-xs md:text-sm font-bold tabular-nums">
        <DeltaGlyph delta={player.delta} />
      </span>
    </div>
  )
}

export default function LeaderboardTable({
  players = [],
  currentUserId,
  totalChallenges = 10,
  pageSize = 10,
}) {
  const [page, setPage] = useState(1)
  const tableBodyRef = useRef(null)
  const prevPageRef = useRef(1)

  const totalPages = Math.max(1, Math.ceil(players.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const visiblePlayers = players.slice(startIndex, startIndex + pageSize)

  // Stagger rows on page change
  useEffect(() => {
    if (prevPageRef.current === safePage) return
    prevPageRef.current = safePage
    if (prefersReducedMotion() || !tableBodyRef.current) return

    const rows = tableBodyRef.current.querySelectorAll('.lb-row')
    if (rows.length) {
      animate(rows, {
        translateX: [-12, 0],
        opacity: [0, 1],
        duration: 180,
        ease: 'steps(3)',
        delay: stagger(40),
      })
    }
  }, [safePage])

  if (players.length === 0) {
    return (
      <div className="border border-dashed border-line-strong p-8 text-center bg-surface-1">
        <StatusGlyph status="unsolved" label="No other players in the standings yet." />
      </div>
    )
  }

  // Check if current user is present anywhere in players
  const currentUserIndex = currentUserId
    ? players.findIndex((p) => p.user_id === currentUserId)
    : -1
  const currentUser = currentUserIndex >= 0 ? players[currentUserIndex] : null
  const isCurrentUserOnPage = visiblePlayers.some((p) => p.user_id === currentUserId)

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="flex items-center gap-2 border-b border-line-strong pb-3 font-mono text-xs font-bold uppercase tracking-widest text-fg-muted px-2 md:px-4">
        <span className="w-10 sm:w-14">#</span>
        <span className="flex-1 min-w-0">HANDLE</span>
        <span className="w-28 sm:w-36 text-center hidden xs:block">SOLVED</span>
        <span className="w-16 sm:w-24 text-right">POINTS</span>
        <span className="w-16 sm:w-20 text-right hidden sm:block">LAST</span>
        <span className="w-10 sm:w-14 text-right">Δ</span>
      </div>

      {/* Table Rows */}
      <div ref={tableBodyRef} className="divide-y divide-dashed divide-line">
        {visiblePlayers.map((player) => {
          const isMe = currentUserId && player.user_id === currentUserId
          const rankStr = String(player.rank).padStart(2, '0')

          return (
            <LeaderboardRow
              key={player.user_id}
              player={player}
              isMe={isMe}
              totalChallenges={totalChallenges}
              rankStr={rankStr}
            />
          )
        })}

        {/* Pinned Current User Row (if user is scored but not on the current page) */}
        {currentUser && !isCurrentUserOnPage ? (
          <LeaderboardRow
            player={currentUser}
            isMe={true}
            totalChallenges={totalChallenges}
            rankStr={String(currentUser.rank).padStart(2, '0')}
          />
        ) : null}
      </div>

      {/* Table Footer: Notice + Pagination */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between font-mono text-xs text-fg-muted">
        <p className="tracking-tight">
          ties broken by earliest last accepted submission
        </p>

        {totalPages > 1 ? (
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 border border-line-strong px-2.5 font-bold uppercase tracking-wider text-fg transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
            >
              &lt; PREV
            </button>
            <span className="tabular-nums text-fg-muted">
              page {safePage}/{totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 border border-line-strong px-2.5 font-bold uppercase tracking-wider text-fg transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
            >
              NEXT &gt;
            </button>
          </div>
        ) : (
          <div className="tabular-nums text-fg-muted">page 1/1</div>
        )}
      </div>
    </div>
  )
}
