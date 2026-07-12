import type { User } from './user'

/**
 * Company profile for recruiters.
 */
export interface Company {
  id: string
  name: string
  description?: string
  industry?: string
  website?: string
  logoUrl?: string
  location?: string
  ownerId: string
  owner?: User
  createdAt: string
  updatedAt: string
}
