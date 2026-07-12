/**
 * Common validation helpers.
 * TODO: Replace with Zod schemas when forms are implemented.
 */

export function isValidEmail(value: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(value.trim())
}

export function isNonEmptyString(value: string): boolean {
  return value.trim().length > 0
}

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isValidFileExtension(
  fileName: string,
  allowedExtensions: string[],
): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension !== undefined && allowedExtensions.includes(extension)
}

export const CV_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'] as const
