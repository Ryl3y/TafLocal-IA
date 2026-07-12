import { Outlet } from 'react-router-dom'

/**
 * EmptyLayout — Minimal layout without chrome (splash, errors, modals).
 */
export function EmptyLayout() {
  return (
    <main className="min-h-screen" role="main">
      <Outlet />
    </main>
  )
}
