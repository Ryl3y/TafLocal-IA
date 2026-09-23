import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getStorageItem, removeStorageItem, setStorageItem } from '../services/storage'
import type { AuthContextType, AuthState, AuthUser, LoginCredentials, RegisterCredentials } from '../types/auth'
import { login as loginApi, register as registerApi, logout as logoutApi, getUserProfile } from '../services/api/authServices'
import { AUTH_EXPIRED_EVENT, apiClient, errorMessage } from '../services/api/apiClient'
import type { Role } from '../constants/roles'

const STORAGE_USER_KEY = 'taflocal_auth_user'
// Le jeton est stocké en texte brut par apiClient (pas en JSON).
const ACCESS_TOKEN_KEY = 'access_token'

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
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
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const storedUser = getStorageItem<AuthUser | null>(STORAGE_USER_KEY, null)
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    return {
      ...initialAuthState,
      user: storedUser,
      token: storedToken,
      isAuthenticated: Boolean(storedUser && storedToken),
    }
  })

  useEffect(() => {
    if (state.user) {
      setStorageItem(STORAGE_USER_KEY, state.user)
    } else {
      removeStorageItem(STORAGE_USER_KEY)
    }
  }, [state.user])

  // Session expirée côté API (rafraîchissement impossible) : retour à l'écran de connexion.
  useEffect(() => {
    const handleExpired = () => setState({ ...initialAuthState, error: 'Votre session a expiré. Veuillez vous reconnecter.' })
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const response = await loginApi(credentials)
      setState({
        user: transformBackendUser(response.user),
        token: response.access,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
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
      })
      setState({
        user: transformBackendUser(response.user),
        token: response.access,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage(error, "Erreur lors de l'inscription") }))
    }
  }, [])

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    await logoutApi()
    apiClient.clearToken()
    setState({ ...initialAuthState })
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
