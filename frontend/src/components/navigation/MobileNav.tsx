import { NavLink, Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { X } from 'lucide-react'
import { NAV_ICONS } from '../../constants/icons'
import { candidateRoutes } from '../../routes/candidate.routes'
import { companyRoutes } from '../../routes/company.routes'
import { adminRoutes } from '../../routes/admin.routes'
import { cn } from '../../utils/cn'
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
}

export function MobileNav({ isOpen = false, onClose, variant = 'candidate' }: MobileNavProps) {
  if (!isOpen) return null

  const routes = routeMap[variant]

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu mobile"
    >
      <div className="absolute inset-0 bg-foreground/40 animate-fade-in" onClick={onClose} aria-hidden />
      <div className="absolute top-0 left-0 h-full w-sidebar max-w-[85vw] animate-slide-in-right bg-surface p-4 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <Link to={ROUTES.SPLASH} onClick={onClose} className="inline-flex items-center gap-3">
            <img src="/src/assets/logos/TafLocal_AI_Logo.jpeg" alt="TafLocal AI" className="h-8 w-auto object-contain" />
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer le menu">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="mb-3">
          <Link to={ROUTES.AUTH} onClick={onClose}>
            <Button size="sm" fullWidth>Commencer</Button>
          </Link>
        </div>
        <nav className="flex flex-col gap-1">
          {routes.map((route) => {
            const Icon = iconMap[route.path] ?? NAV_ICONS.dashboard
            return (
              <NavLink
                key={route.path}
                to={route.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-primary-light text-primary' : 'text-muted hover:bg-background',
                  )
                }
              >
                <Icon className="h-4 w-4" aria-hidden />
                {route.label}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
