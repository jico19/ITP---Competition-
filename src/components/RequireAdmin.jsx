import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminStatus } from '../hooks/useAdminStatus'

export default function RequireAdmin() {
  const { status, error } = useAdminStatus()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <main className="flex min-h-svh items-center justify-center bg-slate-50 px-4 text-slate-600">
        Checking admin access...
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center text-slate-900">
        <p className="text-lg font-semibold">Admin access error</p>
        <p className="max-w-md text-sm text-red-600">{error}</p>
        <Link to="/admin/login" className="text-sm text-slate-600 underline">
          Back to login
        </Link>
      </main>
    )
  }

  if (status !== 'admin') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
