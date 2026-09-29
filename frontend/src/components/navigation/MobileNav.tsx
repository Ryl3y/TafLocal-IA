import { NavLink, Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { BadgeCheck, LogOut, Sparkles, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { NAV_ICONS } from '../../constants/icons'
import { ROLES } from '../../constants/roles'
import { candidateRoutes } from '../../routes/candidate.routes'
import { companyRoutes } from '../../routes/company.routes'
import { adminRoutes } from '../../routes/admin.routes'
import { cn } from '../../utils/cn'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'

export interface MobileNavProps {
  isOpen?: boolean
  onClose?: () => void
  variant?: 'candidate' | 'company' | 'admin'
}

const routeMap = {
  candidate: candidateRoutes,
  company: companyRoutes,
  admin: adminRoutes,
} as const

const iconMap: Record<string, (typeof NAV_ICONS)[keyof typeof NAV_ICONS]> = {
  '/dashboard': NAV_ICONS.dashboard,
  '/cv-analysis': NAV_ICONS.cvAnalysis,
  '/jobs/recommended': NAV_ICONS.jobs,
  '/profile': NAV_ICONS.profile,
  '/notifications': NAV_ICONS.notifications,
  '/settings': NAV_ICONS.settings,
  '/company/dashboard': NAV_ICONS.company,
  '/admin/dashboard': NAV_ICONS.admin,
  '/jobs/list': NAV_ICONS.jobs,
  '/applications': NAV_ICONS.cvAnalysis,
  '/interview': NAV_ICONS.interview,
  '/company/jobs': NAV_ICONS.jobs,
  '/company/applications': NAV_ICONS.profile,
  '/company/profile': NAV_ICONS.company,
}

const profileRoute = {
  candidate: ROUTES.PROFILE,
  company: ROUTES.COMPANY_PROFILE,
  admin: ROUTES.ADMIN_DASHBOARD,
} as const

/**
 * Tiroir de navigation mobile façon kit : en-tête profil, liste d'entrées, déconnexion et CTA en pied.
 */
export function MobileNav({ isOpen = false, onClose, variant = 'candidate' }: MobileNavProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  if (!isOpen) return null

  const routes = routeMap[variant]
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : 'Invité'
  const roleLabel =
    user?.role === ROLES.COMPANY ? 'Entreprise' : user?.role === ROLES.ADMIN ? 'Administrateur' : 'Candidat'

  const handleLogout = async () => {
    onClose?.()
    await logout()
    navigate(ROUTES.AUTH, { replace: true })
  }

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu mobile"
    >
      <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <div className="absolute top-0 left-0 flex h-full w-[85vw] max-w-80 animate-slide-in-right flex-col rounded-r-3xl bg-surface px-6 pt-5 pb-6 shadow-lg">
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer le menu">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {isAuthenticated ? (
          <div className="flex flex-col items-center text-center">
            <Avatar alt={fullName} fallback={fullName} size="xl" className="h-20 w-20 text-2xl ring-4 ring-primary-light" />
            <p className="mt-3 text-lg font-semibold text-foreground">{fullName}</p>
            <p className="inline-flex items-center gap-1 text-xs text-muted">
              {roleLabel} <BadgeCheck className="h-3.5 w-3.5 text-primary" />
            </p>
            <Link
              to={profileRoute[variant]}
              onClick={onClose}
              className="mt-1 text-xs font-medium text-primary hover:underline"
            >
              Voir le profil
            </Link>
          </div>
        ) : (
          <Link to={ROUTES.REGISTER} onClick={onClose}>
            <Button fullWidth>Commencer</Button>
          </Link>
        )}

        <nav className="mt-6 flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {routes.map((route) => {
            const Icon = iconMap[route.path] ?? NAV_ICONS.dashboard
            return (
              <NavLink
                key={route.path}
                to={route.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-4 rounded-lg px-3 py-3 text-sm transition-colors',
                    isActive ? 'bg-primary-light font-semibold text-primary' : 'text-foreground hover:bg-field',
                  )
                }
              >
                <Icon className="h-5 w-5 text-muted" aria-hidden />
                {route.label}
              </NavLink>
            )
          })}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex items-center gap-4 rounded-lg px-3 py-3 text-left text-sm font-medium text-error transition-colors hover:bg-error/10"
            >
              <LogOut className="h-5 w-5" aria-hidden />
              Se déconnecter
            </button>
          )}
        </nav>

        {variant === 'candidate' && isAuthenticated && (
          <Link to={ROUTES.CV_ANALYSIS} onClick={onClose} className="mt-4">
            <Button size="lg" fullWidth>
              <Sparkles className="h-5 w-5" /> Analyser mon CV
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
