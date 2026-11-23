import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

function JoinForm({ initialName, initialCode, isRejoin }) {
  const navigate = useNavigate()
  const setSession = useSessionStore((s) => s.setSession)
  const setProfile = useSessionStore((s) => s.setProfile)
  const setRoom = useSessionStore((s) => s.setRoom)

  const [displayName, setDisplayName] = useState(initialName)
  const [roomCode, setRoomCode] = useState(initialCode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession()
      if (sessionError) throw sessionError

      let session = sessionData.session
      if (!session) {
        const { data: anonData, error: anonError } =
          await supabase.auth.signInAnonymously()
        if (anonError) throw anonError
        session = anonData.session
      }

      if (session) setSession(session)

      const { data: joinedProfile, error: joinError } = await supabase.rpc(
        'join_room',
        {
          p_code: roomCode.trim(),
          p_name: displayName.trim(),
        },
      )
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
      setError(getReadableError(err, 'Could not join room.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-svh bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">ITP Competition</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Join room</h1>
        <p className="mt-2 text-sm text-slate-600">
          {isRejoin
            ? 'Update your display name or rejoin with a room code.'
            : 'Enter a display name and room code to join.'}
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="display-name">
              Display name
            </label>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row">
              <input
                id="display-name"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={24}
                autoComplete="off"
                placeholder="Your name"
              />
              <button
                type="button"
                className="shrink-0 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setDisplayName(suggestDisplayName())}
              >
                Suggest name
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">1–24 characters.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="room-code">
              Room code
            </label>
            <input
              id="room-code"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase tracking-wide outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              autoComplete="off"
              placeholder="e.g. TEST1"
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
            {loading ? 'Joining...' : isRejoin ? 'Rejoin / Update name' : 'Join room'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default function Join() {
  const { profile, room, hydrated } = useSession()

  if (!hydrated) {
    return (
      <main className="min-h-svh bg-slate-50 px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-md">
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <JoinForm
      key={profile?.id ?? 'new'}
      initialName={profile?.display_name ?? ''}
      initialCode={room?.code ?? ''}
      isRejoin={Boolean(profile)}
    />
  )
}
