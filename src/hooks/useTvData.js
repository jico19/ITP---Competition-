import { useEffect, useRef, useState } from 'react'
import { getReadableError } from '../lib/errors'
import { supabase } from '../lib/supabase'

const empty = { room: null, rows: [], totalChallenges: 10, updatedAt: 0, error: '' }

export function useTvData(roomCode) {
  const code = roomCode?.trim().toUpperCase() ?? ''
  const [data, setData] = useState({ key: '', ...empty })
  const prevRanksRef = useRef(new Map())

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

        const [rowsRes, countRes] = await Promise.all([
          supabase
            .from('leaderboard')
            .select('user_id,display_name,total_points,solved,rank,last_scored_at')
            .eq('room_id', room.id)
            .order('rank', { ascending: true })
            .order('display_name', { ascending: true }),
          supabase
            .from('challenges')
            .select('id', { count: 'exact', head: true })
            .eq('published', true),
        ])

        if (!active) return
        if (rowsRes.error) throw rowsRes.error

        const rawRows = rowsRes.data ?? []
        const totalChallenges = countRes.count || 10

        // Calculate delta (previous rank - current rank)
        const rowsWithDelta = rawRows.map((r) => {
          const prevRank = prevRanksRef.current.get(r.user_id)
          let delta = 0
          if (prevRank !== undefined) {
            delta = prevRank - r.rank
          }
          return { ...r, delta }
        })

        // Store current ranks for subsequent comparisons
        const nextRanks = new Map()
        rawRows.forEach((r) => nextRanks.set(r.user_id, r.rank))
        prevRanksRef.current = nextRanks

        setData({
          key: code,
          room,
          rows: rowsWithDelta,
          totalChallenges,
          updatedAt: Date.now(),
          error: '',
        })
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
