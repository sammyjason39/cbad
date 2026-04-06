export default function MetricCard({ title, value, sub, color }) {
  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{title}</p>
      <p
        className="text-2xl font-bold truncate"
        style={color ? { color } : undefined}
      >
        {value ?? '—'}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}
