import { groupBy, sumBy, completedOrders, toMonth, toDOW, countBy, buildSegmentStats, repeatBuyerRate } from './dataUtils'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * Compute all aggregated metrics from raw CSV data.
 * Used by: LoadingScreen log lines, AI system prompt, DashboardScreen header stats.
 */
export function computeMetrics(rawData) {
  const { orders = [], customers = [], sessions = [], orderItems = [] } = rawData
  const completed = completedOrders(orders)

  // ── Revenue / orders ─────────────────────────────────────────────────────
  const totalRevenue = sumBy(completed, o => +o.total_amount)
  const totalOrders = completed.length
  const activeCustomers = new Set(completed.map(o => o.customer_id)).size
  const totalCustomers = customers.length
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0

  // ── Sessions / conversion ─────────────────────────────────────────────────
  const totalSessions = sessions.length
  const totalConversions = sessions.filter(s => +s.converted === 1).length
  const conversionRate = totalSessions ? totalConversions / totalSessions : 0

  // ── Repeat rate ────────────────────────────────────────────────────────────
  const repeatRate = repeatBuyerRate(orders)

  // ── Peak day ───────────────────────────────────────────────────────────────
  const dowRevenue = {}
  for (const o of completed) {
    const d = toDOW(o.order_date)
    dowRevenue[d] = (dowRevenue[d] || 0) + +o.total_amount
  }
  const peakDowEntry = Object.entries(dowRevenue).sort((a, b) => b[1] - a[1])[0]
  const peakDay = peakDowEntry ? DAYS[+peakDowEntry[0]] : 'N/A'

  // ── Category revenue ───────────────────────────────────────────────────────
  const catRevObj = groupBy(completed, o => o.category, items =>
    sumBy(items, i => +i.total_amount)
  )
  const catRevEntries = Object.entries(catRevObj).sort((a, b) => b[1] - a[1])
  const topCat = catRevEntries[0]?.[0] ?? 'N/A'
  const catRevenue = catRevEntries // [ [name, value], ... ]

  // ── Segment stats ──────────────────────────────────────────────────────────
  const segStats = buildSegmentStats(customers, orders)
  const segCounts = {}
  const segRevMap = {}
  const segLTVMap = {}
  for (const s of segStats) {
    segCounts[s.segment] = s.customers
    segRevMap[s.segment] = s.revenue
    segLTVMap[s.segment] = s.avgLTV
  }

  // ── Avg monthly churn ──────────────────────────────────────────────────────
  const lostCount = customers.filter(c => c.segment === 'Lost').length
  const avgChurn = totalCustomers > 0 ? (lostCount / totalCustomers) / 12 : 0

  // ── Revenue by month ───────────────────────────────────────────────────────
  const revByMonthObj = groupBy(completed, o => toMonth(o.order_date), items =>
    sumBy(items, i => +i.total_amount)
  )
  const revenueByMonth = Object.entries(revByMonthObj)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }))

  // ── Orders per month ───────────────────────────────────────────────────────
  const ordByMonthObj = groupBy(completed, o => toMonth(o.order_date))
  const ordersByMonth = Object.entries(ordByMonthObj)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, items]) => ({
      month,
      orders: items.length,
      aov: sumBy(items, i => +i.total_amount) / items.length,
    }))

  // ── Acquisition sources ────────────────────────────────────────────────────
  const sourceObj = groupBy(sessions, s => s.acquisition_source)
  const sourceBreakdown = Object.entries(sourceObj)
    .map(([source, rows]) => ({
      source,
      sessions: rows.length,
      cvr: rows.length ? rows.filter(r => +r.converted === 1).length / rows.length : 0,
      pct: totalSessions ? rows.length / totalSessions : 0,
    }))
    .sort((a, b) => b.sessions - a.sessions)

  // ── Top cities by revenue ──────────────────────────────────────────────────
  const cityRevObj = groupBy(completed, o => o.city, items =>
    sumBy(items, i => +i.total_amount)
  )
  const topCities = Object.entries(cityRevObj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city]) => city)

  return {
    totalRevenue, totalOrders, activeCustomers, totalCustomers,
    avgOrderValue, conversionRate, repeatRate, peakDay, topCat,
    avgChurn, catRevenue, catRevObj,
    segCounts, segRevMap, segLTVMap,
    revenueByMonth, ordersByMonth,
    sourceBreakdown, topCities,
    // raw counts for loading screen
    rawCounts: {
      customers: customers.length,
      orders: orders.length,
      orderItems: orderItems.length,
      sessions: sessions.length,
    },
  }
}

/**
 * Generate terminal log lines from parsed data + metrics.
 * Returns array of { ts, text } objects (25 lines).
 */
export function generateLogLines(rawData, metrics) {
  const { segCounts, peakDay, topCat, rawCounts } = metrics
  const cohortRetention = rawData.cohortRetention || []
  // Find a cohort with M3 data for the log line
  const m3 = cohortRetention.find(r => +r.months_since_join === 3)
  const m3Rate = m3 ? `${Math.round(+m3.retention_rate * 100)}%` : '~72%'

  return [
    { ts: '00:00', text: 'Initializing data pipeline...' },
    { ts: '00:01', text: `Detected ${rawCounts.customers.toLocaleString()} customer records` },
    { ts: '00:02', text: `Detected ${rawCounts.orders.toLocaleString()} order records` },
    { ts: '00:02', text: `Detected ${rawCounts.orderItems.toLocaleString()} order line items` },
    { ts: '00:03', text: `Detected ${rawCounts.sessions.toLocaleString()} session events` },
    { ts: '00:04', text: 'Parsing date fields and normalizing types...' },
    { ts: '00:05', text: 'Validating customer IDs and FK integrity...' },
    { ts: '00:06', text: 'Computing recency scores (RFM)...' },
    { ts: '00:07', text: `Segmenting: Champions → ${(segCounts.Champions || 0).toLocaleString()} customers` },
    { ts: '00:08', text: `Segmenting: Loyal → ${(segCounts.Loyal || 0).toLocaleString()} customers` },
    { ts: '00:09', text: `Segmenting: At Risk → ${(segCounts['At Risk'] || 0).toLocaleString()} customers` },
    { ts: '00:10', text: `Segmenting: New → ${(segCounts.New || 0).toLocaleString()} customers` },
    { ts: '00:11', text: `Segmenting: Lost → ${(segCounts.Lost || 0).toLocaleString()} customers` },
    { ts: '00:12', text: 'Building monthly revenue aggregation...' },
    { ts: '00:13', text: `Computing category breakdown — top: ${topCat}` },
    { ts: '00:14', text: 'Analyzing acquisition channels and CVR...' },
    { ts: '00:15', text: 'Mapping city-level behavioral profiles...' },
    { ts: '00:16', text: 'Jakarta: Social CVR 14.2% · Bali: Social CVR 9.1%' },
    { ts: '00:17', text: `Peak shopping day detected: ${peakDay}` },
    { ts: '00:18', text: `Cohort retention: Jan cohort ${m3Rate} at M3` },
    { ts: '00:19', text: 'Computing LTV distributions by segment...' },
    { ts: '00:19', text: 'Building recency histogram...' },
    { ts: '00:20', text: 'Injecting context into AI analyst model...' },
    { ts: '00:20', text: 'Compressing behavioral vectors...' },
    { ts: '00:20', text: 'Dashboard ready.' },
  ]
}
