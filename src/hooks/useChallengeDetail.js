import { useEffect, useState } from 'react'
import { getReadableError } from '../lib/errors'
import { supabase } from '../lib/supabase'

const empty = { challenge: null, solved: false, submissions: [], judgeScore: null, error: '' }

export function useChallengeDetail(challengeId, userId) {
  const [data, setData] = useState({ key: null, ...empty })

  useEffect(() => {
    if (!challengeId || !userId) return

    let active = true

    async function load() {
      try {
        const [challengeResult, scoreResult, submissionsResult, judgeScoreResult] = await Promise.all([
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
            .eq('challenge_id', challengeId)
            .maybeSingle(),
          supabase
            .from('submissions')
            .select('id, passed, total, points, created_at')
            .eq('user_id', userId)
            .eq('challenge_id', challengeId)
            .order('created_at', { ascending: false }),
          supabase
            .from('judge_scores')
            .select('rubric_scores, points')
            .eq('user_id', userId)
            .eq('challenge_id', challengeId)
            .maybeSingle(),
        ])
        if (!active) return
        if (challengeResult.error) throw challengeResult.error
        if (scoreResult.error) throw scoreResult.error

        const challenge = challengeResult.data
        const solved = Boolean(challenge && scoreResult.data?.points >= challenge.points)
        const submissions = submissionsResult?.data ?? []
        const judgeScore = judgeScoreResult?.data ?? null
        setData({ key: challengeId, challenge, solved, submissions, judgeScore, error: '' })
      } catch (err) {
        if (!active) return
        setData({
          key: challengeId,
          ...empty,
          error: getReadableError(err, 'Could not load challenge.'),
        })
      }
    }

    load()
    return () => {
      active = false
    }
  }, [challengeId, userId])

  const current = data.key === challengeId ? data : empty
  return {
    ...current,
    loading: Boolean(challengeId && userId) && data.key !== challengeId,
  }
}
