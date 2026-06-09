import { useState, useEffect } from 'react'
import { pingAI } from '../utils/aiClient'

/** Pings the Qwen AI proxy on mount and when the window regains focus. */
export function useAIStatus() {
  const [status, setStatus] = useState({ online: false, models: [], model: null, checked: false })

  async function check() {
    const result = await pingAI()
    setStatus({ ...result, checked: true })
  }

  useEffect(() => {
    check()
    window.addEventListener('focus', check)
    return () => window.removeEventListener('focus', check)
  }, [])

  return status
}
