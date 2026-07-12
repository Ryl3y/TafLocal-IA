/**
 * Candidate profile services for TafLocal AI backend.
 */

import { apiClient } from './apiClient'

export interface CandidateProfile {
  id: number
  user: number
  first_name: string
  last_name: string
  phone?: string
  location?: string
  experience_years?: number
  education?: string
  skills?: string[]
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  bio?: string
  created_at: string
  updated_at: string
}

export async function getCandidateProfile(): Promise<CandidateProfile> {
  return apiClient.get<CandidateProfile>('/users/candidates/me/')
}

export async function updateCandidateProfile(data: Partial<CandidateProfile>): Promise<CandidateProfile> {
  return apiClient.patch<CandidateProfile>('/users/candidates/me/', data)
}

export async function getAllCandidates(): Promise<CandidateProfile[]> {
  return apiClient.get<CandidateProfile[]>('/users/candidates/')
}

export async function getCandidateById(id: number): Promise<CandidateProfile> {
  return apiClient.get<CandidateProfile>(`/users/candidates/${id}/`)
}
