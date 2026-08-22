import { getQwenConfig, createChatCompletionStream } from './_lib/qwen.js'
import {
  getN8nBackendConfig,
  proxyChatViaN8n,
  completionToSse,
} from './_lib/n8nBackend.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const messages = req.body?.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  const n8n = getN8nBackendConfig()
  if (n8n.enabled) {
    try {
      const json = await proxyChatViaN8n(messages, n8n)
      const content = json.content ?? json?.choices?.[0]?.message?.content ?? ''
      if (!content) {
        return res.status(502).json({ error: 'Empty response from n8n backend' })
      }

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache, no-transform')
      res.setHeader('Connection', 'keep-alive')
      res.write(completionToSse(content))
      return res.end()
    } catch (err) {
      return res.status(502).json({ error: err.message || 'n8n chat proxy failed' })
    }
  }

  try {
    const config = getQwenConfig()
    const upstream = await createChatCompletionStream(config, messages)

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')

    const reader = upstream.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(Buffer.from(value))
    }
    res.end()
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Chat request failed' })
  }
}
