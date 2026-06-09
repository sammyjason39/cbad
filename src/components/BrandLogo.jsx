import { LOGO_URL } from '../brand/tokens'

/**
 * ConextLab wordmark lockup.
 * @param {'sm'|'md'|'lg'} size
 * @param {'light'|'dark'} theme — text color context
 * @param {boolean} showMark — include rounded logo image
 */
export default function BrandLogo({
  size = 'md',
  theme = 'light',
  showMark = true,
  className = '',
}) {
  const sizes = {
    sm: { img: 22, text: 14, gap: 8 },
    md: { img: 28, text: 18, gap: 10 },
    lg: { img: 40, text: 26, gap: 12 },
  }
  const s = sizes[size] ?? sizes.md
  const textColor = theme === 'dark' ? '#FFFFFF' : '#0A0A0A'

  return (
    <div
      className={`inline-flex items-center font-bold tracking-tight ${className}`}
      style={{ gap: s.gap, fontSize: s.text, color: textColor, letterSpacing: '-0.02em' }}
    >
      {showMark && (
        <img
          src={LOGO_URL}
          alt=""
          width={s.img}
          height={s.img}
          className="flex-shrink-0"
          style={{ borderRadius: size === 'sm' ? 6 : size === 'lg' ? 10 : 7 }}
        />
      )}
      <span>
        Conext<span style={{ color: '#1652F0' }}>Lab</span>
      </span>
    </div>
  )
}

/** Mono uppercase label — JetBrains Mono eyebrow style */
export function BrandLabel({ children, className = '', accent = false }) {
  return (
    <span
      className={`font-mono uppercase font-semibold ${className}`}
      style={{
        fontSize: 11,
        letterSpacing: '0.14em',
        color: accent ? '#1652F0' : '#6B7280',
      }}
    >
      {children}
    </span>
  )
}
