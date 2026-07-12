import { Link } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { cn } from '../../utils/cn'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { SearchBar } from '../ui/SearchBar'

export interface NavbarProps {
  onMenuToggle?: () => void
  showSearch?: boolean
  className?: string
}

/**
 * Barre de navigation principale du Design System.
 */
export function Navbar({ onMenuToggle, showSearch = false, className }: NavbarProps) {
  return (
    <header
      className={cn(
        'flex h-navbar shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4 shadow-sm lg:px-6',
        className,
      )}
      role="banner"
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link to={ROUTES.SPLASH} className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2">
          <img src="/src/assets/logos/TafLocal_AI_Logo.jpeg" alt="TafLocal AI" className="h-8 w-auto object-contain" />
        </Link>
      </div>

      {showSearch && (
        <div className="hidden max-w-md flex-1 md:block">
          <SearchBar placeholder="Rechercher une offre, une compétence…" />
        </div>
      )}

      <nav className="flex items-center gap-2" aria-label="Navigation principale">
            <Link to={ROUTES.AUTH} className="sm:hidden">
              <Button size="sm" className="mr-2">Commencer</Button>
            </Link>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Avatar alt="Utilisateur" fallback="Utilisateur" size="sm" />
      </nav>
    </header>
  )
}
