/**
 * API client configuration.
 * HTTP client with interceptors for backend connection.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api'

export interface ApiClientConfig {
  baseUrl: string
  headers?: Record<string, string>
}

export const defaultApiConfig: ApiClientConfig = {
  baseUrl: API_BASE_URL,
  headers: {},
}

function formatApiError(error: Record<string, unknown>): string {
  if (typeof error.message === 'string') return error.message
  if (typeof error.detail === 'string') return error.detail
  if (Array.isArray(error.detail)) return error.detail.map(String).join(', ')

  const fieldMessages = Object.entries(error)
    .filter(([key]) => key !== 'message' && key !== 'detail')
    .flatMap(([field, value]) => {
      if (Array.isArray(value)) return value.map((msg) => `${field}: ${msg}`)
      if (typeof value === 'string') return [`${field}: ${value}`]
      return []
    })

  if (fieldMessages.length > 0) return fieldMessages.join(' ')
  return 'Request failed'
}

class ApiClient {
  private config: ApiClientConfig
  private token: string | null = null
  private isRefreshing: boolean = false
  private refreshSubscribers: Array<(token: string) => void> = []

  constructor(config: ApiClientConfig) {
    this.config = config
    // Load token from localStorage
    this.token = localStorage.getItem('access_token')
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('access_token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  private getHeaders(): Record<string, string> {
    const headers = { ...this.config.headers }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    return headers
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token))
    this.refreshSubscribers = []
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${this.config.baseUrl}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    this.setToken(data.access)
    localStorage.setItem('refresh_token', data.refresh)
    return data.access
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`
    const headers = this.getHeaders()

    // N'ajoutons pas Content-Type pour FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    let response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })

    // If 401, try to refresh token
    if (response.status === 401 && !this.isRefreshing) {
      this.isRefreshing = true

      try {
        const newToken = await this.refreshToken()
        this.onTokenRefreshed(newToken)
        this.isRefreshing = false

        // Retry original request with new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...this.getHeaders(),
            ...options.headers,
          },
        })
      } catch (error) {
        this.isRefreshing = false
        this.clearToken()
        throw new Error('Session expired. Please login again.')
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }))
      throw new Error(formatApiError(error))
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const requestOptions: RequestInit = {
      method: 'POST',
      ...options,
    }
    if (data instanceof FormData) {
      requestOptions.body = data
    } else if (data) {
      requestOptions.body = JSON.stringify(data)
    }
    return this.request<T>(endpoint, requestOptions)
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(defaultApiConfig)
