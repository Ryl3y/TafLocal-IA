/**
 * Design system color tokens.
 * Source CSS : @theme dans src/styles/globals.css (Tailwind v4).
 */
export const COLORS = {
  primary: '#0F4C81',
  primaryHover: '#0D3F6B',
  secondary: '#2CB67D',
  secondaryHover: '#25A36C',
  accent: '#FFB703',
  accentHover: '#E6A503',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  foreground: '#1F2937',
  muted: '#6B7280',
  border: '#E5E7EB',
  success: '#2CB67D',
  warning: '#FFB703',
  error: '#EF4444',
} as const

export type ColorToken = typeof COLORS
