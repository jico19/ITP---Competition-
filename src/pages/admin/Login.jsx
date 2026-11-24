import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import StatusGlyph from '../../components/StatusGlyph'
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
      <main className="flex min-h-svh items-center justify-center px-4 text-fg">
        <StatusGlyph status="loading" label="Checking admin access..." />
      </main>
    )
  }

  if (status === 'admin') {
    return <Navigate to={from} replace />
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl items-center px-4 py-10 md:px-6">
      <div className="w-full border border-line-strong bg-surface-1 p-6 md:p-9">
        <p className="text-xs font-bold uppercase tracking-widest text-fg-muted">ITP Competition</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-fg"># Admin sign in</h1>
        <p className="mt-3 text-sm text-fg-muted">Use your admin email and password.</p>

        <div className="mt-6 border border-line-strong bg-surface-2">
          <div className="flex h-8 items-center gap-2 border-b border-line px-3 text-xs text-fg-muted">
            <span aria-hidden="true">■ □ □</span>
            <span>~/admin/login</span>
          </div>
          <form className="space-y-6 p-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-fg-muted" htmlFor="admin-email">
                email
              </label>
              <input
                id="admin-email"
                className="mt-2 h-11 w-full border border-line-strong bg-surface-2 px-3 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-fg"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-fg-muted" htmlFor="admin-password">
                password
              </label>
              <input
                id="admin-password"
                className="mt-2 h-11 w-full border border-line-strong bg-surface-2 px-3 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-fg"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error ? (
              <div className="border border-dashed border-line-strong p-3" role="alert">
                <StatusGlyph status="error" label={error} />
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50 disabled:text-fg-muted"
            >
              {loading ? '$ signing in...' : '$ sign in'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
