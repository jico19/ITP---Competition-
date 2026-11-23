import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAdminStatus } from '../../hooks/useAdminStatus'
import { getReadableError } from '../../lib/errors'
import { supabase } from '../../lib/supabase'
import { useSessionStore } from '../../stores/sessionStore'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { status } = useAdminStatus()
  const setSession = useSessionStore((s) => s.setSession)
  const clearSession = useSessionStore((s) => s.clearSession)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from ?? '/admin'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInError) throw signInError

      clearSession()
      if (data.session) setSession(data.session)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getReadableError(err, 'Could not sign in.'))
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <main className="flex min-h-svh items-center justify-center bg-slate-50 px-4 text-slate-600">
        Checking admin access...
      </main>
    )
  }

  if (status === 'admin') {
    return <Navigate to={from} replace />
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">ITP Competition</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Admin sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Use your admin email and password.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="admin-email">
              Email
            </label>
            <input
              id="admin-email"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
