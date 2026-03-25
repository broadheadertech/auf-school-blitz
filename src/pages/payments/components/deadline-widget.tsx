import { useState, useEffect } from 'react'
import { Timer } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { PAYMENT_DEADLINE } from '../data'

export function DeadlineWidget() {
  const [remaining, setRemaining] = useState(getRemaining())

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemaining()), 60_000)
    return () => clearInterval(interval)
  }, [])

  if (remaining.total <= 0) {
    return (
      <Card className="border-l-4 border-l-[var(--color-error)]">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-[var(--color-error)]" />
          <p className="text-sm font-semibold text-[var(--color-error)]">Payment deadline has passed</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-l-4 border-l-[var(--color-warning)]">
      <div className="flex items-center gap-2 mb-2">
        <Timer className="h-5 w-5 text-[var(--color-warning)]" />
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">Payment Deadline</p>
      </div>
      <div className="flex gap-4">
        {[
          { value: remaining.days, label: 'Days' },
          { value: remaining.hours, label: 'Hours' },
          { value: remaining.minutes, label: 'Min' },
        ].map((unit) => (
          <div key={unit.label} className="text-center">
            <p className="font-display text-2xl font-bold text-[var(--color-primary)]">{unit.value}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{unit.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
        Due: {new Date(PAYMENT_DEADLINE).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </Card>
  )
}

function getRemaining() {
  const diff = new Date(PAYMENT_DEADLINE).getTime() - Date.now()
  if (diff <= 0) return { total: 0, days: 0, hours: 0, minutes: 0 }
  return {
    total: diff,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
  }
}
