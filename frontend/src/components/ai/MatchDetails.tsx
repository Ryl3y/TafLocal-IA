import { MATCH_CRITERIA_LABELS, type MatchResult } from '../../services/api/jobsService'
import { cn } from '../../utils/cn'
import { Badge } from '../ui/Badge'
import { MatchExplanation } from './MatchExplanation'
import { scoreVariant } from './scoreVariant'

export interface MatchScoreBadgeProps {
  score: number
  label?: string
  className?: string
}

/** Badge « 82 % compatible » coloré selon le score. */
export function MatchScoreBadge({ score, label = 'compatible', className }: MatchScoreBadgeProps) {
  return (
    <Badge variant={scoreVariant(score)} className={className}>
      {score} % {label}
    </Badge>
  )
}

export interface MatchDetailsProps {
  match: MatchResult
  className?: string
  showRecommendations?: boolean
}

/** Détail explicable d'un score de compatibilité (critères + compétences). */
export function MatchDetails({ match, className, showRecommendations = true }: MatchDetailsProps) {
  const criteria = (Object.keys(MATCH_CRITERIA_LABELS) as (keyof MatchResult['details'])[])
    .filter((key) => match.details[key] !== null && match.details[key] !== undefined)
    .map((key) => ({ label: MATCH_CRITERIA_LABELS[key], score: match.details[key] as number }))

  return (
    <div className={cn('space-y-4', className)}>
      <MatchExplanation overallScore={match.score} summary={match.explanation} criteria={criteria} />

      {(match.matched_skills.length > 0 || match.missing_skills.length > 0) && (
        <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
          {match.matched_skills.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">Compétences correspondantes</p>
              <div className="flex flex-wrap gap-2">
                {match.matched_skills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
          {match.missing_skills.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">Compétences à développer</p>
              <div className="flex flex-wrap gap-2">
                {match.missing_skills.map((skill) => (
                  <Badge key={skill} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showRecommendations && match.recommendations && match.recommendations.length > 0 && (
        <ul className="list-inside list-disc space-y-1 rounded-xl border border-border bg-background p-4 text-sm text-muted">
          {match.recommendations.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      )}

      {match.data_quality === 'faible' && (
        <p className="text-xs text-muted">
          Score calculé avec peu d’informations : complétez votre profil (compétences, expériences, CV) pour un résultat plus fiable.
        </p>
      )}
    </div>
  )
}
