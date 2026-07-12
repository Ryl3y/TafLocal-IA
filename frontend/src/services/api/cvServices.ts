/**
 * CV services for TafLocal AI backend.
 */

import { apiClient } from './apiClient'

export interface CV {
  id: number
  candidate: string // UUID of CandidateProfile
  file: string
  file_name: string
  file_size: number
  file_type: string
  extracted_text: string | null
  is_processed: boolean
  uploaded_at: string
  updated_at: string
  candidate_name?: string
}

export interface CVAnalysis {
  id: number
  cv: CV
  employability_score: number
  strengths: string[]
  weaknesses: string[]
  recommendations_data: any[]
  analyzed_at: string
  updated_at: string
}

export async function uploadCV(file: File): Promise<CV> {
  const formData = new FormData()
  formData.append('file', file)
  
  return apiClient.post<CV>('/cv-analysis/cvs/', formData)
}

export async function getMyCVs(): Promise<CV[]> {
  return apiClient.get<CV[]>('/cv-analysis/cvs/')
}

export async function getCV(id: number): Promise<CV> {
  return apiClient.get<CV>(`/cv-analysis/cvs/${id}/`)
}

export async function deleteCV(id: number): Promise<void> {
  return apiClient.delete(`/cv-analysis/cvs/${id}/`)
}

export async function analyzeCV(cvId: number): Promise<CVAnalysis> {
  return apiClient.post<CVAnalysis>(`/cv-analysis/cvs/${cvId}/analyze/`)
}

export async function getCVAnalysis(cvId: number): Promise<CVAnalysis[]> {
  return apiClient.get<CVAnalysis[]>(`/cv-analysis/analyses/?cv=${cvId}`)
}

export async function getAllAnalyses(): Promise<CVAnalysis[]> {
  return apiClient.get<CVAnalysis[]>('/cv-analysis/analyses/')
}
