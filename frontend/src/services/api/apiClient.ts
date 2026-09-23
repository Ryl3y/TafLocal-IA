/**
 * Client HTTP de l'API TafLocal IA.
 * Gère l'authentification JWT, le rafraîchissement automatique du jeton
 * et la mise en forme des erreurs renvoyées par Django REST Framework.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api'

/** Événement émis quand la session a expiré (le contexte d'authentification se déconnecte). */
export const AUTH_EXPIRED_EVENT = 'taflocal:auth-expired'

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

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
  private token: string | null
  private refreshPromise: Promise<string> | null = null

  constructor(config: ApiClientConfig) {
    this.config = config
    this.token = localStorage.getItem(ACCESS_KEY)
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem(ACCESS_KEY, token)
  }

  setRefreshToken(token: string) {
    localStorage.setItem(REFRESH_KEY, token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  }

  private buildHeaders(body: unknown, extra?: HeadersInit): Headers {
    const headers = new Headers(this.config.headers)
    if (this.token) headers.set('Authorization', `Bearer ${this.token}`)
    if (body !== undefined && !(body instanceof FormData)) headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')
    new Headers(extra).forEach((value, key) => headers.set(key, value))
    return headers
  }

  /** Un seul rafraîchissement à la fois, partagé par toutes les requêtes en 401. */
  private refreshAccessToken(): Promise<string> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        const refreshToken = localStorage.getItem(REFRESH_KEY)
        if (!refreshToken) throw new Error('Aucun jeton de rafraîchissement.')
        const response = await fetch(`${this.config.baseUrl}/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        })
        if (!response.ok) throw new Error('Le rafraîchissement du jeton a échoué.')
        const data = (await response.json()) as { access: string; refresh?: string }
        this.setToken(data.access)
        if (data.refresh) this.setRefreshToken(data.refresh)
        return data.access
      })().finally(() => {
        this.refreshPromise = null
      })
    }
    return this.refreshPromise
  }

  async request<T>(endpoint: string, options: RequestInit & { rawBody?: unknown } = {}): Promise<T> {
    const { rawBody, ...init } = options
    const url = `${this.config.baseUrl}${endpoint}`
    const send = () => fetch(url, { ...init, headers: this.buildHeaders(rawBody, init.headers) })

    let response = await send()

    const isAuthEndpoint = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register')
    if (response.status === 401 && !isAuthEndpoint && localStorage.getItem(REFRESH_KEY)) {
      try {
        await this.refreshAccessToken()
        response = await send()
      } catch (cause) {
        this.clearToken()
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
        throw new ApiError('Votre session a expiré. Veuillez vous reconnecter.', 401, cause)
      }
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new ApiError(formatApiError(data), response.status, data)
    }

    if (response.status === 204) return undefined as T
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
    return this.request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data ?? {}), rawBody: data ?? {} })
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
