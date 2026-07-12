/**
 * Interview services for TafLocal AI backend.
 */

import { apiClient } from './apiClient'

export interface InterviewSession {
  id: number
  candidate: number
  job: number
  status: string
  scheduled_at: string
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface InterviewQuestion {
  id: number
  session: number
  question_text: string
  question_type: string
  category: string
  order: number
}

export interface InterviewAnswer {
  id: number
  question: number
  answer_text: string
  answered_at: string
}

export interface InterviewFeedback {
  id: number
  session: number
  communication_score: number
  technical_score: number
  problem_solving_score: number
  cultural_fit_score: number
  overall_score: number
  strengths: string[]
  areas_for_improvement: string[]
  detailed_feedback: string
  recommendation: string
  created_at: string
}

export async function createInterviewSession(jobId: number): Promise<InterviewSession> {
  return apiClient.post<InterviewSession>('/interviews/sessions/', {
    job: jobId,
  })
}

export async function getInterviewSessions(): Promise<InterviewSession[]> {
  return apiClient.get<InterviewSession[]>('/interviews/sessions/')
}

export async function getInterviewSession(id: number): Promise<InterviewSession> {
  return apiClient.get<InterviewSession>(`/interviews/sessions/${id}/`)
}

export async function startInterviewSession(sessionId: number): Promise<InterviewSession> {
  return apiClient.post<InterviewSession>(`/interviews/sessions/${sessionId}/start/`)
}

export async function completeInterviewSession(sessionId: number): Promise<InterviewSession> {
  return apiClient.post<InterviewSession>(`/interviews/sessions/${sessionId}/complete/`)
}

export async function generateQuestions(sessionId: number): Promise<InterviewQuestion[]> {
  return apiClient.post<InterviewQuestion[]>(`/interviews/sessions/${sessionId}/generate_questions/`)
}

export async function getQuestions(sessionId: number): Promise<InterviewQuestion[]> {
  return apiClient.get<InterviewQuestion[]>(`/interviews/questions/?session=${sessionId}`)
}

export async function submitAnswer(questionId: number, answerText: string): Promise<InterviewAnswer> {
  return apiClient.post<InterviewAnswer>('/interviews/answers/', {
    question: questionId,
    answer_text: answerText,
  })
}

export async function getAnswers(sessionId: number): Promise<InterviewAnswer[]> {
  return apiClient.get<InterviewAnswer[]>(`/interviews/answers/?question__session=${sessionId}`)
}

export async function generateFeedback(sessionId: number): Promise<InterviewFeedback> {
  return apiClient.post<InterviewFeedback>(`/interviews/sessions/${sessionId}/generate_feedback/`)
}

export async function getFeedback(sessionId: number): Promise<InterviewFeedback> {
  return apiClient.get<InterviewFeedback>(`/interviews/sessions/${sessionId}/feedback/`)
}
