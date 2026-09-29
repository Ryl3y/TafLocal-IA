import { cn } from '../../utils/cn'

export interface FilterChipsProps {
  label: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
  className?: string
}

/**
 * Groupe de pastilles à choix unique (écran « Job Preferences » du kit).
 */
export function FilterChips({ label, value, options, onChange, className }: FilterChipsProps) {
  return (
    <fieldset className={cn('space-y-3', className)}>
      <legend className="mb-3 text-sm font-semibold text-foreground">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value || 'all'}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                'rounded-full border px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface text-muted hover:border-primary/40 hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
