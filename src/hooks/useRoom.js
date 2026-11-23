import { useCallback, useEffect, useState } from 'react'
import { getReadableError } from '../lib/errors'
import { supabase } from '../lib/supabase'

const empty = { room: null, error: '' }

export function useRoom(roomId) {
  const [data, setData] = useState({ key: null, ...empty })
  const [reloadToken, setReloadToken] = useState(0)
  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  useEffect(() => {
    if (!roomId) return

    let active = true

    async function load() {
      const { data: room, error } = await supabase
        .from('rooms')
        .select('id,name,code,status,ends_at')
        .eq('id', roomId)
        .maybeSingle()
      if (!active) return

      if (error) {
        setData({ key: roomId, ...empty, error: getReadableError(error, 'Could not load room.') })
        return
      }
      setData({ key: roomId, room, error: '' })
    }

    load()
    const interval = setInterval(load, 10000)
    // Admin presses GO on another screen, so unlock from the room event, not the poll.
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        load,
      )
      .subscribe()

    return () => {
      active = false
      clearInterval(interval)
      void supabase.removeChannel(channel)
    }
  }, [roomId, reloadToken])

  const current = data.key === roomId ? data : empty
  return { ...current, loading: Boolean(roomId) && data.key !== roomId, reload }
}
