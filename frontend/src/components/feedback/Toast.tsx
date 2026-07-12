import { X } from 'lucide-react'
import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { cva, type VariantProps } from 'class-variance-authority'

const toastVariants = cva(
  'flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg animate-slide-in-right transition-opacity',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface text-foreground',
        success: 'border-secondary/30 bg-secondary-light text-foreground',
        warning: 'border-accent/30 bg-accent-light text-foreground',
        error: 'border-error/30 bg-error/10 text-foreground',
        info: 'border-primary/30 bg-primary-light text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface ToastProps extends VariantProps<typeof toastVariants> {
  title: string
  message?: string
  onClose?: () => void
  icon?: ReactNode
  className?: string
}

export function Toast({ title, message, onClose, icon, variant, className }: ToastProps) {
  return (
    <div className={cn(toastVariants({ variant }), className)} role="alert" aria-live="assertive">
      {icon && <div className="shrink-0">{icon}</div>}
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {message && <p className="mt-0.5 text-sm text-muted">{message}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-0.5 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Fermer la notification"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
