import { apiClient } from './apiClient'
import type { Job } from './jobsService'

export interface ApplicationCandidateUser {
  id: string
  email: string
  prenom: string
  nom: string
}

export interface ApplicationCandidate {
  id: string
  user: ApplicationCandidateUser
  ville?: string
  biographie?: string
  linkedin?: string
}

export interface Application {
  id: string
  offre: Job
  candidate: ApplicationCandidate
  statut: string
  statut_display: string
  commentaire?: string
  date_candidature: string
  created_at: string
  updated_at: string
}

export interface ApplicationFilters {
  statut?: string
  offre?: string
  search?: string
  ordering?: string
}

export interface ApplicationUpdateInput {
  statut?: string
  commentaire?: string
}

export const APPLICATION_STATUSES = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'UNDER_REVIEW', label: 'En cours d\'examen' },
  { value: 'SHORTLISTED', label: 'Présélectionné' },
  { value: 'REJECTED', label: 'Refusé' },
  { value: 'HIRED', label: 'Embauché' },
  { value: 'WITHDRAWN', label: 'Retiré' },
] as const

function unwrapList<T>(response: T[] | { results?: T[] }): T[] {
  if (Array.isArray(response)) return response
  return response.results ?? []
}

function buildQuery(filters?: ApplicationFilters): string {
  if (!filters) return ''
  const params = new URLSearchParams()
  if (filters.statut) params.append('statut', filters.statut)
  if (filters.offre) params.append('offre', filters.offre)
  if (filters.search) params.append('search', filters.search)
  if (filters.ordering) params.append('ordering', filters.ordering)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export const applicationsService = {
  async getApplications(filters?: ApplicationFilters): Promise<Application[]> {
    const response = await apiClient.get<Application[] | { results: Application[] }>(
      `/applications/${buildQuery(filters)}`,
    )
    return unwrapList(response)
  },

  async updateApplication(id: string, data: ApplicationUpdateInput): Promise<Application> {
    return apiClient.patch<Application>(`/applications/${id}/`, data)
  },
}
