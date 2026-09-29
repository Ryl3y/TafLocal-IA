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
  categorie: JobCategory
  categorie_display: string
  /** Stage uniquement */
  duree_stage_mois: number | null
  stage_remunere: boolean | null
  type_contrat: string
  type_contrat_display: string
  salaire_min: string | number | null
  salaire_max: string | number | null
  devise: string
  /** En mois (0 = débutant accepté, null = non précisée). */
  experience_requise_mois?: number | null
  experience_requise_display: string
  niveau_etude?: string | null
  /** Place de la lettre de motivation, choisie par l'entreprise (le CV est toujours obligatoire). */
  lettre_motivation: CoverLetterRequirement
  lettre_motivation_display: string
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
  categorie?: JobCategory
  duree_stage_mois?: number | null
  stage_remunere?: boolean | null
  type_contrat: string
  salaire_min?: number | null
  salaire_max?: number | null
  devise?: string
  experience_requise_mois?: number | null
  niveau_etude?: string
  lettre_motivation?: CoverLetterRequirement
  date_expiration?: string | null
  statut?: string
}

export type JobCategory = 'EMPLOI' | 'STAGE'

/** Paliers d'expérience requise proposés au recruteur (en mois), de 3 mois à 10 ans. */
export const EXPERIENCE_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'Débutant accepté' },
  { value: 3, label: '3 mois' },
  { value: 6, label: '6 mois' },
  { value: 12, label: '1 an' },
  { value: 24, label: '2 ans' },
  { value: 36, label: '3 ans' },
  { value: 48, label: '4 ans' },
  { value: 60, label: '5 ans' },
  { value: 84, label: '7 ans' },
  { value: 120, label: '10 ans et plus' },
]

/** Libellé court pour les pastilles : « 3 mois d'exp. », « 2 ans d'exp. », « Débutant accepté ». */
export function formatExperienceBadge(months: number | null | undefined): string | null {
  if (months === null || months === undefined) return null
  if (months === 0) return 'Débutant accepté'
  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts = [years ? `${years} an${years > 1 ? 's' : ''}` : '', rest ? `${rest} mois` : ''].filter(Boolean)
  return `${parts.join(' et ')} d’exp.`
}
export const STAGE_MAX_MONTHS = 24

export type CoverLetterRequirement = 'NON_DEMANDEE' | 'FACULTATIVE' | 'OBLIGATOIRE'

export const COVER_LETTER_OPTIONS: { value: CoverLetterRequirement; label: string; hint: string }[] = [
  { value: 'NON_DEMANDEE', label: 'Non demandée', hint: 'Le candidat envoie uniquement son CV.' },
  { value: 'FACULTATIVE', label: 'Facultative', hint: 'Le candidat peut joindre une lettre.' },
  { value: 'OBLIGATOIRE', label: 'Obligatoire', hint: 'La candidature doit comporter une lettre.' },
]

/** Longueur minimale d'une lettre obligatoire (même règle que le backend). */
export const MIN_REQUIRED_LETTER_LENGTH = 100

/** @deprecated utiliser JobWriteInput */
export type JobCreateInput = JobWriteInput
/** @deprecated utiliser JobWriteInput */
export type JobUpdateInput = Partial<JobWriteInput>

export interface JobFilters {
  categorie?: JobCategory
  type_contrat?: string
  experience_max_mois?: string | number
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

/** Contrats proposés pour une offre d'emploi (un stage a toujours le contrat « Stage »). */
export const EMPLOYMENT_CONTRACT_TYPES = CONTRACT_TYPES.filter((type) => type.value !== 'INTERNSHIP')

export function formatInternshipDuration(months: number | null | undefined): string {
  if (!months) return 'Durée non précisée'
  return months === 1 ? '1 mois' : `${months} mois`
}

/** Rémunération affichée au candidat, adaptée aux stages. */
export function formatJobPay(job: Pick<Job, 'categorie' | 'stage_remunere' | 'salaire_min' | 'salaire_max' | 'devise'>): string {
  if (job.categorie === 'STAGE') {
    if (job.stage_remunere === false) return 'Stage non rémunéré'
    const amount = formatJobSalary(job)
    return amount === 'Salaire non communiqué' ? 'Stage rémunéré' : `Gratification : ${amount}`
  }
  return formatJobSalary(job)
}

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
