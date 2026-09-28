import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav, Footer, MobileNav, Navbar, Sidebar } from '../../components/navigation'

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
        <Sidebar variant="candidate" className="hidden lg:flex" />

        {/* pb-24 : laisse la place à la barre d'onglets mobile */}
        <main className="layout-main pb-24 lg:pb-6" role="main">
          <Outlet />
        </main>
      </div>

      <Footer className="hidden lg:flex" />
      <BottomNav />
    </div>
  )
}
