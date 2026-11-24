import { useEffect } from 'react'
import { getReadableError } from '../lib/errors'
import { supabase } from '../lib/supabase'
import { useSessionStore } from '../stores/sessionStore'

async function fetchJoinedState(userId, loadRoom) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) throw profileError
  if (!profile) return { profile: null, room: null }
  if (!loadRoom) return { profile, room: null }

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', profile.room_id)
    .maybeSingle()

  if (roomError) throw roomError
  return { profile, room }
}

export function useSession({ loadRoom = true } = {}) {
  const session = useSessionStore((s) => s.session)
  const profile = useSessionStore((s) => s.profile)
  const room = useSessionStore((s) => s.room)
  const hydrated = useSessionStore((s) => s.hydrated)
  const error = useSessionStore((s) => s.error)
  const setSession = useSessionStore((s) => s.setSession)
  const setProfile = useSessionStore((s) => s.setProfile)
  const setRoom = useSessionStore((s) => s.setRoom)
  const setHydrated = useSessionStore((s) => s.setHydrated)
  const setError = useSessionStore((s) => s.setError)

  useEffect(() => {
    let active = true

    async function hydrate() {
      setError(null)
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (!active) return

      if (sessionError) {
        setError(getReadableError(sessionError))
        setHydrated(true)
        return
      }

      const nextSession = data.session ?? null
      setSession(nextSession)

      if (!nextSession?.user) {
        setProfile(null)
        setRoom(null)
        setHydrated(true)
        return
      }

      try {
        const joined = await fetchJoinedState(nextSession.user.id, loadRoom)
        if (!active) return
        setProfile(joined.profile)
        setRoom(joined.room)
      } catch (err) {
        if (!active) return
        setError(getReadableError(err))
      } finally {
        if (active) setHydrated(true)
      }
    }

    hydrate()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!active) return
        setSession(nextSession ?? null)
        if (!nextSession?.user) {
          setProfile(null)
          setRoom(null)
        }
      },
    )

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [setError, setHydrated, setProfile, setRoom, setSession, loadRoom])

  return { session, profile, room, hydrated, error }
}
