import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] shadow-[var(--shadow-sm)]',
  secondary:
    'border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)]',
  accent:
    'bg-[var(--color-accent)] text-[var(--color-primary)] hover:brightness-110 shadow-[var(--shadow-sm)]',
  ghost: 'text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)]',
  destructive:
    'border-2 border-[var(--color-error)] text-[var(--color-error)] hover:bg-red-50',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading = false, disabled, children, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 font-body text-sm font-semibold transition-all duration-150 min-h-[36px] xl:min-h-[36px] min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
      </button>
    )
  },
)

Button.displayName = 'Button'
