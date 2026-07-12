import { apiClient } from './apiClient'

export interface Job {
  id: string
  entreprise: string
  entreprise_nom: string
  entreprise_logo?: string
  titre: string
  description: string
  localisation: string
  type_contrat: string
  type_contrat_display: string
  salaire_min: number
  salaire_max: number
  devise: string
  experience_requise?: number | string
  niveau_etude?: string
  date_publication: string
  date_expiration?: string
  statut: string
  statut_display: string
  created_at: string
  updated_at: string
}

export interface JobCreateInput {
  titre: string
  description: string
  localisation: string
  type_contrat: string
  salaire_min: number
  salaire_max: number
  devise: string
  experience_requise?: number | string
  niveau_etude?: string
  date_expiration?: string
}

export interface JobUpdateInput {
  titre?: string
  description?: string
  localisation?: string
  type_contrat?: string
  salaire_min?: number
  salaire_max?: number
  devise?: string
  experience_requise?: number | string
  niveau_etude?: string
  date_expiration?: string
  statut?: string
}

export interface JobFilters {
  type_contrat?: string
  experience_requise?: string
  statut?: string
  search?: string
  ordering?: string
}

export const JOB_STATUSES = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
  EXPIRED: 'EXPIRED',
} as const

export const CONTRACT_TYPES = [
  { value: 'CDI', label: 'CDI' },
  { value: 'CDD', label: 'CDD' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'INTERNSHIP', label: 'Stage' },
  { value: 'APPRENTICESHIP', label: 'Alternance' },
] as const

function unwrapList<T>(response: T[] | { results?: T[] }): T[] {
  if (Array.isArray(response)) return response
  return response.results ?? []
}

function buildQuery(filters?: JobFilters): string {
  if (!filters) return ''
  const params = new URLSearchParams()
  if (filters.type_contrat) params.append('type_contrat', filters.type_contrat)
  if (filters.experience_requise) params.append('experience_requise', filters.experience_requise)
  if (filters.statut) params.append('statut', filters.statut)
  if (filters.search) params.append('search', filters.search)
  if (filters.ordering) params.append('ordering', filters.ordering)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export const jobsService = {
  async getJobs(filters?: JobFilters): Promise<Job[]> {
    const response = await apiClient.get<Job[] | { results: Job[] }>(`/jobs/${buildQuery(filters)}`)
    return unwrapList(response)
  },

  async getJob(id: string): Promise<Job> {
    return apiClient.get<Job>(`/jobs/${id}/`)
  },

  async createJob(data: JobCreateInput): Promise<Job> {
    return apiClient.post<Job>('/jobs/', data)
  },

  async updateJob(id: string, data: JobUpdateInput): Promise<Job> {
    return apiClient.patch<Job>(`/jobs/${id}/`, data)
  },

  async deleteJob(id: string): Promise<void> {
    await apiClient.delete(`/jobs/${id}/`)
  },

  async archiveJob(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/jobs/${id}/archive/`)
  },

  async activateJob(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/jobs/${id}/activate/`)
  },

  async viewJob(id: string): Promise<Job> {
    return apiClient.get<Job>(`/jobs/${id}/view/`)
  },

  async getMatchedJobs(): Promise<unknown[]> {
    return apiClient.get<unknown[]>('/jobs/match_for_me/')
  },
}
