import { brand } from '../brand/tokens'

export default function ChartCard({ title, children, className = '' }) {
  return (
    <div
      className={`p-5 ${className}`}
      style={{
        background: brand.surface,
        border: `1px solid ${brand.hairline}`,
        borderRadius: 16,
      }}
    >
      {title && (
        <h3 className="text-sm font-semibold mb-4 tracking-tight" style={{ color: brand.ink }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
