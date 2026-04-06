import { useCSVData } from './hooks/useCSVData'
import Dashboard from './components/Dashboard'

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-72 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-56 mb-8" />
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-9 bg-gray-200 rounded w-36" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-gray-100 rounded-lg mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-60 bg-gray-100 rounded-lg" />
        <div className="h-60 bg-gray-100 rounded-lg" />
      </div>
    </div>
  )
}

export default function App() {
  const { data, loading, error } = useCSVData()

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Failed to load data</p>
          <p className="text-gray-500 text-sm">{String(error)}</p>
        </div>
      </div>
    )
  }

  return <Dashboard data={data} />
}
