/**
 * Services CV et analyse IA.
 */

import { apiClient, unwrapList, type Paginated } from './apiClient'

export interface CV {
  id: number
  candidate: string
  file: string
  file_name: string
  file_size: number
  file_type: string
  is_processed: boolean
  analysis_id: number | null
  analysis_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | null
  employability_score: number | null
  uploaded_at: string
  updated_at: string
}

export interface DetectedSkill {
  id: number
  name: string
  category: string | null
  proficiency_level: string | null
  years_experience: number | null
}

export interface MissingSkill {
  id: number
  name: string
  importance: 'high' | 'medium' | 'low' | null
}

export interface CVRecommendation {
  id: number
  category: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

export interface CVAnalysis {
  id: number
  cv: CV
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  error_message: string
  employability_score: number
  score_details: {
    competences?: number
    experience?: number
    formation?: number
    structure?: number
    coordonnees?: number
    sections?: string[]
    word_count?: number
  }
  summary: string
  experience_years: number | null
  education_level: string | null
  strengths: string[]
  weaknesses: string[]
  analyzed_at: string
  updated_at: string
  detected_skills: DetectedSkill[]
  missing_skills: MissingSkill[]
  recommendations: CVRecommendation[]
}

export const SCORE_DETAIL_LABELS: Record<string, string> = {
  competences: 'Compétences',
  experience: 'Expérience',
  formation: 'Formation',
  structure: 'Structure du CV',
  coordonnees: 'Coordonnées',
}

export const PROFICIENCY_LABELS: Record<string, string> = {
  DEBUTANT: 'Débutant',
  INTERMEDIAIRE: 'Intermédiaire',
  AVANCE: 'Avancé',
  EXPERT: 'Expert',
}

export async function uploadCV(file: File): Promise<CV> {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient.post<CV>('/cv-analysis/cvs/', formData)
}

export async function getMyCVs(): Promise<CV[]> {
  return unwrapList(await apiClient.get<CV[] | Paginated<CV>>('/cv-analysis/cvs/'))
}

export function getCV(id: number): Promise<CV> {
  return apiClient.get<CV>(`/cv-analysis/cvs/${id}/`)
}

export function deleteCV(id: number): Promise<void> {
  return apiClient.delete(`/cv-analysis/cvs/${id}/`)
}

export function analyzeCV(cvId: number): Promise<CVAnalysis> {
  return apiClient.post<CVAnalysis>(`/cv-analysis/cvs/${cvId}/analyze/`)
}

export function getAnalysis(analysisId: number | string): Promise<CVAnalysis> {
  return apiClient.get<CVAnalysis>(`/cv-analysis/analyses/${analysisId}/`)
}

/** Dernière analyse du candidat, ou null s'il n'a encore déposé aucun CV. */
export async function getLatestAnalysis(): Promise<CVAnalysis | null> {
  return (await apiClient.get<CVAnalysis | undefined>('/cv-analysis/cvs/latest/')) ?? null
}

export async function getAllAnalyses(): Promise<CVAnalysis[]> {
  return unwrapList(await apiClient.get<CVAnalysis[] | Paginated<CVAnalysis>>('/cv-analysis/analyses/'))
}
