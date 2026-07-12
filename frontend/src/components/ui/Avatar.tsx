import { type ImgHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
} as const

export type AvatarSize = keyof typeof sizeClasses

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: AvatarSize
  fallback?: string
  alt: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function Avatar({
  className,
  size = 'md',
  src,
  alt,
  fallback,
  ...props
}: AvatarProps) {
  const initials = getInitials(fallback ?? alt)

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          'inline-block shrink-0 rounded-full object-cover ring-2 ring-border transition-opacity hover:opacity-90',
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    )
  }

  return (
    <span
      role="img"
      aria-label={alt}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-primary-light font-medium text-primary ring-2 ring-border transition-colors hover:bg-primary/10',
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </span>
  )
}
