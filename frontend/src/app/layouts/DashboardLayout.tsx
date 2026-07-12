import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Footer, MobileNav, Navbar, Sidebar } from '../../components/navigation'

export function DashboardLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="layout-shell">
      <Navbar onMenuToggle={() => setMobileNavOpen(true)} showSearch />
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        variant="candidate"
      />

      <div className="layout-body">
        {/* Sidebar hidden on mobile, visible on large screens */}
        <Sidebar variant="candidate" className="hidden lg:block" />

        <main className="layout-main" role="main">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  )
}
