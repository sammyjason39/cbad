import { useState } from 'react'
import OverviewTab from './tabs/OverviewTab'
import PurchaseTab from './tabs/PurchaseTab'
import RetentionTab from './tabs/RetentionTab'
import SegmentsTab from './tabs/SegmentsTab'
import LocationTab from './tabs/LocationTab'
import AIAnalyst from './AIAnalyst'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'purchase', label: 'Purchase Patterns' },
  { id: 'retention', label: 'Retention & Churn' },
  { id: 'segments', label: 'Segments (RFM)' },
  { id: 'location', label: 'By Location' },
]

export default function Dashboard({ data }) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabContent = {
    overview: <OverviewTab data={data} />,
    purchase: <PurchaseTab data={data} />,
    retention: <RetentionTab data={data} />,
    segments: <SegmentsTab data={data} />,
    location: <LocationTab data={data} />,
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Behavioural Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">
          E-commerce insights &mdash; Indonesia market demo
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      {tabContent[activeTab]}

      {/* AI Analyst — always visible */}
      <AIAnalyst data={data} activeTab={activeTab} />
    </div>
  )
}
