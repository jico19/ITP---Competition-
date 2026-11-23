import { useEffect, useState } from 'react'
import { getReadableError } from '../lib/errors'
import { supabase } from '../lib/supabase'

const empty = { room: null, rows: [], error: '' }

export function useTvData(roomCode) {
  const code = roomCode?.trim().toUpperCase() ?? ''
  const [data, setData] = useState({ key: '', ...empty })

  useEffect(() => {
    if (!code) return

    let active = true
    let inFlight = false

    async function load() {
      if (inFlight) return
      inFlight = true

      try {
        const { data: room, error: roomError } = await supabase
          .from('rooms')
          .select('id,code,name,status,ends_at')
          .eq('code', code)
          .maybeSingle()
        if (!active) return
        if (roomError) throw roomError
        if (!room) {
          setData({ key: code, ...empty })
          return
        }

        const { data: rows, error: rowsError } = await supabase
          .from('leaderboard')
          .select('user_id,display_name,total_points,solved,rank')
          .eq('room_id', room.id)
          .order('rank', { ascending: true })
          .order('display_name', { ascending: true })
        if (!active) return
        if (rowsError) throw rowsError

        setData({ key: code, room, rows: rows ?? [], error: '' })
      } catch (err) {
        if (!active) return
        setData({
          key: code,
          ...empty,
          error: getReadableError(err, 'Could not load leaderboard.'),
        })
      } finally {
        inFlight = false
      }
    }

    load()

    const channel = supabase
      .channel(`tv:${code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'first_solves' }, load)
      .subscribe()

    const interval = setInterval(load, 10000)

    return () => {
      active = false
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [code])

  const current = data.key === code ? data : empty
  return { ...current, loading: Boolean(code) && data.key !== code }
}
