import { useState, useEffect, useRef } from 'react'
import { parseCSVs } from '../utils/parseCSVs'
import { computeMetrics, generateLogLines } from '../utils/computeMetrics'

const TOTAL_MS = 20_000
const TICK_MS  = 100
const RADIUS   = 88
const CIRC     = 2 * Math.PI * RADIUS  // ≈ 552.9

const STAGES = [
  { from:  0, to: 10, label: 'Memuat data pelanggan...' },
  { from: 10, to: 20, label: 'Memuat riwayat pesanan...' },
  { from: 20, to: 30, label: 'Memproses item transaksi...' },
  { from: 30, to: 40, label: 'Mengindeks sesi pengguna...' },
  { from: 40, to: 50, label: 'Menghitung segmen RFM...' },
  { from: 50, to: 60, label: 'Membangun kurva retensi kohort...' },
  { from: 60, to: 70, label: 'Memetakan perilaku geografis...' },
  { from: 70, to: 80, label: 'Menghitung performa channel...' },
  { from: 80, to: 90, label: 'Menyiapkan konteks AI analis...' },
  { from: 90, to: 100, label: 'Menyiapkan dashboard...' },
]

function getStageLabel(pct) {
  const s = STAGES.find(s => pct >= s.from && pct < s.to)
  return s?.label ?? 'Analisis selesai.'
}

/** Animated integer count-up */
function useCountUp(target, duration = 2000) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return
    const start = Date.now()
    const id = setInterval(() => {
      const t = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(ease * target))
      if (t >= 1) clearInterval(id)
    }, 40)
    return () => clearInterval(id)
  }, [target, duration])
  return val
}

export default function LoadingScreen({ files, onDone }) {
  const [progress, setProgress]       = useState(0)
  const [parsedData, setParsedData]   = useState(null)
  const [parsingDone, setParsingDone] = useState(false)
  const [logLines, setLogLines]       = useState([])
  const [visibleCount, setVisibleCount] = useState(0)
  const [fading, setFading]           = useState(false)
  const logRef = useRef(null)

  // Raw counts for subtitle count-up (activated once parsing done)
  const customerTarget  = parsedData ? parsedData.customers.length : 0
  const orderTarget     = parsedData ? parsedData.orders.length    : 0
  const sessionTarget   = parsedData ? parsedData.sessions.length  : 0
  const displayCustomers = useCountUp(customerTarget)
  const displayOrders    = useCountUp(orderTarget)
  const displaySessions  = useCountUp(sessionTarget)

  // ── 1. Parse CSVs immediately ─────────────────────────────────────────────
  useEffect(() => {
    parseCSVs(files).then(rawData => {
      const metrics = computeMetrics(rawData)
      const lines   = generateLogLines(rawData, metrics)
      setParsedData({ ...rawData, metrics })
      setLogLines(lines)
      setParsingDone(true)
    })
  }, []) // eslint-disable-line

  // ── 2. Progress timer — 20 seconds ───────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setProgress(p => {
        const next = +(p + 100 / (TOTAL_MS / TICK_MS)).toFixed(2)
        return next >= 100 ? 100 : next
      })
    }, TICK_MS)
    return () => clearInterval(id)
  }, [])

  // ── 3. Reveal log lines at 1 per (20s / 25 lines) ───────────────────────
  useEffect(() => {
    if (!logLines.length) return
    const linesPerTick = logLines.length / (TOTAL_MS / TICK_MS)
    setVisibleCount(Math.min(Math.ceil(progress / 100 * logLines.length), logLines.length))
  }, [progress, logLines.length])

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [visibleCount])

  // ── 4. Advance when both ready ────────────────────────────────────────────
  useEffect(() => {
    if (progress >= 100 && parsingDone && parsedData && !fading) {
      setFading(true)
      setTimeout(() => onDone(parsedData), 800)
    }
  }, [progress, parsingDone, parsedData, fading]) // eslint-disable-line

  const pct    = Math.min(Math.floor(progress), 100)
  const offset = CIRC * (1 - pct / 100)

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 transition-opacity duration-700"
      style={{
        background: '#0a0a0f',
        opacity: fading ? 0 : 1,
      }}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">

        {/* ── Title ──────────────────────────────────────────────────────── */}
        <div className="text-center">
          <h1 className="text-white font-semibold" style={{ fontSize: 30 }}>
            Menganalisis perilaku pelanggan
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Memproses{' '}
            <span className="text-white font-medium">{displayCustomers.toLocaleString()}</span> pelanggan
            {' '}·{' '}
            <span className="text-white font-medium">{displayOrders.toLocaleString()}</span> pesanan
            {' '}·{' '}
            <span className="text-white font-medium">{displaySessions.toLocaleString()}</span> sesi
          </p>
        </div>

        {/* ── Circular progress ring ─────────────────────────────────────── */}
        <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx="100" cy="100" r={RADIUS} fill="none"
              stroke="rgba(127,119,221,0.12)" strokeWidth="8" />
            {/* Progress arc */}
            <circle cx="100" cy="100" r={RADIUS} fill="none"
              stroke="#7F77DD" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.12s linear' }}
            />
          </svg>
          {/* Centered text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white font-bold" style={{ fontSize: 48, lineHeight: 1 }}>
              {pct}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>%</span>
          </div>
        </div>

        {/* ── Thin progress bar ──────────────────────────────────────────── */}
        <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #7F77DD, #1D9E75)',
              transition: 'width 0.12s linear',
            }}
          />
        </div>

        {/* ── Stage label ────────────────────────────────────────────────── */}
        <p className="text-sm font-mono text-center" style={{ color: 'rgba(255,255,255,0.35)', minHeight: 20 }}>
          {getStageLabel(pct)}
        </p>

        {/* ── Terminal log ───────────────────────────────────────────────── */}
        <div
          ref={logRef}
          className="w-full rounded-xl font-mono text-xs overflow-y-auto"
          style={{
            height: 180,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '12px 14px',
            color: '#1D9E75',
          }}
        >
          {logLines.slice(0, visibleCount).map((line, i) => (
            <div key={i} className="leading-relaxed">
              <span style={{ color: 'rgba(29,158,117,0.5)' }}>[{line.ts}]</span>{' '}
              {line.text}
            </div>
          ))}
          {/* blinking cursor */}
          {visibleCount < logLines.length && (
            <span className="animate-pulse" style={{ color: '#7F77DD' }}>▋</span>
          )}
        </div>

      </div>
    </div>
  )
}
