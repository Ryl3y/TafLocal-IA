export type RecommendationCategory =
  | 'skills'
  | 'experience'
  | 'education'
  | 'presentation'
  | 'market'
  | 'interview'

export type RecommendationPriority = 'low' | 'medium' | 'high'

/**
 * AI-generated recommendation to improve employability.
 */
export interface AIRecommendation {
  id: string
  analysisId: string
  category: RecommendationCategory
  priority: RecommendationPriority
  title: string
  description: string
  actionItems: string[]
  createdAt: string
}
