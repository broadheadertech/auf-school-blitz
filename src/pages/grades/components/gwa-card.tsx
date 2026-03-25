import { TrendingUp, Award, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  calculateGwa,
  calculateCumulativeGwa,
  getGwaStatus,
  type SemesterInfo,
} from '@/utils/calculate-gwa'

interface GwaCardProps {
  semesters: SemesterInfo[]
}

export function GwaCard({ semesters }: GwaCardProps) {
  // Find latest semester with finalized grades for "current" display
  const completedSemesters = semesters.filter((s) =>
    s.grades.some((g) => g.status === 'finalized'),
  )
  const latestCompleted = completedSemesters[completedSemesters.length - 1]

  const currentGwa = latestCompleted
    ? calculateGwa(latestCompleted.grades)
    : null
  const cumulativeGwa = calculateCumulativeGwa(
    semesters.map((s) => s.grades),
  )

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Current Semester GWA */}
      <Card className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-info)]/10">
          <BookOpen
            className="h-5 w-5 text-[var(--color-info)]"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {latestCompleted
              ? `${latestCompleted.semester} ${latestCompleted.academicYear}`
              : 'Current Semester'}
          </p>
          <p className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
            {currentGwa !== null ? currentGwa.toFixed(2) : '--'}
          </p>
          {currentGwa !== null ? (
            <p className="text-xs text-[var(--color-text-secondary)]">
              {getGwaStatus(currentGwa)}
            </p>
          ) : (
            <p className="text-xs text-[var(--color-text-secondary)]">
              No finalized grades
            </p>
          )}
        </div>
      </Card>

      {/* Cumulative GWA */}
      <Card className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
          <Award
            className="h-5 w-5 text-[var(--color-accent)]"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Cumulative GWA
          </p>
          <p className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
            {cumulativeGwa !== null ? cumulativeGwa.toFixed(2) : '--'}
          </p>
          {cumulativeGwa !== null && (
            <p className="text-xs text-[var(--color-text-secondary)]">
              {getGwaStatus(cumulativeGwa)}
            </p>
          )}
        </div>
      </Card>

      {/* Semesters Completed */}
      <Card className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)]/10">
          <TrendingUp
            className="h-5 w-5 text-[var(--color-success)]"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Semesters Completed
          </p>
          <p className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
            {completedSemesters.length}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {semesters.length - completedSemesters.length > 0
              ? `${semesters.length - completedSemesters.length} in progress`
              : 'All complete'}
          </p>
        </div>
      </Card>
    </div>
  )
}
