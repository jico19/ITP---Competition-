import { useEffect, useState } from 'react'
import { getReadableError } from '../lib/errors'
import { supabase } from '../lib/supabase'

const empty = { challenges: [], solvedIds: new Set(), attemptedIds: new Set(), error: '' }

export function useChallenges(userId, roomId) {
  const [data, setData] = useState({ key: null, roomId: null, ...empty })

  useEffect(() => {
    if (!userId || !roomId) return

    let active = true

    async function load() {
      try {
        const [challengeResult, scoreResult, submissionResult] = await Promise.all([
          supabase
            .from('challenges')
            // Never select `tests`: hidden tests must stay on the server.
            .select('id,title,tier,type,description,starter_code,rubric,points,sort_order')
            .eq('published', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('scores')
            .select('challenge_id, points')
            .eq('user_id', userId)
            .eq('room_id', roomId),
          supabase
            .from('submissions')
            .select('challenge_id')
            .eq('user_id', userId)
            .eq('room_id', roomId),
        ])
        if (!active) return
        if (challengeResult.error) throw challengeResult.error
        if (scoreResult.error) throw scoreResult.error

        const challenges = challengeResult.data ?? []
        const maxPoints = new Map(challenges.map((c) => [c.id, c.points]))
        const solvedIds = new Set(
          (scoreResult.data ?? [])
            .filter((s) => s.points >= (maxPoints.get(s.challenge_id) ?? Infinity))
            .map((s) => s.challenge_id),
        )

        const attemptedIds = new Set(
          (submissionResult.data ?? [])
            .map((s) => s.challenge_id)
            .filter((id) => !solvedIds.has(id)),
        )
        ;(scoreResult.data ?? []).forEach((s) => {
          if (!solvedIds.has(s.challenge_id) && s.points > 0) {
            attemptedIds.add(s.challenge_id)
          }
        })

        setData({ key: userId, roomId, challenges, solvedIds, attemptedIds, error: '' })
      } catch (err) {
        if (!active) return
        setData({
          key: userId,
          roomId,
          ...empty,
          error: getReadableError(err, 'Could not load challenges.'),
        })
      }
    }

    load()
    return () => {
      active = false
    }
  }, [userId, roomId])

  const current = data.key === userId ? data : empty
  return {
    ...current,
    loading: Boolean(userId) && (data.key !== userId || data.roomId !== roomId),
  }
}
