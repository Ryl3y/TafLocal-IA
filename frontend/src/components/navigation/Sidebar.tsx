import { NavLink } from 'react-router-dom'
import { NAV_ICONS } from '../../constants/icons'
import { candidateRoutes } from '../../routes/candidate.routes'
import { companyRoutes } from '../../routes/company.routes'
import { adminRoutes } from '../../routes/admin.routes'
import { cn } from '../../utils/cn'

export interface SidebarProps {
  className?: string
  variant?: 'candidate' | 'company' | 'admin'
}

const routeMap = {
  candidate: candidateRoutes,
  company: companyRoutes,
  admin: adminRoutes,
} as const

const iconMap = {
  '/dashboard': NAV_ICONS.dashboard,
  '/cv-analysis': NAV_ICONS.cvAnalysis,
  '/jobs/recommended': NAV_ICONS.jobs,
  '/profile': NAV_ICONS.profile,
  '/notifications': NAV_ICONS.notifications,
  '/settings': NAV_ICONS.settings,
  '/company/dashboard': NAV_ICONS.company,
  '/admin/dashboard': NAV_ICONS.admin,
} as const

/**
 * Barre latérale de navigation du Design System.
 */
export function Sidebar({ className, variant = 'candidate' }: SidebarProps) {
  const routes = routeMap[variant]

  return (
    <aside
      className={cn(
        'flex w-sidebar shrink-0 flex-col border-r border-border bg-surface p-4',
        className,
      )}
      aria-label={`Navigation ${variant}`}
    >
      <nav className="flex flex-col gap-1">
        {routes.map((route) => {
          const Icon = iconMap[route.path as keyof typeof iconMap] ?? NAV_ICONS.dashboard

          return (
            <NavLink
              key={route.path}
              to={route.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                  'hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  isActive
                    ? 'bg-primary-light text-primary'
                    : 'text-muted hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {route.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
