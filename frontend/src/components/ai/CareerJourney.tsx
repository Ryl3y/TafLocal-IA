import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface CareerStep {
  id: string
  title: string
  description?: string
  status: 'completed' | 'current' | 'upcoming'
}

export interface CareerJourneyProps {
  steps: CareerStep[]
  title?: string
  className?: string
}

export function CareerJourney({ steps, title = 'Parcours carrière', className }: CareerJourneyProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-surface p-6 shadow-sm', className)}>
      <h3 className="mb-6 text-lg font-semibold text-foreground">{title}</h3>
      <ol className="relative space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          const isCompleted = step.status === 'completed'
          const isCurrent = step.status === 'current'

          return (
            <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
              {!isLast && (
                <span
                  className={cn(
                    'absolute top-8 left-4 h-full w-0.5 -translate-x-1/2',
                    isCompleted ? 'bg-secondary' : 'bg-border',
                  )}
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                  isCompleted && 'border-secondary bg-secondary text-secondary-foreground',
                  isCurrent && 'border-primary bg-primary text-primary-foreground',
                  step.status === 'upcoming' && 'border-border bg-background text-muted',
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <div className="pt-0.5">
                <p
                  className={cn(
                    'font-medium',
                    isCurrent ? 'text-primary' : 'text-foreground',
                    step.status === 'upcoming' && 'text-muted',
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="mt-0.5 text-sm text-muted">{step.description}</p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
