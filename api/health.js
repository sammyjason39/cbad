import { getQwenConfig, pingQwen } from './_lib/qwen.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
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
