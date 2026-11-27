import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import StatusGlyph from './StatusGlyph'
import { useAdminStatus } from '../hooks/useAdminStatus'

export default function RequireAdmin() {
  const { status, error } = useAdminStatus()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <main className="flex min-h-svh items-center justify-center px-4 text-fg">
        <StatusGlyph status="loading" label="Checking admin access..." />
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center text-fg">
        <div className="max-w-md border border-dashed border-line-strong p-6" role="alert">
          <StatusGlyph status="error" label="Admin access error" />
          <p className="mt-3 text-sm text-fg-muted">{error}</p>
        </div>
        <Link
          to="/admin/login"
          className="inline-flex h-11 items-center border border-line-strong px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3"
        >
          back to login
        </Link>
      </main>
    )
  }

  if (status !== 'admin') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
