import { useState } from 'react'
import OverviewTab   from '../components/tabs/OverviewTab'
import PurchaseTab   from '../components/tabs/PurchaseTab'
import RetentionTab  from '../components/tabs/RetentionTab'
import SegmentsTab   from '../components/tabs/SegmentsTab'
import LocationTab   from '../components/tabs/LocationTab'
import AIAnalyst     from '../components/AIAnalyst'
import BrandLogo from '../components/BrandLogo'
import { brand } from '../brand/tokens'

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
    <div className="min-h-screen" style={{ background: brand.mist }}>

      <header
        className="sticky top-0 z-40 flex items-center px-6"
        style={{
          height: 56,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'saturate(180%) blur(14px)',
          WebkitBackdropFilter: 'saturate(180%) blur(14px)',
          borderBottom: `1px solid ${brand.hairline}`,
        }}
      >
        <div className="flex-shrink-0 mr-8">
          <BrandLogo size="sm" theme="light" />
        </div>

        <nav className="flex-1 flex items-center justify-center gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors"
              style={{
                color: activeTab === tab.id ? brand.ink : brand.muted,
                background: activeTab === tab.id ? brand.blueSoft : 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 flex-shrink-0 ml-8">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: ollamaOnline ? brand.blue : brand.muted2,
              boxShadow: ollamaOnline ? '0 0 0 4px rgba(22,82,240,0.16)' : 'none',
            }}
          />
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: brand.muted }}>
            AI Analis: {ollamaOnline ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="font-mono uppercase text-xs font-semibold tracking-widest mb-2" style={{ color: brand.blue }}>
            Dashboard · E-commerce Indonesia
          </p>
          <h1 className="font-extrabold tracking-tight" style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: brand.ink, letterSpacing: '-0.03em' }}>
            Analisis Perilaku <span style={{ color: brand.blue }}>Pelanggan</span>
          </h1>
        </div>

        {tabContent[activeTab]}

        <AIAnalyst
          data={data}
          ollamaOnline={ollamaOnline}
          activeTab={activeTab}
        />
      </main>
    </div>
  )
}
