import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { removeStorageItem } from '../services/storage'
import type { AuthContextType, AuthState, AuthUser, LoginCredentials, RegisterCredentials } from '../types/auth'
import { login as loginApi, register as registerApi, logout as logoutApi, getUserProfile } from '../services/api/authServices'
import { AUTH_EXPIRED_EVENT, errorMessage } from '../services/api/apiClient'
import type { Role } from '../constants/roles'

// Ancienne copie locale du profil : l'identité vient désormais toujours du serveur.
const LEGACY_USER_KEY = 'taflocal_auth_user'

const loggedOutState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitializing: false,
  isLoading: false,
  error: null,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface BackendUser {
  id: string
  email: string
  role?: string
  nom?: string
  prenom?: string
  created_at?: string
  date_inscription?: string
  nombre_connexions?: number
}

function transformBackendUser(backendUser: BackendUser): AuthUser {
  const role = (backendUser.role?.toLowerCase() || 'candidate') as Role
  return {
    id: String(backendUser.id),
    email: backendUser.email,
    firstName: backendUser.prenom || '',
    lastName: backendUser.nom || '',
    role,
    createdAt: backendUser.created_at || backendUser.date_inscription || new Date().toISOString(),
    loginCount: backendUser.nombre_connexions ?? 0,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // La session vit dans des cookies HttpOnly (illisibles ici) : on demande au serveur qui est connecté.
  const [state, setState] = useState<AuthState>({ ...loggedOutState, isInitializing: true })

  useEffect(() => {
    removeStorageItem(LEGACY_USER_KEY)
    let active = true
    getUserProfile()
      .then((profile) => {
        if (active) setState({ ...loggedOutState, user: transformBackendUser(profile), isAuthenticated: true })
      })
      .catch(() => {
        if (active) setState(loggedOutState)
      })
    return () => {
      active = false
    }
  }, [])

  // Session expirée côté API (renouvellement impossible) : retour à l'écran de connexion.
  useEffect(() => {
    const handleExpired = () =>
      setState({ ...loggedOutState, error: 'Votre session a expiré. Veuillez vous reconnecter.' })
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const response = await loginApi(credentials)
      setState({ ...loggedOutState, user: transformBackendUser(response.user), isAuthenticated: true })
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage(error, 'Identifiants incorrects') }))
    }
  }, [])

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const response = await registerApi({
        email: credentials.email,
        password: credentials.password,
        password2: credentials.passwordConfirm,
        role: credentials.role.toUpperCase() as 'CANDIDATE' | 'COMPANY',
        prenom: credentials.firstName,
        nom: credentials.lastName,
        nom_entreprise: credentials.companyName,
        registre_commerce: credentials.registreCommerce,
        document_rccm: credentials.documentRccm,
      })
      setState({ ...loggedOutState, user: transformBackendUser(response.user), isAuthenticated: true })
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage(error, "Erreur lors de l'inscription") }))
    }
  }, [])

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    await logoutApi()
    setState(loggedOutState)
  }, [])

  const refreshSession = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const userProfile = await getUserProfile()
      setState((prev) => ({ ...prev, user: transformBackendUser(userProfile), isLoading: false, error: null }))
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage(error, 'Erreur de session') }))
    }
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({ ...state, login, register, logout, refreshSession, clearError }),
    [clearError, login, logout, refreshSession, register, state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
