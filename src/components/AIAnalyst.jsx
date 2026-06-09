import { useState, useRef, useEffect, useMemo } from 'react'
import { buildSystemPrompt } from '../utils/buildSystemPrompt'
import { streamChat } from '../utils/aiClient'
import { brand } from '../brand/tokens'

const QUICK_QUESTIONS = [
  'Segmen mana yang harus saya prioritaskan?',
  'Mengapa churn saya mungkin tinggi?',
  'Di mana saya kehilangan pelanggan?',
  'Seperti apa profil pelanggan terbaik saya?',
  'Kategori mana yang harus saya fokuskan?',
  'Bagaimana cara mempertahankan Champions saya?',
  'Haruskah kampanye IG di Bali sama dengan Jakarta?',
  'Kota mana yang punya potensi ROI terbaik?',
]

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: brand.muted2, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  )
}

export default function AIAnalyst({ data, aiOnline, aiModel, activeTab }) {
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [streaming, setStreaming] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const systemPrompt = useMemo(() => {
    if (!data?.metrics) return ''
    const cityProfiles = activeTab === 'location' ? (data.cityCustomerProfile || []) : []
    return buildSystemPrompt(data.metrics, cityProfiles)
  }, [data, activeTab])

  async function sendMessage(text) {
    const userMsg = text.trim()
    if (!userMsg || streaming || !aiOnline) return

    const history = [...messages, { role: 'user', content: userMsg }]
    setMessages(history)
    setInput('')
    setStreaming(true)

    const assistantIdx = history.length
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    await streamChat({
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
      ],
      onToken: (fullText) => {
        setMessages(prev => {
          const next = [...prev]
          next[assistantIdx] = { role: 'assistant', content: fullText, streaming: true }
          return next
        })
      },
      onDone: (fullText) => {
        setMessages(prev => {
          const next = [...prev]
          next[assistantIdx] = { role: 'assistant', content: fullText, streaming: false }
          return next
        })
        setStreaming(false)
      },
      onError: (err) => {
        setMessages(prev => {
          const next = [...prev]
          next[assistantIdx] = { role: 'assistant', content: `Error: ${err}`, isError: true }
          return next
        })
        setStreaming(false)
      },
    })
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const modelLabel = aiModel || 'Qwen'

  return (
    <div
      className="p-5 mt-8"
      style={{
        background: brand.surface,
        border: `1px solid ${brand.hairline}`,
        borderRadius: 20,
        boxShadow: '0 16px 50px -20px rgba(10, 10, 10, 0.1)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="font-semibold text-sm" style={{ color: brand.ink }}>AI Analis</span>
        <span
          className="w-2 h-2 rounded-full"
          style={{
            background: aiOnline ? brand.blue : brand.muted2,
            boxShadow: aiOnline ? '0 0 0 4px rgba(22,82,240,0.16)' : 'none',
          }}
        />
        <span className="text-xs" style={{ color: brand.muted }}>
          {aiOnline
            ? `Didukung ${modelLabel} — tanyakan apa saja tentang data pelanggan kamu`
            : 'AI tidak tersedia — periksa konfigurasi Qwen API'}
        </span>
      </div>

      {!aiOnline && (
        <div
          className="mb-4 rounded-xl px-3 py-2 text-xs"
          style={{ background: brand.blueSoft, color: brand.blue, border: `1px solid rgba(22,82,240,0.2)` }}
        >
          Koneksi ke Qwen gagal. Pastikan{' '}
          <code className="font-mono px-1 rounded" style={{ background: 'rgba(22,82,240,0.1)' }}>QWEN_API_KEY</code>{' '}
          sudah diatur di environment (lokal: <code className="font-mono">.env</code>, production: Vercel env vars).
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={streaming || !aiOnline}
            className="text-xs px-3 py-1.5 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            style={{
              background: brand.mist,
              color: brand.muted,
              border: `1px solid ${brand.hairline}`,
            }}
            onMouseEnter={e => {
              if (!streaming && aiOnline) {
                e.currentTarget.style.background = brand.blueSoft
                e.currentTarget.style.color = brand.blue
                e.currentTarget.style.borderColor = 'rgba(22,82,240,0.25)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = brand.mist
              e.currentTarget.style.color = brand.muted
              e.currentTarget.style.borderColor = brand.hairline
            }}
          >
            {q}
          </button>
        ))}
      </div>

      <div
        className="chat-scroll h-56 overflow-y-auto space-y-3 mb-4 p-4"
        style={{ background: brand.mist, border: `1px solid ${brand.hairline}`, borderRadius: 12 }}
      >
        {messages.length === 0 && (
          <p className="text-xs text-center mt-16" style={{ color: brand.muted2 }}>
            {aiOnline
              ? 'Pilih pertanyaan cepat atau ketik di bawah untuk mulai'
              : 'AI Analis membutuhkan koneksi Qwen yang aktif'}
          </p>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[82%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap"
              style={
                m.role === 'user'
                  ? { background: brand.ink, color: brand.surface }
                  : m.isError
                  ? { background: '#FEF2F2', color: brand.danger, border: '1px solid #FECACA' }
                  : { background: brand.surface, color: brand.ink, border: `1px solid ${brand.hairline}` }
              }
            >
              {m.content}
              {m.streaming && (
                <span className="animate-pulse ml-0.5" style={{ color: brand.blue }}>▋</span>
              )}
            </div>
          </div>
        ))}

        {streaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div style={{ background: brand.surface, border: `1px solid ${brand.hairline}`, borderRadius: 12 }}>
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={aiOnline ? 'Tanya tentang pelanggan kamu…' : 'AI tidak tersedia'}
          disabled={streaming || !aiOnline}
          className="flex-1 text-xs rounded-full px-4 py-2.5 focus:outline-none disabled:cursor-not-allowed"
          style={{
            border: `1px solid ${brand.hairline}`,
            background: aiOnline ? brand.surface : brand.mist,
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={streaming || !input.trim() || !aiOnline}
          className="text-white text-xs px-5 py-2.5 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
          style={{ background: brand.ink }}
        >
          {streaming ? '…' : 'Kirim'}
        </button>
      </div>
    </div>
  )
}
