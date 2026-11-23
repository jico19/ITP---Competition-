import { Link } from 'react-router-dom'

const linkClass = 'rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900'

export default function AdminNav() {
  return (
    <nav className="mt-3 flex flex-wrap gap-2">
      <Link to="/admin" className={linkClass}>
        Rooms
      </Link>
      <Link to="/admin/challenges" className={linkClass}>
        Challenges
      </Link>
      <Link to="/admin/judge" className={linkClass}>
        Judge
      </Link>
    </nav>
  )
}
