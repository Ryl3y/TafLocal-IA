import { apiClient, buildQuery, unwrapList, type Paginated } from './apiClient'

export interface Job {
  id: string
  entreprise: string
  entreprise_nom: string
  entreprise_logo?: string | null
  entreprise_ville?: string | null
  titre: string
  description: string
  exigences?: string | null
  competences_requises: string[]
  localisation: string | null
  type_contrat: string
  type_contrat_display: string
  salaire_min: string | number | null
  salaire_max: string | number | null
  devise: string
  experience_requise?: number | null
  niveau_etude?: string | null
  date_publication: string
  date_expiration?: string | null
  statut: string
  statut_display: string
  nombre_candidatures?: number | null
  created_at: string
  updated_at: string
}

export interface JobWriteInput {
  titre: string
  description: string
  exigences?: string
  competences_requises?: string[]
  localisation?: string
  type_contrat: string
  salaire_min?: number | null
  salaire_max?: number | null
  devise?: string
  experience_requise?: number | null
  niveau_etude?: string
  date_expiration?: string | null
  statut?: string
}

/** @deprecated utiliser JobWriteInput */
export type JobCreateInput = JobWriteInput
/** @deprecated utiliser JobWriteInput */
export type JobUpdateInput = Partial<JobWriteInput>

export interface JobFilters {
  type_contrat?: string
  experience_max?: string | number
  statut?: string
  localisation?: string
  search?: string
  ordering?: string
  page?: number
}

/** Résultat de compatibilité calculé par le moteur IA interne. */
export interface MatchResult {
  score: number
  label: string
  details: {
    competences: number | null
    experience: number | null
    semantique: number | null
    localisation: number | null
    formation: number | null
  }
  matched_skills: string[]
  missing_skills: string[]
  partial_skills?: { competence: string; proche_de: string }[]
  required_skills?: string[]
  skills_inferred?: boolean
  explanation: string
  recommendations?: string[]
  data_quality?: 'bonne' | 'moyenne' | 'faible'
  cached?: boolean
}

export interface JobRecommendation {
  job: Job
  match: MatchResult
  already_applied: boolean
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

export const MATCH_CRITERIA_LABELS: Record<keyof MatchResult['details'], string> = {
  competences: 'Compétences',
  experience: 'Expérience',
  semantique: 'Adéquation du profil',
  localisation: 'Localisation',
  formation: 'Formation',
}

export function formatJobSalary(job: Pick<Job, 'salaire_min' | 'salaire_max' | 'devise'>): string {
  const format = (value: string | number) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value))
  const min = job.salaire_min !== null && job.salaire_min !== undefined && Number(job.salaire_min) > 0
  const max = job.salaire_max !== null && job.salaire_max !== undefined && Number(job.salaire_max) > 0
  if (min && max) return `${format(job.salaire_min!)} – ${format(job.salaire_max!)} ${job.devise}`
  if (min) return `À partir de ${format(job.salaire_min!)} ${job.devise}`
  if (max) return `Jusqu'à ${format(job.salaire_max!)} ${job.devise}`
  return 'Salaire non communiqué'
}

export const jobsService = {
  async getJobs(filters?: JobFilters): Promise<Job[]> {
    const response = await apiClient.get<Job[] | Paginated<Job>>(`/jobs/${buildQuery({ ...filters })}`)
    return unwrapList(response)
  },

  getJobsPage(filters?: JobFilters): Promise<Paginated<Job>> {
    return apiClient.get<Paginated<Job>>(`/jobs/${buildQuery({ ...filters })}`)
  },

  getJob(id: string): Promise<Job> {
    return apiClient.get<Job>(`/jobs/${id}/`)
  },

  createJob(data: JobWriteInput): Promise<Job> {
    return apiClient.post<Job>('/jobs/', data)
  },

  updateJob(id: string, data: Partial<JobWriteInput>): Promise<Job> {
    return apiClient.patch<Job>(`/jobs/${id}/`, data)
  },

  async deleteJob(id: string): Promise<void> {
    await apiClient.delete(`/jobs/${id}/`)
  },

  archiveJob(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/jobs/${id}/archive/`)
  },

  activateJob(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/jobs/${id}/activate/`)
  },

  /** Offres classées par compatibilité avec le candidat connecté. */
  async getRecommendations(params?: { limit?: number; min_score?: number; refresh?: boolean }): Promise<JobRecommendation[]> {
    const response = await apiClient.get<JobRecommendation[] | Paginated<JobRecommendation>>(
      `/jobs/match_for_me/${buildQuery({ ...params, refresh: params?.refresh ? 1 : undefined })}`,
    )
    return unwrapList(response)
  },

  /** Compatibilité du candidat connecté avec une offre. */
  getMatch(id: string): Promise<MatchResult> {
    return apiClient.get<MatchResult>(`/jobs/${id}/match/`)
  },
}
