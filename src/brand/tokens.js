/** ConextLab brand tokens — v1.0 */
export const brand = {
  ink: '#0A0A0A',
  slate: '#1E293B',
  blue: '#1652F0',
  blueSoft: '#DCE5FE',
  surface: '#FFFFFF',
  mist: '#F8FAFC',
  hairline: '#E5E7EB',
  hairline2: '#D1D5DB',
  muted: '#6B7280',
  muted2: '#9CA3AF',
  danger: '#B91C1C',
  success: '#0D9488',
}

export const LOGO_URL =
  'https://conextlab.net/assets/conextlab-logo-rounded-BcrUS9UU.png'

/** RFM segment colors — distinct but on-brand */
export const SEGMENT_COLORS = {
  Champions: brand.blue,
  Loyal: brand.slate,
  'At Risk': brand.danger,
  New: '#5B8AF8',
  Lost: brand.muted2,
}

/** Category / multi-series chart palette */
export const CAT_COLORS = [
  brand.blue,
  brand.slate,
  '#5B8AF8',
  brand.muted,
  brand.blueSoft,
  brand.ink,
  brand.muted2,
]

export const COHORT_COLORS = [
  brand.blue,
  brand.slate,
  '#5B8AF8',
  brand.muted,
  brand.danger,
  brand.muted2,
]

export const CHANNEL_COLORS = {
  Organic: brand.success,
  'Paid Search': brand.slate,
  'Social Media': brand.blue,
  Email: '#5B8AF8',
  Direct: brand.muted,
  Referral: brand.ink,
}
