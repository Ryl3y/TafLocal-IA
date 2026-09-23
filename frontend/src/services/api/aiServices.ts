/**
 * Services du moteur IA interne (aucune API externe).
 */

import { apiClient, buildQuery } from './apiClient'

export interface SkillSuggestion {
  nom: string
  categorie: string | null
  occurrences?: number
}

export interface CoverLetterResponse {
  job_id: string
  contenu: string
  generated_by_ai: boolean
}

export interface EngineStatus {
  status: string
  engine: string
  version: string
  external_api: boolean
  skills_in_catalog: number
  features: string[]
}

export function generateCoverLetter(jobId: string): Promise<CoverLetterResponse> {
  return apiClient.post<CoverLetterResponse>('/ai/cover_letter/', { job_id: jobId })
}

export async function extractSkills(text: string): Promise<SkillSuggestion[]> {
  const response = await apiClient.post<{ competences: SkillSuggestion[] }>('/ai/extract_skills/', { text })
  return response.competences
}

export async function searchSkills(search: string): Promise<SkillSuggestion[]> {
  const response = await apiClient.get<{ results: SkillSuggestion[] }>(`/ai/skills/${buildQuery({ search })}`)
  return response.results
}

export function getEngineStatus(): Promise<EngineStatus> {
  return apiClient.get<EngineStatus>('/ai/health/')
}
