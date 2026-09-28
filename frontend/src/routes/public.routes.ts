import { ROUTES } from '../constants/routes'

/**
 * Public routes accessible without authentication.
 */
export const publicRoutes = [
  { path: ROUTES.SPLASH, label: 'Accueil' },
  { path: ROUTES.AUTH, label: 'Connexion' },
  { path: ROUTES.ABOUT, label: 'À propos' },
  { path: ROUTES.PRIVACY, label: 'Confidentialité' },
  { path: ROUTES.TERMS, label: 'Conditions' },
  { path: ROUTES.CONTACT, label: 'Contact' },
] as const
