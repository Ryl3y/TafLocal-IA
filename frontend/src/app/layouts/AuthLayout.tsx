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
        className="flex flex-1 items-center justify-center p-4"
        role="main"
      >
        <div className="w-full max-w-md">
          {/* TODO: Auth form container styling */}
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  )
}
