/**
 * Services de profil (utilisateur, candidat, entreprise).
 */

import { apiClient, unwrapList, type Paginated } from './apiClient'

export interface UserData {
  id: string
  email: string
  username: string | null
  nom: string
  prenom: string
  role: 'CANDIDATE' | 'COMPANY' | 'ADMIN'
  telephone: string | null
  is_active: boolean
  date_inscription: string
}

export type SkillLevel = 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE' | 'EXPERT'

export const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: 'DEBUTANT', label: 'Débutant' },
  { value: 'INTERMEDIAIRE', label: 'Intermédiaire' },
  { value: 'AVANCE', label: 'Avancé' },
  { value: 'EXPERT', label: 'Expert' },
]

export interface CandidateSkill {
  id: string
  nom: string
  categorie: string | null
  niveau: SkillLevel
  niveau_display: string
  annees_experience: number | null
}

export interface WorkExperience {
  id: string
  poste: string
  entreprise: string
  description: string | null
  date_debut: string
  date_fin: string | null
  en_cours: boolean
  duree_mois: number
}

export interface Education {
  id: string
  diplome: string
  etablissement: string
  description: string | null
  date_debut: string | null
  date_fin: string | null
  en_cours: boolean
}

export interface CandidateProfile {
  id: string
  user: UserData
  date_naissance: string | null
  genre: string | null
  adresse: string | null
  ville: string | null
  photo: string | null
  biographie: string | null
  linkedin: string | null
  github: string | null
  portfolio: string | null
  experience_annees: number
  competences: CandidateSkill[]
  experiences: WorkExperience[]
  formations: Education[]
  created_at: string
  updated_at: string
}

export interface CompanyProfile {
  id: string
  user: string
  nom_entreprise: string
  secteur?: string | null
  description?: string | null
  site_web?: string | null
  adresse?: string | null
  ville?: string | null
  telephone?: string | null
  logo?: string | null
  verified: boolean
  /** Numéro de registre de commerce, vérifié par un administrateur. */
  registre_commerce?: string | null
  /** Un certificat PDF a été fourni (le fichier n'est lisible que via un endpoint protégé). */
  document_rccm_disponible: boolean
  document_rccm_nom: string
  statut_verification: CompanyVerificationStatus
  statut_verification_display: string
  motif_rejet: string
  verifie_le: string | null
  created_at: string
  updated_at: string
}

export type CompanyVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/** Fiche vue par l'administrateur pour la vérification. */
export interface CompanyForReview extends CompanyProfile {
  email: string
  contact: string
  nombre_offres: number
}

export interface UpdateCandidateProfileData {
  date_naissance?: string | null
  genre?: string
  adresse?: string
  ville?: string
  photo?: string
  biographie?: string
  linkedin?: string
  github?: string
  portfolio?: string
}

export interface UpdateCompanyProfileData {
  nom_entreprise?: string
  secteur?: string
  description?: string
  site_web?: string
  adresse?: string
  ville?: string
  telephone?: string
  logo?: string
  registre_commerce?: string
}

export interface UpdateUserData {
  prenom?: string
  nom?: string
  telephone?: string
}

export interface PlatformStats {
  utilisateurs: number
  candidats: number
  entreprises: number
  offres_publiees: number
  candidatures: number
  analyses_cv: number
  entretiens: number
}

// Utilisateur connecté
export function getMe(): Promise<UserData> {
  return apiClient.get<UserData>('/users/me/')
}

export function updateMe(data: UpdateUserData): Promise<UserData> {
  return apiClient.patch<UserData>('/users/me/', data)
}

export function getPlatformStats(): Promise<PlatformStats> {
  return apiClient.get<PlatformStats>('/users/stats/')
}

// Profil candidat
export function getCandidateProfile(): Promise<CandidateProfile> {
  return apiClient.get<CandidateProfile>('/users/candidates/me/')
}

export function updateCandidateProfile(data: UpdateCandidateProfileData): Promise<CandidateProfile> {
  return apiClient.patch<CandidateProfile>('/users/candidates/me/', data)
}

// Compétences, expériences et formations du candidat
export async function getSkills(): Promise<CandidateSkill[]> {
  return unwrapList(await apiClient.get<CandidateSkill[] | Paginated<CandidateSkill>>('/users/skills/'))
}

export function addSkill(data: { nom: string; niveau: SkillLevel; annees_experience?: number | null }): Promise<CandidateSkill> {
  return apiClient.post<CandidateSkill>('/users/skills/', data)
}

export function deleteSkill(id: string): Promise<void> {
  return apiClient.delete(`/users/skills/${id}/`)
}

export function addExperience(data: Omit<WorkExperience, 'id' | 'duree_mois'>): Promise<WorkExperience> {
  return apiClient.post<WorkExperience>('/users/experiences/', data)
}

export function deleteExperience(id: string): Promise<void> {
  return apiClient.delete(`/users/experiences/${id}/`)
}

export function addEducation(data: Omit<Education, 'id'>): Promise<Education> {
  return apiClient.post<Education>('/users/formations/', data)
}

export function deleteEducation(id: string): Promise<void> {
  return apiClient.delete(`/users/formations/${id}/`)
}

// ─── Suggestions IA extraites du CV (lecture seule) ─────────────────────────

export type SuggestedField =
  | 'telephone'
  | 'date_naissance'
  | 'adresse'
  | 'ville'
  | 'linkedin'
  | 'github'
  | 'portfolio'
  | 'biographie'

/** Formation = diplôme ou certificat, établissement et date d'obtention (mois + année). */
export interface SuggestedEducation {
  diplome: string
  etablissement: string
  annee: number | null
  /** 1 à 12, ou null si le CV ne l'indique pas (le candidat doit alors le choisir). */
  mois: number | null
}

export interface CVSuggestions {
  cv: { id: number; file_name: string; analyzed_at: string } | null
  informations: { champ: SuggestedField; label: string; valeur: string; valeur_actuelle: string | null }[]
  competences: { nom: string; categorie: string | null; niveau: SkillLevel; annees_experience: number | null }[]
  experiences: Omit<WorkExperience, 'id' | 'duree_mois'>[]
  formations: SuggestedEducation[]
}

/** Date d'obtention stockée dans `date_fin` (1er du mois). */
export function obtentionDate(annee: number, mois: number): string {
  return `${annee}-${String(mois).padStart(2, '0')}-01`
}

/** Propositions de l'IA : rien n'est enregistré tant que le candidat ne les valide pas. */
export function getCVSuggestions(): Promise<CVSuggestions> {
  return apiClient.get<CVSuggestions>('/users/candidates/me/cv-suggestions/')
}

// Profil entreprise
export function getCompanyProfile(): Promise<CompanyProfile> {
  return apiClient.get<CompanyProfile>('/companies/me/')
}

export function updateCompanyProfile(
  data: UpdateCompanyProfileData,
  documentRccm?: File | null,
): Promise<CompanyProfile> {
  if (!documentRccm) return apiClient.patch<CompanyProfile>('/companies/me/', data)
  const form = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, String(value))
  })
  form.append('document_rccm', documentRccm)
  return apiClient.patch<CompanyProfile>('/companies/me/', form)
}

/**
 * Ouvre un PDF protégé dans un nouvel onglet. L'onglet est créé immédiatement (dans le clic)
 * pour ne pas être bloqué par le navigateur, puis reçoit le fichier une fois téléchargé.
 */
export async function openProtectedPdf(endpoint: string): Promise<void> {
  const tab = window.open('', '_blank')
  try {
    const blob = await apiClient.getBlob(endpoint)
    const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
    if (tab) tab.location.href = url
    else window.location.assign(url)
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (error) {
    tab?.close()
    throw error
  }
}

export const MY_RCCM_DOCUMENT_ENDPOINT = '/companies/me/document-rccm/'
export const companyRccmDocumentEndpoint = (id: string) => `/companies/${id}/document-rccm/`

// Vérification des entreprises (administrateur)
export function getCompaniesForReview(
  statut: CompanyVerificationStatus | 'ALL' = 'PENDING',
): Promise<{ counts: Record<CompanyVerificationStatus, number>; results: CompanyForReview[] }> {
  return apiClient.get(`/companies/verification/?statut=${statut}`)
}

export function approveCompany(id: string): Promise<CompanyForReview> {
  return apiClient.post<CompanyForReview>(`/companies/${id}/approve/`, {})
}

export function rejectCompany(id: string, motif: string): Promise<CompanyForReview> {
  return apiClient.post<CompanyForReview>(`/companies/${id}/reject/`, { motif })
}
