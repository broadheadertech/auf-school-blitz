import { GradeBadge } from './grade-badge'
import type { GradeWithSubject } from '@/types/database'

interface GradeTableProps {
  grades: GradeWithSubject[]
  loading?: boolean
}

function formatGrade(value: number | null): string {
  if (value === null) return '--'
  return value.toFixed(1)
}

function GradeTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="h-5 w-16 rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
          <div className="h-5 w-40 rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
          <div className="h-5 w-10 rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
          <div className="h-5 w-10 rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
          <div className="h-5 w-10 rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
          <div className="h-5 w-10 rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
          <div className="h-5 w-20 rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
        </div>
      ))}
    </div>
  )
}

/**
 * Responsive grade table with horizontal scroll on mobile.
 * First column (Subject Code) is sticky/frozen for mobile usability.
 * Uses semantic HTML table with proper th scope for accessibility.
 */
export function GradeTable({ grades, loading = false }: GradeTableProps) {
  if (loading) {
    return <GradeTableSkeleton />
  }

  if (grades.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          No grades found for this semester.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
      {/* Outer wrapper for horizontal scroll on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Student grades for the selected semester</caption>
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-[var(--color-surface)] px-4 py-3 font-semibold text-[var(--color-text-secondary)] whitespace-nowrap"
              >
                Subject Code
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-semibold text-[var(--color-text-secondary)]"
              >
                Subject Name
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-center"
              >
                Units
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-center"
              >
                Midterm
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-center"
              >
                Final
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-center"
              >
                Final Grade
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-center"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr
                key={grade.id}
                className="border-b border-[var(--color-border)] last:border-b-0 transition-colors duration-100 hover:bg-[var(--color-primary-lighter)]/30"
              >
                <td className="sticky left-0 z-10 bg-[var(--color-surface)] px-4 py-3 font-semibold text-[var(--color-text-primary)] whitespace-nowrap">
                  {grade.subject.code}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-primary)]">
                  {grade.subject.name}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-primary)] text-center">
                  {grade.subject.units}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-primary)] text-center font-medium">
                  {formatGrade(grade.midterm)}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-primary)] text-center font-medium">
                  {formatGrade(grade.final_grade)}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-primary)] text-center font-semibold">
                  {formatGrade(grade.final_computed)}
                </td>
                <td className="px-4 py-3 text-center">
                  <GradeBadge status={grade.status} finalComputed={grade.final_computed} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
