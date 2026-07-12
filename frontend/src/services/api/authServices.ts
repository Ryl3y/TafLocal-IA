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
  candidate_profile?: any
  company_profile?: any
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // Effacer les tokens existants avant de tenter le login
  apiClient.clearToken()
  const response = await apiClient.post<AuthResponse>('/auth/login/', credentials)
  apiClient.setToken(response.access)
  localStorage.setItem('refresh_token', response.refresh)
  return response
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  // Si username n'est pas fourni, utiliser l'email comme username
  const registerPayload = {
    ...data,
    username: data.username || data.email
  }
  
  console.log("Données envoyées au backend pour l'inscription:", registerPayload)
  const response = await apiClient.post<AuthResponse>('/auth/register/', registerPayload)
  
  // Si la réponse n'inclut pas les tokens, on doit se connecter immédiatement après
  if (!response.access) {
    const loginResponse = await login({ email: data.email, password: data.password })
    return loginResponse
  }
  
  apiClient.setToken(response.access)
  localStorage.setItem('refresh_token', response.refresh)
  return response
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem('refresh_token')
  if (refreshToken) {
    try {
      await apiClient.post('/auth/logout/', { refresh_token: refreshToken })
    } catch (e) {
      console.error('Erreur lors de la déconnexion:', e)
    }
  }
  apiClient.clearToken()
}

export async function refreshToken(): Promise<AuthResponse> {
  const refreshToken = localStorage.getItem('refresh_token')
  const response = await apiClient.post<AuthResponse>('/auth/token/refresh/', {
    refresh: refreshToken,
  })
  apiClient.setToken(response.access)
  return response
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
