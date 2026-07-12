import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'
import { focusRing } from './styles'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, disabled, id, ...props }, ref) => {
    const inputId = id ?? (label ? `switch-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'group inline-flex cursor-pointer items-center gap-2.5',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          disabled={disabled}
          className={cn('peer sr-only', focusRing)}
          {...props}
        />
        <span
          className={cn(
            'relative inline-flex h-6 w-11 rounded-full border border-border bg-background transition-colors duration-200',
            'group-hover:border-primary/40',
            'peer-checked:border-secondary peer-checked:bg-secondary',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
          )}
          aria-hidden
        >
          <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition-transform duration-200 group-has-[:checked]:translate-x-5" />
        </span>
        {label && <span className="text-sm text-foreground select-none">{label}</span>}
      </label>
    )
  },
)

Switch.displayName = 'Switch'
