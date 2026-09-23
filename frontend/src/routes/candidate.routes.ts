import { ROUTES } from '../constants/routes'

/**
 * Route metadata for candidate-facing pages.
 */
export const candidateRoutes = [
  { path: ROUTES.DASHBOARD, label: 'Tableau de bord' },
  { path: ROUTES.CV_ANALYSIS, label: 'Analyse CV' },
  { path: ROUTES.RECOMMENDED_JOBS, label: 'Offres recommandées' },
  { path: ROUTES.JOBS_LIST, label: 'Toutes les offres' },
  { path: ROUTES.MY_APPLICATIONS, label: 'Mes candidatures' },
  { path: ROUTES.INTERVIEW_ROOT, label: 'Entretien IA' },
  { path: ROUTES.PROFILE, label: 'Profil' },
  { path: ROUTES.NOTIFICATIONS, label: 'Notifications' },
  { path: ROUTES.SETTINGS, label: 'Paramètres' },
] as const
