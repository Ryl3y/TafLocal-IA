/**
 * Classes utilitaires partagées du Design System.
 */
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2'

export const disabledState =
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'

export const interactiveBase = `transition-colors duration-200 ${focusRing} ${disabledState}`

export const surfaceBase = 'rounded-2xl border border-border/60 bg-surface shadow-sm'

export const hoverLift = 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'

export const loadingOverlay = 'pointer-events-none relative opacity-70'
