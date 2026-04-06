import { useState } from 'react'
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

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === 'demoAI123') {
      onLogin()
    } else {
      setError(true)
      setTimeout(() => setError(false), 3000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Dashboard</h2>
          <p className="text-gray-500">Please enter the password to view this content.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                error 
                  ? 'border-red-500 ring-red-200 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
              }`}
              placeholder="Enter password"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 font-medium">Incorrect password. Please try again.</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-sm"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { data, loading, error } = useCSVData()

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />
  }

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
