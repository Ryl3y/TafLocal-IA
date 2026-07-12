import type { User } from './user'

/**
 * Job seeker profile and employability data.
 */
export interface Candidate {
  id: string
  userId: string
  user?: User
  headline?: string
  location?: string
  skills: string[]
  cvUrl?: string
  employabilityScore?: number
  createdAt: string
  updatedAt: string
}
