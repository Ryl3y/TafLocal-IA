import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'
import { inputVariants } from './variants'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
  inputSize?: 'sm' | 'md' | 'lg'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputSize = 'md', hasError = false, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        className={cn(inputVariants({ inputSize, hasError }), className)}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
