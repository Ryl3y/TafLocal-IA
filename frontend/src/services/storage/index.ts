/**
 * Storage service layer.
 * Re-exports storage utilities for service-level access.
 */
export {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStorage,
} from '../../utils/storage'

export const STORAGE_KEYS = {
  THEME: 'taflocal_theme',
  AUTH_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'taflocal_user_preferences',
} as const
