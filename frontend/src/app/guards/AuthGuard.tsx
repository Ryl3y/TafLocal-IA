import { Navigate, Outlet } from 'react-router-dom'
import { Loader } from '../../components/feedback/Loader'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../context'

/**
 * AuthGuard — Protects routes requiring authentication.
 * Attend la vérification de la session (cookies HttpOnly) avant de décider.
 */
export function AuthGuard() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader label="Vérification de votre session…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH} replace />
  }

  return <Outlet />
}
