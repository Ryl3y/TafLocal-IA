import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Loader } from '../../components/feedback/Loader'
import { Footer, MobileNav, Navbar, Sidebar } from '../../components/navigation'
import { CompanyVerificationScreen } from '../../features/company/components/CompanyVerificationScreen'
import { getCompanyProfile, type CompanyProfile } from '../../services/api/profileServices'

export function CompanyLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadCompany = useCallback(
    () =>
      getCompanyProfile()
        .then(setCompany)
        .catch(() => setCompany(null))
        .finally(() => setIsLoading(false)),
    [],
  )

  useEffect(() => {
    void loadCompany()
  }, [loadCompany])

  // Tant que l'administrateur n'a pas validé l'entreprise, seul l'écran de vérification est accessible.
  const approved = company?.statut_verification === 'APPROVED'

  return (
    <div className="layout-shell">
      <Navbar onMenuToggle={approved ? () => setMobileNavOpen(true) : undefined} />
      {approved && (
        <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} variant="company" />
      )}

      <div className="layout-body">
        {approved && <Sidebar variant="company" className="hidden lg:block" />}

        <main className="layout-main" role="main">
          {isLoading ? (
            <Loader label="Chargement de votre espace…" />
          ) : approved ? (
            <Outlet />
          ) : company ? (
            <CompanyVerificationScreen company={company} onRefresh={loadCompany} onUpdated={setCompany} />
          ) : (
            <p className="p-6 text-center text-sm text-error">Impossible de charger votre entreprise. Réessayez plus tard.</p>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}
