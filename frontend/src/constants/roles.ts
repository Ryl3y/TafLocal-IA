/**
 * User role definitions for authorization guards and UI visibility.
 */
export const ROLES = {
  CANDIDATE: 'candidate',
  COMPANY: 'company',
  ADMIN: 'admin',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.CANDIDATE]: 'Candidat',
  [ROLES.COMPANY]: 'Entreprise',
  [ROLES.ADMIN]: 'Administrateur',
}
