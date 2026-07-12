import type { Score } from './score'

export type CVAnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed'

/**
 * AI analysis result for an uploaded CV.
 */
export interface CVAnalysis {
  id: string
  candidateId: string
  cvFileName: string
  cvFileUrl: string
  status: CVAnalysisStatus
  score?: Score
  summary?: string
  strengths: string[]
  weaknesses: string[]
  analyzedAt?: string
  createdAt: string
  updatedAt: string
}
