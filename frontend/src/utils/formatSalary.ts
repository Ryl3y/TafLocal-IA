interface FormatSalaryOptions {
  currency?: string
  locale?: string
  period?: 'year' | 'month' | 'hour'
}

/**
 * Formats a salary range or single amount for display.
 */
export function formatSalary(
  min?: number,
  max?: number,
  options: FormatSalaryOptions = {},
): string {
  const { currency = 'EUR', locale = 'fr-FR', period = 'year' } = options

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })

  const periodLabel =
    period === 'year' ? '/an' : period === 'month' ? '/mois' : '/h'

  if (min !== undefined && max !== undefined) {
    return `${formatter.format(min)} - ${formatter.format(max)}${periodLabel}`
  }

  if (min !== undefined) {
    return `À partir de ${formatter.format(min)}${periodLabel}`
  }

  if (max !== undefined) {
    return `Jusqu'à ${formatter.format(max)}${periodLabel}`
  }

  return 'Non communiqué'
}
