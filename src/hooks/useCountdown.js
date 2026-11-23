import { useEffect, useState } from 'react'

export function useCountdown(endsAt) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!endsAt) return

    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [endsAt])

  if (!endsAt) return null
  return new Date(endsAt).getTime() - now
}
