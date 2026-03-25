import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface ModuleCardProps {
  icon: LucideIcon
  title: string
  description: string
  to: string
}

export function ModuleCard({ icon: Icon, title, description, to }: ModuleCardProps) {
  return (
    <Link to={to} className="block">
      <Card clickable className="flex items-start gap-4 min-h-[88px]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            {description}
          </p>
        </div>
      </Card>
    </Link>
  )
}
