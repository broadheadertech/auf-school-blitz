import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GradeTable } from './components/grade-table'
import { GwaCard } from './components/gwa-card'
import { GwaTrendChart } from './components/gwa-trend-chart'
import { GradeExportButton } from './components/grade-export-button'
import { ShareGradeCard } from './components/share-grade-card'
import { FacultyAtRiskOverview } from './components/faculty-at-risk-overview'
import {
  SemesterSelector,
  buildSemesterOptions,
  parseSemesterKey,
} from './components/semester-selector'
import { groupGradesBySemester, calculateGwa, type SemesterGrades } from '@/utils/calculate-gwa'
import { useStudentGrades } from '@/hooks/use-supabase-query'
import type { GradeWithSubject } from '@/types/database'

/**
 * Mock grade data matching the seed data structure from 006_seed_grades.sql.
 * Uses the same subject codes, names, units, and grade values.
 * For MVP: hardcoded data instead of Supabase queries.
 */
const MOCK_GRADES: GradeWithSubject[] = [
  // 1st Sem 2025-2026 — finalized grades (mix of passed and failed)
  {
    id: 'g001',
    student_id: 's1000000-0000-0000-0000-000000000001',
    section_id: 'b1000000-0000-0000-0000-000000000001',
    subject_id: 'a1000000-0000-0000-0000-000000000001',
    midterm: 1.5,
    final_grade: 1.5,
    final_computed: 1.5,
    status: 'finalized',
    semester: '1st Sem',
    academic_year: '2025-2026',
    submitted_by: 'f1000000-0000-0000-0000-000000000001',
    submitted_at: '2025-12-20T08:00:00Z',
    created_at: '2025-08-01T00:00:00Z',
    subject: { code: 'CS 101', name: 'Introduction to Computing', units: 3 },
  },
  {
    id: 'g002',
    student_id: 's1000000-0000-0000-0000-000000000001',
    section_id: 'b1000000-0000-0000-0000-000000000003',
    subject_id: 'a1000000-0000-0000-0000-000000000002',
    midterm: 2.0,
    final_grade: 2.0,
    final_computed: 2.0,
    status: 'finalized',
    semester: '1st Sem',
    academic_year: '2025-2026',
    submitted_by: 'f1000000-0000-0000-0000-000000000001',
    submitted_at: '2025-12-20T08:00:00Z',
    created_at: '2025-08-01T00:00:00Z',
    subject: { code: 'CS 102', name: 'Computer Programming 1', units: 3 },
  },
  {
    id: 'g003',
    student_id: 's1000000-0000-0000-0000-000000000001',
    section_id: 'b1000000-0000-0000-0000-000000000005',
    subject_id: 'a1000000-0000-0000-0000-000000000003',
    midterm: 2.5,
    final_grade: 2.5,
    final_computed: 2.5,
    status: 'finalized',
    semester: '1st Sem',
    academic_year: '2025-2026',
    submitted_by: 'f1000000-0000-0000-0000-000000000002',
    submitted_at: '2025-12-20T09:00:00Z',
    created_at: '2025-08-01T00:00:00Z',
    subject: { code: 'MATH 101', name: 'College Algebra', units: 3 },
  },
  {
    id: 'g004',
    student_id: 's1000000-0000-0000-0000-000000000001',
    section_id: 'b1000000-0000-0000-0000-000000000007',
    subject_id: 'a1000000-0000-0000-0000-000000000004',
    midterm: 3.0,
    final_grade: 5.0,
    final_computed: 5.0,
    status: 'finalized',
    semester: '1st Sem',
    academic_year: '2025-2026',
    submitted_by: 'f1000000-0000-0000-0000-000000000002',
    submitted_at: '2025-12-20T09:00:00Z',
    created_at: '2025-08-01T00:00:00Z',
    subject: { code: 'MATH 102', name: 'Plane Trigonometry', units: 3 },
  },
  {
    id: 'g005',
    student_id: 's1000000-0000-0000-0000-000000000001',
    section_id: 'b1000000-0000-0000-0000-000000000008',
    subject_id: 'a1000000-0000-0000-0000-000000000005',
    midterm: 1.5,
    final_grade: 2.0,
    final_computed: 1.75,
    status: 'finalized',
    semester: '1st Sem',
    academic_year: '2025-2026',
    submitted_by: 'f1000000-0000-0000-0000-000000000002',
    submitted_at: '2025-12-20T10:00:00Z',
    created_at: '2025-08-01T00:00:00Z',
    subject: { code: 'GE 101', name: 'Understanding the Self', units: 3 },
  },
  {
    id: 'g006',
    student_id: 's1000000-0000-0000-0000-000000000001',
    section_id: 'b1000000-0000-0000-0000-000000000009',
    subject_id: 'a1000000-0000-0000-0000-000000000006',
    midterm: 2.0,
    final_grade: 2.5,
    final_computed: 2.25,
    status: 'finalized',
    semester: '1st Sem',
    academic_year: '2025-2026',
    submitted_by: 'f1000000-0000-0000-0000-000000000001',
    submitted_at: '2025-12-20T10:00:00Z',
    created_at: '2025-08-01T00:00:00Z',
    subject: { code: 'GE 102', name: 'Readings in Philippine History', units: 3 },
  },
  {
    id: 'g007',
    student_id: 's1000000-0000-0000-0000-000000000001',
    section_id: 'b1000000-0000-0000-0000-000000000010',
    subject_id: 'a1000000-0000-0000-0000-000000000008',
    midterm: 1.5,
    final_grade: 1.5,
    final_computed: 1.5,
    status: 'finalized',
    semester: '1st Sem',
    academic_year: '2025-2026',
    submitted_by: 'f1000000-0000-0000-0000-000000000002',
    submitted_at: '2025-12-20T10:00:00Z',
    created_at: '2025-08-01T00:00:00Z',
    subject: { code: 'PE 101', name: 'Physical Fitness', units: 2 },
  },
  // 2nd Sem 2025-2026 — in-progress and submitted grades
  {
    id: 'g008',
    student_id: 's1000000-0000-0000-0000-000000000001',
    section_id: 'b1000000-0000-0000-0000-000000000011',
    subject_id: 'a1000000-0000-0000-0000-000000000009',
    midterm: 1.75,
    final_grade: null,
    final_computed: null,
    status: 'in_progress',
    semester: '2nd Sem',
    academic_year: '2025-2026',
    submitted_by: null,
    submitted_at: null,
    created_at: '2026-01-15T00:00:00Z',
    subject: { code: 'CS 201', name: 'Computer Programming 2', units: 3 },
  },
  {
    id: 'g009',
    student_id: 's1000000-0000-0000-0000-000000000001',
    section_id: 'b1000000-0000-0000-0000-000000000012',
    subject_id: 'a1000000-0000-0000-0000-000000000007',
    midterm: 2.0,
    final_grade: null,
    final_computed: null,
    status: 'in_progress',
    semester: '2nd Sem',
    academic_year: '2025-2026',
    submitted_by: null,
    submitted_at: null,
    created_at: '2026-01-15T00:00:00Z',
    subject: { code: 'GE 103', name: 'The Contemporary World', units: 3 },
  },
  {
    id: 'g010',
    student_id: 's1000000-0000-0000-0000-000000000001',
    section_id: 'b1000000-0000-0000-0000-000000000013',
    subject_id: 'a1000000-0000-0000-0000-000000000010',
    midterm: 1.5,
    final_grade: 1.5,
    final_computed: 1.5,
    status: 'submitted',
    semester: '2nd Sem',
    academic_year: '2025-2026',
    submitted_by: 'f1000000-0000-0000-0000-000000000001',
    submitted_at: '2026-03-15T08:00:00Z',
    created_at: '2026-01-15T00:00:00Z',
    subject: { code: 'NSTP 101', name: 'National Service Training Program 1', units: 3 },
  },
]

/** Current semester — used as default selection */
const CURRENT_SEMESTER = '2nd Sem'
const CURRENT_AY = '2025-2026'

export default function GradesPage() {
  const { role, profile } = useAuthStore()
  const navigate = useNavigate()
  const profileAny = profile as Record<string, unknown> | null
  const displayName = profileAny
    ? `${String(profileAny.first_name ?? '')} ${String(profileAny.last_name ?? '')}`.trim()
    : 'Student'

  // Fetch live grades from Supabase (falls back to mock if no data)
  const { grades: liveGrades, loading: gradesLoading } = useStudentGrades()

  // Use live data if available, otherwise fall back to mock
  const allGrades: GradeWithSubject[] = liveGrades.length > 0 ? liveGrades : MOCK_GRADES

  // Build semester options from grades
  const semesterOptions = useMemo(
    () =>
      buildSemesterOptions(
        allGrades.map((g) => ({ semester: g.semester, academicYear: g.academic_year }))
      ),
    [allGrades]
  )

  // Default to current semester
  const defaultKey = `${CURRENT_SEMESTER}|${CURRENT_AY}`
  const [selectedKey, setSelectedKey] = useState(defaultKey)

  const { semester, academicYear } = parseSemesterKey(selectedKey)

  // Filter grades for selected semester
  const filteredGrades = useMemo(
    () =>
      allGrades.filter(
        (g) => g.semester === semester && g.academic_year === academicYear
      ),
    [semester, academicYear]
  )

  // Group grades by semester for GWA card and trend chart
  const semesterInfos = useMemo(() => groupGradesBySemester(allGrades), [allGrades])

  // Build SemesterGrades[] for PDF export
  const semesterGradesForExport: SemesterGrades[] = useMemo(
    () =>
      semesterInfos.map((s) => ({
        semester: s.semester,
        academic_year: s.academicYear,
        grades: s.grades.map((g) => ({
          subject_code: g.subject.code,
          subject_name: g.subject.name,
          units: g.subject.units,
          midterm: g.midterm,
          final_grade: g.final_grade,
          final_computed: g.final_computed,
          status: g.status,
        })),
      })),
    [semesterInfos]
  )

  // Find the selected semester index for PDF export
  const selectedExportIndex = useMemo(() => {
    return semesterInfos.findIndex(
      (s) => s.semester === semester && s.academicYear === academicYear
    )
  }, [semesterInfos, semester, academicYear])

  if (gradesLoading) {
    return (
      <div className="space-y-6">
        <h1>Grades</h1>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="h-24 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
            <div className="h-24 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
            <div className="h-24 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
          </div>
          <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Grades</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            View your academic performance per semester
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ShareGradeCard
            gwa={semesterInfos.length > 0 ? calculateGwa(semesterInfos[semesterInfos.length - 1]!.grades) : null}
            semester={semester}
            academicYear={academicYear}
            program={profileAny?.program ? String(profileAny.program) : 'Unknown Program'}
            studentName={displayName}
          />
          <GradeExportButton
            semesters={semesterGradesForExport}
            selectedSemesterIndex={selectedExportIndex}
          />
          <SemesterSelector
            options={semesterOptions}
            value={selectedKey}
            onChange={setSelectedKey}
          />
        </div>
      </div>

      <GwaCard semesters={semesterInfos} />
      <GwaTrendChart semesters={semesterInfos} />

      {role === 'faculty' && (
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-lighter)]">
              <ClipboardList className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-[var(--color-text-primary)]">
                Grade Submission
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Submit and manage grades for your sections
              </p>
            </div>
          </div>
          <Button variant="primary" onClick={() => navigate('/grades/submit')}>
            Submit Grades
          </Button>
        </Card>
      )}

      {role === 'faculty' && <FacultyAtRiskOverview />}

      <GradeTable grades={filteredGrades} />
    </div>
  )
}
