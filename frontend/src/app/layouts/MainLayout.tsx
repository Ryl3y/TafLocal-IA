import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Footer, MobileNav, Navbar } from '../../components/navigation'

export function MainLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="layout-shell">
      <Navbar onMenuToggle={() => setMobileNavOpen(true)} />
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* TODO: Wire mobile menu toggle from Navbar */}
      <main className="layout-main flex-1" role="main">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
