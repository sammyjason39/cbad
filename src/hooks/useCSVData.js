import { useState, useEffect } from 'react'
import Papa from 'papaparse'

const CSV_FILES = {
  customers: '/customers.csv',
  orders: '/orders.csv',
  orderItems: '/order_items.csv',
  sessions: '/sessions.csv',
  cohortRetention: '/cohort_retention.csv',
  monthlySummary: '/monthly_summary.csv',
  cityCustomerProfile: '/city_customer_profile.csv',
  cityChannelPerformance: '/city_channel_performance.csv',
  cityCategoryRevenue: '/city_category_revenue.csv',
  citySegmentMix: '/city_segment_mix.csv',
}

function parseCSV(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: reject,
    })
  })
}

export function useCSVData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all(
      Object.entries(CSV_FILES).map(([key, url]) =>
        parseCSV(url).then(rows => [key, rows])
      )
    )
      .then(entries => {
        setData(Object.fromEntries(entries))
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  return { data, loading, error }
}
