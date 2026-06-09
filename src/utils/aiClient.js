export const AI_MODEL = 'qwen3.7-plus'

/** Check if the Qwen proxy is reachable. */
export async function pingAI() {
  try {
    const res = await fetch('/api/health', { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return { online: false, models: [], model: AI_MODEL }
    const json = await res.json()
    return {
      online: !!json.online,
      models: json.models || [],
      model: json.model || AI_MODEL,
      error: json.error ?? null,
    }
  } catch {
    return { online: false, models: [], model: AI_MODEL }
  }
}

/**
 * Stream a chat completion via the server-side Qwen proxy.
 */
export async function streamChat({ messages, onToken, onDone, onError }) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })

    if (!res.ok) {
      const json = await res.json().catch(() => null)
      throw new Error(json?.error || `HTTP ${res.status}`)
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
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue

        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') {
          onDone(fullText)
          return
        }

        try {
          const parsed = JSON.parse(data)
          const token = parsed.choices?.[0]?.delta?.content ?? ''
          if (token) {
            fullText += token
            onToken(fullText)
          }
        } catch {
          // ignore malformed SSE chunks
        }
      }
    }

    onDone(fullText)
  } catch (err) {
    onError(err.message || 'Chat request failed')
  }
}
