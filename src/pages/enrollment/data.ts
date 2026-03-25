import type { EnrollmentWithSection, Section, ScheduleEntry } from '@/types/database'

/** Mock available sections for 2nd Sem 2025-2026 */
export const AVAILABLE_SECTIONS: (Section & { subject: { code: string; name: string; units: number } })[] = [
  {
    id: 'sec01', subject_id: 's08', section_code: 'CS201-A', faculty_id: 'f01',
    schedule_json: [{ day: 'Mon', start: '08:00', end: '09:30', room: 'Room 301' }, { day: 'Wed', start: '08:00', end: '09:30', room: 'Room 301' }],
    capacity: 40, enrolled_count: 35, semester: '2nd Sem', academic_year: '2025-2026', status: 'open', created_at: '',
    subject: { code: 'CS 201', name: 'Computer Programming 2', units: 3 },
  },
  {
    id: 'sec02', subject_id: 's08', section_code: 'CS201-B', faculty_id: 'f02',
    schedule_json: [{ day: 'Tue', start: '10:00', end: '11:30', room: 'Room 302' }, { day: 'Thu', start: '10:00', end: '11:30', room: 'Room 302' }],
    capacity: 40, enrolled_count: 38, semester: '2nd Sem', academic_year: '2025-2026', status: 'open', created_at: '',
    subject: { code: 'CS 201', name: 'Computer Programming 2', units: 3 },
  },
  {
    id: 'sec03', subject_id: 's09', section_code: 'MATH201-A', faculty_id: 'f03',
    schedule_json: [{ day: 'Mon', start: '10:00', end: '11:30', room: 'Room 201' }, { day: 'Wed', start: '10:00', end: '11:30', room: 'Room 201' }],
    capacity: 45, enrolled_count: 30, semester: '2nd Sem', academic_year: '2025-2026', status: 'open', created_at: '',
    subject: { code: 'MATH 201', name: 'Calculus 1', units: 3 },
  },
  {
    id: 'sec04', subject_id: 's10', section_code: 'GE103-A', faculty_id: 'f01',
    schedule_json: [{ day: 'Tue', start: '13:00', end: '14:30', room: 'Room 101' }, { day: 'Thu', start: '13:00', end: '14:30', room: 'Room 101' }],
    capacity: 50, enrolled_count: 42, semester: '2nd Sem', academic_year: '2025-2026', status: 'open', created_at: '',
    subject: { code: 'GE 103', name: 'The Contemporary World', units: 3 },
  },
  {
    id: 'sec05', subject_id: 's11', section_code: 'NSTP101-A', faculty_id: 'f02',
    schedule_json: [{ day: 'Fri', start: '08:00', end: '11:00', room: 'Auditorium' }],
    capacity: 100, enrolled_count: 75, semester: '2nd Sem', academic_year: '2025-2026', status: 'open', created_at: '',
    subject: { code: 'NSTP 101', name: 'National Service Training Program 1', units: 3 },
  },
  {
    id: 'sec06', subject_id: 's12', section_code: 'PE102-A', faculty_id: 'f03',
    schedule_json: [{ day: 'Wed', start: '14:00', end: '16:00', room: 'Gym' }],
    capacity: 50, enrolled_count: 48, semester: '2nd Sem', academic_year: '2025-2026', status: 'open', created_at: '',
    subject: { code: 'PE 102', name: 'Rhythmic Activities', units: 2 },
  },
  {
    id: 'sec07', subject_id: 's09', section_code: 'MATH201-B', faculty_id: 'f03',
    schedule_json: [{ day: 'Tue', start: '08:00', end: '09:30', room: 'Room 203' }, { day: 'Thu', start: '08:00', end: '09:30', room: 'Room 203' }],
    capacity: 45, enrolled_count: 44, semester: '2nd Sem', academic_year: '2025-2026', status: 'open', created_at: '',
    subject: { code: 'MATH 201', name: 'Calculus 1', units: 3 },
  },
]

/** Mock confirmed enrollment (for returning student view) */
export const MOCK_ENROLLMENT: EnrollmentWithSection[] = []

/** Enrollment period status */
export const ENROLLMENT_STATUS = {
  isOpen: true,
  semester: '2nd Sem',
  academicYear: '2025-2026',
  startDate: '2026-01-05',
  endDate: '2026-01-20',
}

/** Check if two schedule entries conflict */
export function schedulesConflict(a: ScheduleEntry[], b: ScheduleEntry[]): boolean {
  for (const slotA of a) {
    for (const slotB of b) {
      if (slotA.day !== slotB.day) continue
      const aStart = parseTime(slotA.start)
      const aEnd = parseTime(slotA.end)
      const bStart = parseTime(slotB.start)
      const bEnd = parseTime(slotB.end)
      if (aStart < bEnd && bStart < aEnd) return true
    }
  }
  return false
}

function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/** Format schedule for display */
export function formatSchedule(schedule: ScheduleEntry[]): string {
  return schedule.map((s) => `${s.day} ${s.start}-${s.end} (${s.room})`).join(', ')
}

/** Calculate fee estimate based on units */
export function estimateFees(totalUnits: number): number {
  const perUnit = 1500
  const misc = 5000
  const lab = 3000
  return totalUnits * perUnit + misc + lab
}
