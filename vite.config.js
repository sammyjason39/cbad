import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { getQwenConfig, pingQwen, createChatCompletionStream } from './api/_lib/qwen.js'

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function qwenDevApiPlugin(env) {
  return {
    name: 'qwen-dev-api',
    configureServer(server) {
      // Inject env for the shared Qwen helper during local dev
      process.env.QWEN_API_KEY = env.QWEN_API_KEY || process.env.QWEN_API_KEY
      process.env.QWEN_API_BASE = env.QWEN_API_BASE || process.env.QWEN_API_BASE
      process.env.QWEN_MODEL = env.QWEN_MODEL || process.env.QWEN_MODEL

      server.middlewares.use('/api/health', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        const config = getQwenConfig()
        const result = await pingQwen(config)
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          online: result.online,
          models: result.models,
          model: config.model,
          provider: 'qwen',
          error: result.error ?? null,
        }))
      })

      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        try {
          const body = await readJsonBody(req)
          const config = getQwenConfig()
          const upstream = await createChatCompletionStream(config, body.messages || [])
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
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message || 'Chat request failed' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), qwenDevApiPlugin(env)],
  }
})
