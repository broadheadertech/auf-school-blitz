import { useState } from 'react'
import { CheckCircle, Edit2, FileDown, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Section } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { formatSchedule, estimateFees } from '../data'

type SelectedSection = Section & { subject: { code: string; name: string; units: number } }

interface EnrollmentSummaryProps {
  selected: SelectedSection[]
  onEdit: () => void
  onConfirm: () => void
  semester: string
  academicYear: string
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7)

// Color palette for subjects
const SUBJECT_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-green-100 border-green-300 text-green-800',
  'bg-purple-100 border-purple-300 text-purple-800',
  'bg-orange-100 border-orange-300 text-orange-800',
  'bg-pink-100 border-pink-300 text-pink-800',
  'bg-teal-100 border-teal-300 text-teal-800',
]

function TimetableGrid({ sections }: { sections: SelectedSection[] }) {
  // Build schedule slots
  const slots: { day: string; startHour: number; endHour: number; section: SelectedSection; colorClass: string }[] = []

  sections.forEach((sec, idx) => {
    const colorClass = SUBJECT_COLORS[idx % SUBJECT_COLORS.length]!
    for (const entry of sec.schedule_json) {
      const [startH] = entry.start.split(':').map(Number)
      const [endH] = entry.end.split(':').map(Number)
      slots.push({ day: entry.day, startHour: startH!, endHour: endH!, section: sec, colorClass })
    }
  })

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="min-w-[500px]">
        <div className="grid grid-cols-[60px_repeat(5,1fr)] gap-0.5 mb-0.5">
          <div />
          {DAYS.map((day) => (
            <div key={day} className="rounded-t-[var(--radius-sm)] bg-[var(--color-primary)] px-2 py-1.5 text-center text-xs font-semibold text-white">
              {day}
            </div>
          ))}
        </div>
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-[60px_repeat(5,1fr)] gap-0.5 mb-0.5">
            <div className="flex items-center justify-end pr-2 text-xs text-[var(--color-text-secondary)]">
              {hour > 12 ? `${hour - 12}PM` : hour === 12 ? '12PM' : `${hour}AM`}
            </div>
            {DAYS.map((day) => {
              const slot = slots.find((s) => s.day === day && s.startHour <= hour && s.endHour > hour)
              if (slot && slot.startHour === hour) {
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`rounded-[var(--radius-sm)] border px-1.5 py-0.5 text-[10px] font-semibold ${slot.colorClass}`}
                    style={{ gridRow: `span ${slot.endHour - slot.startHour}` }}
                  >
                    {slot.section.subject.code}
                  </div>
                )
              }
              if (slot) return <div key={`${day}-${hour}`} />
              return (
                <div
                  key={`${day}-${hour}`}
                  className="h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)]"
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export function EnrollmentSummary({ selected, onEdit, onConfirm, semester, academicYear }: EnrollmentSummaryProps) {
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const user = useAuthStore((s) => s.user)
  const totalUnits = selected.reduce((sum, s) => sum + s.subject.units, 0)
  const totalFees = estimateFees(totalUnits)

  const handleConfirm = async () => {
    if (!user) {
      setError('You must be logged in to enroll.')
      return
    }

    setLoading(true)
    setError(null)

    // Look up student record
    const db = supabase as any
    const { data: student, error: studentErr } = await db
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (studentErr || !student) {
      setError('Could not find your student record.')
      setLoading(false)
      return
    }

    const rows = selected.map((sec: any) => ({
      student_id: student.id,
      section_id: sec.id,
      semester,
      academic_year: academicYear,
      status: 'enrolled',
    }))

    const { error: insertErr } = await db.from('enrollments').insert(rows)

    if (insertErr) {
      setError(insertErr.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setConfirmed(true)
    onConfirm()
  }

  if (confirmed) {
    return (
      <Card className="text-center py-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
          Enrollment Confirmed!
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          You are enrolled in {selected.length} subjects for {totalUnits} units.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Button variant="secondary">
            <FileDown className="h-4 w-4" aria-hidden="true" />
            Download Confirmation
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
          Enrollment Summary
        </h2>
        <Button variant="secondary" onClick={onEdit}>
          <Edit2 className="h-4 w-4" aria-hidden="true" />
          Edit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-bold text-[var(--color-primary)]">{selected.length}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Subjects</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-[var(--color-primary)]">{totalUnits}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Units</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-[var(--color-accent)]">
            ₱{totalFees.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">Est. Fees</p>
        </Card>
      </div>

      {/* Timetable */}
      <Card>
        <h3 className="mb-3 font-display text-sm font-semibold text-[var(--color-text-primary)]">
          Weekly Schedule
        </h3>
        <TimetableGrid sections={selected} />
      </Card>

      {/* Subject list */}
      <Card>
        <h3 className="mb-3 font-display text-sm font-semibold text-[var(--color-text-primary)]">
          Selected Subjects
        </h3>
        <div className="divide-y divide-[var(--color-border)]">
          {selected.map((sec) => (
            <div key={sec.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {sec.subject.code}
                  <Badge variant="info" label={sec.section_code} className="ml-2" />
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {formatSchedule(sec.schedule_json)}
                </p>
              </div>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {sec.subject.units} units
              </span>
            </div>
          ))}
        </div>
      </Card>

      {error && (
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      )}

      <Button variant="primary" className="w-full" onClick={handleConfirm} disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <CheckCircle className="h-4 w-4" aria-hidden="true" />
        )}
        {loading ? 'Enrolling...' : 'Confirm Enrollment'}
      </Button>
    </div>
  )
}
