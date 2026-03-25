import { type HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  clickable?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ clickable = false, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)] border border-[var(--color-border)] ${
          clickable
            ? 'cursor-pointer transition-shadow duration-150 hover:shadow-[var(--shadow-md)]'
            : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Card.displayName = 'Card'
