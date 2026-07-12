/**
 * Company profile services for TafLocal AI backend.
 */

import { apiClient } from './apiClient'

export interface CompanyProfile {
  id: number
  user: number
  company_name: string
  industry?: string
  website?: string
  size?: string
  location?: string
  description?: string
  logo?: string
  founded_year?: number
  linkedin_url?: string
  created_at: string
  updated_at: string
}

export async function getCompanyProfile(): Promise<CompanyProfile> {
  return apiClient.get<CompanyProfile>('/users/companies/me/')
}

export async function updateCompanyProfile(data: Partial<CompanyProfile>): Promise<CompanyProfile> {
  return apiClient.patch<CompanyProfile>('/users/companies/me/', data)
}

export async function getAllCompanies(): Promise<CompanyProfile[]> {
  return apiClient.get<CompanyProfile[]>('/users/companies/')
}

export async function getCompanyById(id: number): Promise<CompanyProfile> {
  return apiClient.get<CompanyProfile>(`/users/companies/${id}/`)
}
