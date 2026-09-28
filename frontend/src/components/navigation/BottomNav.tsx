import { Bookmark, Home, LayoutGrid, MessageSquare, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { cn } from '../../utils/cn'

const tabs = [
  { to: ROUTES.DASHBOARD, label: 'Accueil', icon: Home },
  { to: ROUTES.JOBS_LIST, label: 'Offres', icon: LayoutGrid },
  { to: ROUTES.MY_APPLICATIONS, label: 'Candidatures', icon: Bookmark },
  { to: ROUTES.INTERVIEW_ROOT, label: 'Entretien', icon: MessageSquare },
  { to: ROUTES.PROFILE, label: 'Profil', icon: User },
] as const

/**
 * Barre d'onglets fixe en bas d'écran (mobile uniquement), façon application native.
 */
export function BottomNav({ className }: { className?: string }) {
  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur lg:hidden',
        className,
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Navigation principale mobile"
    >
      <ul className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              aria-label={label}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 1.8} aria-hidden />
                  <span className={cn('h-1 w-1 rounded-full', isActive ? 'bg-primary' : 'bg-transparent')} />
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
