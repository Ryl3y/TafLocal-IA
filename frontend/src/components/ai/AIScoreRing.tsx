import { cn } from '../../utils/cn'

export interface AIScoreRingProps {
  score: number
  maxScore?: number
  size?: number
  strokeWidth?: number
  label?: string
  isLoading?: boolean
  className?: string
}

export function AIScoreRing({
  score,
  maxScore = 100,
  size = 120,
  strokeWidth = 8,
  label = 'Score IA',
  isLoading = false,
  className,
}: AIScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percentage = isLoading ? 0 : Math.min(100, Math.max(0, (score / maxScore) * 100))
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div
      className={cn('relative inline-flex flex-col items-center', className)}
      role="img"
      aria-label={isLoading ? 'Calcul du score en cours' : `${label} : ${Math.round(percentage)}%`}
      aria-busy={isLoading}
    >
      <svg width={size} height={size} className={cn('-rotate-90', isLoading && 'animate-pulse-soft')}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-background"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">
          {isLoading ? '…' : `${Math.round(percentage)}%`}
        </span>
        <span className="text-xs text-muted">{label}</span>
      </div>
    </div>
  )
}
