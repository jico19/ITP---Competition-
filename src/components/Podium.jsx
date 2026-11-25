import { useEffect, useRef } from 'react'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { popStamp } from '../lib/motion'
import StatusGlyph from './StatusGlyph'

function getProgressBlocks(solved = 0, total = 10) {
  const cap = total > 0 ? total : 10
  const ratio = Math.min(1, Math.max(0, solved / cap))
  const filled = Math.round(ratio * 10)
  return '■'.repeat(filled) + '□'.repeat(10 - filled)
}

function PodiumCard({ rank, player, totalChallenges, isCenter }) {
  const rankStr = String(rank).padStart(2, '0')
  const hasPlayer = Boolean(player)
  const displayName = player ? `@${player.display_name}` : '----'
  const rawPoints = player?.total_points ?? 0
  const animatedPoints = useAnimatedNumber(rawPoints, { duration: 400 })
  const animatedSolved = useAnimatedNumber(player?.solved ?? 0, { duration: 400 })
  const points = player ? `${String(animatedPoints).padStart(4, '0')} pts` : '0000 pts'
  const bar = getProgressBlocks(animatedSolved, totalChallenges)
  const cardRef = useRef(null)
  const prevKeyRef = useRef(`${player?.user_id ?? ''}:${rawPoints}`)

  useEffect(() => {
    const nextKey = `${player?.user_id ?? ''}:${rawPoints}`
    if (prevKeyRef.current !== nextKey && player && cardRef.current) {
      popStamp(cardRef.current, { duration: 190 })
    }
    prevKeyRef.current = nextKey
  }, [player, rawPoints])

  return (
    <div
      ref={cardRef}
      className={`tv-podium-card flex flex-col border border-line-strong bg-surface-1 transition-transform duration-[120ms] ease-[steps(2)] ${
        isCenter
          ? 'order-1 sm:order-2 sm:-translate-y-2 shadow-hard'
          : rank === 2
          ? 'order-2 sm:order-1'
          : 'order-3 sm:order-3'
      }`}
    >
      {/* Card Header Strip */}
      <div
        className={`flex h-9 items-center justify-between px-4 font-mono text-xs font-bold tracking-wider ${
          isCenter
            ? 'bg-invert-bg text-invert-fg'
            : 'border-b border-line-strong text-fg'
        }`}
      >
        <span>{rankStr}</span>
        <span aria-hidden="true">[★]</span>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
        <div>
          <div className="font-mono text-5xl md:text-6xl font-bold tracking-tight text-fg">
            {rankStr}
          </div>
          <p
            className="mt-3 truncate font-mono text-base md:text-lg font-bold text-fg"
            title={hasPlayer ? player.display_name : undefined}
          >
            {displayName}
          </p>
          <p className="mt-1 font-mono text-sm tabular-nums text-fg-muted">
            {points}
          </p>
        </div>

        <div className="mt-6 font-mono text-xs tracking-wider text-fg-muted">
          <span className="tracking-widest" aria-hidden="true">[{bar}]</span>{' '}
          <span>solved</span>
        </div>
      </div>
    </div>
  )
}

export default function Podium({ players = [], totalChallenges = 10 }) {
  if (players.length === 0) {
    return (
      <div className="border border-dashed border-line-strong p-8 text-center">
        <StatusGlyph status="unsolved" label="No scores on the podium yet." />
      </div>
    )
  }

  // Find ranks 1, 2, 3
  const p1 = players.find((p) => p.rank === 1) || players[0]
  const p2 = players.find((p) => p.rank === 2) || (players[0] !== p1 ? players[0] : players[1])
  const p3 = players.find((p) => p.rank === 3) || players.find((p) => p !== p1 && p !== p2)

  return (
    <div className="grid grid-cols-1 items-end gap-6 sm:grid-cols-3">
      {/* 02 on Left */}
      <PodiumCard
        rank={2}
        player={p2}
        totalChallenges={totalChallenges}
        isCenter={false}
      />
      {/* 01 in Center (Elevated, Inverted Header Strip) */}
      <PodiumCard
        rank={1}
        player={p1}
        totalChallenges={totalChallenges}
        isCenter={true}
      />
      {/* 03 on Right */}
      <PodiumCard
        rank={3}
        player={p3}
        totalChallenges={totalChallenges}
        isCenter={false}
      />
    </div>
  )
}
