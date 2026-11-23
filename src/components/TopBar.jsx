import { Link, useLocation } from 'react-router-dom'
import { useSessionStore } from '../stores/sessionStore'
import ThemeToggle from './ThemeToggle'

export default function TopBar() {
  const { pathname } = useLocation()
  const profile = useSessionStore((s) => s.profile)
  const room = useSessionStore((s) => s.room)

  if (pathname.startsWith('/tv/')) return null

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between gap-3 border-b border-line-strong bg-bg py-2 px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <Link to="/" className="shrink-0 text-sm font-bold tracking-tight text-fg hover:underline">
          <span aria-hidden="true">&gt; </span>itp
        </Link>
        {profile ? (
          <nav aria-label="Main" className="flex items-center gap-3">
            <Link
              to="/challenges"
              className={`px-2 text-xs font-bold uppercase tracking-wider ${pathname.startsWith('/challenge') ? 'bg-invert-bg text-invert-fg' : 'text-fg-muted hover:text-fg'
                }`}
            >
              [board]
            </Link>
          </nav>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {room?.code || profile?.display_name ? (
          <p className="hidden truncate text-xs text-fg-muted md:block">
            {room?.code ? `[${room.code}] ` : ''}
            {profile?.display_name ? `@${profile.display_name}` : ''}
          </p>
        ) : null}
        <ThemeToggle />
      </div>
    </header>
  )
}
