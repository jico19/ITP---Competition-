import { useEffect, useState } from 'react'
import { getReadableError } from '../lib/errors'
import { supabase } from '../lib/supabase'

const empty = {
  challenge: null,
  solved: false,
  submissions: [],
  judgeScore: null,
  hintCount: 0,
  error: '',
}

export function useChallengeDetail(challengeId, userId, roomId) {
  const [data, setData] = useState({ key: null, roomId: null, ...empty })

  useEffect(() => {
    if (!challengeId || !userId || !roomId) return

    let active = true

    async function load() {
      try {
        const [challengeResult, scoreResult, submissionsResult, judgeScoreResult, hintResult] =
          await Promise.all([
            supabase
              .from('challenges')
              // Detail page needs tests to run them; the list page never fetches this column.
              .select('id,title,tier,type,description,starter_code,tests,rubric,points,sort_order')
              .eq('id', challengeId)
              .eq('published', true)
              .maybeSingle(),
            supabase
              .from('scores')
              .select('points')
              .eq('user_id', userId)
              .eq('room_id', roomId)
              .eq('challenge_id', challengeId)
              .maybeSingle(),
            supabase
              .from('submissions')
              .select('id, passed, total, points, created_at')
              .eq('user_id', userId)
              .eq('room_id', roomId)
              .eq('challenge_id', challengeId)
              .order('created_at', { ascending: false }),
            supabase
              .from('judge_scores')
              .select('rubric_scores, points')
              .eq('user_id', userId)
              .eq('room_id', roomId)
              .eq('challenge_id', challengeId)
              .maybeSingle(),
            supabase
              .from('hint_uses')
              .select('hints_used')
              .eq('user_id', userId)
              .eq('room_id', roomId)
              .eq('challenge_id', challengeId)
              .maybeSingle(),
          ])
        if (!active) return
        if (challengeResult.error) throw challengeResult.error
        if (scoreResult.error) throw scoreResult.error
        if (hintResult.error) throw hintResult.error

        const challenge = challengeResult.data
        const submissions = submissionsResult?.data ?? []
        const judgeScore = judgeScoreResult?.data ?? null
        const solved =
          challenge?.type === 'web'
            ? (judgeScore?.points ?? 0) >= (challenge?.points ?? Infinity)
            : submissions.some((sub) => sub.total > 0 && sub.passed === sub.total)
        const hintCount = hintResult?.data?.hints_used ?? 0
        setData({
          key: challengeId,
          roomId,
          challenge,
          solved,
          submissions,
          judgeScore,
          hintCount,
          error: '',
        })
      } catch (err) {
        if (!active) return
        setData({
          key: challengeId,
          roomId,
          ...empty,
          error: getReadableError(err, 'Could not load challenge.'),
        })
      }
    }

    load()
    return () => {
      active = false
    }
  }, [challengeId, userId, roomId])

  const current = data.key === challengeId ? data : empty
  return {
    ...current,
    loading:
      Boolean(challengeId && userId) &&
      (data.key !== challengeId || data.roomId !== roomId),
  }
}
