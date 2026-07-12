import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../context'

/**
 * AuthGuard — Protects routes requiring authentication.
 */
export function AuthGuard() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH} replace />
  }

  return <Outlet />
}
