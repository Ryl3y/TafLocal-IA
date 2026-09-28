/**
 * Client HTTP de l'API TafLocal IA.
 *
 * Sécurité de la session :
 * - les jetons JWT vivent dans des cookies HttpOnly posés par le serveur : ce code n'y a
 *   jamais accès (un script injecté ne peut donc pas les voler) ;
 * - l'API est appelée sur la même origine (/api), via le proxy Vite ou le serveur web ;
 * - chaque requête modifiante porte le jeton anti-CSRF (gardé en mémoire uniquement).
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

/** Événement émis quand la session a expiré (le contexte d'authentification se déconnecte). */
export const AUTH_EXPIRED_EVENT = 'taflocal:auth-expired'

// Anciennes clés : les jetons ne sont plus jamais stockés côté navigateur.
const LEGACY_TOKEN_KEYS = ['access_token', 'refresh_token']
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
// Routes publiques de session : un 401 y est une vraie réponse, pas un jeton à renouveler.
const NO_REFRESH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/token/refresh', '/auth/logout', '/auth/csrf']

export interface ApiClientConfig {
  baseUrl: string
  headers?: Record<string, string>
}

export const defaultApiConfig: ApiClientConfig = {
  baseUrl: API_BASE_URL,
  headers: {},
}

/** Réponse paginée de DRF. */
export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function formatApiError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Une erreur est survenue.'
  const record = error as Record<string, unknown>
  if (typeof record.message === 'string') return record.message
  if (typeof record.detail === 'string') return record.detail
  if (typeof record.error === 'string') return record.error
  if (Array.isArray(record.detail)) return record.detail.map(String).join(', ')

  const fieldMessages = Object.entries(record).flatMap(([field, value]) => {
    const prefix = field === 'non_field_errors' ? '' : `${field} : `
    if (Array.isArray(value)) return value.map((msg) => `${prefix}${String(msg)}`)
    if (typeof value === 'string') return [`${prefix}${value}`]
    return []
  })

  return fieldMessages.length > 0 ? fieldMessages.join(' ') : 'Une erreur est survenue.'
}

/** Accepte une liste brute ou une réponse paginée et retourne toujours un tableau. */
export function unwrapList<T>(response: T[] | Paginated<T> | { results?: T[] }): T[] {
  if (Array.isArray(response)) return response
  return response.results ?? []
}

export function buildQuery(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return ''
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.append(key, String(value))
  })
  const text = query.toString()
  return text ? `?${text}` : ''
}

class ApiClient {
  private config: ApiClientConfig
  private csrfToken: string | null = null
  private csrfPromise: Promise<string> | null = null
  private refreshPromise: Promise<void> | null = null

  constructor(config: ApiClientConfig) {
    this.config = config
    // Nettoyage des jetons laissés par l'ancienne version (stockage lisible par JavaScript).
    try {
      LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key))
    } catch {
      // Stockage indisponible : rien à nettoyer.
    }
  }

  /** Jeton anti-CSRF (un seul appel partagé ; renouvelé si le serveur le refuse). */
  private getCsrfToken(force = false): Promise<string> {
    if (this.csrfToken && !force) return Promise.resolve(this.csrfToken)
    if (!this.csrfPromise) {
      this.csrfPromise = fetch(`${this.config.baseUrl}/auth/csrf/`, { credentials: 'same-origin' })
        .then(async (response) => {
          if (!response.ok) throw new ApiError('Impossible d’initialiser la session.', response.status, null)
          const data = (await response.json()) as { csrfToken: string }
          this.csrfToken = data.csrfToken
          return data.csrfToken
        })
        .finally(() => {
          this.csrfPromise = null
        })
    }
    return this.csrfPromise
  }

  private async buildHeaders(method: string, body: unknown, extra?: HeadersInit, forceCsrf = false): Promise<Headers> {
    const headers = new Headers(this.config.headers)
    if (body !== undefined && !(body instanceof FormData)) headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')
    if (!SAFE_METHODS.has(method)) headers.set('X-CSRFToken', await this.getCsrfToken(forceCsrf))
    new Headers(extra).forEach((value, key) => headers.set(key, value))
    return headers
  }

  /** Un seul rafraîchissement à la fois, partagé par toutes les requêtes en 401. */
  private refreshSession(): Promise<void> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        const response = await fetch(`${this.config.baseUrl}/auth/token/refresh/`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'X-CSRFToken': await this.getCsrfToken(), Accept: 'application/json' },
        })
        if (!response.ok) throw new Error('Le renouvellement de la session a échoué.')
      })().finally(() => {
        this.refreshPromise = null
      })
    }
    return this.refreshPromise
  }

  /** Oublier l'état local (déconnexion) ; les cookies sont effacés par le serveur. */
  clearSession() {
    this.csrfToken = null
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & { rawBody?: unknown; responseType?: 'json' | 'blob' } = {},
  ): Promise<T> {
    const { rawBody, responseType = 'json', ...init } = options
    const method = (init.method ?? 'GET').toUpperCase()
    const url = `${this.config.baseUrl}${endpoint}`
    const send = async (forceCsrf = false) =>
      fetch(url, {
        ...init,
        method,
        credentials: 'same-origin',
        headers: await this.buildHeaders(method, rawBody, init.headers, forceCsrf),
      })

    let response = await send()

    // Jeton CSRF périmé (ex. après une nouvelle connexion) : on le redemande une fois.
    if (response.status === 403 && !SAFE_METHODS.has(method)) {
      const data = await response.clone().json().catch(() => null)
      if (JSON.stringify(data ?? '').includes('CSRF')) response = await send(true)
    }

    const canRefresh = !NO_REFRESH_ENDPOINTS.some((prefix) => endpoint.startsWith(prefix))
    if (response.status === 401 && canRefresh) {
      try {
        await this.refreshSession()
        response = await send()
      } catch (cause) {
        this.clearSession()
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
        throw new ApiError('Votre session a expiré. Veuillez vous reconnecter.', 401, cause)
      }
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new ApiError(formatApiError(data), response.status, data)
    }

    if (response.status === 204) return undefined as T
    if (responseType === 'blob') return (await response.blob()) as T
    const text = await response.text()
    return (text ? JSON.parse(text) : undefined) as T
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const body = data instanceof FormData ? data : data !== undefined ? JSON.stringify(data) : undefined
    return this.request<T>(endpoint, { method: 'POST', ...options, body, rawBody: data })
  }

  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data ?? {}), rawBody: data ?? {} })
  }

  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data ?? {})
    return this.request<T>(endpoint, { method: 'PATCH', body, rawBody: data ?? {} })
  }

  /** Fichier protégé (ex. PDF) : les cookies de session sont joints comme pour les autres requêtes. */
  getBlob(endpoint: string): Promise<Blob> {
    return this.request<Blob>(endpoint, { method: 'GET', headers: { Accept: '*/*' }, responseType: 'blob' })
  }

  delete<T = void>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(defaultApiConfig)

/** Message lisible pour une erreur quelconque. */
export function errorMessage(error: unknown, fallback = 'Une erreur est survenue.'): string {
  if (error instanceof Error && error.message) return error.message
  return fallback
}
