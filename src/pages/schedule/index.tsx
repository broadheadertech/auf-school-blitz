import { useState, useEffect, useMemo } from 'react'
import { Calendar, List, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'

const db = supabase as any

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7) // 7AM - 9PM

/** Color palette for subject blocks */
const BLOCK_COLORS = [
  { bg: 'rgba(59,130,246,0.15)', border: 'rgb(59,130,246)', text: 'rgb(30,64,175)' },
  { bg: 'rgba(16,185,129,0.15)', border: 'rgb(16,185,129)', text: 'rgb(6,95,70)' },
  { bg: 'rgba(245,158,11,0.15)', border: 'rgb(245,158,11)', text: 'rgb(146,64,14)' },
  { bg: 'rgba(139,92,246,0.15)', border: 'rgb(139,92,246)', text: 'rgb(76,29,149)' },
  { bg: 'rgba(236,72,153,0.15)', border: 'rgb(236,72,153)', text: 'rgb(157,23,77)' },
  { bg: 'rgba(20,184,166,0.15)', border: 'rgb(20,184,166)', text: 'rgb(13,148,136)' },
  { bg: 'rgba(249,115,22,0.15)', border: 'rgb(249,115,22)', text: 'rgb(154,52,18)' },
  { bg: 'rgba(99,102,241,0.15)', border: 'rgb(99,102,241)', text: 'rgb(55,48,163)' },
]

interface ScheduleEntry {
  id: string
  subject_code: string
  subject_name: string
  section_code: string
  room: string
  day: string
  start_hour: number
  start_min: number
  end_hour: number
  end_min: number
  subject_id: string
}

function parseScheduleJson(
  scheduleJson: any,
  subjectCode: string,
  subjectName: string,
  sectionCode: string,
  room: string,
  subjectId: string,
  enrollmentId: string,
): ScheduleEntry[] {
  if (!scheduleJson) return []
  const items = Array.isArray(scheduleJson) ? scheduleJson : [scheduleJson]
  const entries: ScheduleEntry[] = []

  for (const item of items) {
    const days: string[] = item.days ?? (item.day ? [item.day] : [])
    for (const day of days) {
      const startParts = (item.start_time ?? item.start ?? '07:00').split(':')
      const endParts = (item.end_time ?? item.end ?? '08:00').split(':')
      entries.push({
        id: `${enrollmentId}-${day}-${startParts[0]}`,
        subject_code: subjectCode,
        subject_name: subjectName,
        section_code: sectionCode,
        room: item.room ?? room ?? '',
        day,
        start_hour: parseInt(startParts[0], 10),
        start_min: parseInt(startParts[1] ?? '0', 10),
        end_hour: parseInt(endParts[0], 10),
        end_min: parseInt(endParts[1] ?? '0', 10),
        subject_id: subjectId,
      })
    }
  }
  return entries
}

function formatTime(hour: number, min: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${h}:${String(min).padStart(2, '0')} ${ampm}`
}

export default function SchedulePage() {
  const { role, user, profile } = useAuthStore()
  const [entries, setEntries] = useState<ScheduleEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (!user) return
    ;(async () => {
      setLoading(true)
      try {
        if (role === 'faculty') {
          // Faculty: get sections assigned to them
          const profileAny = profile as Record<string, unknown> | null
          const facultyId = profileAny?.id as string | undefined
          if (!facultyId) { setLoading(false); return }

          const { data: sections } = await db
            .from('sections')
            .select('id, section_code, room, schedule_json, subject_id, subjects(code, name)')
            .eq('faculty_id', facultyId)

          const parsed: ScheduleEntry[] = []
          for (const sec of sections ?? []) {
            const subj = sec.subjects as any
            parsed.push(
              ...parseScheduleJson(
                sec.schedule_json,
                subj?.code ?? '',
                subj?.name ?? '',
                sec.section_code ?? '',
                sec.room ?? '',
                sec.subject_id ?? '',
                sec.id,
              ),
            )
          }
          setEntries(parsed)
        } else {
          // Student: get enrollments
          const { data: student } = await db
            .from('students')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()
          if (!student) { setLoading(false); return }

          const { data: enrollments } = await db
            .from('enrollments')
            .select('id, section_id, sections(id, section_code, room, schedule_json, subject_id, subjects(code, name))')
            .eq('student_id', student.id)
            .eq('status', 'enrolled')

          const parsed: ScheduleEntry[] = []
          for (const enr of enrollments ?? []) {
            const sec = enr.sections as any
            if (!sec) continue
            const subj = sec.subjects as any
            parsed.push(
              ...parseScheduleJson(
                sec.schedule_json,
                subj?.code ?? '',
                subj?.name ?? '',
                sec.section_code ?? '',
                sec.room ?? '',
                sec.subject_id ?? '',
                enr.id,
              ),
            )
          }
          setEntries(parsed)
        }
      } catch {
        // Silently handle query errors
      } finally {
        setLoading(false)
      }
    })()
  }, [user, role, profile])

  // Build color map per subject
  const colorMap = useMemo(() => {
    const uniqueSubjects = [...new Set(entries.map((e) => e.subject_id))]
    const map: Record<string, (typeof BLOCK_COLORS)[number]> = {}
    uniqueSubjects.forEach((id, i) => {
      map[id] = BLOCK_COLORS[i % BLOCK_COLORS.length]!
    })
    return map
  }, [entries])

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Class Schedule</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {role === 'faculty' ? 'Your teaching schedule' : 'Your weekly class timetable'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('grid')}
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" aria-hidden="true" />
            List
          </Button>
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-7 w-7 text-[var(--color-text-secondary)]" />}
          title="No schedule found"
          description={
            role === 'faculty'
              ? 'You have no assigned sections this semester.'
              : 'You are not enrolled in any sections this semester.'
          }
        />
      ) : (
        <>
          {viewMode === 'grid' && <WeeklyGrid entries={entries} colorMap={colorMap} />}
          {viewMode === 'list' && <ListView entries={entries} colorMap={colorMap} />}
        </>
      )}
    </div>
  )
}

function WeeklyGrid({
  entries,
  colorMap,
}: {
  entries: ScheduleEntry[]
  colorMap: Record<string, (typeof BLOCK_COLORS)[number]>
}) {
  return (
    <Card className="overflow-x-auto p-0">
      <div className="min-w-[700px]">
        {/* Header row */}
        <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-[var(--color-border)]">
          <div className="p-2 text-xs font-semibold text-[var(--color-text-secondary)]">Time</div>
          {DAYS.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs font-semibold text-[var(--color-text-primary)]"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time rows */}
        <div className="relative">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-[var(--color-border)]"
              style={{ height: 60 }}
            >
              <div className="flex items-start p-1 text-[10px] text-[var(--color-text-secondary)]">
                {formatTime(hour, 0)}
              </div>
              {DAYS.map((day) => (
                <div
                  key={`${day}-${hour}`}
                  className="relative border-l border-[var(--color-border)]"
                >
                  {entries
                    .filter((e) => e.day === day && e.start_hour === hour)
                    .map((entry) => {
                      const durationMin =
                        (entry.end_hour - entry.start_hour) * 60 +
                        (entry.end_min - entry.start_min)
                      const heightPx = (durationMin / 60) * 60
                      const topOffset = (entry.start_min / 60) * 60
                      const colors = colorMap[entry.subject_id] ?? BLOCK_COLORS[0]!
                      return (
                        <div
                          key={entry.id}
                          className="absolute left-0.5 right-0.5 z-10 overflow-hidden rounded-[var(--radius-sm)] border-l-[3px] px-1.5 py-1"
                          style={{
                            top: topOffset,
                            height: heightPx,
                            backgroundColor: colors.bg,
                            borderColor: colors.border,
                            color: colors.text,
                          }}
                        >
                          <p className="truncate text-[10px] font-bold leading-tight">
                            {entry.subject_code}
                          </p>
                          <p className="truncate text-[9px] leading-tight opacity-80">
                            {entry.room}
                          </p>
                          <p className="truncate text-[9px] leading-tight opacity-70">
                            {formatTime(entry.start_hour, entry.start_min)}-
                            {formatTime(entry.end_hour, entry.end_min)}
                          </p>
                        </div>
                      )
                    })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function ListView({
  entries,
  colorMap,
}: {
  entries: ScheduleEntry[]
  colorMap: Record<string, (typeof BLOCK_COLORS)[number]>
}) {
  // Group by day
  const grouped = useMemo(() => {
    const map: Record<string, ScheduleEntry[]> = {}
    for (const day of DAYS) {
      map[day] = entries
        .filter((e) => e.day === day)
        .sort((a, b) => a.start_hour * 60 + a.start_min - (b.start_hour * 60 + b.start_min))
    }
    return map
  }, [entries])

  return (
    <div className="space-y-4">
      {DAYS.map((day) => {
        const dayEntries = grouped[day] ?? []
        if (dayEntries.length === 0) return null
        return (
          <Card key={day}>
            <h3 className="mb-3 font-display text-sm font-bold text-[var(--color-text-primary)]">
              {day}
            </h3>
            <div className="space-y-2">
              {dayEntries.map((entry) => {
                const colors = colorMap[entry.subject_id] ?? BLOCK_COLORS[0]!
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-[var(--radius-md)] border-l-[3px] px-3 py-2"
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                    }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: colors.text }}>
                        {entry.subject_code}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {entry.subject_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-[var(--color-text-primary)]">
                        {formatTime(entry.start_hour, entry.start_min)} -{' '}
                        {formatTime(entry.end_hour, entry.end_min)}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {entry.room} | {entry.section_code}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
