import { cn } from '../../utils/cn'
import { ProgressBar } from '../ui/ProgressBar'

export interface MatchCriterion {
  label: string
  score: number
  description?: string
}

export interface MatchExplanationProps {
  overallScore: number
  criteria: MatchCriterion[]
  summary?: string
  isLoading?: boolean
  className?: string
}

export function MatchExplanation({
  overallScore,
  criteria,
  summary,
  isLoading = false,
  className,
}: MatchExplanationProps) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-surface p-6 shadow-sm', className)}
      aria-busy={isLoading}
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Compatibilité avec l&apos;offre</h3>
        <span className="text-2xl font-bold text-primary">
          {isLoading ? '…' : `${overallScore}%`}
        </span>
      </div>

      {summary && <p className="mb-6 text-sm text-muted">{summary}</p>}

      <div className="space-y-4">
        {criteria.map((criterion) => (
          <div key={criterion.label}>
            <ProgressBar
              value={criterion.score}
              label={criterion.label}
              showValue
              variant="secondary"
              isLoading={isLoading}
            />
            {criterion.description && (
              <p className="mt-1 text-xs text-muted">{criterion.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
