import { useState, useEffect } from 'react'
import { pingOllama } from '../utils/ollamaClient'

/**
 * Pings Ollama on mount and returns { online, models }.
 * Re-checks whenever the window gains focus.
 */
export function useOllamaStatus() {
  const [status, setStatus] = useState({ online: false, models: [], checked: false })

  async function check() {
    const result = await pingOllama()
    setStatus({ ...result, checked: true })
  }

  useEffect(() => {
    check()
    window.addEventListener('focus', check)
    return () => window.removeEventListener('focus', check)
  }, [])

  return status
}
