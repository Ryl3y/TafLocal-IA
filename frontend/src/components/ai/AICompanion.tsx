import { Bot, MessageCircle } from 'lucide-react'
import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Badge } from '../ui/Badge'

export interface AICompanionProps {
  name?: string
  status?: 'online' | 'thinking' | 'offline'
  message?: string
  children?: ReactNode
  className?: string
}

const statusConfig = {
  online: { label: 'En ligne', variant: 'success' as const },
  thinking: { label: 'Réflexion…', variant: 'accent' as const },
  offline: { label: 'Hors ligne', variant: 'outline' as const },
}

export function AICompanion({
  name = 'Assistant TafLocal',
  status = 'online',
  message,
  children,
  className,
}: AICompanionProps) {
  const { label, variant } = statusConfig[status]

  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border border-primary/20 bg-primary-light/50 p-4 transition-colors hover:border-primary/30',
        className,
      )}
    >
      <div className="relative shrink-0">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground ring-2 ring-border">
          {name.slice(0, 2).toUpperCase()}
        </span>
        <span className="absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-secondary-foreground ring-2 ring-surface">
          <Bot className="h-3 w-3" aria-hidden />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">{name}</span>
          <Badge variant={variant}>{label}</Badge>
        </div>
        {message && (
          <p className="mt-1 flex items-start gap-1.5 text-sm text-muted">
            <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            {message}
          </p>
        )}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  )
}
