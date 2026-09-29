import { cva } from 'class-variance-authority'
import { disabledState, focusRing } from './styles'

export const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium ${focusRing} ${disabledState} transition-all duration-200 active:scale-[0.98]`,
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_var(--color-primary)] hover:bg-primary-hover active:bg-primary-hover',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-hover',
        accent:
          'bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-hover',
        outline:
          'border border-border bg-surface text-foreground hover:border-primary/40 hover:text-primary active:bg-background',
        ghost: 'text-foreground hover:bg-field active:bg-field',
        danger: 'bg-error text-white hover:bg-error/90 active:bg-error/80',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-11 px-5 text-sm',
        lg: 'h-14 px-8 text-base',
        icon: 'h-11 w-11 p-0',
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
  `w-full rounded-lg border border-transparent bg-field px-4 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:border-primary focus-visible:bg-surface focus-visible:ring-4 focus-visible:ring-primary/10 ${disabledState} transition-colors duration-200`,
  {
    variants: {
      inputSize: {
        sm: 'h-9 text-xs',
        md: 'h-12',
        lg: 'h-14 text-base',
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
  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-field text-foreground',
        /** Pastille translucide pour fonds bleus (carte à la une, en-tête d'offre) */
        glass: 'bg-white/15 text-white backdrop-blur-sm',
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
