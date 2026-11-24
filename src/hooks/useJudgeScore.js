import { useEffect, useState } from 'react'
import { getReadableError } from '../lib/errors'
import { supabase } from '../lib/supabase'

const initial = { key: '', scores: {}, saved: false, saving: false, error: '' }

export function useJudgeScore(userId, challengeId, roomId) {
  const key = roomId && userId && challengeId ? `${roomId}:${userId}:${challengeId}` : ''
  const [data, setData] = useState(initial)

  useEffect(() => {
    if (!key) return

    let active = true

    async function load() {
      try {
        const { data: row, error } = await supabase
          .from('judge_scores')
          .select('rubric_scores,points')
          .eq('user_id', userId)
          .eq('room_id', roomId)
          .eq('challenge_id', challengeId)
          .maybeSingle()
        if (!active) return
        if (error) throw error

        setData({
          key,
          scores: row?.rubric_scores ?? {},
          saved: Boolean(row),
          saving: false,
          error: '',
        })
      } catch (err) {
        if (!active) return
        setData({
          key,
          scores: {},
          saved: false,
          saving: false,
          error: getReadableError(err, 'Could not load saved score.'),
        })
      }
    }

    void Promise.resolve().then(load)
    return () => {
      active = false
    }
  }, [key, userId, roomId, challengeId])

  async function save(scores, points, maxPoints) {
    if (!key) return false

    if (!Number.isInteger(points) || points < 0) {
      setData((previous) => ({ ...previous, error: 'Points must be a whole number.' }))
      return false
    }
    if (points > maxPoints) {
      setData((previous) => ({
        ...previous,
        error: `Total cannot exceed ${maxPoints} points.`,
      }))
      return false
    }

    setData((previous) => ({ ...previous, saving: true, error: '' }))

    try {
      const { error } = await supabase.from('judge_scores').upsert(
        {
          user_id: userId,
          room_id: roomId,
          challenge_id: challengeId,
          rubric_scores: scores,
          points,
        },
        { onConflict: 'room_id,user_id,challenge_id' },
      )
      if (error) throw error

      setData({ key, scores, saved: true, saving: false, error: '' })
      return true
    } catch (err) {
      setData((previous) => ({
        ...previous,
        saving: false,
        error: getReadableError(err, 'Could not save score.'),
      }))
      return false
    }
  }

  const current = data.key === key ? data : initial
  return { ...current, loading: Boolean(key) && data.key !== key, save }
}
