import { fmtK, fmtCurrency, fmtPct, fmtNumber } from './formatters'

const SEGMENTS = ['Champions', 'Loyal', 'At Risk', 'New', 'Lost']

export function buildSystemPrompt(metrics, cityProfiles = []) {
  const {
    totalRevenue, activeCustomers, totalCustomers, avgOrderValue,
    conversionRate, repeatRate, peakDay, topCat, avgChurn,
    segCounts, segRevMap, segLTVMap, catRevenue, revenueByMonth,
    sourceBreakdown, topCities,
  } = metrics

  const segLines = SEGMENTS.map(seg =>
    `- ${seg}: ${fmtNumber(segCounts[seg] || 0)} customers, ${fmtK(segRevMap[seg] || 0)} revenue, ${fmtCurrency(segLTVMap[seg] || 0, 0)} avg LTV`
  ).join('\n')

  const catLines = (catRevenue || []).map(([cat, rev]) =>
    `- ${cat}: ${fmtK(rev)} (${fmtPct(rev / (totalRevenue || 1))})`
  ).join('\n')

  const monthLines = (revenueByMonth || []).map(r =>
    `- ${r.month}: ${fmtK(r.revenue)}`
  ).join('\n')

  const srcLines = (sourceBreakdown || []).map(s =>
    `- ${s.source}: ${fmtPct(s.pct)} of sessions, CVR ${fmtPct(s.cvr)}`
  ).join('\n')

  // City section — use city files if present, else omit individual stats
  let citySection = ''
  if (cityProfiles.length > 0) {
    const cityLines = cityProfiles.map(p =>
      `- ${p.city}: IG Ads CVR ${fmtPct(+p.ig_ads_cvr)}, Email CVR ${fmtPct(+p.email_cvr)}, ` +
      `peak ${p.peak_shopping_day}, top category ${p.top_category}, ` +
      `AOV ${fmtCurrency(+p.avg_order_value, 0)}, mobile share ${fmtPct(+p.mobile_share)}`
    ).join('\n')

    const igCVRs = cityProfiles.map(p => ({ city: p.city, cvr: +p.ig_ads_cvr })).sort((a, b) => b.cvr - a.cvr)
    const bestIG = igCVRs[0]?.city
    const worstIG = igCVRs[igCVRs.length - 1]?.city
    const emailBest = cityProfiles.slice().sort((a, b) => +b.email_cvr - +a.email_cvr).slice(0, 2).map(p => p.city).join(', ')
    const mobileCities = cityProfiles.filter(p => +p.mobile_share > 0.65).map(p => p.city).join(', ')

    citySection = `
CITY BEHAVIORAL PROFILES:
${cityLines}

HYPERLOCAL KEY INSIGHT: IG Ads perform best in ${bestIG}, weakest in ${worstIG}. Best email markets: ${emailBest}. Mobile-first cities (>65%): ${mobileCities || 'N/A'}.`
  } else if (topCities.length > 0) {
    citySection = `\nTOP CITIES BY REVENUE: ${topCities.join(', ')}`
  }

  return `Kamu adalah analis data pelanggan yang tajam dan sedang presentasi langsung di acara Hyperlocalization Marketing di Indonesia. Kamu punya akses penuh ke data perilaku pelanggan nyata dari file CSV yang diunggah. Audiensmu adalah pemilik brand dan marketer — banyak yang baru mengenal data. Buat data terasa kuat, jelas, dan langsung bisa dieksekusi.

Aturan:
- Selalu sebut angka spesifik dari data
- Jawaban maksimal 4–6 kalimat
- Langsung dan percaya diri, tidak ragu-ragu
- Akhiri setiap jawaban dengan satu rekomendasi aksi yang jelas
- Gunakan bahasa yang mudah dipahami, hindari jargon
- SELALU jawab dalam Bahasa Indonesia

DATA SUMMARY:
- Total revenue: ${fmtK(totalRevenue)}
- Active customers: ${fmtNumber(activeCustomers)} of ${fmtNumber(totalCustomers)}
- Average order value: ${fmtCurrency(avgOrderValue, 2)}
- Repeat buyer rate: ${fmtPct(repeatRate)}
- Peak shopping day: ${peakDay}
- Top category: ${topCat}
- Average monthly churn: ${fmtPct(avgChurn)}
- Conversion rate: ${fmtPct(conversionRate)}

SEGMENTS:
${segLines}

TOP CATEGORIES:
${catLines}

MONTHLY REVENUE:
${monthLines}

ACQUISITION SOURCES:
${srcLines}
${citySection}`
}
