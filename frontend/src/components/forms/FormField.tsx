import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface FormFieldProps {
  label?: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
          {label}
          {required && (
            <span className="ml-0.5 text-error" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function FormGroup({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('flex flex-col gap-4', className)}>{children}</div>
}

export function FormRow({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('grid gap-4 sm:grid-cols-2', className)}>{children}</div>
}
