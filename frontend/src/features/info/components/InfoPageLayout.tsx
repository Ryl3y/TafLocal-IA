import { ArrowLeft } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Footer } from '../../../components/navigation'
import { ROUTES } from '../../../constants/routes'
import { useAuth } from '../../../context'

export interface InfoPageLayoutProps {
  eyebrow: string
  title: string
  intro?: string
  /** Date de dernière mise à jour affichée sous le titre (pages légales). */
  updatedAt?: string
  children: ReactNode
}

/**
 * Mise en page des pages d'information (À propos, Confidentialité, Conditions, Contact),
 * accessibles connecté ou non depuis le pied de page.
 */
export function InfoPageLayout({ eyebrow, title, intro, updatedAt, children }: InfoPageLayoutProps) {
  const { isAuthenticated } = useAuth()
  const { pathname, hash } = useLocation()

  // Arrivée sur la page : en haut, ou sur la section visée (ex. /confidentialite#cookies).
  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to={ROUTES.ROOT} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-base font-bold text-white">
              TL
            </span>
            <span className="text-lg font-bold text-foreground">TafLocal AI</span>
          </Link>
          <Link
            to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.ROOT}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {isAuthenticated ? 'Mon espace' : 'Accueil'}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14" role="main">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
        {updatedAt && <p className="mt-2 text-sm text-muted">Dernière mise à jour : {updatedAt}</p>}
        {intro && <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{intro}</p>}
        <div className="mt-10 space-y-10">{children}</div>
      </main>

      <Footer />
    </div>
  )
}

export interface InfoSectionProps {
  id?: string
  title: string
  children: ReactNode
}

/** Section titrée d'une page d'information (ancre possible via ``id``). */
export function InfoSection({ id, title, children }: InfoSectionProps) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-muted [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  )
}
