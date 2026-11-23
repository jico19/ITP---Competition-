import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/admin', label: 'Rooms' },
  { to: '/admin/challenges', label: 'Challenges' },
  { to: '/admin/judge', label: 'Judge' },
]

export default function AdminNav() {
  const { pathname } = useLocation()

  return (
    <nav aria-label="Admin" className="mt-6 flex flex-wrap gap-3 border-b border-line pb-3">
      {links.map((link) => {
        const active = link.to === '/admin' ? pathname === link.to : pathname.startsWith(link.to)
        return (
          <Link
            key={link.to}
            to={link.to}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex h-11 shrink-0 items-center border px-4 text-xs font-bold uppercase tracking-wider ${
              active
                ? 'border-invert-bg bg-invert-bg text-invert-fg'
                : 'border-line-strong text-fg-muted hover:bg-surface-3 hover:text-fg'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
