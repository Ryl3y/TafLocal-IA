import { ROUTES } from '../constants/routes'

/**
 * Route metadata for company-facing pages.
 */
export const companyRoutes = [
  { path: ROUTES.COMPANY_DASHBOARD, label: 'Tableau de bord' },
  { path: ROUTES.COMPANY_JOBS, label: 'Mes offres' },
  { path: ROUTES.COMPANY_APPLICATIONS, label: 'Candidatures' },
  { path: ROUTES.COMPANY_PROFILE, label: 'Profil entreprise' },
] as const
