import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useSessionStore } from '../stores/sessionStore'

const HEARTBEAT_MS = 20000

async function ping() {
  try {
    await supabase.rpc('set_presence', { p_online: true })
  } catch {
    // Best-effort: a missed heartbeat just delays the next one.
  }
}

// "I left" ping that survives tab close. supabase-js requests are aborted
// on unload, so this uses a raw keepalive fetch with the current token.
function markLeft() {
  const { session } = useSessionStore.getState()
  if (!session?.access_token) return

  fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/set_presence`, {
    method: 'POST',
    keepalive: true,
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_online: false }),
  }).catch(() => {})
}

// Keeps the joined player visible on the leaderboard. Pings every 20s,
// marks them left when the tab closes, and revives them on return.
export function usePresence() {
  const profileId = useSessionStore((s) => s.profile?.id)

  useEffect(() => {
    if (!profileId) return

    ping()
    const interval = setInterval(ping, HEARTBEAT_MS)

    // Background tabs get throttled timers; ping as soon as we're back.
    function handleVisibility() {
      if (document.visibilityState === 'visible') ping()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pagehide', markLeft)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pagehide', markLeft)
    }
  }, [profileId])
}
