import { type ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { Card } from './card'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-bg)]">
        {icon ?? <Inbox className="h-7 w-7 text-[var(--color-text-secondary)]" />}
      </div>
      <h3 className="font-display text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  )
}
