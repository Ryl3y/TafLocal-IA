import { type TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'
import { disabledState } from './styles'

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
          'w-full resize-y rounded-lg border bg-field px-4 py-3 text-sm leading-6 text-foreground placeholder:text-muted',
          'focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-4',
          disabledState,
          'transition-colors duration-200',
          hasError
            ? 'border-error focus-visible:ring-error/20'
            : 'border-transparent focus-visible:border-primary focus-visible:ring-primary/10',
          className,
        )}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'
