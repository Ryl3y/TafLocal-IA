import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { Button } from '../ui/Button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to={ROUTES.ROOT} className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary sm:h-10 sm:w-10">
              <span className="text-base font-bold text-white sm:text-lg">TL</span>
            </div>
            <span className="whitespace-nowrap text-lg font-bold text-foreground sm:text-xl">TafLocal AI</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            <a href="#how-it-works" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Comment ça marche
            </a>
            <a href="#features" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Fonctionnalités
            </a>
            <a href="#faq" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to={ROUTES.AUTH} className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link to={ROUTES.REGISTER}>
              <Button size="sm">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
