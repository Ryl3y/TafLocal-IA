import { cn } from '../../utils/cn'

const palette = ['#356899', '#e0457b', '#2cb67d', '#f28c28', '#7c5cff', '#1b9aaa', '#d64545'] as const

const sizeClasses = {
  sm: 'h-10 w-10 rounded-xl text-base',
  md: 'h-12 w-12 rounded-2xl text-lg',
  lg: 'h-20 w-20 rounded-full text-3xl',
} as const

export interface CompanyLogoProps {
  name: string
  src?: string | null
  size?: keyof typeof sizeClasses
  className?: string
}

/** Couleur stable dérivée du nom : une même entreprise garde toujours la même teinte. */
function colorFor(name: string) {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return palette[Math.abs(hash) % palette.length]
}

/**
 * Pastille logo d'entreprise façon kit Jôbizz : fond blanc arrondi, logo ou initiale colorée.
 */
export function CompanyLogo({ name, src, size = 'md', className }: CompanyLogoProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden bg-surface font-bold shadow-sm',
        sizeClasses[size],
        className,
      )}
      style={{ color: colorFor(name) }}
      aria-hidden
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : initial}
    </span>
  )
}
