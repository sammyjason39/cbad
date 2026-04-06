import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend, Cell,
} from 'recharts'
import MetricCard from '../MetricCard'
import ChartCard from '../ChartCard'
import {
  completedOrders, groupBy, sumBy, avgBy,
  estimateMonthlyChurn, recencyHistogram,
} from '../../utils/dataUtils'
import { fmtK, fmtCurrency, fmtNumber, fmtPct, fmtMonth } from '../../utils/formatters'

const SEG_COLORS = {
  Champions: '#1D9E75',
  Loyal: '#378ADD',
  'At Risk': '#E24B4A',
  New: '#7F77DD',
  Lost: '#888780',
}

export default function RetentionTab({ data }) {
  const { orders, customers, cohortRetention } = data

  const metrics = useMemo(() => {
    const total = customers.length
    const atRisk = customers.filter(c => c.segment === 'At Risk').length
    const lost = customers.filter(c => c.segment === 'Lost').length
    const churnEst = total > 0 ? (lost / total) / 12 : 0

    const completed = completedOrders(orders)
    const champOrders = completed.filter(o => o.segment === 'Champions')
    const champCusts = new Set(champOrders.map(o => o.customer_id)).size
    const champRevenue = sumBy(champOrders, o => +o.total_amount)
    const champLTV = champCusts > 0 ? champRevenue / champCusts : 0

    return { churnEst, champLTV, atRisk, lost }
  }, [orders, customers])

  // Cohort retention chart: one line per cohort month
  const cohortChartData = useMemo(() => {
    const byMonth = groupBy(cohortRetention, r => r.cohort_month)
    const cohorts = Object.keys(byMonth).sort().slice(-6) // last 6 cohorts
    const maxMonths = 7

    const rows = Array.from({ length: maxMonths }, (_, i) => {
      const row = { months: i }
      for (const cohort of cohorts) {
        const entry = (byMonth[cohort] || []).find(r => +r.months_since_join === i)
        row[cohort] = entry ? +(+entry.retention_rate * 100).toFixed(1) : null
      }
      return row
    })
    return { rows, cohorts }
  }, [cohortRetention])

  const monthlyChurnData = useMemo(() =>
    estimateMonthlyChurn(orders, customers).map(r => ({
      month: fmtMonth(r.month),
      churned: r.churned,
    }))
  , [orders, customers])

  const ltvBySegment = useMemo(() => {
    const completed = completedOrders(orders)
    const bySeg = groupBy(completed, o => o.segment)
    return ['Champions', 'Loyal', 'At Risk', 'New', 'Lost'].map(seg => {
      const ords = bySeg[seg] || []
      const custs = new Set(ords.map(o => o.customer_id)).size
      const rev = sumBy(ords, o => +o.total_amount)
      return { segment: seg, ltv: custs > 0 ? rev / custs : 0 }
    })
  }, [orders])

  const recencyData = useMemo(() => recencyHistogram(orders), [orders])

  const COHORT_COLORS = ['#378ADD', '#1D9E75', '#7F77DD', '#D85A30', '#BA7517', '#E24B4A']

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Avg Monthly Churn" value={fmtPct(metrics.churnEst)} sub="estimated" />
        <MetricCard title="Champion LTV" value={fmtCurrency(metrics.champLTV, 0)} color="#1D9E75" />
        <MetricCard title="At-Risk Customers" value={fmtNumber(metrics.atRisk)} color="#E24B4A" />
        <MetricCard title="Lost Customers" value={fmtNumber(metrics.lost)} color="#888780" />
      </div>

      {/* Cohort retention */}
      <ChartCard title="Cohort Retention (% retained by month)">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={cohortChartData.rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="months" label={{ value: 'Months since join', position: 'insideBottom', offset: -2, fontSize: 11 }} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => `${v}%`} domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={v => v !== null ? `${v}%` : 'N/A'} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {cohortChartData.cohorts.map((cohort, i) => (
              <Line
                key={cohort}
                type="monotone"
                dataKey={cohort}
                stroke={COHORT_COLORS[i % COHORT_COLORS.length]}
                dot={false}
                strokeWidth={2}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly churn */}
        <ChartCard title="Monthly Churned Customers (estimate)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyChurnData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="churned" stroke="#E24B4A" dot={false} strokeWidth={2} name="Churned" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* LTV by segment */}
        <ChartCard title="Avg LTV by Segment">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ltvBySegment}>
              <XAxis dataKey="segment" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `$${v}`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => fmtCurrency(v, 0)} />
              <Bar dataKey="ltv" radius={[3, 3, 0, 0]}>
                {ltvBySegment.map((entry, i) => (
                  <Cell key={i} fill={SEG_COLORS[entry.segment] ?? '#ccc'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recency histogram */}
      <ChartCard title="Days Since Last Order (Recency Distribution)">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={recencyData}>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="customers" fill="#378ADD" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
