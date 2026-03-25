import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  deadline: Date | string
  label: string
  description?: string
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  total: number
}

function getTimeRemaining(deadline: Date): TimeRemaining {
  const now = new Date()
  const total = deadline.getTime() - now.getTime()

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, total }
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((total / (1000 * 60)) % 60)

  return { days, hours, minutes, total }
}

type Urgency = 'normal' | 'warning' | 'critical' | 'passed'

function getUrgency(total: number): Urgency {
  if (total <= 0) return 'passed'
  const daysLeft = total / (1000 * 60 * 60 * 24)
  if (daysLeft < 1) return 'critical'
  if (daysLeft < 3) return 'warning'
  return 'normal'
}

const urgencyStyles: Record<Urgency, string> = {
  normal: 'border-[var(--color-info)] bg-[var(--color-info)]/10 text-[var(--color-info)]',
  warning: 'border-[var(--color-warning)] bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
  critical: 'border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)]',
  passed: 'border-[var(--color-border)] bg-[var(--color-border)]/20 text-[var(--color-text-secondary)]',
}

const urgencyIconStyles: Record<Urgency, string> = {
  normal: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
  warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
  critical: 'bg-[var(--color-error)]/10 text-[var(--color-error)]',
  passed: 'bg-[var(--color-border)]/30 text-[var(--color-text-secondary)]',
}

export function CountdownTimer({ deadline, label, description }: CountdownTimerProps) {
  const deadlineDate = useMemo(
    () => (typeof deadline === 'string' ? new Date(deadline) : deadline),
    [deadline],
  )

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    getTimeRemaining(deadlineDate),
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(deadlineDate))
    }, 60_000)

    return () => clearInterval(interval)
  }, [deadlineDate])

  const urgency = getUrgency(timeRemaining.total)
  const isPassed = urgency === 'passed'

  const formattedDate = deadlineDate.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Card className={`border-l-4 ${urgencyStyles[urgency]} min-w-[220px]`}>
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${urgencyIconStyles[urgency]}`}
        >
          <Clock className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</h3>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{formattedDate}</p>
          {description && (
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{description}</p>
          )}
          <p
            className="mt-2 font-display text-lg font-bold"
            role="timer"
            aria-live="polite"
            aria-label={
              isPassed
                ? `${label}: deadline passed`
                : `${label}: ${timeRemaining.days} days, ${timeRemaining.hours} hours, ${timeRemaining.minutes} minutes remaining`
            }
          >
            {isPassed ? (
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                Deadline passed
              </span>
            ) : (
              <>
                {timeRemaining.days > 0 && <span>{timeRemaining.days}d </span>}
                <span>{timeRemaining.hours}h </span>
                <span>{timeRemaining.minutes}m</span>
              </>
            )}
          </p>
        </div>
      </div>
    </Card>
  )
}
