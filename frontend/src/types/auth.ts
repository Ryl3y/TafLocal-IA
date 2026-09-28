import type { Role } from '../constants/roles'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  avatar?: string
  createdAt: string
  /** Sessions ouvertes, inscription comprise : 1 = première visite (message de bienvenue). */
  loginCount: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  passwordConfirm: string
  firstName: string
  lastName: string
  role: Role
  companyName?: string
  /** Numéro de registre de commerce (RCCM), obligatoire pour une entreprise. */
  registreCommerce?: string
  /** Certificat RCCM (PDF), obligatoire pour une entreprise. */
  documentRccm?: File | null
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  passwordConfirm: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
  refreshToken?: string
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  /** Vérification de la session auprès du serveur en cours (au chargement de l'application). */
  isInitializing: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  clearError: () => void
}
