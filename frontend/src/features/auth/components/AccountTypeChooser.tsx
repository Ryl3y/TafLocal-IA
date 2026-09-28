import { ArrowRight, Building2, Check, UserRound, type LucideIcon } from 'lucide-react'
import { cn } from '../../../utils/cn'

export type AccountType = 'candidat' | 'entreprise'

const OPTIONS: {
  value: AccountType
  icon: LucideIcon
  title: string
  subtitle: string
  points: string[]
  tone: string
}[] = [
  {
    value: 'candidat',
    icon: UserRound,
    title: 'Je cherche un emploi',
    subtitle: 'Compte candidat',
    points: [
      'Analyse IA de votre CV',
      'Offres adaptées à votre profil',
      'Préparation aux entretiens',
    ],
    tone: 'bg-pastel-blue text-primary',
  },
  {
    value: 'entreprise',
    icon: Building2,
    title: 'Je recrute',
    subtitle: 'Compte entreprise / recruteur',
    points: ['Publication d’offres', 'Candidatures classées par l’IA', 'Compte vérifié (RCCM)'],
    tone: 'bg-pastel-mint text-secondary',
  },
]

/**
 * Première étape de l'inscription : choisir le type de compte avant tout formulaire.
 */
export function AccountTypeChooser({ onChoose }: { onChoose: (type: AccountType) => void }) {
  return (
    <div className="space-y-3" role="list" aria-label="Type de compte">
      {OPTIONS.map(({ value, icon: Icon, title, subtitle, points, tone }) => (
        <button
          key={value}
          type="button"
          role="listitem"
          onClick={() => onChoose(value)}
          className="group flex w-full items-start gap-4 rounded-2xl border-2 border-border bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:border-primary focus-visible:outline-none"
        >
          <span
            className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', tone)}
          >
            <Icon className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold text-foreground">{title}</span>
            <span className="block text-xs text-muted">{subtitle}</span>
            <span className="mt-2 flex flex-col gap-1">
              {points.map((point) => (
                <span key={point} className="inline-flex items-center gap-1.5 text-xs text-muted">
                  <Check className="h-3.5 w-3.5 text-secondary" /> {point}
                </span>
              ))}
            </span>
          </span>
          <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </button>
      ))}
    </div>
  )
}
