/* eslint-disable react-refresh/only-export-components */
import { useCallback } from 'react'
import { Badge } from '@/components/ui/badge'

export interface StudentGradeEntry {
  student_id: string
  student_number: string
  first_name: string
  last_name: string
  midterm: string
  final_grade: string
  midterm_error: string | null
  final_error: string | null
}

/** Valid PH grades: 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 4.0, 5.0 */
const VALID_GRADES = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 4.0, 5.0]

export function validateGrade(value: string): string | null {
  if (value.trim() === '') return null // empty is allowed (not yet entered)
  const num = Number(value)
  if (isNaN(num)) return 'Must be a number'
  if (num < 1.0 || num > 5.0) return 'Must be between 1.0 and 5.0'
  // Check step of 0.25
  if (!VALID_GRADES.includes(num)) return 'Must be in 0.25 increments (e.g. 1.0, 1.25, 1.5)'
  return null
}

interface GradeEntryTableProps {
  entries: StudentGradeEntry[]
  onUpdateEntry: (studentId: string, field: 'midterm' | 'final_grade', value: string) => void
}

export function GradeEntryTable({ entries, onUpdateEntry }: GradeEntryTableProps) {
  const handleChange = useCallback(
    (studentId: string, field: 'midterm' | 'final_grade', value: string) => {
      onUpdateEntry(studentId, field, value)
    },
    [onUpdateEntry],
  )

  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)]">
              #
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)]">
              Student Number
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)]">
              Name
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)]">
              Midterm
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)]">
              Final Grade
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)]">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const hasError = entry.midterm_error !== null || entry.final_error !== null
            const isComplete =
              entry.midterm.trim() !== '' &&
              entry.final_grade.trim() !== '' &&
              !hasError

            return (
              <tr
                key={entry.student_id}
                className="border-b border-[var(--color-border)] last:border-b-0"
              >
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{index + 1}</td>
                <td className="px-4 py-2 font-mono text-xs text-[var(--color-text-secondary)]">
                  {entry.student_number}
                </td>
                <td className="px-4 py-2 text-[var(--color-text-primary)]">
                  {entry.last_name}, {entry.first_name}
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={entry.midterm}
                      onChange={(e) => handleChange(entry.student_id, 'midterm', e.target.value)}
                      placeholder="1.0-5.0"
                      aria-label={`Midterm grade for ${entry.last_name}, ${entry.first_name}`}
                      aria-invalid={!!entry.midterm_error}
                      className={`w-24 rounded-[var(--radius-md)] border px-2 py-1.5 text-sm transition-colors duration-150 focus:outline-none focus:border-[var(--color-accent)] ${
                        entry.midterm_error
                          ? 'border-[var(--color-error)] bg-red-50'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                      }`}
                    />
                    {entry.midterm_error && (
                      <p className="text-xs text-[var(--color-error)]">{entry.midterm_error}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={entry.final_grade}
                      onChange={(e) =>
                        handleChange(entry.student_id, 'final_grade', e.target.value)
                      }
                      placeholder="1.0-5.0"
                      aria-label={`Final grade for ${entry.last_name}, ${entry.first_name}`}
                      aria-invalid={!!entry.final_error}
                      className={`w-24 rounded-[var(--radius-md)] border px-2 py-1.5 text-sm transition-colors duration-150 focus:outline-none focus:border-[var(--color-accent)] ${
                        entry.final_error
                          ? 'border-[var(--color-error)] bg-red-50'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                      }`}
                    />
                    {entry.final_error && (
                      <p className="text-xs text-[var(--color-error)]">{entry.final_error}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2">
                  {hasError ? (
                    <Badge variant="error" label="Invalid" />
                  ) : isComplete ? (
                    <Badge variant="success" label="Ready" />
                  ) : (
                    <Badge variant="info" label="Pending" />
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
