import { useCallback, useEffect, useState } from 'react'
import { getReadableError } from '../lib/errors'
import { supabase } from '../lib/supabase'

const initial = { rooms: [], counts: {}, loading: true, error: '' }

export function useAdminRooms() {
  const [data, setData] = useState(initial)

  const load = useCallback(async () => {
    try {
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('id,name,code,status,ends_at,created_at')
        .order('created_at', { ascending: false })
      if (roomsError) throw roomsError

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('room_id')
      if (profilesError) throw profilesError

      const counts = {}
      for (const profile of profiles ?? []) {
        counts[profile.room_id] = (counts[profile.room_id] ?? 0) + 1
      }

      setData({ rooms: rooms ?? [], counts, loading: false, error: '' })
    } catch (err) {
      setData((previous) => ({
        ...previous,
        loading: false,
        error: getReadableError(err, 'Could not load rooms.'),
      }))
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [load])

  return { ...data, reload: load }
}
