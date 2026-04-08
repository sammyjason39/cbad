import Papa from 'papaparse'

// Maps lowercase filename → data key
const FILENAME_MAP = {
  'customers.csv':              'customers',
  'orders.csv':                 'orders',
  'order_items.csv':            'orderItems',
  'sessions.csv':               'sessions',
  'cohort_retention.csv':       'cohortRetention',
  'monthly_summary.csv':        'monthlySummary',
  'city_customer_profile.csv':  'cityCustomerProfile',
  'city_channel_performance.csv': 'cityChannelPerformance',
  'city_category_revenue.csv':  'cityCategoryRevenue',
  'city_segment_mix.csv':       'citySegmentMix',
}

export const REQUIRED_KEYS = [
  'customers', 'orders', 'orderItems', 'sessions', 'cohortRetention', 'monthlySummary',
]

export const OPTIONAL_KEYS = [
  'cityCustomerProfile', 'cityChannelPerformance', 'cityCategoryRevenue', 'citySegmentMix',
]

export const ALL_EXPECTED = [...REQUIRED_KEYS, ...OPTIONAL_KEYS]

/** Match a File object to its data key by filename */
export function fileKeyFromName(name) {
  return FILENAME_MAP[name.toLowerCase()] ?? null
}

/** Parse a single File object with PapaParse */
function parseFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (r) => resolve(r.data),
      error: reject,
    })
  })
}

/**
 * Parse all files in the provided map.
 * @param {Object} fileMap  e.g. { customers: File, orders: File, ... }
 * @returns {Promise<Object>} raw data keyed by data key, optional files default to []
 */
export async function parseCSVs(fileMap) {
  const entries = await Promise.all(
    Object.entries(fileMap).map(([key, file]) =>
      parseFile(file).then((rows) => [key, rows])
    )
  )
  const result = Object.fromEntries(entries)
  // Fill optional files with empty arrays if not provided
  for (const key of OPTIONAL_KEYS) {
    if (!result[key]) result[key] = []
  }
  return result
}
