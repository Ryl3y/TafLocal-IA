import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-white">TL</span>
              </div>
              <span className="text-xl font-bold text-foreground">TafLocal AI</span>
            </div>
            <p className="text-sm text-muted">
              Plateforme d'intelligence de carrière propulsée par l'IA.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Produit</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#features" className="text-sm text-muted hover:text-foreground transition-colors">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link to="#how-it-works" className="text-sm text-muted hover:text-foreground transition-colors">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link to="#pricing" className="text-sm text-muted hover:text-foreground transition-colors">
                  Tarifs
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Entreprise</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#about" className="text-sm text-muted hover:text-foreground transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="#blog" className="text-sm text-muted hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="#careers" className="text-sm text-muted hover:text-foreground transition-colors">
                  Carrières
                </Link>
              </li>
              <li>
                <Link to="#contact" className="text-sm text-muted hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#privacy" className="text-sm text-muted hover:text-foreground transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link to="#terms" className="text-sm text-muted hover:text-foreground transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="#cookies" className="text-sm text-muted hover:text-foreground transition-colors">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} TafLocal AI. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
