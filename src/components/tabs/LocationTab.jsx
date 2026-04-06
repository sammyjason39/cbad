import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import MetricCard from '../MetricCard'
import ChartCard from '../ChartCard'
import { groupBy, sumBy, avgBy } from '../../utils/dataUtils'
import { fmtK, fmtCurrency, fmtPct, fmtNumber, fmtMonth } from '../../utils/formatters'

const CITIES = [
  'Jakarta', 'Bali', 'Bandung', 'Surabaya', 'Medan',
  'Yogyakarta', 'Makassar', 'Semarang', 'Depok', 'Tangerang',
]

const SEGMENT_COLORS = {
  Champions: '#1D9E75', Loyal: '#378ADD', 'At Risk': '#E24B4A',
  New: '#7F77DD', Lost: '#888780',
}

const CHANNEL_COLORS = {
  Organic: '#1D9E75',
  'Paid Search': '#378ADD',
  'Social Media': '#7F77DD',
  Email: '#D85A30',
  Direct: '#BA7517',
  Referral: '#639922',
}

function InsightBadge({ text, type }) {
  const styles = {
    positive: 'bg-green-50 text-green-800 border border-green-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    negative: 'bg-red-50 text-red-800 border border-red-200',
  }
  return (
    <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${styles[type]}`}>
      {text}
    </span>
  )
}

function buildInsights(profile) {
  const insights = []
  if (!profile) return insights
  const p = profile

  if (+p.ig_ads_cvr > 0.12)
    insights.push({ text: 'IG Ads: High ROI — increase budget', type: 'positive' })
  else if (+p.ig_ads_cvr < 0.10)
    insights.push({ text: 'IG Ads: Low ROI — shift to organic/referral', type: 'negative' })

  if (+p.email_cvr > 0.15)
    insights.push({ text: 'Email: Strong — prioritize list building', type: 'positive' })

  if (+p.monthly_churn_rate > 0.06)
    insights.push({ text: 'Churn risk: High — launch retention campaign', type: 'warning' })

  if (+p.mobile_share > 0.60)
    insights.push({ text: 'Mobile-first — ensure mobile UX is optimized', type: 'positive' })

  return insights
}

export default function LocationTab({ data }) {
  const { cityCustomerProfile, cityChannelPerformance, cityCategoryRevenue, citySegmentMix } = data
  const [selectedCity, setSelectedCity] = useState('Jakarta')

  const profile = useMemo(
    () => cityCustomerProfile.find(r => r.city === selectedCity),
    [cityCustomerProfile, selectedCity]
  )

  // ── Channel CVR comparison ────────────────────────────────────────────────
  const channelCVRData = useMemo(() => {
    const cityRows = cityChannelPerformance.filter(r => r.city === selectedCity)
    const byChannel = groupBy(cityRows, r => r.acquisition_source)

    const allRows = cityChannelPerformance
    const globalByChannel = groupBy(allRows, r => r.acquisition_source)

    return Object.entries(byChannel).map(([ch, rows]) => {
      const totalSessions = rows.reduce((s, r) => s + +r.sessions, 0)
      const totalConv = rows.reduce((s, r) => s + +r.conversions, 0)
      const cityCVR = totalSessions ? totalConv / totalSessions : 0

      const gRows = globalByChannel[ch] || []
      const gSessions = gRows.reduce((s, r) => s + +r.sessions, 0)
      const gConv = gRows.reduce((s, r) => s + +r.conversions, 0)
      const globalCVR = gSessions ? gConv / gSessions : 0

      return {
        channel: ch,
        cityCVR: +((cityCVR) * 100).toFixed(2),
        globalCVR: +((globalCVR) * 100).toFixed(2),
        isAbove: cityCVR >= globalCVR,
      }
    }).sort((a, b) => b.cityCVR - a.cityCVR)
  }, [cityChannelPerformance, selectedCity])

  // ── Revenue by channel over time ─────────────────────────────────────────
  const channelOverTimeData = useMemo(() => {
    const cityRows = cityChannelPerformance.filter(r => r.city === selectedCity)
    const byMonth = groupBy(cityRows, r => r.month)
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, rows]) => {
        const row = { month: fmtMonth(month) }
        for (const r of rows) {
          row[r.acquisition_source] = (+r.revenue || 0)
        }
        return row
      })
  }, [cityChannelPerformance, selectedCity])

  // ── Category revenue ──────────────────────────────────────────────────────
  const categoryData = useMemo(() => {
    const cityRows = cityCategoryRevenue.filter(r => r.city === selectedCity)
    const byCategory = groupBy(cityRows, r => r.category, items =>
      items.reduce((s, r) => s + +r.revenue, 0)
    )
    return Object.entries(byCategory)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [cityCategoryRevenue, selectedCity])

  // ── Segment mix ───────────────────────────────────────────────────────────
  const segmentMixData = useMemo(() => {
    return citySegmentMix
      .filter(r => r.city === selectedCity)
      .map(r => ({ name: r.segment, value: +r.customer_count }))
  }, [citySegmentMix, selectedCity])

  // ── City vs city comparison ───────────────────────────────────────────────
  const cityComparisonData = useMemo(() =>
    cityCustomerProfile.map(r => ({
      city: r.city,
      aov: +r.avg_order_value,
      ig_cvr: +(+r.ig_ads_cvr * 100).toFixed(1),
    })).sort((a, b) => b.aov - a.aov)
  , [cityCustomerProfile])

  const insights = useMemo(() => buildInsights(profile), [profile])

  if (!profile) return <p className="text-gray-500 text-sm">No data for selected city.</p>

  return (
    <div className="space-y-6">
      {/* City selector */}
      <div className="flex flex-wrap gap-2">
        {CITIES.map(city => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCity === city
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* City insight card */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-blue-900 mb-1">{selectedCity}</h2>
            <p className="text-sm text-blue-800 leading-relaxed">{profile.description}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {insights.map((ins, i) => (
              <InsightBadge key={i} text={ins.text} type={ins.type} />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-blue-700">
          <span>Top category: <strong>{profile.top_category}</strong></span>
          <span>Top source: <strong>{profile.top_acquisition_source}</strong></span>
          <span>Peak day: <strong>{profile.peak_shopping_day}</strong></span>
          <span>Device: <strong>{profile.preferred_device}</strong></span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Avg Order Value" value={fmtCurrency(+profile.avg_order_value, 0)} />
        <MetricCard title="Avg LTV" value={fmtCurrency(+profile.avg_ltv, 0)} />
        <MetricCard
          title="Monthly Churn"
          value={fmtPct(+profile.monthly_churn_rate)}
          color={+profile.monthly_churn_rate > 0.06 ? '#E24B4A' : undefined}
        />
        <MetricCard
          title="Mobile Share"
          value={fmtPct(+profile.mobile_share)}
          color={+profile.mobile_share > 0.65 ? '#1D9E75' : undefined}
        />
      </div>

      {/* Channel CVR comparison */}
      <ChartCard title={`Channel Conversion Rate — ${selectedCity} vs Overall Average`}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={channelCVRData} layout="vertical" margin={{ left: 90 }}>
            <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="channel" tick={{ fontSize: 11 }} width={90} />
            <Tooltip formatter={v => `${v}%`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="cityCVR" name={selectedCity} radius={[0, 3, 3, 0]}>
              {channelCVRData.map((entry, i) => (
                <Cell key={i} fill={entry.isAbove ? '#1D9E75' : '#E24B4A'} />
              ))}
            </Bar>
            <Bar dataKey="globalCVR" name="Overall avg" fill="#d1d5db" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Revenue by channel over time */}
      <ChartCard title={`Revenue by Acquisition Channel — ${selectedCity}`}>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={channelOverTimeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={v => fmtK(v)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {Object.entries(CHANNEL_COLORS).map(([ch, color]) => (
              <Area
                key={ch}
                type="monotone"
                dataKey={ch}
                stackId="1"
                stroke={color}
                fill={color}
                fillOpacity={0.7}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Category + Segment row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title={`Category Revenue — ${selectedCity}`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 100 }}>
              <XAxis type="number" tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={v => fmtK(v)} />
              <Bar dataKey="revenue" fill="#378ADD" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`Customer Segment Mix — ${selectedCity}`}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={segmentMixData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                dataKey="value"
                nameKey="name"
              >
                {segmentMixData.map((entry, i) => (
                  <Cell key={i} fill={SEGMENT_COLORS[entry.name] ?? '#ccc'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={v => (
                  <span style={{ color: SEGMENT_COLORS[v] ?? '#555' }}>{v}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* City vs city comparison */}
      <ChartCard title="City vs City — Avg Order Value & IG Ads CVR">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={cityComparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="city" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="left" tickFormatter={v => `$${v}`} tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="aov" name="Avg Order Value ($)" fill="#378ADD" radius={[3, 3, 0, 0]}>
              {cityComparisonData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.city === selectedCity ? '#1D9E75' : '#378ADD'}
                />
              ))}
            </Bar>
            <Bar yAxisId="right" dataKey="ig_cvr" name="IG Ads CVR (%)" fill="#7F77DD" radius={[3, 3, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
