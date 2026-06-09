import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, Cell,
} from 'recharts'
import MetricCard from '../MetricCard'
import ChartCard from '../ChartCard'
import { completedOrders, groupBy, sumBy, toMonth } from '../../utils/dataUtils'
import { fmtK, fmtCurrency, fmtNumber, fmtMonth } from '../../utils/formatters'
import { SEGMENT_COLORS, brand } from '../../brand/tokens'

const SEG_COLORS = SEGMENT_COLORS
const SEGMENTS = ['Champions', 'Loyal', 'At Risk', 'New', 'Lost']

const ACTIONS = [
  { segment: 'Champions', color: SEGMENT_COLORS.Champions, action: 'Beri reward & upsell — program loyalitas, penawaran eksklusif' },
  { segment: 'Loyal', color: SEGMENT_COLORS.Loyal, action: 'Cross-sell — rekomendasikan kategori yang relevan' },
  { segment: 'At Risk', color: SEGMENT_COLORS['At Risk'], action: 'Re-engage sekarang — kirim email win-back dalam 7 hari' },
  { segment: 'New', color: SEGMENT_COLORS.New, action: 'Sambut & onboard — insentif pembelian pertama' },
  { segment: 'Lost', color: SEGMENT_COLORS.Lost, action: 'Kampanye win-back — diskon besar, kesempatan terakhir' },
]

export default function SegmentsTab({ data }) {
  const { orders, customers } = data

  const segmentStats = useMemo(() => {
    const completed = completedOrders(orders)
    const segCusts = groupBy(customers, c => c.segment)
    const segOrds = groupBy(completed, o => o.segment)
    return SEGMENTS.map(seg => {
      const custs = (segCusts[seg] || []).length
      const ords = segOrds[seg] || []
      const revenue = sumBy(ords, o => +o.total_amount)
      const ltv = custs > 0 ? revenue / custs : 0
      return { segment: seg, customers: custs, revenue, ltv }
    })
  }, [orders, customers])

  const segOverTime = useMemo(() => {
    const completed = completedOrders(orders)
    const months = [...new Set(completed.map(o => toMonth(o.order_date)))].sort()
    return months.map(month => {
      const row = { month: fmtMonth(month) }
      for (const seg of SEGMENTS) {
        row[seg] = completed.filter(o => toMonth(o.order_date) === month && o.segment === seg).length
      }
      return row
    })
  }, [orders])

  const citySegData = useMemo(() => {
    const cities = [...new Set(customers.map(c => c.city))].sort()
    return cities.map(city => {
      const row = { city }
      for (const seg of SEGMENTS) {
        row[seg] = customers.filter(c => c.city === city && c.segment === seg).length
      }
      return row
    })
  }, [customers])

  return (
    <div className="space-y-6">
      {/* 5 segment cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {segmentStats.map(s => (
          <MetricCard
            key={s.segment}
            title={s.segment}
            value={fmtNumber(s.customers)}
            sub={`Rata-rata LTV: ${fmtCurrency(s.ltv, 0)}`}
            color={SEG_COLORS[s.segment]}
          />
        ))}
      </div>

      {/* Segment order volume over time */}
      <ChartCard title="Volume Pesanan per Segmen dari Waktu ke Waktu">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={segOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke={brand.hairline} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {SEGMENTS.map(seg => (
              <Line
                key={seg}
                type="monotone"
                dataKey={seg}
                stroke={SEG_COLORS[seg]}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue by segment */}
        <ChartCard title="Kontribusi Pendapatan per Segmen">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={segmentStats}>
              <XAxis dataKey="segment" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => fmtK(v)} />
              <Bar dataKey="revenue" radius={[3, 3, 0, 0]}>
                {segmentStats.map((entry, i) => (
                  <Cell key={i} fill={SEG_COLORS[entry.segment] ?? '#ccc'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* City distribution */}
        <ChartCard title="Segmen per Kota">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={citySegData}>
              <XAxis dataKey="city" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {SEGMENTS.map(seg => (
                <Bar key={seg} dataKey={seg} stackId="a" fill={SEG_COLORS[seg]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Action table */}
      <ChartCard title="Rekomendasi Aksi per Segmen">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${brand.hairline}` }}>
                <th className="text-left py-2 pr-6 font-semibold w-32 font-mono uppercase text-xs tracking-wider" style={{ color: brand.muted }}>Segmen</th>
                <th className="text-left py-2 font-semibold font-mono uppercase text-xs tracking-wider" style={{ color: brand.muted }}>Rekomendasi Aksi</th>
              </tr>
            </thead>
            <tbody>
              {ACTIONS.map(({ segment, color, action }) => (
                <tr key={segment} style={{ borderBottom: `1px solid ${brand.mist}` }}>
                  <td className="py-2.5 pr-6">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-white text-xs font-semibold"
                      style={{ backgroundColor: color }}
                    >
                      {segment}
                    </span>
                  </td>
                  <td className="py-2.5" style={{ color: brand.ink }}>{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
