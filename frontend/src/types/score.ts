export type ScoreCategory =
  | 'overall'
  | 'skills'
  | 'experience'
  | 'education'
  | 'presentation'
  | 'market_fit'

/**
 * Employability score breakdown.
 */
export interface Score {
  overall: number
  categories: Partial<Record<ScoreCategory, number>>
  maxScore: number
  label?: string
  computedAt: string
}
