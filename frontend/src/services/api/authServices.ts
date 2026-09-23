/**
 * Authentication services for TafLocal AI backend.
 */

import { apiClient } from './apiClient'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username?: string
  password: string
  password2: string
  role: 'CANDIDATE' | 'COMPANY' | 'ADMIN'
  prenom?: string
  nom?: string
  telephone?: string
  nom_entreprise?: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: {
    id: string
    email: string
    username: string
    role: string
    nom?: string
    prenom?: string
  }
  message?: string
}

export interface UserProfile {
  id: string
  email: string
  username: string
  role: string
  nom?: string
  prenom?: string
  telephone?: string | null
  date_inscription?: string
  candidate_profile?: Record<string, unknown> | null
  company_profile?: Record<string, unknown> | null
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // Effacer les tokens existants avant de tenter le login
  apiClient.clearToken()
  const response = await apiClient.post<AuthResponse>('/auth/login/', credentials)
  apiClient.setToken(response.access)
  apiClient.setRefreshToken(response.refresh)
  return response
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  apiClient.clearToken()
  // Si username n'est pas fourni, le backend utilise l'email
  const response = await apiClient.post<AuthResponse>('/auth/register/', {
    ...data,
    username: data.username || data.email,
  })

  // Si la réponse n'inclut pas les tokens, on se connecte immédiatement après
  if (!response.access) {
    return login({ email: data.email, password: data.password })
  }

  apiClient.setToken(response.access)
  apiClient.setRefreshToken(response.refresh)
  return response
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem('refresh_token')
  if (refreshToken) {
    try {
      await apiClient.post('/auth/logout/', { refresh: refreshToken })
    } catch {
      // Jeton déjà expiré ou révoqué : la déconnexion locale suffit.
    }
  }
  apiClient.clearToken()
}

export async function getUserProfile(): Promise<UserProfile> {
  return apiClient.get<UserProfile>('/auth/me/')
}

export async function changePassword(data: {
  old_password: string
  new_password: string
}): Promise<void> {
  return apiClient.post('/auth/change-password/', data)
}

export async function resetPassword(email: string): Promise<void> {
  return apiClient.post('/auth/reset-password/', { email })
}
