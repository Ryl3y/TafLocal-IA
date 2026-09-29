import { Bookmark, MapPin } from 'lucide-react'
import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { CompanyLogo } from '../ui/CompanyLogo'

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
  /** Carte pleine couleur « à la une » (bleu du kit), comme dans le carrousel de l'accueil. */
  featured?: boolean
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
  featured = false,
}: JobCardProps) {
  const pills = [contractType, ...tags].filter(Boolean) as string[]

  return (
    <article
      className={cn(
        'relative flex flex-col gap-4 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5',
        featured
          ? 'job-hero-pattern text-white shadow-lg'
          : 'border border-border/60 bg-surface shadow-sm hover:shadow-md',
        isLoading && 'opacity-70',
        className,
      )}
      aria-busy={isLoading}
    >
      <div className="flex items-start gap-3">
        <CompanyLogo name={company} className={featured ? 'bg-white' : undefined} />
        <div className="min-w-0 flex-1">
          <h3 className={cn('truncate text-base font-semibold', featured ? 'text-white' : 'text-foreground')}>
            {title}
          </h3>
          <p className={cn('truncate text-sm', featured ? 'text-white/75' : 'text-muted')}>{company}</p>
        </div>
        {compatibilityScore !== undefined ? (
          <span
            className={cn(
              'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
              featured ? 'bg-white/20 text-white' : 'bg-secondary-light text-secondary',
            )}
          >
            {compatibilityScore}%
          </span>
        ) : (
          <Bookmark className={cn('h-5 w-5 shrink-0', featured ? 'text-white/80' : 'text-muted')} aria-hidden />
        )}
      </div>

      {pills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pills.slice(0, 4).map((pill) => (
            <Badge key={pill} variant={featured ? 'glass' : 'default'}>
              {pill}
            </Badge>
          ))}
        </div>
      )}

      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-2 text-sm',
          featured ? 'text-white' : 'text-foreground',
        )}
      >
        <span className="font-semibold">{salary ?? 'Salaire non précisé'}</span>
        <span className={cn('inline-flex items-center gap-1', featured ? 'text-white/85' : 'text-muted')}>
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {location}
        </span>
      </div>

      {(footer || onView || onApply) && (
        <div className={cn('flex items-center gap-2 border-t pt-4', featured ? 'border-white/15' : 'border-border')}>
          {footer ?? (
            <>
              {onView && (
                <Button
                  variant={featured ? 'ghost' : 'outline'}
                  size="sm"
                  onClick={onView}
                  disabled={isLoading}
                  className={featured ? 'text-white hover:bg-white/10' : undefined}
                >
                  Voir l&apos;offre
                </Button>
              )}
              {onApply && (
                <Button
                  size="sm"
                  onClick={onApply}
                  isLoading={isLoading}
                  className={cn('ml-auto', featured && 'bg-white text-primary shadow-none hover:bg-white/90')}
                >
                  Postuler
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </article>
  )
}
