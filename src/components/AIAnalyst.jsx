import { useState, useRef, useEffect, useMemo } from 'react'
import { buildSystemPrompt } from '../utils/buildSystemPrompt'
import { streamChat } from '../utils/ollamaClient'

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

/** Animated typing dots */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gray-400"
          style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  )
}

export default function AIAnalyst({ data, ollamaOnline, activeTab }) {
  const [messages, setMessages]   = useState([])   // { role, content, streaming? }
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
    if (!userMsg || streaming || !ollamaOnline) return

    const history = [...messages, { role: 'user', content: userMsg }]
    setMessages(history)
    setInput('')
    setStreaming(true)

    // Add a placeholder assistant message that we'll update token by token
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-semibold text-gray-800 text-sm">AI Analis</span>
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: ollamaOnline ? '#1D9E75' : '#888780' }}
        />
        <span className="text-xs text-gray-500">
          {ollamaOnline ? 'Tanyakan apa saja tentang data pelanggan kamu' : 'Ollama nonaktif — jalankan Ollama untuk mengaktifkan'}
        </span>
      </div>

      {/* Offline warning */}
      {!ollamaOnline && (
        <div className="mb-3 rounded-lg px-3 py-2 text-xs bg-amber-50 text-amber-700 border border-amber-200">
          Ollama tidak berjalan. Jalankan dengan{' '}
          <code className="font-mono bg-amber-100 px-1 rounded">ollama serve</code> lalu muat ulang.
          Jika ada error CORS, atur{' '}
          <code className="font-mono bg-amber-100 px-1 rounded">OLLAMA_ORIGINS=*</code>.
        </div>
      )}

      {/* Quick questions */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={streaming || !ollamaOnline}
            className="text-xs bg-gray-100 hover:bg-purple-50 hover:text-purple-700 text-gray-600 px-2.5 py-1 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="chat-scroll h-56 overflow-y-auto space-y-3 mb-3 border border-gray-100 rounded-lg p-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-16">
            {ollamaOnline
              ? 'Pilih pertanyaan cepat atau ketik di bawah untuk mulai'
              : 'Jalankan Ollama untuk mengaktifkan AI Analis'}
          </p>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[82%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'text-white'
                  : m.isError
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
              }`}
              style={m.role === 'user' ? { background: '#7F77DD' } : undefined}
            >
              {m.content}
              {/* streaming cursor */}
              {m.streaming && (
                <span className="animate-pulse ml-0.5" style={{ color: '#7F77DD' }}>▋</span>
              )}
            </div>
          </div>
        ))}

        {/* Typing dots (while streaming but before first token) */}
        {streaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={ollamaOnline ? 'Tanya tentang pelanggan kamu…' : 'Ollama nonaktif'}
          disabled={streaming || !ollamaOnline}
          className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 disabled:bg-gray-50 disabled:cursor-not-allowed"
          style={{ '--tw-ring-color': '#7F77DD' }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={streaming || !input.trim() || !ollamaOnline}
          className="text-white text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          style={{ background: '#7F77DD' }}
        >
          {streaming ? '…' : 'Send'}
        </button>
      </div>
    </div>
  )
}
