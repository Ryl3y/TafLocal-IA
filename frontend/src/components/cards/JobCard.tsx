import { Briefcase, MapPin } from 'lucide-react'
import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './Card'

export interface JobCardProps {
  title: string
  company: string
  location: string
  contractType?: string
  compatibilityScore?: number
  salary?: string
  tags?: string[]
  onView?: () => void
  onApply?: () => void
  isLoading?: boolean
  className?: string
  footer?: ReactNode
}

export function JobCard({
  title,
  company,
  location,
  contractType,
  compatibilityScore,
  salary,
  tags = [],
  onView,
  onApply,
  isLoading = false,
  className,
  footer,
}: JobCardProps) {
  return (
    <Card
      hoverable
      className={cn('transition-colors hover:border-primary/30', isLoading && 'opacity-70', className)}
      aria-busy={isLoading}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
              <Briefcase className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <p className="text-sm font-medium text-primary">{company}</p>
            </div>
          </div>
          {compatibilityScore !== undefined && (
            <Badge variant="secondary">{compatibilityScore}% match</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {location}
          </span>
          {contractType && <Badge variant="outline">{contractType}</Badge>}
          {salary && <span className="font-medium text-foreground">{salary}</span>}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        {footer ?? (
          <>
            <Button variant="outline" size="sm" onClick={onView} disabled={isLoading}>
              Voir l&apos;offre
            </Button>
            <Button variant="primary" size="sm" onClick={onApply} isLoading={isLoading}>
              Postuler
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
