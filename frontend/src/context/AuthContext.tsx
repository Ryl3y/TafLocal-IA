import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getStorageItem, removeStorageItem, setStorageItem, STORAGE_KEYS } from '../services/storage'
import type { AuthContextType, AuthState, LoginCredentials, RegisterCredentials } from '../types/auth'
import { login as loginApi, register as registerApi, logout as logoutApi, getUserProfile } from '../services/api/authServices'
import { apiClient } from '../services/api/apiClient'

const STORAGE_USER_KEY = 'taflocal_auth_user'

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function transformBackendUser(backendUser: any) {
  console.log("transformBackendUser - backendUser:", backendUser)
  const role = (backendUser.role?.toLowerCase() || 'candidate') as 'candidate' | 'company' | 'admin'
  console.log("transformBackendUser - role:", role)
  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName: backendUser.prenom || '',
    lastName: backendUser.nom || '',
    role,
    createdAt: backendUser.created_at || backendUser.date_inscription || new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const storedUser = getStorageItem(STORAGE_USER_KEY, null) as AuthState['user']
    const storedToken = getStorageItem(STORAGE_KEYS.AUTH_TOKEN, null) as string | null

    // Initialize apiClient with stored token
    if (storedToken) {
      apiClient.setToken(storedToken)
    }

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

    if (state.token) {
      setStorageItem(STORAGE_KEYS.AUTH_TOKEN, state.token)
      apiClient.setToken(state.token)
    } else {
      removeStorageItem(STORAGE_KEYS.AUTH_TOKEN)
      apiClient.clearToken()
    }
  }, [state.user, state.token])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await loginApi(credentials)
      
      // Utiliser directement les données utilisateur de la réponse de login
      const user = transformBackendUser(response.user)

      setState({
        user,
        token: response.access,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Identifiants incorrects',
      }))
    }
  }, [])

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await registerApi({
        email: credentials.email,
        password: credentials.password,
        password2: credentials.passwordConfirm,
        role: credentials.role.toUpperCase() as 'CANDIDATE' | 'COMPANY' | 'ADMIN',
        prenom: credentials.firstName,
        nom: credentials.lastName,
        nom_entreprise: credentials.companyName,
      })
      console.log("Register response:", response)

      // Utiliser directement les données utilisateur de la réponse d'inscription
      const user = transformBackendUser(response.user)
      console.log("Transformed user:", user)

      setState({
        user,
        token: response.access,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      console.error("Error registering:", error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Erreur lors de l'inscription",
      }))
    }
  }, [])

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      await logoutApi()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
    setState({ ...initialAuthState, isLoading: false })
  }, [])

  const refreshSession = useCallback(async () => {
    if (!state.user) {
      setState((prev) => ({ ...prev, error: 'Aucune session active.' }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const userProfile = await getUserProfile()
      const user = transformBackendUser(userProfile)
      
      setState((prev) => ({
        ...prev,
        user,
        isLoading: false,
        error: null,
      }))
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Erreur de session',
      }))
    }
  }, [state.user])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({
      ...state,
      login,
      register,
      logout,
      refreshSession,
      clearError,
    }),
    [clearError, login, logout, refreshSession, state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
