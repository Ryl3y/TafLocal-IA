import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface PageShellProps {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function PageShell({
  title,
  description,
  eyebrow,
  actions,
  children,
  className,
}: PageShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('space-y-6', className)}
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-gradient-to-r from-primary-light/50 to-surface p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          {eyebrow && <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>}
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          {description && <p className="text-sm leading-6 text-muted sm:text-base">{description}</p>}
        </div>
        {actions && (
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">{actions}</div>
        )}
      </div>
      {children}
    </motion.div>
  )
}
