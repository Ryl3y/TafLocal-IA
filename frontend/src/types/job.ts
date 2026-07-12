import type { Company } from './company'

export type JobStatus = 'draft' | 'published' | 'archived' | 'suspended'
export type ContractType = 'cdi' | 'cdd' | 'freelance' | 'internship' | 'other'

/**
 * Job offer published by a company.
 */
export interface Job {
  id: string
  companyId: string
  company?: Company
  title: string
  description: string
  location: string
  contractType: ContractType
  salaryMin?: number
  salaryMax?: number
  currency?: string
  requiredSkills: string[]
  compatibilityScore?: number
  status: JobStatus
  publishedAt?: string
  createdAt: string
  updatedAt: string
}
