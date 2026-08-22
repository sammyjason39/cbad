const DEFAULT_HOST = 'https://n8n.indonesiabelajarai.com'
const DEFAULT_HEALTH_PATH = 'a8f3c2d1-5e4b-4a9c-8d1e-2f6b9c0a1d2e'
const DEFAULT_CHAT_PATH = 'b9e4d3c2-6f5a-4b0d-9e2f-3a7c8d9e0f1b'

export function getN8nBackendConfig() {
  const host = (process.env.N8N_HOST || DEFAULT_HOST).replace(/\/$/, '')
  const healthPath = process.env.N8N_WEBHOOK_HEALTH || DEFAULT_HEALTH_PATH
  const chatPath = process.env.N8N_WEBHOOK_CHAT || DEFAULT_CHAT_PATH
  const enabled = process.env.N8N_BACKEND !== 'false'

  return {
    enabled,
    host,
    healthUrl: `${host}/webhook/${healthPath}`,
    chatUrl: `${host}/webhook/${chatPath}`,
  }
}

export async function proxyHealthViaN8n(config = getN8nBackendConfig()) {
  const res = await fetch(config.healthUrl, {
    signal: AbortSignal.timeout(15000),
  })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(text || `Health proxy failed (HTTP ${res.status})`)
  }
  if (!res.ok) {
    throw new Error(json.message || json.error || `Health proxy failed (HTTP ${res.status})`)
  }
  return json
}

export async function proxyChatViaN8n(messages, config = getN8nBackendConfig()) {
  const res = await fetch(config.chatUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal: AbortSignal.timeout(120000),
  })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(text || `Chat proxy failed (HTTP ${res.status})`)
  }
  if (!res.ok) {
    throw new Error(json.message || json.error || `Chat proxy failed (HTTP ${res.status})`)
  }
  return json
}

/** Convert a single completion string into OpenAI-style SSE for the existing client. */
export function completionToSse(content) {
  const chunk = {
    choices: [{ delta: { content } }],
  }
  return `data: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`
}
