// In dev the Vite proxy forwards /ollama/* → localhost:11434/*
// In production (built app) we call localhost:11434 directly from the browser
const OLLAMA_BASE = import.meta.env.DEV
  ? '/ollama'
  : 'http://127.0.0.1:11434'

export const OLLAMA_MODEL = 'gemma4:e4b'

/** Check if Ollama is reachable. Returns { online, models }. */
export async function pingOllama() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return { online: false, models: [] }
    const json = await res.json()
    return { online: true, models: (json.models || []).map(m => m.name) }
  } catch {
    return { online: false, models: [] }
  }
}

/**
 * Stream a chat completion from Ollama.
 * Calls onToken(text) for each incremental token.
 * Calls onDone(fullText) when stream ends.
 * Calls onError(err) on failure.
 */
export async function streamChat({ messages, onToken, onDone, onError }) {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: true,
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => `HTTP ${res.status}`)
      // Detect CORS-style network error vs server error
      throw new Error(text || `HTTP ${res.status}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() // keep incomplete last line
      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const parsed = JSON.parse(line)
          const token = parsed.message?.content ?? ''
          if (token) {
            fullText += token
            onToken(fullText)
          }
          if (parsed.done) {
            onDone(fullText)
            return
          }
        } catch {
          // ignore malformed JSON chunks
        }
      }
    }
    onDone(fullText)
  } catch (err) {
    const isCors = err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')
    onError(
      isCors
        ? 'CORS error — start Ollama with OLLAMA_ORIGINS=* and reload.'
        : err.message
    )
  }
}
