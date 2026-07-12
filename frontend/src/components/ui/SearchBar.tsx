import { Search, X } from 'lucide-react'
import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'
import { Input } from './Input'

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void
  isLoading?: boolean
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, value, onClear, isLoading, disabled, placeholder = 'Rechercher…', ...props }, ref) => {
    const hasValue = value !== undefined && value !== ''

    return (
      <div className={cn('relative w-full', className)}>
        <Search
          className={cn(
            'pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted',
            isLoading && 'animate-pulse-soft',
          )}
          aria-hidden
        />
        <Input
          ref={ref}
          type="search"
          value={value}
          disabled={disabled || isLoading}
          placeholder={placeholder}
          className="pl-10 pr-10"
          {...props}
        />
        {hasValue && onClear && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-0.5 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  },
)

SearchBar.displayName = 'SearchBar'
