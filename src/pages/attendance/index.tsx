/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, Loader2, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-store'
import { useFacultySections } from '@/hooks/use-supabase-query'
import { supabase } from '@/lib/supabase'

const db = supabase as any

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

const STATUS_CONFIG: Record<AttendanceStatus, { color: string; bg: string; border: string; label: string }> = {
  present: { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300', label: 'Present' },
  absent: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', label: 'Absent' },
  late: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300', label: 'Late' },
  excused: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300', label: 'Excused' },
}

const BADGE_VARIANT: Record<AttendanceStatus, 'success' | 'error' | 'warning' | 'info'> = {
  present: 'success',
  absent: 'error',
  late: 'warning',
  excused: 'info',
}

export default function AttendancePage() {
  const { role } = useAuthStore()

  if (role === 'student') return <StudentAttendanceView />
  if (role === 'faculty') return <FacultyAttendanceView />

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Attendance tracking is available for faculty and students.
      </p>
    </div>
  )
}

/* ─────────────── Faculty View ─────────────── */

function FacultyAttendanceView() {
  const { profile } = useAuthStore()
  const { sections, loading: sectionsLoading } = useFacultySections()

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]!)
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const loadStudentsAndAttendance = useCallback(async (sectionId: string, selectedDate: string) => {
    setLoadingStudents(true)
    setSaved(false)
    setStudents([])
    setAttendance({})

    try {
      // Fetch enrolled students
      const { data: enrollments } = await db
        .from('enrollments')
        .select('*, students(id, student_number, first_name, last_name)')
        .eq('section_id', sectionId)
        .eq('status', 'confirmed')

      const studentList = (enrollments ?? [])
        .filter((e: any) => e.students)
        .map((e: any) => e.students)
        .sort((a: any, b: any) => a.last_name.localeCompare(b.last_name))

      setStudents(studentList)

      // Fetch existing attendance for this date
      const studentIds = studentList.map((s: any) => s.id)
      if (studentIds.length > 0) {
        const { data: existingAttendance } = await db
          .from('attendance')
          .select('student_id, status')
          .eq('section_id', sectionId)
          .eq('date', selectedDate)
          .in('student_id', studentIds)

        const attendanceMap: Record<string, AttendanceStatus> = {}
        for (const record of existingAttendance ?? []) {
          attendanceMap[record.student_id] = record.status
        }
        setAttendance(attendanceMap)
      }
    } catch (err) {
      console.error('Error loading attendance data:', err)
    } finally {
      setLoadingStudents(false)
    }
  }, [])

  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId)
    loadStudentsAndAttendance(sectionId, date)
  }

  const handleDateChange = (newDate: string) => {
    setDate(newDate)
    if (selectedSectionId) {
      loadStudentsAndAttendance(selectedSectionId, newDate)
    }
  }

  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
    setSaved(false)
  }

  const handleMarkAllPresent = () => {
    const all: Record<string, AttendanceStatus> = {}
    for (const s of students) all[s.id] = 'present'
    setAttendance(all)
    setSaved(false)
  }

  const handleSave = async () => {
    if (!selectedSectionId) return
    setSaving(true)

    try {
      const rows = Object.entries(attendance).map(([studentId, status]) => ({
        section_id: selectedSectionId,
        student_id: studentId,
        date,
        status,
        marked_by: (profile as any)?.id ?? null,
      }))

      if (rows.length > 0) {
        await db.from('attendance').upsert(rows, { onConflict: 'section_id,student_id,date' })
      }
      setSaved(true)
    } catch (err) {
      console.error('Error saving attendance:', err)
    } finally {
      setSaving(false)
    }
  }

  // Summary stats
  const totalStudents = students.length
  const markedCount = Object.keys(attendance).length
  const presentCount = Object.values(attendance).filter((s) => s === 'present').length
  const absentCount = Object.values(attendance).filter((s) => s === 'absent').length
  const lateCount = Object.values(attendance).filter((s) => s === 'late').length
  const excusedCount = Object.values(attendance).filter((s) => s === 'excused').length
  const presentPercent = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
          Attendance Tracker
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Mark attendance for your sections
        </p>
      </div>

      {/* Section selector + Date picker */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Section</label>
          {sectionsLoading ? (
            <div className="h-10 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-border)]" />
          ) : (
            <select
              value={selectedSectionId ?? ''}
              onChange={(e) => handleSelectSection(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
            >
              <option value="">Select section...</option>
              {sections.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.subjects?.code ?? '?'} — {s.section_code} ({s.subjects?.name})
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
          />
        </div>
      </div>

      {/* Summary stats */}
      {selectedSectionId && !loadingStudents && students.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Card className="text-center">
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{presentPercent}%</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Present Today</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Present</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Absent</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-amber-600">{lateCount}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Late</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-blue-600">{excusedCount}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Excused</p>
          </Card>
        </div>
      )}

      {/* Loading state */}
      {loadingStudents && (
        <div className="space-y-3">
          <CardSkeleton />
          <TableSkeleton rows={6} />
        </div>
      )}

      {/* Student list */}
      {selectedSectionId && !loadingStudents && (
        <>
          {students.length === 0 ? (
            <Card className="py-8 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">No enrolled students found for this section.</p>
            </Card>
          ) : (
            <>
              {/* Bulk action + save */}
              <div className="flex items-center justify-between">
                <Button variant="secondary" onClick={handleMarkAllPresent}>
                  <CheckCircle className="h-4 w-4" />
                  Mark All Present
                </Button>
                <div className="flex items-center gap-3">
                  {saved && (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" /> Saved
                    </span>
                  )}
                  <Badge
                    variant={markedCount === totalStudents ? 'success' : 'warning'}
                    label={`${markedCount}/${totalStudents} marked`}
                  />
                  <Button variant="primary" onClick={handleSave} disabled={saving || markedCount === 0}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      'Save Attendance'
                    )}
                  </Button>
                </div>
              </div>

              {/* Student rows */}
              <div className="space-y-2">
                {students.map((student: any) => {
                  const currentStatus = attendance[student.id] as AttendanceStatus | undefined
                  return (
                    <Card key={student.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {student.last_name}, {student.first_name}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {student.student_number}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map((status) => {
                          const config = STATUS_CONFIG[status]
                          const isActive = currentStatus === status
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleSetStatus(student.id, status)}
                              className={`rounded-[var(--radius-md)] border px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                                isActive
                                  ? `${config.bg} ${config.color} ${config.border}`
                                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-lighter)]'
                              }`}
                            >
                              {config.label}
                            </button>
                          )
                        })}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

/* ─────────────── Student View ─────────────── */

function StudentAttendanceView() {
  const { user } = useAuthStore()
  const [records, setRecords] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    ;(async () => {
      // Get student id
      const { data: student } = await db.from('students').select('id').eq('user_id', user.id).maybeSingle()
      if (!student) { setLoading(false); return }

      // Get enrolled sections
      const { data: enrollments } = await db
        .from('enrollments')
        .select('section_id, sections(id, section_code, subjects(code, name))')
        .eq('student_id', student.id)
        .eq('status', 'confirmed')

      const enrolledSections = (enrollments ?? [])
        .filter((e: any) => e.sections)
        .map((e: any) => e.sections)

      setSections(enrolledSections)

      // Fetch all attendance records for this student
      const { data: attendanceData } = await db
        .from('attendance')
        .select('*')
        .eq('student_id', student.id)
        .order('date', { ascending: false })

      if (attendanceData) setRecords(attendanceData)
      if (enrolledSections.length > 0) setSelectedSectionId(enrolledSections[0].id)
      setLoading(false)
    })()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-border)]" />
        <CardSkeleton />
        <TableSkeleton rows={8} />
      </div>
    )
  }

  const filteredRecords = selectedSectionId
    ? records.filter((r: any) => r.section_id === selectedSectionId)
    : records

  const totalClasses = filteredRecords.length
  const presentDays = filteredRecords.filter((r: any) => r.status === 'present' || r.status === 'late').length
  const attendanceRate = totalClasses > 0 ? Math.round((presentDays / totalClasses) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
          My Attendance
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          View your attendance record per section
        </p>
      </div>

      {/* Section filter */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-[var(--color-text-primary)]">Section</label>
        <select
          value={selectedSectionId ?? ''}
          onChange={(e) => setSelectedSectionId(e.target.value || null)}
          className="w-full max-w-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
        >
          <option value="">All Sections</option>
          {sections.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.subjects?.code ?? '?'} — {s.section_code}
            </option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{attendanceRate}%</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Attendance Rate</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-600">{presentDays}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Days Present</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-red-600">{totalClasses - presentDays}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Days Missed</p>
        </Card>
      </div>

      {/* Records list */}
      {filteredRecords.length === 0 ? (
        <Card className="py-8 text-center">
          <Calendar className="mx-auto h-8 w-8 text-[var(--color-text-secondary)]" />
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">No attendance records yet.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredRecords.map((record: any) => (
            <Card key={record.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {new Date(record.date).toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <Badge
                variant={BADGE_VARIANT[record.status as AttendanceStatus] ?? 'neutral'}
                label={STATUS_CONFIG[record.status as AttendanceStatus]?.label ?? record.status}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
