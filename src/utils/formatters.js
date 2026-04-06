export const fmtCurrency = (val, decimals = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val)

export const fmtK = (val) => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`
  return fmtCurrency(val)
}

export const fmtPct = (val, decimals = 1) =>
  `${(val * 100).toFixed(decimals)}%`

export const fmtNumber = (val) =>
  new Intl.NumberFormat('en-US').format(Math.round(val))

export const fmtMonth = (yyyymm) => {
  const [y, m] = yyyymm.split('-')
  return new Date(+y, +m - 1, 1).toLocaleString('en-US', { month: 'short', year: '2-digit' })
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const fmtDOW = (n) => DAYS[n] ?? String(n)
