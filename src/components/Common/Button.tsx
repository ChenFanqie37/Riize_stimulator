import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-[#ff2d78] to-[#ff6b9d] text-white hover:shadow-[0_0_20px_rgba(255,45,120,0.4)]',
  secondary:
    'bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]',
  danger:
    'bg-gradient-to-r from-[#ef4444] to-[#f87171] text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]',
  ghost:
    'bg-transparent text-white/70 border border-white/10 hover:bg-white/5 hover:text-white',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-5 py-2 text-sm',
  lg: 'px-7 py-3 text-base',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'rounded-full font-medium transition-all duration-200 active:scale-95',
          variantStyles[variant],
          sizeStyles[size],
          disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
