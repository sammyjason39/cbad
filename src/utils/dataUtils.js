/** Group array by key, apply aggregation to each group */
export function groupBy(arr, keyFn, aggFn) {
  const map = new Map()
  for (const item of arr) {
    const k = keyFn(item)
    if (!map.has(k)) map.set(k, [])
    map.get(k).push(item)
  }
  if (!aggFn) return Object.fromEntries(map)
  const result = {}
  map.forEach((items, k) => { result[k] = aggFn(items) })
  return result
}

export const sumBy = (arr, fn) => arr.reduce((s, x) => s + (fn(x) || 0), 0)
export const avgBy = (arr, fn) => arr.length ? sumBy(arr, fn) / arr.length : 0
export const countBy = (arr, fn) => {
  const r = {}
  for (const x of arr) {
    const k = fn(x)
    r[k] = (r[k] || 0) + 1
  }
  return r
}

/** Return unique values of a field */
export const unique = (arr, fn) => [...new Set(arr.map(fn))]

/** Orders filtered to Completed status */
export const completedOrders = (orders) =>
  orders.filter(o => o.status === 'Completed')

/** Parse a YYYY-MM-DD date string to a Date */
export const parseDate = (s) => new Date(s)

/** YYYY-MM from a date string */
export const toMonth = (s) => s?.slice(0, 7)

/** Day-of-week 0=Sun from date string */
export const toDOW = (s) => new Date(s).getDay()

/** Build segment-level stats from orders + customers */
export function buildSegmentStats(customers, orders) {
  const completed = completedOrders(orders)
  const segCustomers = groupBy(customers, c => c.segment)
  const segOrders = groupBy(completed, o => o.segment)

  const segments = ['Champions', 'Loyal', 'At Risk', 'New', 'Lost']
  return segments.map(seg => {
    const custs = segCustomers[seg] || []
    const ords = segOrders[seg] || []
    const revenue = sumBy(ords, o => +o.total_amount)
    const custCount = custs.length
    const avgLTV = custCount > 0 ? revenue / custCount : 0
    return { segment: seg, customers: custCount, revenue, avgLTV }
  })
}

/** Purchase frequency buckets for customers */
export function purchaseFreqBuckets(orders) {
  const completed = completedOrders(orders)
  const counts = countBy(completed, o => o.customer_id)
  const buckets = { '1 order': 0, '2–3': 0, '4–6': 0, '7+': 0 }
  Object.values(counts).forEach(n => {
    if (n === 1) buckets['1 order']++
    else if (n <= 3) buckets['2–3']++
    else if (n <= 6) buckets['4–6']++
    else buckets['7+']++
  })
  return Object.entries(buckets).map(([name, customers]) => ({ name, customers }))
}

/** Repeat buyer rate: customers with >1 completed order / total active customers */
export function repeatBuyerRate(orders) {
  const completed = completedOrders(orders)
  const counts = countBy(completed, o => o.customer_id)
  const total = Object.keys(counts).length
  const repeat = Object.values(counts).filter(n => n > 1).length
  return total > 0 ? repeat / total : 0
}

/** Days since last order for each customer (recency) */
export function recencyPerCustomer(orders) {
  const completed = completedOrders(orders)
  const latest = {}
  const now = new Date('2025-01-01') // relative reference for demo
  for (const o of completed) {
    const d = new Date(o.order_date)
    if (!latest[o.customer_id] || d > latest[o.customer_id]) {
      latest[o.customer_id] = d
    }
  }
  return Object.values(latest).map(d =>
    Math.floor((now - d) / (1000 * 60 * 60 * 24))
  )
}

/** Bucket recency days into histogram bins */
export function recencyHistogram(orders) {
  const days = recencyPerCustomer(orders)
  const bins = [
    { label: '0–30', min: 0, max: 30 },
    { label: '31–60', min: 31, max: 60 },
    { label: '61–90', min: 61, max: 90 },
    { label: '91–180', min: 91, max: 180 },
    { label: '181–365', min: 181, max: 365 },
    { label: '365+', min: 366, max: Infinity },
  ]
  return bins.map(b => ({
    label: b.label,
    customers: days.filter(d => d >= b.min && d <= b.max).length,
  }))
}

/** Monthly churn estimate: lost customers who had last order in that month */
export function estimateMonthlyChurn(orders, customers) {
  const lostIds = new Set(
    customers.filter(c => c.segment === 'Lost').map(c => c.customer_id)
  )
  const completed = completedOrders(orders)
  const lastOrder = {}
  for (const o of completed) {
    if (!lastOrder[o.customer_id] || o.order_date > lastOrder[o.customer_id]) {
      lastOrder[o.customer_id] = o.order_date
    }
  }
  const monthCounts = {}
  for (const [cid, date] of Object.entries(lastOrder)) {
    if (lostIds.has(cid)) {
      const m = toMonth(date)
      monthCounts[m] = (monthCounts[m] || 0) + 1
    }
  }
  return Object.entries(monthCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, churned]) => ({ month, churned }))
}
