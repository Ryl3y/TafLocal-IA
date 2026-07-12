import type { Role } from '../constants/roles'

/**
 * Base user entity shared across roles.
 */
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  role: Role
  createdAt: string
  updatedAt: string
}
