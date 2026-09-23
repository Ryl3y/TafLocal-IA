/**
 * Services de simulation d'entretien (moteur IA interne).
 */

import { apiClient, buildQuery, unwrapList, type Paginated } from './apiClient'
import type { Job } from './jobsService'

export type InterviewType = 'MIXED' | 'TECHNICAL' | 'BEHAVIORAL' | 'HR'

export interface AnswerEvaluation {
  score: number
  criteres: Record<string, number>
  points_forts: string[]
  axes_amelioration: string[]
  commentaire: string
  mots_cles_trouves: string[]
  mots_cles_manquants: string[]
}

export interface InterviewQuestion {
  id: string
  session: string
  question: string
  type_question: string
  categorie: 'RH' | 'COMPORTEMENTAL' | 'TECHNIQUE' | null
  competence: string | null
  reponse: string | null
  score: string | number | null
  evaluation: AnswerEvaluation | Record<string, never>
  ordre: number
}

export interface InterviewFeedback {
  id: string
  score_global: string | number | null
  points_forts: string[]
  points_faibles: string[]
  conseils: string[]
  scores_par_categorie: Record<string, number>
  date_feedback: string
}

export interface InterviewSession {
  id: string
  candidate: string
  candidat_nom: string
  offre: Job | null
  date_session: string | null
  type_entretien: InterviewType
  type_entretien_display: string
  duree: number | null
  score_global: string | number | null
  statut: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED'
  statut_display: string
  progression: { repondues: number; total: number }
  questions: InterviewQuestion[]
  feedback: InterviewFeedback | null
  created_at: string
}

export const INTERVIEW_TYPES: { value: InterviewType; label: string; description: string }[] = [
  { value: 'MIXED', label: 'Mixte', description: 'Motivation, questions techniques et comportementales.' },
  { value: 'TECHNICAL', label: 'Technique', description: 'Centré sur les compétences exigées par le poste.' },
  { value: 'BEHAVIORAL', label: 'Comportemental', description: 'Mises en situation (méthode STAR).' },
  { value: 'HR', label: 'RH', description: 'Motivation, projet professionnel, prétentions.' },
]

export const CATEGORY_LABELS: Record<string, string> = {
  RH: 'Motivation',
  COMPORTEMENTAL: 'Comportemental',
  TECHNIQUE: 'Technique',
  AUTRE: 'Autre',
}

export function createInterviewSession(data: {
  offre?: string | null
  type_entretien?: InterviewType
  nombre_questions?: number
}): Promise<InterviewSession> {
  return apiClient.post<InterviewSession>('/interviews/sessions/', data)
}

export async function getInterviewSessions(filters?: { statut?: string }): Promise<InterviewSession[]> {
  return unwrapList(
    await apiClient.get<InterviewSession[] | Paginated<InterviewSession>>(`/interviews/sessions/${buildQuery(filters)}`),
  )
}

export function getInterviewSession(id: string): Promise<InterviewSession> {
  return apiClient.get<InterviewSession>(`/interviews/sessions/${id}/`)
}

export function startInterviewSession(id: string): Promise<InterviewSession> {
  return apiClient.post<InterviewSession>(`/interviews/sessions/${id}/start/`)
}

export function submitAnswer(sessionId: string, questionId: string, reponse: string): Promise<InterviewQuestion> {
  return apiClient.post<InterviewQuestion>(`/interviews/sessions/${sessionId}/answer/`, {
    question_id: questionId,
    reponse,
  })
}

export function completeInterviewSession(id: string): Promise<InterviewFeedback> {
  return apiClient.post<InterviewFeedback>(`/interviews/sessions/${id}/complete/`)
}

export function deleteInterviewSession(id: string): Promise<void> {
  return apiClient.delete(`/interviews/sessions/${id}/`)
}
