import { cn } from '../../utils/cn'

export interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'accent'
  isLoading?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
} as const

const variantClasses = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-accent',
} as const

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  variant = 'primary',
  isLoading = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {showValue && (
            <span className="text-muted">{isLoading ? '…' : `${Math.round(percentage)}%`}</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={isLoading ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        aria-busy={isLoading}
        className={cn(
          'w-full overflow-hidden rounded-full bg-background',
          sizeClasses[size],
          isLoading && 'animate-pulse-soft',
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantClasses[variant],
            isLoading && 'w-1/3 animate-pulse-soft',
          )}
          style={isLoading ? undefined : { width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
