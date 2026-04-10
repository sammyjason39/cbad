import { useState } from 'react'
import OverviewTab   from '../components/tabs/OverviewTab'
import PurchaseTab   from '../components/tabs/PurchaseTab'
import RetentionTab  from '../components/tabs/RetentionTab'
import SegmentsTab   from '../components/tabs/SegmentsTab'
import LocationTab   from '../components/tabs/LocationTab'
import AIAnalyst     from '../components/AIAnalyst'

const TABS = [
  { id: 'overview',   label: 'Ringkasan' },
  { id: 'purchase',   label: 'Pola Pembelian' },
  { id: 'retention',  label: 'Retensi' },
  { id: 'segments',   label: 'Segmen' },
  { id: 'location',   label: 'Per Lokasi' },
]

export default function DashboardScreen({ data, ollamaOnline }) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabContent = {
    overview:  <OverviewTab  data={data} />,
    purchase:  <PurchaseTab  data={data} />,
    retention: <RetentionTab data={data} />,
    segments:  <SegmentsTab  data={data} />,
    location:  <LocationTab  data={data} />,
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8f8f6' }}>

      {/* ── Dark header ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 flex items-center px-6"
        style={{ background: '#0f0f18', height: 52, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Wordmark */}
        <span
          className="font-semibold flex-shrink-0 mr-8"
          style={{ color: '#7F77DD', fontSize: 13, letterSpacing: '0.05em' }}
        >
          ConextLab
        </span>

        {/* Tabs — centered */}
        <nav className="flex-1 flex items-center justify-center gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                color:      activeTab === tab.id ? '#fff'                       : 'rgba(255,255,255,0.45)',
                background: activeTab === tab.id ? 'rgba(127,119,221,0.25)'    : 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Ollama status */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-8">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: ollamaOnline ? '#1D9E75' : '#E24B4A' }}
          />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            AI Analis: {ollamaOnline ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
      </header>

      {/* ── Tab content ─────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {tabContent[activeTab]}

        {/* AI Analyst — always visible */}
        <AIAnalyst
          data={data}
          ollamaOnline={ollamaOnline}
          activeTab={activeTab}
        />
      </main>
    </div>
  )
}
