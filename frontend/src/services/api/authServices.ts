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
  registre_commerce?: string
  /** Copie PDF du certificat RCCM (entreprise). */
  document_rccm?: File | null
}

/** Les jetons ne figurent plus dans la réponse : le serveur les pose en cookies HttpOnly. */
export interface AuthResponse {
  user: {
    id: string
    email: string
    username: string
    role: string
    nom?: string
    prenom?: string
    nombre_connexions?: number
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
  nombre_connexions?: number
  candidate_profile?: Record<string, unknown> | null
  company_profile?: Record<string, unknown> | null
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('/auth/login/', credentials)
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  // Si username n'est pas fourni, le backend utilise l'email
  const { document_rccm, ...fields } = data
  const payload = { ...fields, username: data.username || data.email }
  let body: FormData | typeof payload = payload
  if (document_rccm) {
    // Un fichier joint impose l'envoi en multipart.
    const form = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) form.append(key, String(value))
    })
    form.append('document_rccm', document_rccm)
    body = form
  }
  // Le serveur connecte directement le nouvel utilisateur (cookies de session).
  return apiClient.post<AuthResponse>('/auth/register/', body)
}

/** Révoque la session côté serveur et efface les cookies. */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout/')
  } catch {
    // Session déjà expirée : les cookies sont de toute façon effacés ou invalides.
  }
  apiClient.clearSession()
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

// ─── Mot de passe oublié : code à 6 chiffres envoyé par e-mail ───────────────

export interface PasswordResetRequestResponse {
  message: string
  expires_in_minutes: number
  resend_after_seconds: number
}

/** Étape 1 : la réponse est la même que le compte existe ou non. */
export function requestPasswordReset(email: string): Promise<PasswordResetRequestResponse> {
  return apiClient.post<PasswordResetRequestResponse>('/auth/password-reset/request/', { email })
}

/** Étape 2 : retourne un jeton à usage unique pour définir le nouveau mot de passe. */
export async function verifyPasswordResetCode(email: string, code: string): Promise<string> {
  const response = await apiClient.post<{ token: string }>('/auth/password-reset/verify/', { email, code })
  return response.token
}

/** Étape 3 : toutes les sessions ouvertes sont fermées côté serveur. */
export function confirmPasswordReset(token: string, newPassword: string): Promise<{ message: string }> {
  return apiClient.post('/auth/password-reset/confirm/', { token, new_password: newPassword })
}
