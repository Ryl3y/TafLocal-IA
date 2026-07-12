import type { Candidate } from './candidate'
import type { Job } from './job'

export type ApplicationStatus =
  | 'pending'
  | 'reviewed'
  | 'shortlisted'
  | 'rejected'
  | 'withdrawn'

/**
 * Application submitted by a candidate for a job offer.
 */
export interface Application {
  id: string
  jobId: string
  job?: Job
  candidateId: string
  candidate?: Candidate
  coverLetter?: string
  status: ApplicationStatus
  submittedAt: string
  updatedAt: string
}
