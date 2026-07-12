type DateInput = string | number | Date

const DEFAULT_LOCALE = 'fr-FR'

/**
 * Formats a date value for display.
 */
export function formatDate(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  },
  locale: string = DEFAULT_LOCALE,
): string {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, options).format(date)
}

/**
 * Formats a date with time for display.
 */
export function formatDateTime(
  value: DateInput,
  locale: string = DEFAULT_LOCALE,
): string {
  return formatDate(
    value,
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
    locale,
  )
}
