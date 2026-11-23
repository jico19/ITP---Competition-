import { useEffect, useState } from 'react'
import { getEngineState, onEngineChange, preloadPyodide } from '../lib/pyRunner'

export function usePyEngine() {
  const [engine, setEngine] = useState(getEngineState)

  useEffect(() => {
    const unsubscribe = onEngineChange(setEngine)
    preloadPyodide()
    return unsubscribe
  }, [])

  return engine
}
