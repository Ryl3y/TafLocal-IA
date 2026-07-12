import { type TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'
import { disabledState, focusRing } from './styles'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError = false, disabled, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={cn(
          'w-full resize-y rounded-lg border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted',
          focusRing,
          disabledState,
          'transition-colors duration-200 hover:border-primary/30',
          hasError
            ? 'border-error focus-visible:ring-error/40'
            : 'border-border focus-visible:ring-primary/40',
          className,
        )}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'
