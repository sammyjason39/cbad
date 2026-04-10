import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, Legend,
  PieChart, Pie, Cell, ComposedChart, Line,
} from 'recharts'
import MetricCard from '../MetricCard'
import ChartCard from '../ChartCard'
import { groupBy, sumBy, completedOrders, toMonth, toDOW } from '../../utils/dataUtils'
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
  Organic: '#1D9E75', 'Paid Search': '#378ADD', 'Social Media': '#7F77DD',
  Email: '#D85A30', Direct: '#BA7517', Referral: '#639922',
}
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// ── Derive city profiles from core CSV data ──────────────────────────────────
function deriveCityProfiles(orders, customers) {
  const completed = completedOrders(orders)
  const cities = [...new Set(customers.map(c => c.city))].filter(Boolean).sort()

  return cities.map(city => {
    const cityOrders = completed.filter(o => o.city === city)
    const cityCustomers = customers.filter(c => c.city === city)
    const revenue = sumBy(cityOrders, o => +o.total_amount)
    const custCount = cityCustomers.length
    const avgOrderValue = cityOrders.length ? revenue / cityOrders.length : 0
    const avgLTV = custCount ? revenue / custCount : 0

    // Top category
    const catRev = groupBy(cityOrders, o => o.category, items => sumBy(items, i => +i.total_amount))
    const topCat = Object.entries(catRev).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'

    // Top source
    const srcCount = {}
    for (const o of cityOrders) srcCount[o.acquisition_source] = (srcCount[o.acquisition_source] || 0) + 1
    const topSrc = Object.entries(srcCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'

    // Mobile share
    const mobileOrders = cityOrders.filter(o => o.device === 'Mobile').length
    const mobileShare = cityOrders.length ? mobileOrders / cityOrders.length : 0

    // Peak day
    const dowCount = {}
    for (const o of cityOrders) {
      const d = toDOW(o.order_date)
      dowCount[d] = (dowCount[d] || 0) + 1
    }
    const peakDow = Object.entries(dowCount).sort((a, b) => b[1] - a[1])[0]
    const peakDay = peakDow ? DAYS[+peakDow[0]] : 'N/A'

    // Churn (Lost / total per city)
    const lostCount = cityCustomers.filter(c => c.segment === 'Lost').length
    const churnRate = custCount ? (lostCount / custCount) / 12 : 0

    // Repeat rate
    const orderCounts = {}
    for (const o of cityOrders) orderCounts[o.customer_id] = (orderCounts[o.customer_id] || 0) + 1
    const repeatCustomers = Object.values(orderCounts).filter(n => n > 1).length
    const totalActive = Object.keys(orderCounts).length
    const repeatRate = totalActive ? repeatCustomers / totalActive : 0

    return {
      city, total_customers: custCount, avg_order_value: avgOrderValue,
      avg_ltv: avgLTV, monthly_churn_rate: churnRate, repeat_purchase_rate: repeatRate,
      top_category: topCat, top_acquisition_source: topSrc,
      preferred_device: 'Mobile', peak_shopping_day: peakDay,
      mobile_share: mobileShare,
      ig_ads_cvr: null, email_cvr: null, paid_search_cvr: null, organic_cvr: null,
      description: `${city}: ${fmtNumber(custCount)} pelanggan · Kategori teratas: ${topCat} · Puncak: ${peakDay} · RNP: ${fmtCurrency(avgOrderValue, 0)}`,
    }
  })
}

// Derive channel performance per city from orders
function deriveCityChannelPerf(orders, cities) {
  const completed = completedOrders(orders)
  const rows = []
  for (const city of cities) {
    const cityOrders = completed.filter(o => o.city === city)
    const bySource = groupBy(cityOrders, o => o.acquisition_source)
    for (const [source, ords] of Object.entries(bySource)) {
      const byMonth = groupBy(ords, o => toMonth(o.order_date))
      for (const [month, monthOrds] of Object.entries(byMonth)) {
        const revenue = sumBy(monthOrds, o => +o.total_amount)
        rows.push({ city, acquisition_source: source, month, sessions: monthOrds.length, conversions: monthOrds.length, revenue, conversion_rate: 1, ad_spend: 0, roas: 0, avg_order_value: revenue / monthOrds.length })
      }
    }
  }
  return rows
}

// Derive category revenue per city from orders
function deriveCityCatRevenue(orders, cities) {
  const completed = completedOrders(orders)
  const rows = []
  for (const city of cities) {
    const cityOrders = completed.filter(o => o.city === city)
    const byCat = groupBy(cityOrders, o => o.category)
    for (const [category, catOrds] of Object.entries(byCat)) {
      const byMonth = groupBy(catOrds, o => toMonth(o.order_date))
      for (const [month, monthOrds] of Object.entries(byMonth)) {
        const revenue = sumBy(monthOrds, o => +o.total_amount)
        rows.push({ city, category, month, revenue, orders: monthOrds.length, avg_order_value: revenue / monthOrds.length })
      }
    }
  }
  return rows
}

// Derive segment mix per city from customers
function deriveCitySegmentMix(customers, cities) {
  const rows = []
  const SEGMENTS = ['Champions', 'Loyal', 'At Risk', 'New', 'Lost']
  for (const city of cities) {
    const cityCustomers = customers.filter(c => c.city === city)
    for (const seg of SEGMENTS) {
      const count = cityCustomers.filter(c => c.segment === seg).length
      rows.push({ city, segment: seg, customer_count: count, avg_ltv: 0, avg_order_value: 0, churn_rate: 0, share_of_city: cityCustomers.length ? count / cityCustomers.length : 0 })
    }
  }
  return rows
}

function InsightBadge({ text, type }) {
  const styles = {
    positive: 'bg-green-50 text-green-800 border border-green-200',
    warning:  'bg-amber-50 text-amber-800 border border-amber-200',
    negative: 'bg-red-50 text-red-800 border border-red-200',
  }
  return <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${styles[type]}`}>{text}</span>
}

function buildInsights(profile) {
  const insights = []
  if (!profile) return insights
  if (profile.ig_ads_cvr !== null) {
    if (+profile.ig_ads_cvr > 0.12) insights.push({ text: 'IG Ads: ROI Tinggi — tambah anggaran', type: 'positive' })
    else if (+profile.ig_ads_cvr < 0.10) insights.push({ text: 'IG Ads: ROI Rendah — alihkan ke organik', type: 'negative' })
  }
  if (profile.email_cvr !== null && +profile.email_cvr > 0.15)
    insights.push({ text: 'Email: Kuat — prioritaskan pembangunan daftar', type: 'positive' })
  if (+profile.monthly_churn_rate > 0.06)
    insights.push({ text: 'Risiko Churn: Tinggi — luncurkan kampanye retensi', type: 'warning' })
  if (+profile.mobile_share > 0.60)
    insights.push({ text: 'Mobile-first — optimalkan UX mobile', type: 'positive' })
  return insights
}

export default function LocationTab({ data }) {
  const { orders, customers } = data
  const hasCityFiles = (data.cityCustomerProfile || []).length > 0

  // ── Source data: prefer city files, fall back to derived ─────────────────
  const cityProfiles = useMemo(() => {
    if (hasCityFiles) return data.cityCustomerProfile
    return deriveCityProfiles(orders, customers)
  }, [hasCityFiles, data.cityCustomerProfile, orders, customers])

  const availableCities = useMemo(
    () => cityProfiles.map(p => p.city).filter(c => CITIES.includes(c)).sort((a, b) => CITIES.indexOf(a) - CITIES.indexOf(b)),
    [cityProfiles]
  )

  const [selectedCity, setSelectedCity] = useState(() => availableCities[0] ?? 'Jakarta')

  const cityChannelPerf = useMemo(() => {
    if (hasCityFiles) return data.cityChannelPerformance || []
    return deriveCityChannelPerf(orders, availableCities)
  }, [hasCityFiles, data.cityChannelPerformance, orders, availableCities])

  const cityCatRevenue = useMemo(() => {
    if (hasCityFiles) return data.cityCategoryRevenue || []
    return deriveCityCatRevenue(orders, availableCities)
  }, [hasCityFiles, data.cityCategoryRevenue, orders, availableCities])

  const citySegmentMix = useMemo(() => {
    if (hasCityFiles) return data.citySegmentMix || []
    return deriveCitySegmentMix(customers, availableCities)
  }, [hasCityFiles, data.citySegmentMix, customers, availableCities])

  const profile = useMemo(
    () => cityProfiles.find(r => r.city === selectedCity),
    [cityProfiles, selectedCity]
  )

  // ── Charts ────────────────────────────────────────────────────────────────
  const channelCVRData = useMemo(() => {
    const cityRows   = cityChannelPerf.filter(r => r.city === selectedCity)
    const globalRows = cityChannelPerf

    const byCh = groupBy(cityRows, r => r.acquisition_source)
    const globalByCh = groupBy(globalRows, r => r.acquisition_source)

    return Object.entries(byCh).map(([ch, rows]) => {
      const cS = rows.reduce((s, r) => s + +r.sessions, 0)
      const cC = rows.reduce((s, r) => s + +r.conversions, 0)
      const cityRate = cS ? (cC / cS) * 100 : 0

      const gRows = globalByCh[ch] || []
      const gS = gRows.reduce((s, r) => s + +r.sessions, 0)
      const gC = gRows.reduce((s, r) => s + +r.conversions, 0)
      const globalRate = gS ? (gC / gS) * 100 : 0

      return { channel: ch, cityCVR: +cityRate.toFixed(2), globalCVR: +globalRate.toFixed(2), isAbove: cityRate >= globalRate }
    }).sort((a, b) => b.cityCVR - a.cityCVR)
  }, [cityChannelPerf, selectedCity])

  const channelOverTimeData = useMemo(() => {
    const cityRows = cityChannelPerf.filter(r => r.city === selectedCity)
    const byMonth  = groupBy(cityRows, r => r.month)
    return Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, rows]) => {
      const row = { month: fmtMonth(month) }
      for (const r of rows) row[r.acquisition_source] = +r.revenue || 0
      return row
    })
  }, [cityChannelPerf, selectedCity])

  const categoryData = useMemo(() => {
    const cityRows = cityCatRevenue.filter(r => r.city === selectedCity)
    const byCat = groupBy(cityRows, r => r.category, items => items.reduce((s, r) => s + +r.revenue, 0))
    return Object.entries(byCat).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue)
  }, [cityCatRevenue, selectedCity])

  const segmentMixData = useMemo(() =>
    citySegmentMix.filter(r => r.city === selectedCity).map(r => ({ name: r.segment, value: +r.customer_count }))
  , [citySegmentMix, selectedCity])

  const cityComparisonData = useMemo(() =>
    cityProfiles.map(r => ({
      city: r.city,
      aov: +r.avg_order_value,
      ig_cvr: r.ig_ads_cvr !== null ? +(+r.ig_ads_cvr * 100).toFixed(1) : null,
    })).sort((a, b) => b.aov - a.aov)
  , [cityProfiles])

  const insights = useMemo(() => buildInsights(profile), [profile])

  if (!profile) return (
    <p className="text-gray-500 text-sm py-8 text-center">
      No data found for {selectedCity}. Check your CSV files.
    </p>
  )

  return (
    <div className="space-y-6">
      {/* City selector */}
      <div className="flex flex-wrap gap-2">
        {availableCities.map(city => (
          <button key={city} onClick={() => setSelectedCity(city)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              background: selectedCity === city ? '#7F77DD' : '#f3f4f6',
              color: selectedCity === city ? '#fff' : '#4b5563',
            }}
          >
            {city}
          </button>
        ))}
      </div>

      {/* City insight card */}
      <div className="rounded-lg p-4" style={{ background: '#f0eeff', border: '1px solid #e0dbff' }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="font-bold mb-1" style={{ color: '#3730a3', fontSize: 15 }}>{selectedCity}</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4338ca' }}>{profile.description}</p>
          </div>
          {insights.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {insights.map((ins, i) => <InsightBadge key={i} text={ins.text} type={ins.type} />)}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-xs" style={{ color: '#4338ca' }}>
          <span>Kategori teratas: <strong>{profile.top_category}</strong></span>
          <span>Sumber teratas: <strong>{profile.top_acquisition_source}</strong></span>
          <span>Hari puncak: <strong>{profile.peak_shopping_day}</strong></span>
          <span>Perangkat: <strong>{profile.preferred_device}</strong></span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Rata-rata Nilai Pesanan" value={fmtCurrency(+profile.avg_order_value, 0)} />
        <MetricCard title="Rata-rata LTV"           value={fmtCurrency(+profile.avg_ltv, 0)} />
        <MetricCard title="Churn Bulanan"           value={fmtPct(+profile.monthly_churn_rate)}
          color={+profile.monthly_churn_rate > 0.06 ? '#E24B4A' : undefined} />
        <MetricCard title="Porsi Mobile"            value={fmtPct(+profile.mobile_share)}
          color={+profile.mobile_share > 0.65 ? '#1D9E75' : undefined} />
      </div>

      {/* Channel CVR comparison */}
      {channelCVRData.length > 0 && (
        <ChartCard title={`Tingkat Konversi Channel — ${selectedCity} vs Rata-rata Keseluruhan`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={channelCVRData} layout="vertical" margin={{ left: 90 }}>
              <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="channel" tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={v => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="cityCVR" name={selectedCity} radius={[0, 3, 3, 0]}>
                {channelCVRData.map((e, i) => <Cell key={i} fill={e.isAbove ? '#1D9E75' : '#E24B4A'} />)}
              </Bar>
              <Bar dataKey="globalCVR" name="Overall avg" fill="#d1d5db" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Revenue by channel over time */}
      {channelOverTimeData.length > 0 && (
        <ChartCard title={`Pendapatan per Channel Akuisisi — ${selectedCity}`}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={channelOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => fmtK(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {Object.entries(CHANNEL_COLORS).map(([ch, color]) => (
                <Area key={ch} type="monotone" dataKey={ch} stackId="1"
                  stroke={color} fill={color} fillOpacity={0.7} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Category + Segment row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title={`Pendapatan per Kategori — ${selectedCity}`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 100 }}>
              <XAxis type="number" tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={v => fmtK(v)} />
              <Bar dataKey="revenue" fill="#378ADD" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`Komposisi Segmen — ${selectedCity}`}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={segmentMixData} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                dataKey="value" nameKey="name">
                {segmentMixData.map((e, i) => <Cell key={i} fill={SEGMENT_COLORS[e.name] ?? '#ccc'} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }}
                formatter={v => <span style={{ color: SEGMENT_COLORS[v] ?? '#555' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* City vs city comparison */}
      <ChartCard title="Perbandingan Kota — Rata-rata Nilai Pesanan & CVR IG Ads">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={cityComparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="city" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="left"  tickFormatter={v => `$${v}`} tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="aov" name="Avg Order Value ($)" radius={[3, 3, 0, 0]}>
              {cityComparisonData.map((e, i) => (
                <Cell key={i} fill={e.city === selectedCity ? '#1D9E75' : '#378ADD'} />
              ))}
            </Bar>
            {cityComparisonData.some(d => d.ig_cvr !== null) && (
              <Line yAxisId="right" type="monotone" dataKey="ig_cvr"
                name="IG Ads CVR (%)" stroke="#7F77DD" strokeWidth={2} dot={{ r: 3 }} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
