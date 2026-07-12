/**
 * Profile services for TafLocal AI backend.
 */

import { apiClient } from './apiClient'

export interface CandidateProfile {
  id: string
  date_naissance?: string
  genre?: string
  adresse?: string
  ville?: string
  photo?: string
  biographie?: string
  linkedin?: string
  github?: string
  portfolio?: string
  created_at: string
  updated_at: string
}

export interface CompanyProfile {
  id: string
  nom_entreprise: string
  secteur?: string
  description?: string
  site_web?: string
  adresse?: string
  ville?: string
  telephone?: string
  logo?: string
  verified: boolean
  created_at: string
  updated_at: string
}

export interface UpdateCandidateProfileData {
  date_naissance?: string
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

// User profile endpoints
export async function getMe(): Promise<any> {
  return apiClient.get('/users/me/')
}

export async function updateMe(data: UpdateUserData): Promise<any> {
  return apiClient.patch('/users/me/', data)
}

// Candidate profile endpoints
export async function getCandidateProfile(): Promise<CandidateProfile> {
  return apiClient.get('/users/candidates/me/')
}

export async function updateCandidateProfile(data: UpdateCandidateProfileData): Promise<CandidateProfile> {
  return apiClient.patch('/users/candidates/me/', data)
}

// Company profile endpoints
export async function getCompanyProfile(): Promise<CompanyProfile> {
  return apiClient.get('/companies/me/')
}

export async function updateCompanyProfile(data: UpdateCompanyProfileData): Promise<CompanyProfile> {
  return apiClient.patch('/companies/me/', data)
}
