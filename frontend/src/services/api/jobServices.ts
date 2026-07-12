/**
 * Job services for TafLocal AI backend.
 */

import { apiClient } from './apiClient'

export interface Job {
  id: number
  title: string
  description: string
  requirements: string
  responsibilities: string
  benefits: string
  location: string
  remote: boolean
  employment_type: string
  employment_type_display: string
  experience_level: string
  experience_level_display: string
  salary_min: number
  salary_max: number
  salary_currency: string
  skills_required: string[]
  vacancy_count: number
  views_count: number
  is_active: boolean
  is_archived: boolean
  published_at: string
  expires_at: string
  company_name: string
  company_logo?: string
}

export interface JobSummary {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  match: number
  summary: string
  tags: string[]
}

export async function getJobs(params?: {
  search?: string
  location?: string
  employment_type?: string
  experience_level?: string
}): Promise<Job[]> {
  const queryParams = new URLSearchParams()
  if (params?.search) queryParams.append('search', params.search)
  if (params?.location) queryParams.append('location', params.location)
  if (params?.employment_type) queryParams.append('employment_type', params.employment_type)
  if (params?.experience_level) queryParams.append('experience_level', params.experience_level)
  
  const queryString = queryParams.toString()
  const endpoint = queryString ? `/jobs/?${queryString}` : '/jobs/'
  
  return apiClient.get<Job[]>(endpoint)
}

export async function getJob(id: number): Promise<Job> {
  return apiClient.get<Job>(`/jobs/${id}/`)
}

export async function getRecommendedJobs(candidateId?: number, limit: number = 10): Promise<JobSummary[]> {
  const queryParams = new URLSearchParams()
  if (candidateId) queryParams.append('candidate_id', candidateId.toString())
  queryParams.append('limit', limit.toString())
  
  const queryString = queryParams.toString()
  const endpoint = queryString ? `/ai/job_recommendations/?${queryString}` : '/ai/job_recommendations/'
  
  const recommendations = await apiClient.get<any[]>(endpoint)
  
  // Transform backend recommendations to frontend format
  return recommendations.map((rec: any) => ({
    id: rec.job_id.toString(),
    title: rec.title,
    company: rec.company,
    location: 'Remote', // Default if not provided
    type: 'CDI', // Default if not provided
    salary: 'Competitive', // Default if not provided
    match: rec.compatibility_score || 0,
    summary: rec.match_reason || 'No description available',
    tags: [], // Skills not provided in current response
  }))
}

export async function applyForJob(jobId: number, coverLetter?: string): Promise<void> {
  return apiClient.post('/applications/', {
    job: jobId,
    cover_letter: coverLetter || '',
  })
}

export async function getMyApplications(): Promise<any[]> {
  return apiClient.get<any[]>('/applications/')
}

export async function withdrawApplication(applicationId: number): Promise<void> {
  return apiClient.post(`/applications/${applicationId}/withdraw/`)
}
