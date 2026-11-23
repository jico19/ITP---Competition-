import { useCallback, useEffect, useState } from 'react'
import { getReadableError } from '../lib/errors'
import { supabase } from '../lib/supabase'

const initial = { challenges: [], loading: true, error: '' }

export function useAdminChallenges() {
  const [data, setData] = useState(initial)

  const load = useCallback(async () => {
    try {
      const { data: challenges, error } = await supabase
        .from('challenges')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('title', { ascending: true })
      if (error) throw error

      setData({ challenges: challenges ?? [], loading: false, error: '' })
    } catch (err) {
      setData((previous) => ({
        ...previous,
        loading: false,
        error: getReadableError(err, 'Could not load challenges.'),
      }))
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [load])

  return { ...data, reload: load }
}
