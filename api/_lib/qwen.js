const DEFAULT_BASE =
  'https://ws-pvflth6kss1o2my2.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1'

export function getQwenConfig() {
  const baseUrl = (process.env.QWEN_API_BASE || DEFAULT_BASE).replace(/\/$/, '')
  return {
    apiKey: process.env.QWEN_API_KEY || '',
    baseUrl,
    model: process.env.QWEN_MODEL || 'qwen3.7-plus',
  }
}

export async function pingQwen(config = getQwenConfig()) {
  if (!config.apiKey) {
    return { online: false, models: [], error: 'missing_api_key' }
  }

  try {
    const res = await fetch(`${config.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      return { online: false, models: [], error: `HTTP ${res.status}` }
    }
    const json = await res.json()
    const models = (json.data || []).map(m => m.id || m.name).filter(Boolean)
    return { online: true, models }
  } catch (err) {
    return { online: false, models: [], error: err.message }
  }
}

export async function createChatCompletionStream(config, messages) {
  if (!config.apiKey) {
    throw new Error('QWEN_API_KEY is not configured')
  }

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      stream: true,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }

  if (!res.body) {
    throw new Error('Upstream returned no response body')
  }

  return res.body
}
