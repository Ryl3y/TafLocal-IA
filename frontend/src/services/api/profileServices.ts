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
  created_at: string
  updated_at: string
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

// Profil entreprise
export function getCompanyProfile(): Promise<CompanyProfile> {
  return apiClient.get<CompanyProfile>('/companies/me/')
}

export function updateCompanyProfile(data: UpdateCompanyProfileData): Promise<CompanyProfile> {
  return apiClient.patch<CompanyProfile>('/companies/me/', data)
}
