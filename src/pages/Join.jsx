import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/Modal'
import StatusGlyph from '../components/StatusGlyph'
import { useScrambleAnimation } from '../hooks/useScrambleAnimation'
import { useSession } from '../hooks/useSession'
import { getReadableError } from '../lib/errors'
import { suggestDisplayName } from '../lib/names'
import { supabase } from '../lib/supabase'
import { useSessionStore } from '../stores/sessionStore'

function validate(displayName, roomCode) {
  const name = displayName.trim()
  const code = roomCode.trim()
  if (name.length < 1 || name.length > 24) {
    return 'Display name must be 1 to 24 characters.'
  }
  if (!code) {
    return 'Room code is required.'
  }
  return null
}

function JoinForm({ initialName, isRejoin }) {
  const navigate = useNavigate()
  const setSession = useSessionStore((s) => s.setSession)
  const setProfile = useSessionStore((s) => s.setProfile)
  const setRoom = useSessionStore((s) => s.setRoom)

  const roomCodeRef = useRef(null)
  const [displayName, setDisplayName] = useState(initialName)
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roomUnavailableOpen, setRoomUnavailableOpen] = useState(false)

  const { scrambleTo } = useScrambleAnimation({ defaultRevealRate: 20 })

  function handleSuggest() {
    const nextName = suggestDisplayName()
    scrambleTo(displayName, nextName, setDisplayName)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const validationError = validate(displayName, roomCode)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      let session = sessionData.session
      if (!session) {
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
        if (anonError) throw anonError
        session = anonData.session
      }

      if (session) setSession(session)

      const { data: joinedProfile, error: joinError } = await supabase.rpc('join_room', {
        p_code: roomCode.trim(),
        p_name: displayName.trim(),
      })
      if (joinError) throw joinError

      setProfile(joinedProfile)

      const { data: joinedRoom, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', joinedProfile.room_id)
        .maybeSingle()
      if (roomError) throw roomError

      setRoom(joinedRoom)
      navigate('/challenges')
    } catch (err) {
      const message = getReadableError(err, 'Could not join room.')
      if (/invalid room code|room has ended/i.test(message)) {
        setError('')
        setRoomUnavailableOpen(true)
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleRoomUnavailableClose() {
    setRoomUnavailableOpen(false)
    setRoomCode('')
    // Modal restores focus to the submit button on unmount; focus after that.
    requestAnimationFrame(() => roomCodeRef.current?.focus())
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 md:px-6">
      <div className="border border-line-strong bg-surface-1 p-6 md:p-9">
        <p className="text-xs font-bold uppercase tracking-widest text-fg-muted">ITP Competition</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-fg"># Join room</h1>
        <p className="mt-3 max-w-xl text-sm text-fg-muted">
          {isRejoin
            ? 'Update your display name or rejoin with a room code.'
            : 'Enter a display name and room code to join.'}
        </p>

        <div className="mt-6 border border-line-strong bg-surface-2">
          <div className="flex h-8 items-center gap-2 border-b border-line px-3 text-xs text-fg-muted">
            <span aria-hidden="true">■ □ □</span>
            <span>~/join</span>
          </div>

          <form className="space-y-6 p-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-fg-muted" htmlFor="display-name">
                handle
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <div className="flex h-10 flex-1 items-center border border-line-strong bg-surface-2 focus-within:border-fg">
                  <span className="blink-cursor pl-3 text-fg-faint" aria-hidden="true">$</span>
                  <input
                    id="display-name"
                    className="h-full w-full bg-transparent px-2 text-sm text-fg outline-none placeholder:text-fg-faint"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={24}
                    autoComplete="off"
                    placeholder="enter_handle"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSuggest}
                  className="h-10 shrink-0 border border-line-strong bg-transparent px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3 active:shadow-none"
                >
                  suggest
                </button>
              </div>
              <p className="mt-2 text-xs text-fg-muted">1 to 24 characters.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-fg-muted" htmlFor="room-code">
                room code
              </label>
              <div className="mt-2 flex h-10 items-center border border-line-strong bg-surface-2 focus-within:border-fg">
                <span className="pl-3 text-fg-faint" aria-hidden="true">$</span>
                <input
                  id="room-code"
                  ref={roomCodeRef}
                  className="h-full w-full bg-transparent px-2 text-sm uppercase text-fg outline-none placeholder:text-fg-faint"
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  autoComplete="off"
                  placeholder="TEST1"
                />
              </div>
            </div>

            {error ? (
              <div className="border border-dashed border-line-strong p-3" role="alert">
                <StatusGlyph status="error" label={error} />
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50 disabled:text-fg-muted"
            >
              {loading ? '$ joining...' : isRejoin ? '$ rejoin' : '$ join'}
            </button>
          </form>
        </div>
      </div>

      <Modal
        isOpen={roomUnavailableOpen}
        onClose={handleRoomUnavailableClose}
        title="# Room Unavailable"
        role="alertdialog"
        size="sm"
        footer={
          <button
            type="button"
            onClick={handleRoomUnavailableClose}
            className="inline-flex h-10 items-center justify-center border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            ok
          </button>
        }
      >
        <StatusGlyph status="error" label="room unavailable" />
        <p className="mt-4 text-sm leading-6 text-fg-muted">
          That room code has expired or the match no longer exists. Ask the organizer for the current code, then try again.
        </p>
      </Modal>
    </main>
  )
}

export default function Join() {
  const { profile, hydrated } = useSession({ loadRoom: false })

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 md:px-6">
        <StatusGlyph status="loading" label="Loading session..." />
      </main>
    )
  }

  return (
    <JoinForm
      key={profile?.id ?? 'new'}
      initialName={profile?.display_name ?? ''}
      isRejoin={Boolean(profile)}
    />
  )
}
