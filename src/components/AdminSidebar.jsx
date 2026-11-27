import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Code2, DoorOpen, LogOut, Scale } from 'lucide-react'
import { getReadableError } from '../lib/errors'
import { supabase } from '../lib/supabase'
import { useSessionStore } from '../stores/sessionStore'
import { toast } from '../stores/toastStore'
import ThemeToggle from './ThemeToggle'

const links = [
  { to: '/admin', label: 'Rooms', icon: DoorOpen },
  { to: '/admin/challenges', label: 'Challenges', icon: Code2 },
  { to: '/admin/judge', label: 'Judge', icon: Scale },
]

const footerActionClass =
  'inline-flex h-11 w-full items-center gap-2.5 border border-line-strong bg-transparent px-3 text-xs font-bold uppercase tracking-wider text-fg-muted transition-colors hover:border-fg hover:bg-surface-3 hover:text-fg disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50'

export default function AdminSidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const clearSession = useSessionStore((s) => s.clearSession)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    if (signingOut) return
    setSigningOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast(getReadableError(error, 'Could not sign out.'), { kind: 'error' })
        return
      }
      clearSession()
      navigate('/admin/login', { replace: true })
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <aside className="flex flex-col border-b border-line-strong bg-surface-1 font-mono md:sticky md:top-0 md:h-svh md:w-56 md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-3 md:block md:px-4 md:py-4">
        <div className="min-w-0">
          <Link
            to="/admin"
            className="inline-block text-sm font-bold tracking-tight text-fg hover:underline"
          >
            <span aria-hidden="true">&gt; </span>admin_
          </Link>
          <p className="mt-0.5 truncate text-[10px] uppercase tracking-widest text-fg-muted">
            ITP: Exit Code 0
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 md:hidden">
          <ThemeToggle size="admin" />
          <Link
            to="/"
            aria-label="Exit to app"
            title="Exit to app"
            className="inline-flex h-11 w-11 items-center justify-center border border-line-strong text-fg-muted transition-colors hover:border-fg hover:bg-surface-3 hover:text-fg"
          >
            <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label="Sign out"
            title="Sign out"
            className="inline-flex h-11 w-11 items-center justify-center border border-line-strong text-fg-muted transition-colors hover:border-fg hover:bg-surface-3 hover:text-fg disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50"
          >
            <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav
        aria-label="Admin"
        className="grid grid-cols-3 gap-2 p-3 md:flex md:flex-1 md:flex-col md:gap-1.5 md:py-4"
      >
        <p className="hidden px-1 pb-1 text-[10px] font-bold uppercase tracking-widest text-fg-faint md:block">
          ## nav
        </p>
        {links.map((link) => {
          const active = link.to === '/admin' ? pathname === link.to : pathname.startsWith(link.to)
          const Icon = link.icon
          return (
            <Link
              key={link.to}
              to={link.to}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex h-11 min-w-0 items-center justify-center gap-1.5 border px-2 text-[10px] font-bold uppercase tracking-wider transition-colors md:justify-start md:gap-2.5 md:px-3 md:text-xs ${
                active
                  ? 'border-invert-bg bg-invert-bg text-invert-fg'
                  : 'border-line-strong bg-transparent text-fg-muted hover:border-fg hover:bg-surface-3 hover:text-fg'
              }`}
            >
              <Icon size={16} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{link.label}</span>
              {active ? (
                <span className="ml-auto hidden text-xs md:inline" aria-hidden="true">
                  &gt;
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="hidden md:mt-auto md:flex md:flex-col md:gap-2 md:border-t md:border-line md:p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-fg-muted">
            Theme
          </span>
          <ThemeToggle size="admin" />
        </div>
        <Link to="/" className={footerActionClass}>
          <ArrowLeft size={16} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
          <span>Exit to app</span>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className={footerActionClass}
        >
          <LogOut size={16} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
          <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>
        </button>
      </div>
    </aside>
  )
}
