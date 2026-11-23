import { useEffect, useState } from 'react'
import { getReadableError } from '../lib/errors'
import { supabase } from '../lib/supabase'

const initial = { status: 'loading', user: null, error: '' }

export function useAdminStatus() {
  const [state, setState] = useState(initial)

  useEffect(() => {
    let active = true

    async function check(user) {
      if (!user) {
        if (active) setState({ status: 'signed-out', user: null, error: '' })
        return
      }

      try {
        const { data, error } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle()
        if (!active) return
        if (error) throw error
        setState({ status: data ? 'admin' : 'not-admin', user, error: '' })
      } catch (err) {
        if (!active) return
        setState({
          status: 'not-admin',
          user,
          error: getReadableError(err, 'Could not check admin access.'),
        })
      }
    }

    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return
      if (error) {
        setState({
          status: 'signed-out',
          user: null,
          error: getReadableError(error, 'Could not check sign-in.'),
        })
        return
      }
      check(data.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      check(session?.user ?? null)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return state
}
