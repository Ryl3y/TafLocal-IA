/**
 * Formats a numeric value as a percentage string.
 */
export function formatPercentage(
  value: number,
  decimals: number = 0,
  locale: string = 'fr-FR',
): string {
  const normalized = value > 1 ? value / 100 : value

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(normalized)
}
