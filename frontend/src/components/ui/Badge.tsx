import { type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { badgeVariants } from './variants'
import type { VariantProps } from 'class-variance-authority'

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  )
}
