import { BookOpen, Clock, Lock, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { CurriculumEntryWithSubject } from '@/types/database'
import { COMPLETED_SUBJECT_IDS, IN_PROGRESS_SUBJECT_IDS } from '../data'

interface UnitSummaryProps {
  curriculum: CurriculumEntryWithSubject[]
  totalProgramUnits: number
}

export function UnitSummary({ curriculum, totalProgramUnits }: UnitSummaryProps) {
  const completedUnits = curriculum
    .filter((c) => COMPLETED_SUBJECT_IDS.has(c.subject_id))
    .reduce((sum, c) => sum + c.subject.units, 0)

  const inProgressUnits = curriculum
    .filter((c) => IN_PROGRESS_SUBJECT_IDS.has(c.subject_id))
    .reduce((sum, c) => sum + c.subject.units, 0)

  const remainingUnits = totalProgramUnits - completedUnits - inProgressUnits

  const completionPercent = Math.round((completedUnits / totalProgramUnits) * 100)

  const stats = [
    { label: 'Completed', value: completedUnits, icon: CheckCircle, color: 'var(--color-success)' },
    { label: 'In Progress', value: inProgressUnits, icon: Clock, color: 'var(--color-warning)' },
    { label: 'Remaining', value: remainingUnits, icon: Lock, color: 'var(--color-text-secondary)' },
    { label: 'Total', value: totalProgramUnits, icon: BookOpen, color: 'var(--color-primary)' },
  ]

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Degree Progress
          </p>
          <p className="text-sm font-bold text-[var(--color-primary)]">
            {completionPercent}%
          </p>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full bg-[var(--color-success)] transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
            role="progressbar"
            aria-valuenow={completionPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${completionPercent}% of degree completed`}
          />
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)` }}
            >
              <stat.icon
                className="h-4 w-4"
                style={{ color: stat.color }}
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">
                {stat.value}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
