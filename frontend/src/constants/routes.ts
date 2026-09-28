/**
 * Centralized route path constants.
 * Use these instead of hardcoded strings across the application.
 */
export const ROUTES = {
  ROOT: '/',
  SPLASH: '/',
  AUTH: '/auth',
  /** Page d'authentification ouverte directement sur le formulaire d'inscription (lien, pas une route). */
  REGISTER: '/auth?mode=register',
  /** Inscription directement sur le formulaire candidat / entreprise (sans l'étape de choix). */
  REGISTER_CANDIDATE: '/auth?mode=register&type=candidat',
  REGISTER_COMPANY: '/auth?mode=register&type=entreprise',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',

  // Pages d'information (pied de page), accessibles connecté ou non
  ABOUT: '/a-propos',
  PRIVACY: '/confidentialite',
  TERMS: '/conditions',
  CONTACT: '/contact',

  // Candidate routes
  CANDIDATE_ROOT: '/candidate',
  DASHBOARD: '/dashboard',
  CV_ROOT: '/cv',
  CV_ANALYSIS: '/cv-analysis',
  CV_ANALYSIS_RESULT: '/cv-analysis/result/:analysisId',
  JOBS_ROOT: '/jobs',
  JOBS_LIST: '/jobs/list',
  RECOMMENDED_JOBS: '/jobs/recommended',
  JOB_DETAILS: '/jobs/:jobId',
  APPLY: '/jobs/:jobId/apply',
  MY_APPLICATIONS: '/applications',
  INTERVIEW_ROOT: '/interview',
  INTERVIEW: '/interview/:sessionId',
  INTERVIEW_FEEDBACK: '/interview/:sessionId/feedback',
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',

  // Company routes
  COMPANY_ROOT: '/company',
  COMPANY_DASHBOARD: '/company/dashboard',
  COMPANY_JOBS: '/company/jobs',
  COMPANY_JOB_CREATE: '/company/jobs/create',
  COMPANY_JOB_EDIT: '/company/jobs/:jobId/edit',
  COMPANY_APPLICATIONS: '/company/applications',
  COMPANY_PROFILE: '/company/profile',

  // Admin routes
  ADMIN_ROOT: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',

  // Fallback
  NOT_FOUND: '*',
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]
