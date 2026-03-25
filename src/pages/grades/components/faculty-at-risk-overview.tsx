import { useState, useMemo, useCallback } from 'react'
import { AlertTriangle, Send, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface AtRiskStudent {
  studentId: string
  studentNumber: string
  firstName: string
  lastName: string
  midterm: number
  section: string
  subject: string
}

// Mock aggregated at-risk students across all faculty sections
const MOCK_AT_RISK: AtRiskStudent[] = [
  { studentId: 'ar01', studentNumber: '2024-00003', firstName: 'Juan', lastName: 'Dela Cruz', midterm: 3.0, section: 'MATH101-A', subject: 'College Algebra' },
  { studentId: 'ar02', studentNumber: '2024-00007', firstName: 'Ana', lastName: 'Reyes', midterm: 4.0, section: 'MATH101-A', subject: 'College Algebra' },
  { studentId: 'ar03', studentNumber: '2024-00012', firstName: 'Pedro', lastName: 'Santos', midterm: 3.5, section: 'MATH101-B', subject: 'College Algebra' },
  { studentId: 'ar04', studentNumber: '2024-00015', firstName: 'Rosa', lastName: 'Garcia', midterm: 5.0, section: 'MATH102-A', subject: 'Plane Trigonometry' },
  { studentId: 'ar05', studentNumber: '2024-00021', firstName: 'Carlos', lastName: 'Mendoza', midterm: 3.0, section: 'MATH102-A', subject: 'Plane Trigonometry' },
]

export function FacultyAtRiskOverview() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showSuccess, setShowSuccess] = useState(false)

  // Group by section
  const grouped = useMemo(() => {
    const map = new Map<string, AtRiskStudent[]>()
    for (const s of MOCK_AT_RISK) {
      const existing = map.get(s.section) ?? []
      existing.push(s)
      map.set(s.section, existing)
    }
    return map
  }, [])

  const toggleStudent = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === MOCK_AT_RISK.length) return new Set()
      return new Set(MOCK_AT_RISK.map((s) => s.studentId))
    })
  }, [])

  const handleSendBatch = useCallback(() => {
    setShowSuccess(true)
    setSelectedIds(new Set())
    setTimeout(() => setShowSuccess(false), 3000)
  }, [])

  if (MOCK_AT_RISK.length === 0) return null

  return (
    <Card className="border-l-4 border-l-[var(--color-warning)]">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold text-[var(--color-text-primary)]">
            At-Risk Students Overview
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {MOCK_AT_RISK.length} students across {grouped.size} sections with midterm below 3.0
          </p>
        </div>
      </div>

      {showSuccess && (
        <div className="mb-3 rounded-[var(--radius-md)] border border-green-200 bg-green-50 px-3 py-2">
          <p className="text-sm text-green-700">Batch consultation reminders sent successfully.</p>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={selectAll} className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
          {selectedIds.size === MOCK_AT_RISK.length ? 'Deselect All' : 'Select All'}
        </button>
        <Button variant="primary" disabled={selectedIds.size === 0} onClick={handleSendBatch}>
          <Send className="h-4 w-4" />
          Send Batch Reminder ({selectedIds.size})
        </Button>
      </div>

      {Array.from(grouped.entries()).map(([section, students]) => (
        <div key={section} className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">{section} — {students[0]?.subject}</p>
          </div>
          <div className="space-y-1">
            {students.map((student) => (
              <label key={student.studentId} className="flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-1.5 hover:bg-[var(--color-bg)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.has(student.studentId)}
                  onChange={() => toggleStudent(student.studentId)}
                  className="h-4 w-4 rounded border-[var(--color-border)]"
                />
                <span className="flex-1 text-sm text-[var(--color-text-primary)]">
                  {student.lastName}, {student.firstName}
                  <span className="ml-2 font-mono text-xs text-[var(--color-text-secondary)]">{student.studentNumber}</span>
                </span>
                <Badge variant="error" label={student.midterm.toFixed(1)} />
              </label>
            ))}
          </div>
        </div>
      ))}
    </Card>
  )
}
