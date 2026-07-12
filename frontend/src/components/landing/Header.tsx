import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { Button } from '../ui/Button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to={ROUTES.ROOT} className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-white">TL</span>
            </div>
            <span className="text-xl font-bold text-foreground">TafLocal AI</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to={ROUTES.ROOT} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Accueil
            </Link>
            <Link to="#how-it-works" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Comment ça marche
            </Link>
            <Link to="#features" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Fonctionnalités
            </Link>
            <Link to="#companies" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Entreprises
            </Link>
            <Link to="#faq" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Link to={ROUTES.AUTH}>
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link to={ROUTES.AUTH}>
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
