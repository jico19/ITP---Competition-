import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import AdminNav from '../../components/AdminNav'
import RoomPlayers from '../../components/RoomPlayers'
import StatusGlyph from '../../components/StatusGlyph'
import { useAdminRooms } from '../../hooks/useAdminRooms'
import { getReadableError } from '../../lib/errors'
import { supabase } from '../../lib/supabase'
import { useSessionStore } from '../../stores/sessionStore'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const roomStatus = {
  lobby: { status: 'locked', label: 'waiting for go' },
  live: { status: 'solved', label: 'live', inverted: true },
  ended: { status: 'locked', label: 'ended' },
}

function generateCode() {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  let code = Array.from(bytes, (byte) => CODE_CHARS[byte % CODE_CHARS.length]).join('')

  if (!/[A-Z]/.test(code)) code = `A${code.slice(1)}`
  if (!/[0-9]/.test(code)) code = `${code.slice(0, 1)}2${code.slice(2)}`

  return code
}

function toLocalInput(value) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const inputClass =
  'h-11 w-full border border-line-strong bg-surface-2 px-3 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-fg'
const secondaryButton =
  'inline-flex h-11 items-center justify-center gap-2 border border-line-strong bg-transparent px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3 disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50'
const primaryButton =
  'inline-flex h-11 items-center justify-center border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50 disabled:text-fg-muted'

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
  const [editingId, setEditingId] = useState('')
  const [draft, setDraft] = useState({ name: '', code: '', status: 'lobby', endsAt: '' })
  const [deleteId, setDeleteId] = useState('')
  const [deleteCode, setDeleteCode] = useState('')
  const [playersOpenId, setPlayersOpenId] = useState('')

  function openEdit(room) {
    setEditingId(room.id)
    setDeleteId('')
    setDeleteCode('')
    setActionError('')
    setDraft({
      name: room.name,
      code: room.code,
      status: room.status,
      endsAt: toLocalInput(room.ends_at),
    })
  }

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

  async function handleSave(event, room) {
    event.preventDefault()

    const trimmed = draft.name.trim()
    const normalizedCode = draft.code.trim().toUpperCase()
    const previousEnd = toLocalInput(room.ends_at)

    if (!trimmed) {
      setActionError('Room name is required.')
      return
    }
    if (!/^[A-Z0-9]{4,8}$/.test(normalizedCode)) {
      setActionError('Code must be 4 to 8 letters or digits.')
      return
    }
    if (draft.status === 'live') {
      if (!draft.endsAt) {
        setActionError('Choose an end time for a live room.')
        return
      }
      const end = new Date(draft.endsAt)
      if (Number.isNaN(end.getTime())) {
        setActionError('End time is not valid.')
        return
      }
      if ((room.status !== 'live' || draft.endsAt !== previousEnd) && end.getTime() <= Date.now()) {
        setActionError('End time must be in the future.')
        return
      }
    }

    setBusyId(room.id)
    setActionError('')

    try {
      if (normalizedCode !== room.code) {
        const { data: existing, error: checkError } = await supabase
          .from('rooms')
          .select('id')
          .eq('code', normalizedCode)
          .neq('id', room.id)
          .maybeSingle()
        if (checkError) throw checkError
        if (existing) throw new Error('That code is already taken.')
      }

      let endsAt = null
      if (draft.status === 'live') endsAt = new Date(draft.endsAt).toISOString()
      if (draft.status === 'ended') endsAt = new Date().toISOString()

      const { error: updateError } = await supabase
        .from('rooms')
        .update({ name: trimmed, code: normalizedCode, status: draft.status, ends_at: endsAt })
        .eq('id', room.id)
      if (updateError) throw updateError

      setEditingId('')
      await reload()
    } catch (err) {
      setActionError(getReadableError(err, 'Could not update room.'))
    } finally {
      setBusyId('')
    }
  }

  async function handleDelete(room) {
    if (deleteCode.trim().toUpperCase() !== room.code) {
      setActionError(`Type ${room.code} to delete this room.`)
      return
    }

    setBusyId(room.id)
    setActionError('')

    try {
      const { error: deleteError } = await supabase.from('rooms').delete().eq('id', room.id)
      if (deleteError) throw deleteError

      setDeleteId('')
      setDeleteCode('')
      setEditingId('')
      setPlayersOpenId('')
      await reload()
    } catch (err) {
      setActionError(getReadableError(err, 'Could not delete room.'))
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
    <main className="min-h-svh bg-bg px-4 py-8 text-fg md:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-fg-muted">ITP Competition</p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-fg"># Admin · Rooms</h1>
            <AdminNav />
          </div>
          <button type="button" onClick={handleSignOut} className={secondaryButton}>
            sign out
          </button>
        </header>

        <section className="mt-6 border border-line-strong bg-surface-1 p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-fg-muted">## create room</h2>
          <form className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end" onSubmit={handleCreate}>
            <label className="min-w-0 flex-1">
              <span className="block text-xs font-bold uppercase tracking-widest text-fg-muted">name</span>
              <input
                className={`mt-2 ${inputClass}`}
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Round 1"
                maxLength={60}
                required
              />
            </label>
            <div className="min-w-0 lg:w-80">
              <label
                htmlFor="room-code"
                className="block text-xs font-bold uppercase tracking-widest text-fg-muted"
              >
                code
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="room-code"
                  className={`${inputClass} min-w-0 flex-1 uppercase`}
                  type="text"
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="A1B2C3"
                  aria-label="Room code, optional"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={() => {
                    setCreateError('')
                    setCode(generateCode())
                  }}
                  className={secondaryButton}
                >
                  generate
                </button>
              </div>
            </div>
            <button type="submit" disabled={creating} className={primaryButton}>
              {creating ? '$ creating...' : '$ create room'}
            </button>
          </form>
          <p className="mt-3 text-xs text-fg-muted">
            Optional: generate a 6-character code with at least one letter and one number. Leave blank for the default code.
          </p>
          {createError ? (
            <div className="mt-3 border border-dashed border-line-strong p-3" role="alert">
              <StatusGlyph status="error" label={createError} />
            </div>
          ) : null}
          {createdCode ? (
            <div className="mt-3 bg-invert-bg px-3 py-2 text-sm font-bold text-invert-fg">
              <StatusGlyph status="solved" label={`room created · code ${createdCode}`} inverted />
            </div>
          ) : null}
        </section>

        {actionError ? (
          <div className="mt-6 border border-dashed border-line-strong p-3" role="alert">
            <StatusGlyph status="error" label={actionError} />
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 bg-dots-dense p-6">
            <StatusGlyph status="loading" label="Loading rooms..." />
          </div>
        ) : null}

        {!loading && error ? (
          <div className="mt-6 border border-dashed border-line-strong p-4" role="alert">
            <StatusGlyph status="error" label={error} />
            <button
              type="button"
              onClick={reload}
              className={`mt-3 ${secondaryButton}`}
            >
              retry
            </button>
          </div>
        ) : null}

        {!loading && !error && rooms.length === 0 ? (
          <div className="mt-6 bg-dots-dense p-9 text-center">
            <StatusGlyph status="unsolved" label="No rooms yet. Create one above." />
          </div>
        ) : null}

        {!loading && !error && rooms.length > 0 ? (
          <section className="mt-6 space-y-6">
            {rooms.map((room) => {
              const status = roomStatus[room.status] ?? roomStatus.ended
              return (
                <article key={room.id} className="border border-line-strong bg-surface-1 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-base font-bold text-fg">{room.name}</h2>
                        <StatusGlyph {...status} />
                      </div>
                      <p className="mt-2 text-sm text-fg-muted">
                        code <span className="font-bold tabular-nums text-fg">{room.code}</span>
                        {' · '}
                        <span className="tabular-nums">{counts[room.id] ?? 0}</span>{' '}
                        {counts[room.id] === 1 ? 'player' : 'players'}
                      </p>
                      {room.ends_at ? (
                        <p className="mt-1 text-xs text-fg-muted">
                          ends {new Date(room.ends_at).toLocaleString()}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(room)}
                        disabled={busyId === room.id}
                        className={secondaryButton}
                      >
                        edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteId(deleteId === room.id ? '' : room.id)
                          setDeleteCode('')
                          setEditingId('')
                          setActionError('')
                        }}
                        disabled={busyId === room.id}
                        className="inline-flex h-11 items-center justify-center gap-2 border border-dashed border-line-strong px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3 disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50"
                      >
                        [×] delete
                      </button>
                      <a
                        href={`/tv/${room.code}`}
                        target="_blank"
                        rel="noreferrer"
                        className={secondaryButton}
                      >
                        <ExternalLink size={14} strokeWidth={1.75} aria-hidden="true" />
                        open tv
                      </a>
                    </div>
                  </div>

                  {deleteId === room.id ? (
                    <div className="mt-4 border border-dashed border-line-strong bg-surface-2 p-4">
                      <StatusGlyph
                        status="error"
                        label={`Delete ${room.name}? This permanently removes its players, scores, and submissions.`}
                      />
                      <div className="mt-3 flex flex-wrap items-end gap-2">
                        <label>
                          <span className="block text-xs font-bold uppercase tracking-widest text-fg-muted">
                            type {room.code}
                          </span>
                          <input
                            type="text"
                            value={deleteCode}
                            onChange={(event) => setDeleteCode(event.target.value.toUpperCase())}
                            placeholder={room.code}
                            aria-label={`Type ${room.code} to confirm deletion`}
                            className={`mt-2 ${inputClass} w-32 uppercase`}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDelete(room)}
                          disabled={busyId === room.id || deleteCode.trim().toUpperCase() !== room.code}
                          className="inline-flex h-11 items-center justify-center border border-dashed border-line-strong px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3 disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50"
                        >
                          confirm delete
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteId('')
                            setDeleteCode('')
                          }}
                          disabled={busyId === room.id}
                          className={secondaryButton}
                        >
                          cancel
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {editingId === room.id ? (
                    <form
                      onSubmit={(event) => handleSave(event, room)}
                      className="mt-4 space-y-4 border border-line-strong bg-surface-2 p-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <label>
                          <span className="block text-xs font-bold uppercase tracking-widest text-fg-muted">name</span>
                          <input
                            type="text"
                            value={draft.name}
                            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                            maxLength={60}
                            className={`mt-2 ${inputClass}`}
                          />
                        </label>
                        <label>
                          <span className="block text-xs font-bold uppercase tracking-widest text-fg-muted">code</span>
                          <input
                            type="text"
                            value={draft.code}
                            onChange={(event) =>
                              setDraft({ ...draft, code: event.target.value.toUpperCase() })
                            }
                            maxLength={8}
                            className={`mt-2 ${inputClass} uppercase`}
                          />
                        </label>
                        <label>
                          <span className="block text-xs font-bold uppercase tracking-widest text-fg-muted">status</span>
                          <select
                            value={draft.status}
                            onChange={(event) => setDraft({ ...draft, status: event.target.value })}
                            className={`mt-2 ${inputClass}`}
                          >
                            <option value="lobby">lobby</option>
                            <option value="live">live</option>
                            <option value="ended">ended</option>
                          </select>
                        </label>
                        {draft.status === 'live' ? (
                          <label>
                            <span className="block text-xs font-bold uppercase tracking-widest text-fg-muted">ends at</span>
                            <input
                              type="datetime-local"
                              value={draft.endsAt}
                              onChange={(event) => setDraft({ ...draft, endsAt: event.target.value })}
                              className={`mt-2 ${inputClass}`}
                            />
                          </label>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="submit" disabled={busyId === room.id} className={primaryButton}>
                          save room
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId('')}
                          disabled={busyId === room.id}
                          className={secondaryButton}
                        >
                          cancel
                        </button>
                      </div>
                    </form>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-dashed border-line pt-4">
                    {room.status === 'lobby' ? (
                      <>
                        <label>
                          <span className="block text-xs font-bold uppercase tracking-widest text-fg-muted">
                            duration (minutes)
                          </span>
                          <input
                            className={`mt-2 ${inputClass} w-28 tabular-nums`}
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
                          className={primaryButton}
                        >
                          go
                        </button>
                        <p className="w-full text-xs text-fg-muted">
                          Press GO to start the timer and unlock player editors.
                        </p>
                      </>
                    ) : null}

                    {room.status === 'live' ? (
                      <button
                        type="button"
                        onClick={() => handleEnd(room)}
                        disabled={busyId === room.id}
                        className={secondaryButton}
                      >
                        end room
                      </button>
                    ) : null}

                    {room.status === 'lobby' || room.status === 'live' ? null : (
                      <StatusGlyph status="locked" label="This room is finished." />
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setPlayersOpenId(playersOpenId === room.id ? '' : room.id)
                      }
                      className={secondaryButton}
                    >
                      players ({counts[room.id] ?? 0})
                    </button>
                  </div>

                  {playersOpenId === room.id ? <RoomPlayers room={room} onRemoved={reload} /> : null}
                </article>
              )
            })}
          </section>
        ) : null}
      </div>
    </main>
  )
}
