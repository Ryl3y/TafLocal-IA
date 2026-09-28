import { apiClient, buildQuery, unwrapList, type Paginated } from './apiClient'
import type { Job, MatchResult } from './jobsService'

export interface ApplicationCandidateUser {
  id: string
  email: string
  prenom: string
  nom: string
  telephone?: string | null
}

export interface ApplicationCandidate {
  id: string
  user: ApplicationCandidateUser
  ville?: string | null
  biographie?: string | null
  linkedin?: string | null
  experience_annees?: number
}

export interface Application {
  id: string
  offre: Job
  candidate: ApplicationCandidate
  /** CV transmis avec la candidature (téléchargeable via downloadCV). */
  cv: { id: number; file_name: string; file_type: string; uploaded_at: string } | null
  statut: string
  statut_display: string
  commentaire?: string | null
  lettre_motivation?: string | null
  lettre_generee_par_ia?: boolean
  date_candidature: string
  created_at: string
  updated_at: string
}

export interface RankedApplication {
  rang: number
  application: Application
  match: MatchResult
}

export interface RankedApplicationsResponse {
  avertissement: string
  results: RankedApplication[]
  count?: number
}

export interface ApplicationFilters {
  statut?: string
  offre?: string
  search?: string
  ordering?: string
}

export interface ApplicationCreateInput {
  offre: string
  /** CV joint (obligatoire côté serveur ; à défaut, le plus récent est utilisé). */
  cv?: number
  commentaire?: string
  lettre_motivation?: string
  lettre_generee_par_ia?: boolean
}

export interface ApplicationUpdateInput {
  statut?: string
  commentaire?: string
}

export const APPLICATION_STATUSES = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'UNDER_REVIEW', label: "En cours d'examen" },
  { value: 'SHORTLISTED', label: 'Présélectionnée' },
  { value: 'REJECTED', label: 'Refusée' },
  { value: 'HIRED', label: 'Retenue' },
  { value: 'WITHDRAWN', label: 'Retirée' },
] as const

export const applicationsService = {
  async getApplications(filters?: ApplicationFilters): Promise<Application[]> {
    const response = await apiClient.get<Application[] | Paginated<Application>>(
      `/applications/${buildQuery({ ...filters })}`,
    )
    return unwrapList(response)
  },

  createApplication(data: ApplicationCreateInput): Promise<Application> {
    return apiClient.post<Application>('/applications/', data)
  },

  updateApplication(id: string, data: ApplicationUpdateInput): Promise<Application> {
    return apiClient.patch<Application>(`/applications/${id}/`, data)
  },

  withdrawApplication(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/applications/${id}/withdraw/`)
  },

  /** Classement indicatif des candidatures reçues (entreprise). */
  getRankedApplications(filters?: { offre?: string; statut?: string; refresh?: boolean }): Promise<RankedApplicationsResponse> {
    return apiClient.get<RankedApplicationsResponse>(
      `/applications/ranked/${buildQuery({ ...filters, refresh: filters?.refresh ? 1 : undefined })}`,
    )
  },
}
