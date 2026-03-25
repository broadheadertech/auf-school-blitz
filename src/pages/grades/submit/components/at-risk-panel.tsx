import { useState, useMemo, useCallback, useEffect } from 'react'
import { AlertTriangle, Send } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { StudentGradeEntry } from './grade-entry-table'

/** At-risk threshold: midterm grade >= 3.0 means struggling/failing in PH system */
const AT_RISK_THRESHOLD = 3.0

interface AtRiskPanelProps {
  entries: StudentGradeEntry[]
}

export function AtRiskPanel({ entries }: AtRiskPanelProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showSuccess, setShowSuccess] = useState(false)

  // Reset selection when entries change (e.g. section switch)
  useEffect(() => {
    setSelectedIds(new Set())
  }, [entries])

  const atRiskStudents = useMemo(() => {
    return entries.filter((entry) => {
      const midterm = Number(entry.midterm)
      return !isNaN(midterm) && entry.midterm.trim() !== '' && midterm >= AT_RISK_THRESHOLD
    })
  }, [entries])

  const toggleStudent = useCallback((studentId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(studentId)) {
        next.delete(studentId)
      } else {
        next.add(studentId)
      }
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === atRiskStudents.length) {
        return new Set()
      }
      return new Set(atRiskStudents.map((s) => s.student_id))
    })
  }, [atRiskStudents])

  const handleSendReminder = useCallback(() => {
    // MVP: just show success toast
    setShowSuccess(true)
    setSelectedIds(new Set())
    setTimeout(() => setShowSuccess(false), 3000)
  }, [])

  if (atRiskStudents.length === 0) {
    return null
  }

  return (
    <Card className="border-l-4 border-l-[var(--color-warning)]">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold text-[var(--color-text-primary)]">
            At-Risk Students
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {atRiskStudents.length} student{atRiskStudents.length !== 1 ? 's' : ''} with midterm
            grade of 3.0 or higher
          </p>
        </div>
      </div>

      {showSuccess && (
        <div className="mb-3 rounded-[var(--radius-md)] border border-green-200 bg-green-50 px-3 py-2">
          <p className="text-sm text-green-700">
            Consultation reminders sent successfully.
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
              <th className="px-3 py-2 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === atRiskStudents.length && atRiskStudents.length > 0}
                  onChange={toggleAll}
                  aria-label="Select all at-risk students"
                  className="h-4 w-4 rounded border-[var(--color-border)]"
                />
              </th>
              <th scope="col" className="px-3 py-2 text-left font-semibold text-[var(--color-text-primary)]">
                Student
              </th>
              <th scope="col" className="px-3 py-2 text-left font-semibold text-[var(--color-text-primary)]">
                Midterm Grade
              </th>
            </tr>
          </thead>
          <tbody>
            {atRiskStudents.map((student) => (
              <tr
                key={student.student_id}
                className="border-b border-[var(--color-border)] last:border-b-0"
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(student.student_id)}
                    onChange={() => toggleStudent(student.student_id)}
                    aria-label={`Select ${student.last_name}, ${student.first_name}`}
                    className="h-4 w-4 rounded border-[var(--color-border)]"
                  />
                </td>
                <td className="px-3 py-2 text-[var(--color-text-primary)]">
                  {student.last_name}, {student.first_name}
                  <span className="ml-2 font-mono text-xs text-[var(--color-text-secondary)]">
                    {student.student_number}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <Badge variant="error" label={student.midterm} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex justify-end">
        <Button
          variant="primary"
          disabled={selectedIds.size === 0}
          onClick={handleSendReminder}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Send Consultation Reminder ({selectedIds.size})
        </Button>
      </div>
    </Card>
  )
}
