/** Variante de badge selon un score de compatibilité (0-100). */
export function scoreVariant(score: number): 'secondary' | 'primary' | 'accent' | 'error' {
  if (score >= 80) return 'secondary'
  if (score >= 65) return 'primary'
  if (score >= 50) return 'accent'
  return 'error'
}
