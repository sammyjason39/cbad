import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import MetricCard from '../MetricCard'
import ChartCard from '../ChartCard'
import { completedOrders, groupBy, sumBy } from '../../utils/dataUtils'
import { fmtK, fmtCurrency, fmtPct, fmtNumber, fmtMonth } from '../../utils/formatters'

const SEGMENT_COLORS = {
  Champions: '#1D9E75',
  Loyal: '#378ADD',
  'At Risk': '#E24B4A',
  New: '#7F77DD',
  Lost: '#888780',
}

const CAT_COLORS = ['#7F77DD', '#1D9E75', '#378ADD', '#D85A30', '#BA7517', '#888780', '#639922']

export default function OverviewTab({ data }) {
  const { orders, customers, sessions, monthlySummary } = data

  const metrics = useMemo(() => {
    const completed = completedOrders(orders)
    const totalRevenue = sumBy(completed, o => +o.total_amount)
    const activeCustomers = new Set(completed.map(o => o.customer_id)).size
    const aov = completed.length ? totalRevenue / completed.length : 0
    const totalSessions = sessions.length
    const conversions = sessions.filter(s => +s.converted === 1).length
    const convRate = totalSessions ? conversions / totalSessions : 0
    return { totalRevenue, activeCustomers, aov, convRate }
  }, [orders, sessions])

  const monthlyChartData = useMemo(() =>
    monthlySummary
      .slice()
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(r => ({
        month: fmtMonth(r.month),
        revenue: +r.total_revenue,
      }))
  , [monthlySummary])

  const categoryRevenue = useMemo(() => {
    const completed = completedOrders(orders)
    const byCategory = groupBy(completed, o => o.category, items =>
      sumBy(items, i => +i.total_amount)
    )
    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [orders])

  const segmentDist = useMemo(() => {
    const counts = {}
    for (const c of customers) {
      counts[c.segment] = (counts[c.segment] || 0) + 1
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [customers])

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Pendapatan" value={fmtK(metrics.totalRevenue)} />
        <MetricCard title="Pelanggan Aktif" value={fmtNumber(metrics.activeCustomers)} sub={`dari ${fmtNumber(customers.length)} total`} />
        <MetricCard title="Rata-rata Nilai Pesanan" value={fmtCurrency(metrics.aov, 2)} />
        <MetricCard title="Tingkat Konversi" value={fmtPct(metrics.convRate)} />
      </div>

      {/* Charts row 1 */}
      <ChartCard title="Pendapatan Bulanan">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyChartData}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={v => fmtK(v)} />
            <Bar dataKey="revenue" fill="#378ADD" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Pendapatan per Kategori">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={categoryRevenue}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {categoryRevenue.map((_, i) => (
                  <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={v => fmtK(v)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribusi Segmen Pelanggan">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={segmentDist}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                dataKey="value"
                nameKey="name"
              >
                {segmentDist.map((entry, i) => (
                  <Cell key={i} fill={SEGMENT_COLORS[entry.name] ?? '#ccc'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend formatter={(v) => (
                <span style={{ color: SEGMENT_COLORS[v] ?? '#555', fontSize: 12 }}>{v}</span>
              )} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
