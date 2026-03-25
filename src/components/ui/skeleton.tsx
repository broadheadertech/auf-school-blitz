interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-[var(--radius-md)] bg-[var(--color-border)] ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse space-y-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="h-4 w-1/3 rounded bg-[var(--color-border)]" />
      <div className="h-3 w-2/3 rounded bg-[var(--color-border)]" />
      <div className="h-3 w-1/2 rounded bg-[var(--color-border)]" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-8 rounded bg-[var(--color-border)]" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 rounded bg-[var(--color-border)]" />
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-[var(--radius-md)] bg-[var(--color-border)]" />
      <div className="h-4 w-72 rounded bg-[var(--color-border)]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <TableSkeleton />
    </div>
  )
}
