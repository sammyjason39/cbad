import { useState, useRef, useEffect, useMemo } from 'react'
import {
  completedOrders, groupBy, sumBy, repeatBuyerRate,
  buildSegmentStats,
} from '../utils/dataUtils'
import { fmtK, fmtCurrency, fmtPct, fmtNumber } from '../utils/formatters'

const QUICK_QUESTIONS = [
  'Which segment should I focus on first?',
  'Why might my churn be high?',
  'Where am I losing customers?',
  'What does my best customer look like?',
  'Which category should I double down on?',
  'How do I retain my Champions?',
  'What is my best acquisition source?',
  'Which city has the most potential?',
]

function buildSystemPrompt(data) {
  const { orders, customers, sessions } = data
  const completed = completedOrders(orders)
  const totalRevenue = sumBy(completed, o => +o.total_amount)
  const activeCustomers = new Set(completed.map(o => o.customer_id)).size
  const aov = completed.length ? totalRevenue / completed.length : 0
  const rr = repeatBuyerRate(orders)

  const totalSessions = sessions.length
  const conversions = sessions.filter(s => +s.converted === 1).length
  const convRate = totalSessions ? conversions / totalSessions : 0

  // Peak DOW
  const dowCounts = {}
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  for (const o of completed) {
    const d = new Date(o.order_date).getDay()
    dowCounts[d] = (dowCounts[d] || 0) + 1
  }
  const peakDow = Object.entries(dowCounts).sort((a, b) => b[1] - a[1])[0]
  const peakDowName = peakDow ? DAYS[+peakDow[0]] : 'N/A'

  // Top category
  const catRev = groupBy(completed, o => o.category, items =>
    sumBy(items, i => +i.total_amount)
  )
  const sortedCats = Object.entries(catRev).sort((a, b) => b[1] - a[1])
  const topCat = sortedCats[0] || ['N/A', 0]

  // Segments
  const segStats = buildSegmentStats(customers, orders)
  const lostCount = customers.filter(c => c.segment === 'Lost').length
  const avgChurn = customers.length > 0 ? (lostCount / customers.length) / 12 : 0

  // Acquisition sources from sessions
  const srcCounts = {}
  for (const s of sessions) {
    srcCounts[s.acquisition_source] = (srcCounts[s.acquisition_source] || 0) + 1
  }
  const srcLines = Object.entries(srcCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([src, cnt]) => `- ${src}: ${fmtPct(cnt / sessions.length)}`)
    .join('\n')

  // Cities by revenue
  const cityRev = groupBy(completed, o => o.city, items =>
    sumBy(items, i => +i.total_amount)
  )
  const topCities = Object.entries(cityRev)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([city]) => city)
    .join(', ')

  const segLines = segStats
    .map(s =>
      `- ${s.segment}: ${fmtNumber(s.customers)} customers, ${fmtK(s.revenue)} revenue, ${fmtCurrency(s.avgLTV, 0)} avg LTV`
    )
    .join('\n')

  const catLines = sortedCats
    .map(([cat, rev]) =>
      `- ${cat}: ${fmtK(rev)} (${fmtPct(rev / totalRevenue)})`
    )
    .join('\n')

  return `You are a sharp, direct customer data analyst presenting at a Hyperlocalization Marketing event in Indonesia. You have full access to real e-commerce behavioral data below. Your audience are brand owners and marketers — many are new to data. Your job is to make data feel powerful, clear, and actionable.

Rules:
- Always cite specific numbers from the data
- Keep answers to 4–6 sentences max
- Be direct and confident, not hedging
- End every answer with one clear recommended action
- Use plain language, no jargon

DATA SUMMARY:
- Total revenue: ${fmtK(totalRevenue)}
- Active customers: ${fmtNumber(activeCustomers)} of ${fmtNumber(customers.length)}
- Average order value: ${fmtCurrency(aov, 2)}
- Repeat buyer rate: ${fmtPct(rr)}
- Peak shopping day: ${peakDowName}
- Top category: ${topCat[0]} (${fmtK(topCat[1])} revenue)
- Average monthly churn: ${fmtPct(avgChurn)}
- Conversion rate: ${fmtPct(convRate)}

SEGMENTS:
${segLines}

CATEGORIES (revenue):
${catLines}

ACQUISITION SOURCES:
${srcLines}

TOP CITIES BY REVENUE: ${topCities}`
}

function buildCityContext(cityCustomerProfile) {
  if (!cityCustomerProfile?.length) return ''
  const lines = cityCustomerProfile.map(p =>
    `- ${p.city}: IG Ads CVR ${fmtPct(+p.ig_ads_cvr)}, Email CVR ${fmtPct(+p.email_cvr)}, ` +
    `peak ${p.peak_shopping_day}, top category ${p.top_category}, ` +
    `AOV ${fmtCurrency(+p.avg_order_value, 0)}, mobile share ${fmtPct(+p.mobile_share)}`
  ).join('\n')

  return `

CITY BEHAVIORAL PROFILES:
${lines}

KEY HYPERLOCAL INSIGHT: IG Ads perform strongest in Jakarta and Tangerang. Email outperforms social in Surabaya and Semarang. Bandung is the strongest city for fashion/apparel campaigns. Yogyakarta has the lowest paid-channel ROI — lean into organic content there.`
}

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY

export default function AIAnalyst({ data, activeTab }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const systemPrompt = useMemo(() => {
    if (!data) return ''
    const base = buildSystemPrompt(data)
    if (activeTab === 'location') {
      return base + buildCityContext(data.cityCustomerProfile)
    }
    return base
  }, [data, activeTab])

  async function sendMessage(text) {
    const userMsg = text.trim()
    if (!userMsg || !API_KEY) return

    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Customer Behavioural Analyst',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            ...newMessages,
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.error?.message || `HTTP ${response.status}`)
      }

      const json = await response.json()
      const reply = json.choices?.[0]?.message?.content ?? 'No response.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`,
        isError: true,
      }])
    } finally {
      setLoading(false)
    }
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
        <span className="font-semibold text-gray-800 text-sm">AI Analyst</span>
        <span className={`inline-block w-2 h-2 rounded-full ${API_KEY ? 'bg-green-500' : 'bg-gray-300'}`}></span>
        <p className="text-xs text-gray-500">Ask anything about your customer data</p>
        {!API_KEY && (
          <span className="ml-auto text-xs text-amber-600 font-medium">
            Set VITE_OPENROUTER_API_KEY in .env to enable
          </span>
        )}
      </div>

      {/* Quick questions */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={loading || !API_KEY}
            className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 px-2.5 py-1 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="chat-scroll h-56 overflow-y-auto space-y-3 mb-3 border border-gray-100 rounded-lg p-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-16">
            Select a quick question or type below to start
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : m.isError
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500 shadow-sm">
              <span className="animate-pulse">Analysing...</span>
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
          placeholder={API_KEY ? 'Ask about your customers…' : 'Set VITE_OPENROUTER_API_KEY in .env to enable'}
          disabled={loading || !API_KEY}
          className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim() || !API_KEY}
          className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >
          Send
        </button>
      </div>
    </div>
  )
}
