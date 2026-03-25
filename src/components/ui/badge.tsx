import { type HTMLAttributes } from 'react'
import { CheckCircle, XCircle, Clock, Info, Lock } from 'lucide-react'

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant
  label: string
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
}

const variantIcons: Record<BadgeVariant, typeof CheckCircle> = {
  success: CheckCircle,
  warning: Clock,
  error: XCircle,
  info: Info,
  neutral: Lock,
}

export function Badge({ variant, label, className = '', ...props }: BadgeProps) {
  const Icon = variantIcons[variant]

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  )
}
