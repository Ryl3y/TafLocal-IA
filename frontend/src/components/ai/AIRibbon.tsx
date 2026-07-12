import { Sparkles } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface AIRibbonProps {
  label?: string
  className?: string
}

export function AIRibbon({ label = 'Propulsé par IA', className }: AIRibbonProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm',
        className,
      )}
    >
      <Sparkles className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  )
}
