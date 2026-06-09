import { brand } from '../brand/tokens'

export default function MetricCard({ title, value, sub, color }) {
  return (
    <div
      className="p-5"
      style={{
        background: brand.surface,
        border: `1px solid ${brand.hairline}`,
        borderRadius: 16,
      }}
    >
      <p
        className="font-mono uppercase font-semibold mb-2"
        style={{ fontSize: 11, letterSpacing: '0.14em', color: brand.muted }}
      >
        {title}
      </p>
      <p
        className="font-extrabold truncate tracking-tight"
        style={{ fontSize: 28, letterSpacing: '-0.03em', color: color ?? brand.ink }}
      >
        {value ?? '—'}
      </p>
      {sub && (
        <p className="text-xs mt-1.5" style={{ color: brand.muted }}>
          {sub}
        </p>
      )}
    </div>
  )
}
