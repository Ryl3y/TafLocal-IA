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
      <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-2xl space-y-1.5">
          {eyebrow && <p className="text-sm text-muted">{eyebrow}</p>}
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">{title}</h1>
          {description && <p className="max-w-xl pt-1 text-sm leading-6 text-muted">{description}</p>}
        </div>
        {actions && (
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:shrink-0 sm:flex-row sm:flex-wrap sm:justify-end">{actions}</div>
        )}
      </div>
      {children}
    </motion.div>
  )
}
