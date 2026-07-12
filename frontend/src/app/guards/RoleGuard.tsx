import { Navigate, Outlet } from 'react-router-dom'
import { ROLES, ROUTES } from '../../constants'
import type { Role } from '../../constants/roles'
import { useAuth } from '../../context'

interface RoleGuardProps {
  allowedRoles: Role[]
}

function getDefaultRouteForRole(role?: Role): string {
  if (role === ROLES.COMPANY) return ROUTES.COMPANY_DASHBOARD
  if (role === ROLES.ADMIN) return ROUTES.ADMIN_DASHBOARD
  return ROUTES.DASHBOARD
}

/**
 * RoleGuard — Restricts access based on user role.
 */
export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user?.role)} replace />
  }

  return <Outlet />
}
