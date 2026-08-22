import { getQwenConfig, pingQwen } from './_lib/qwen.js'
import { getN8nBackendConfig, proxyHealthViaN8n } from './_lib/n8nBackend.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const n8n = getN8nBackendConfig()
  if (n8n.enabled) {
    try {
      const json = await proxyHealthViaN8n(n8n)
      return res.status(200).json(json)
    } catch (err) {
      return res.status(502).json({
        online: false,
        models: [],
        model: process.env.QWEN_MODEL || 'qwen3.7-plus',
        provider: 'qwen',
        error: err.message || 'n8n health proxy failed',
        backend: 'n8n',
      })
    }
  }

  const config = getQwenConfig()
  const result = await pingQwen(config)

  return res.status(200).json({
    online: result.online,
    models: result.models,
    model: config.model,
    provider: 'qwen',
    error: result.error ?? null,
  })
}
