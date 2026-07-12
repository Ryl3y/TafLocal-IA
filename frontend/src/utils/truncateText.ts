/**
 * Truncates text to a maximum length with an ellipsis suffix.
 */
export function truncateText(text: string, maxLength: number, suffix: string = '…'): string {
  if (maxLength <= 0 || text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}${suffix}`
}
