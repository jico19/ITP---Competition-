import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminNav from '../../components/AdminNav'
import { useAdminRooms } from '../../hooks/useAdminRooms'
import { getReadableError } from '../../lib/errors'
import { supabase } from '../../lib/supabase'
import { useSessionStore } from '../../stores/sessionStore'

const statusStyles = {
  lobby: 'bg-slate-200 text-slate-700',
  live: 'bg-green-100 text-green-700',
  ended: 'bg-slate-300 text-slate-600',
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCode() {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  let code = Array.from(bytes, (byte) => CODE_CHARS[byte % CODE_CHARS.length]).join('')

  if (!/[A-Z]/.test(code)) code = `A${code.slice(1)}`
  if (!/[0-9]/.test(code)) code = `${code.slice(0, 1)}2${code.slice(2)}`

  return code
}

export default function Rooms() {
  const navigate = useNavigate()
  const clearSession = useSessionStore((s) => s.clearSession)
  const { rooms, counts, loading, error, reload } = useAdminRooms()

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [minutes, setMinutes] = useState({})
  const [busyId, setBusyId] = useState('')
  const [actionError, setActionError] = useState('')

  async function handleCreate(event) {
    event.preventDefault()
    const trimmed = name.trim()
    const normalizedCode = code.trim().toUpperCase()

    if (!trimmed) {
      setCreateError('Room name is required.')
      return
    }
    if (normalizedCode && !/^[A-Z0-9]{6}$/.test(normalizedCode)) {
      setCreateError('Code must be 6 letters or digits.')
      return
    }
    if (normalizedCode && (!/[A-Z]/.test(normalizedCode) || !/[0-9]/.test(normalizedCode))) {
      setCreateError('Code must include at least one letter and one number.')
      return
    }

    setCreating(true)
    setCreateError('')
    setCreatedCode('')

    try {
      if (normalizedCode) {
        const { data: existing, error: checkError } = await supabase
          .from('rooms')
          .select('id')
          .eq('code', normalizedCode)
          .maybeSingle()
        if (checkError) throw checkError
        if (existing) {
          setCreateError('That code is already taken. Generate another.')
          return
        }
      }

      const { data, error: insertError } = await supabase
        .from('rooms')
        .insert(normalizedCode ? { name: trimmed, code: normalizedCode } : { name: trimmed })
        .select('code')
        .single()
      if (insertError) throw insertError

      setName('')
      setCode('')
      setCreatedCode(data.code)
      await reload()
    } catch (err) {
      setCreateError(getReadableError(err, 'Could not create room.'))
    } finally {
      setCreating(false)
    }
  }

  async function handleStart(room) {
    const value = Number(minutes[room.id] ?? 10)
    if (!Number.isInteger(value) || value < 1 || value > 1440) {
      setActionError('Duration must be a whole number from 1 to 1440 minutes.')
      return
    }

    setBusyId(room.id)
    setActionError('')

    try {
      const { data, error: updateError } = await supabase
        .from('rooms')
        .update({
          status: 'live',
          ends_at: new Date(Date.now() + value * 60000).toISOString(),
        })
        .eq('id', room.id)
        .eq('status', 'lobby')
        .select('id')
      if (updateError) throw updateError
      if (!data?.length) throw new Error('Room status changed. Refresh and try again.')

      await reload()
    } catch (err) {
      setActionError(getReadableError(err, 'Could not start room.'))
    } finally {
      setBusyId('')
    }
  }

  async function handleEnd(room) {
    setBusyId(room.id)
    setActionError('')

    try {
      const { data, error: updateError } = await supabase
        .from('rooms')
        .update({ status: 'ended', ends_at: new Date().toISOString() })
        .eq('id', room.id)
        .eq('status', 'live')
        .select('id')
      if (updateError) throw updateError
      if (!data?.length) throw new Error('Room status changed. Refresh and try again.')

      await reload()
    } catch (err) {
      setActionError(getReadableError(err, 'Could not end room.'))
    } finally {
      setBusyId('')
    }
  }

  async function handleSignOut() {
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setActionError(getReadableError(signOutError, 'Could not sign out.'))
      return
    }
    clearSession()
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="min-h-svh bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">ITP Competition</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Admin · Rooms</h1>
            <AdminNav />
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
          >
            Sign out
          </button>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Create room</h2>
          <form className="mt-4 space-y-3" onSubmit={handleCreate}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Room name"
                maxLength={60}
                required
              />
              <div className="flex gap-2 sm:w-64">
                <input
                  className="w-24 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm uppercase outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  type="text"
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="Code"
                  aria-label="Room code, optional"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={() => {
                    setCreateError('')
                    setCode(generateCode())
                  }}
                  className="shrink-0 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Generate code
                </button>
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create room'}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Optional: generate a 6-character code with at least one letter and one number. Leave blank for the default code.
            </p>
          </form>
          {createError ? <p className="mt-3 text-sm text-red-600">{createError}</p> : null}
          {createdCode ? (
            <p className="mt-3 text-sm text-green-700">
              Room created. Join code: <span className="font-mono font-semibold">{createdCode}</span>
            </p>
          ) : null}
        </section>

        {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}

        {loading ? (
          <p className="text-sm text-slate-600">Loading rooms...</p>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p>{error}</p>
            <button type="button" onClick={reload} className="mt-3 underline">
              Try again
            </button>
          </div>
        ) : rooms.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            No rooms yet. Create one above.
          </p>
        ) : (
          <section className="space-y-3">
            {rooms.map((room) => (
              <article
                key={room.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold">{room.name}</h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[room.status] ?? ''}`}
                      >
                        {room.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      Code <span className="font-mono font-semibold text-slate-900">{room.code}</span>
                      {' · '}
                      {counts[room.id] ?? 0} {counts[room.id] === 1 ? 'player' : 'players'}
                    </p>
                    {room.ends_at ? (
                      <p className="mt-0.5 text-xs text-slate-500">
                        Ends {new Date(room.ends_at).toLocaleString()}
                      </p>
                    ) : null}
                  </div>

                  <a
                    href={`/tv/${room.code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Open TV ↗
                  </a>
                </div>

                <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
                  {room.status === 'lobby' ? (
                    <>
                      <label className="text-sm text-slate-600">
                        Duration (minutes)
                        <input
                          className="ml-2 w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                          type="number"
                          min="1"
                          max="1440"
                          value={minutes[room.id] ?? 10}
                          onChange={(event) =>
                            setMinutes((previous) => ({ ...previous, [room.id]: event.target.value }))
                          }
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleStart(room)}
                        disabled={busyId === room.id}
                        className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Start
                      </button>
                    </>
                  ) : null}

                  {room.status === 'live' ? (
                    <button
                      type="button"
                      onClick={() => handleEnd(room)}
                      disabled={busyId === room.id}
                      className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      End room
                    </button>
                  ) : null}

                  {room.status === 'lobby' || room.status === 'live' ? null : (
                    <span className="text-sm text-slate-500">This room is finished.</span>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
