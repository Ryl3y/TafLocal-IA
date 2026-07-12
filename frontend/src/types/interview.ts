import type { Candidate } from './candidate'
import type { Job } from './job'

export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

/**
 * AI-powered interview simulation session.
 */
export interface Interview {
  id: string
  candidateId: string
  candidate?: Candidate
  jobId?: string
  job?: Job
  status: InterviewStatus
  startedAt?: string
  completedAt?: string
  durationMinutes?: number
  transcriptUrl?: string
  createdAt: string
  updatedAt: string
}
