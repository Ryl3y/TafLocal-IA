import { Check } from 'lucide-react'
import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, disabled, id, ...props }, ref) => {
    const inputId =
      id ?? (label ? `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)

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
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <span
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded border border-border bg-surface transition-colors duration-200',
            'group-hover:border-primary/50',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2',
            'peer-checked:border-primary peer-checked:bg-primary',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
          )}
          aria-hidden
        >
          <Check className="h-3.5 w-3.5 text-primary-foreground opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
        </span>
        {label && <span className="text-sm text-foreground select-none">{label}</span>}
      </label>
    )
  },
)

Checkbox.displayName = 'Checkbox'
