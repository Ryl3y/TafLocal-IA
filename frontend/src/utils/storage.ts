/**
 * Type-safe localStorage helpers.
 * TODO: Add encryption for sensitive values when auth is implemented.
 */

export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) {
      return fallback
    }
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // TODO: Handle quota exceeded errors
  }
}

export function removeStorageItem(key: string): void {
  localStorage.removeItem(key)
}

export function clearStorage(): void {
  localStorage.clear()
}
