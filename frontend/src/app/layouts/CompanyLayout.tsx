import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Footer, MobileNav, Navbar, Sidebar } from '../../components/navigation'

export function CompanyLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="layout-shell">
      <Navbar onMenuToggle={() => setMobileNavOpen(true)} />
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        variant="company"
      />

      <div className="layout-body">
        <Sidebar variant="company" className="hidden lg:block" />

        <main className="layout-main" role="main">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  )
}
