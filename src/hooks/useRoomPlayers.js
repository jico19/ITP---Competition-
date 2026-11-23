import { useCallback, useEffect, useState } from 'react'
import { getReadableError } from '../lib/errors'
import { supabase } from '../lib/supabase'

const empty = { players: [], error: '' }

export function useRoomPlayers(roomId) {
  const [data, setData] = useState({ key: null, ...empty })
  const [reloadToken, setReloadToken] = useState(0)
  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  useEffect(() => {
    if (!roomId) return

    let active = true

    async function load() {
      try {
        const { data: players, error } = await supabase
          .from('profiles')
          .select('id,display_name')
          .eq('room_id', roomId)
          .order('display_name', { ascending: true })
        if (!active) return
        if (error) throw error

        setData({ key: roomId, players: players ?? [], error: '' })
      } catch (err) {
        if (!active) return
        setData({
          key: roomId,
          players: [],
          error: getReadableError(err, 'Could not load players.'),
        })
      }
    }

    void Promise.resolve().then(load)
    return () => {
      active = false
    }
  }, [roomId, reloadToken])

  const current = data.key === roomId ? data : empty
  return { ...current, loading: Boolean(roomId) && data.key !== roomId, reload }
}
