import { ROUTES } from '../constants/routes'

/**
 * Public routes accessible without authentication.
 */
export const publicRoutes = [
  { path: ROUTES.SPLASH, label: 'Accueil' },
  { path: ROUTES.AUTH, label: 'Connexion' },
] as const
