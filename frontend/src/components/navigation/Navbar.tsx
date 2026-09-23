import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Bell, LogOut } from 'lucide-react'
import logo from '../../assets/logos/TafLocal_AI_Logo.jpeg'
import { ROLES } from '../../constants/roles'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../context/AuthContext'
import { getUnreadCount } from '../../services/api/notificationServices'
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
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== ROLES.CANDIDATE) return
    let active = true
    const refresh = () =>
      getUnreadCount()
        .then((data) => active && setUnread(data.unread_count))
        .catch(() => undefined)
    void refresh()
    const timer = window.setInterval(refresh, 60_000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [isAuthenticated, user?.role])

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    const query = search.trim()
    navigate(query ? `${ROUTES.JOBS_LIST}?search=${encodeURIComponent(query)}` : ROUTES.JOBS_LIST)
  }

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.AUTH, { replace: true })
  }

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : 'Utilisateur'

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
          <img src={logo} alt="TafLocal AI" className="h-8 w-auto object-contain" />
        </Link>
      </div>

      {showSearch && (
        <form className="hidden max-w-md flex-1 md:block" onSubmit={handleSearch} role="search">
          <SearchBar
            placeholder="Rechercher une offre, une compétence…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onClear={() => setSearch('')}
          />
        </form>
      )}

      <nav className="flex items-center gap-2" aria-label="Navigation principale">
        {!isAuthenticated ? (
          <Link to={ROUTES.AUTH}>
            <Button size="sm">Commencer</Button>
          </Link>
        ) : (
          <>
            {user?.role === ROLES.CANDIDATE && (
              <Link to={ROUTES.NOTIFICATIONS} className="relative" aria-label={`Notifications (${unread} non lues)`}>
                <Button variant="ghost" size="icon" tabIndex={-1}>
                  <Bell className="h-5 w-5" />
                </Button>
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
            )}
            <span className="hidden text-sm text-muted sm:inline">{fullName}</span>
            <Avatar alt={fullName} fallback={fullName} size="sm" />
            <Button variant="ghost" size="icon" aria-label="Se déconnecter" title="Se déconnecter" onClick={() => void handleLogout()}>
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        )}
      </nav>
    </header>
  )
}
