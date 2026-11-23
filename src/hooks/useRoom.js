import { useEffect, useState } from 'react'
import { getReadableError } from '../lib/errors'
import { supabase } from '../lib/supabase'

const empty = { room: null, error: '' }

export function useRoom(roomId) {
  const [data, setData] = useState({ key: null, ...empty })

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
    // Admin may start the round after the player joined; refresh so ends_at is current.
    const interval = setInterval(load, 10000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [roomId])

  const current = data.key === roomId ? data : empty
  return { ...current, loading: Boolean(roomId) && data.key !== roomId }
}
