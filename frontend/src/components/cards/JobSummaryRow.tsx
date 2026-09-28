import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { CompanyLogo } from '../ui/CompanyLogo'

export interface JobSummaryRowProps {
  title: string
  company: string
  logo?: string | null
  salary?: string
  location?: string
  /** Contenu libre affiché à droite à la place du salaire / lieu (ex. badge de statut). */
  aside?: ReactNode
  className?: string
}

/**
 * Ligne compacte « logo · poste / entreprise · salaire / lieu » des écrans Apply, Confirmation et Suivi.
 */
export function JobSummaryRow({ title, company, logo, salary, location, aside, className }: JobSummaryRowProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <CompanyLogo name={company} src={logo} className="rounded-full" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        <p className="truncate text-xs text-muted">{company}</p>
      </div>
      {aside ?? (
        <div className="shrink-0 text-right">
          {salary && <p className="text-sm font-medium text-foreground">{salary}</p>}
          {location && <p className="text-xs text-muted">{location}</p>}
        </div>
      )}
    </div>
  )
}
