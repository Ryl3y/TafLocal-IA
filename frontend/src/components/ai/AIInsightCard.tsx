import { Lightbulb } from 'lucide-react'
import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Badge } from '../ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../cards/Card'

export interface AIInsightCardProps {
  title: string
  insight: string
  category?: string
  priority?: 'low' | 'medium' | 'high'
  actionItems?: string[]
  footer?: ReactNode
  isLoading?: boolean
  className?: string
}

const priorityVariants = {
  low: 'outline' as const,
  medium: 'accent' as const,
  high: 'error' as const,
}

const priorityLabels = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Haute',
}

export function AIInsightCard({
  title,
  insight,
  category,
  priority = 'medium',
  actionItems = [],
  footer,
  isLoading = false,
  className,
}: AIInsightCardProps) {
  return (
    <Card
      hoverable
      className={cn(
        'border-primary/20 bg-gradient-to-br from-surface to-primary-light/30',
        isLoading && 'animate-pulse-soft opacity-70',
        className,
      )}
      aria-busy={isLoading}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Lightbulb className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {category && <CardDescription>{category}</CardDescription>}
            </div>
          </div>
          <Badge variant={priorityVariants[priority]}>{priorityLabels[priority]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-foreground">{insight}</p>
        {actionItems.length > 0 && (
          <ul className="space-y-1.5 border-t border-border pt-3">
            {actionItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        )}
        {footer}
      </CardContent>
    </Card>
  )
}
