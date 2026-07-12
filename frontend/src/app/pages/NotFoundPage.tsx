import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

/**
 * NotFoundPage — 404 fallback page.
 * TODO: Implement branded 404 illustration and helpful links.
 */
export function NotFoundPage() {
  return (
    <div className="page not-found-page flex min-h-screen flex-col items-center justify-center p-4" data-page="not-found">
      <header className="page-header text-center">
        <h1>404</h1>
        <p>Page introuvable</p>
      </header>

      <main className="page-content">
        <section className="page-section text-center" aria-label="Navigation help">
          {/* TODO: Helpful links to dashboard and home */}
          <Link to={ROUTES.SPLASH} className="text-primary-600 hover:text-primary-700">
            Retour à l&apos;accueil
          </Link>
        </section>
      </main>
    </div>
  )
}

export default NotFoundPage
