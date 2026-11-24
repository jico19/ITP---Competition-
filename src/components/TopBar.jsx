import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSessionStore } from '../stores/sessionStore'
import RulesModal from './RulesModal'
import ThemeToggle from './ThemeToggle'

export default function TopBar() {
  const location = useLocation()
  const pathname = location.pathname
  const searchParams = new URLSearchParams(location.search)
  const profile = useSessionStore((s) => s.profile)
  const room = useSessionStore((s) => s.room)
  const [rulesOpen, setRulesOpen] = useState(false)

  const isTvProjector = searchParams.get('mode') === 'tv' || searchParams.get('tv') === '1'
  if (pathname.startsWith('/challenge/') || isTvProjector) return null

  const isBoardActive = pathname.startsWith('/challenges')
  const isLeaderboardActive = pathname === '/leaderboard' || pathname.startsWith('/tv')

  const leaderboardTarget = room?.code ? `/tv/${room.code}` : '/leaderboard'

  return (
    <>
      <header className="sticky top-0 z-20 flex h-12 items-center justify-between gap-4 border-b border-line-strong bg-bg px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            to="/"
            className="shrink-0 font-mono text-sm font-bold tracking-tight text-fg hover:underline"
          >
            <span aria-hidden="true">&gt; </span>itp_
          </Link>

          <nav aria-label="Main" className="flex items-center gap-2">
            <Link
              to="/challenges"
              className={`h-7 px-3 flex items-center font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                isBoardActive
                  ? 'bg-invert-bg text-invert-fg'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              BOARD
            </Link>

            <Link
              to={leaderboardTarget}
              className={`h-7 px-3 flex items-center font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                isLeaderboardActive
                  ? 'bg-invert-bg text-invert-fg'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              LEADERBOARD
            </Link>

            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className="h-7 px-3 flex items-center font-mono text-xs font-bold uppercase tracking-wider text-fg-muted hover:text-fg cursor-pointer"
            >
              RULES
            </button>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {room?.code || profile?.display_name ? (
            <p className="hidden truncate font-mono text-xs text-fg-muted md:block">
              {room?.code ? `[${room.code}] ` : ''}
              {profile?.display_name ? `@${profile.display_name}` : ''}
            </p>
          ) : (
            <Link
              to="/"
              className="inline-flex h-8 items-center border border-invert-bg bg-invert-bg px-3 font-mono text-xs font-bold uppercase tracking-wider text-invert-fg hover:shadow-hard-sm"
            >
              &gt; JOIN
            </Link>
          )}
          <ThemeToggle />
        </div>
      </header>

      <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />
    </>
  )
}
