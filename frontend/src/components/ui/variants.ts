import { cva } from 'class-variance-authority'
import { disabledState, focusRing } from './styles'

export const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 rounded-lg font-medium ${focusRing} ${disabledState} transition-colors duration-200`,
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-hover',
        accent:
          'bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-hover',
        outline:
          'border border-border bg-surface text-foreground hover:bg-background active:bg-background',
        ghost: 'text-foreground hover:bg-background active:bg-background',
        danger: 'bg-error text-white hover:bg-error/90 active:bg-error/80',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
)

export const inputVariants = cva(
  `w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted ${focusRing} ${disabledState} transition-colors duration-200 hover:border-primary/30`,
  {
    variants: {
      inputSize: {
        sm: 'h-8 text-xs',
        md: 'h-10',
        lg: 'h-12 text-base',
      },
      hasError: {
        true: 'border-error focus-visible:ring-error/40 hover:border-error',
        false: '',
      },
    },
    defaultVariants: {
      inputSize: 'md',
      hasError: false,
    },
  },
)

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        primary: 'bg-primary-light text-primary',
        secondary: 'bg-secondary-light text-secondary',
        accent: 'bg-accent-light text-accent-foreground',
        success: 'bg-secondary-light text-secondary',
        warning: 'bg-accent-light text-accent-foreground',
        error: 'bg-error/10 text-error',
        outline: 'border border-border bg-surface text-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
