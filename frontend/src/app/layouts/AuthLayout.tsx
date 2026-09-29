import { Outlet } from 'react-router-dom'
import { Footer, Navbar } from '../../components/navigation'

/**
 * AuthLayout — Centered layout for authentication flows.
 */
export function AuthLayout() {
  return (
    <div className="layout-shell">
      <Navbar />

      <main
        className="relative flex flex-1 items-center justify-center overflow-hidden p-4 lg:p-8"
        role="main"
      >
        {/* Arc gris décoratif du kit */}
        <div className="onboarding-arc" aria-hidden />
        <div className="relative w-full max-w-5xl">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  )
}
