import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ComposedChart, Line, CartesianGrid, Cell,
} from 'recharts'
import MetricCard from '../MetricCard'
import ChartCard from '../ChartCard'
import {
  completedOrders, groupBy, sumBy, avgBy,
  purchaseFreqBuckets, repeatBuyerRate, toMonth, toDOW,
} from '../../utils/dataUtils'
import { fmtK, fmtCurrency, fmtPct, fmtNumber, fmtMonth, fmtDOW } from '../../utils/formatters'

const CAT_COLORS = ['#7F77DD', '#1D9E75', '#378ADD', '#D85A30', '#BA7517', '#888780', '#639922']

export default function PurchaseTab({ data }) {
  const { orders, orderItems } = data

  const metrics = useMemo(() => {
    const completed = completedOrders(orders)
    const totalOrders = completed.length
    const rr = repeatBuyerRate(orders)

    const catRev = groupBy(completed, o => o.category, items =>
      sumBy(items, i => +i.total_amount)
    )
    const topCat = Object.entries(catRev).sort((a, b) => b[1] - a[1])[0]

    const dowCounts = {}
    for (const o of completed) {
      const d = toDOW(o.order_date)
      dowCounts[d] = (dowCounts[d] || 0) + 1
    }
    const peakDow = Object.entries(dowCounts).sort((a, b) => b[1] - a[1])[0]

    return { totalOrders, rr, topCat, peakDow }
  }, [orders])

  const ordersMonthlyData = useMemo(() => {
    const completed = completedOrders(orders)
    const byMonth = groupBy(completed, o => toMonth(o.order_date))
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, items]) => ({
        month: fmtMonth(month),
        orders: items.length,
        aov: avgBy(items, i => +i.total_amount),
      }))
  }, [orders])

  const freqData = useMemo(() => purchaseFreqBuckets(orders), [orders])

  const dowData = useMemo(() => {
    const completed = completedOrders(orders)
    const byDow = groupBy(completed, o => toDOW(o.order_date), items =>
      sumBy(items, i => +i.total_amount)
    )
    return [0, 1, 2, 3, 4, 5, 6].map(d => ({
      day: fmtDOW(d),
      revenue: byDow[d] || 0,
      isPeak: d === +(metrics.peakDow?.[0] ?? -1),
    }))
  }, [orders, metrics.peakDow])

  const top10Products = useMemo(() => {
    const byProduct = groupBy(orderItems, i => i.product_name, items =>
      sumBy(items, i => +i.subtotal)
    )
    return Object.entries(byProduct)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, revenue]) => ({ name, revenue }))
      .reverse()
  }, [orderItems])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Orders" value={fmtNumber(metrics.totalOrders)} />
        <MetricCard title="Repeat Buyer Rate" value={fmtPct(metrics.rr)} />
        <MetricCard
          title="Top Category"
          value={metrics.topCat?.[0] ?? '—'}
          sub={metrics.topCat ? fmtK(metrics.topCat[1]) + ' revenue' : undefined}
        />
        <MetricCard
          title="Peak Shopping Day"
          value={metrics.peakDow ? fmtDOW(+metrics.peakDow[0]) : '—'}
        />
      </div>

      {/* Orders per month + AOV */}
      <ChartCard title="Orders per Month & Avg Order Value">
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={ordersMonthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={v => `$${v}`} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar yAxisId="left" dataKey="orders" fill="#378ADD" radius={[3, 3, 0, 0]} name="Orders" />
            <Line yAxisId="right" type="monotone" dataKey="aov" stroke="#D85A30" dot={false} name="AOV ($)" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Purchase frequency */}
        <ChartCard title="Purchase Frequency Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={freqData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="customers" fill="#1D9E75" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue by DOW */}
        <ChartCard title="Revenue by Day of Week">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dowData}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => fmtK(v)} />
              <Bar dataKey="revenue" radius={[3, 3, 0, 0]}>
                {dowData.map((entry, i) => (
                  <Cell key={i} fill={entry.isPeak ? '#D85A30' : '#7F77DD'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top 10 products horizontal */}
      <ChartCard title="Top 10 Products by Revenue">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={top10Products} layout="vertical" margin={{ left: 110 }}>
            <XAxis type="number" tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
            <Tooltip formatter={v => fmtK(v)} />
            <Bar dataKey="revenue" fill="#BA7517" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
