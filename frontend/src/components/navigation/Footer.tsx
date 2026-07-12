import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { cn } from '../../utils/cn'

export interface FooterProps {
  className?: string
}

const footerLinks = [
  { label: 'À propos', href: '#' },
  { label: 'Confidentialité', href: '#' },
  { label: 'Conditions', href: '#' },
  { label: 'Contact', href: '#' },
] as const

/**
 * Pied de page du Design System.
 */
export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        'flex h-footer shrink-0 flex-col items-center justify-center gap-2 border-t border-border bg-surface px-4 py-2 text-sm text-muted sm:flex-row sm:justify-between',
        className,
      )}
      role="contentinfo"
    >
      <span>
        &copy; {new Date().getFullYear()}{' '}
        <Link to={ROUTES.SPLASH} className="font-medium text-primary hover:text-primary-hover">
          TafLocal AI
        </Link>
      </span>
      <nav className="flex flex-wrap justify-center gap-4" aria-label="Liens du pied de page">
        {footerLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:rounded"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  )
}
