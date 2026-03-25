/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, FileSpreadsheet, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useFacultySections } from '@/hooks/use-supabase-query'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SectionSelector } from './components/section-selector'
import type { FacultySection } from './components/section-selector'
import {
  GradeEntryTable,
  validateGrade,
  type StudentGradeEntry,
} from './components/grade-entry-table'
import { CsvUpload, type CsvRow } from './components/csv-upload'
import { AtRiskPanel } from './components/at-risk-panel'

export default function GradeSubmissionPage() {
  const navigate = useNavigate()
  const { role, user, profile } = useAuthStore()
  const { sections, loading: sectionsLoading } = useFacultySections()

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [entries, setEntries] = useState<StudentGradeEntry[]>([])
  const [csvError, setCsvError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const stats = useMemo(() => {
    const total = entries.length
    const filled = entries.filter(
      (e) => e.midterm.trim() !== '' && e.final_grade.trim() !== '',
    ).length
    const hasErrors = entries.some((e) => e.midterm_error !== null || e.final_error !== null)
    const allValid = filled === total && !hasErrors && total > 0
    return { total, filled, hasErrors, allValid }
  }, [entries])

  // Faculty-only guard
  if (role !== 'faculty') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-sm text-[var(--color-text-secondary)]">
          This page is only accessible to faculty members.
        </p>
        <Button variant="secondary" onClick={() => navigate('/grades')}>
          Go to Grades
        </Button>
      </div>
    )
  }

  const selectedSection = sections.find((s: any) => s.id === selectedSectionId) as
    | FacultySection
    | undefined

  const handleSelectSection = async (sectionId: string) => {
    setSelectedSectionId(sectionId)
    setSubmitted(false)
    setCsvError(null)
    setSubmitError(null)
    setLoadingStudents(true)
    setEntries([])

    try {
      // Fetch enrolled students for this section
      const { data: enrollments, error: enrollError } = await (supabase
        .from('enrollments')
        .select('*, students(id, student_number, first_name, last_name)')
        .eq('section_id', sectionId)
        .eq('status', 'confirmed') as any)

      if (enrollError) {
        console.error('Failed to fetch enrollments:', enrollError)
        setLoadingStudents(false)
        return
      }

      // Find the section to get subject_id
      const section = sections.find((s: any) => s.id === sectionId) as FacultySection | undefined

      // Check for existing grades for these students in this section
      const studentIds = (enrollments ?? [])
        .map((e: any) => e.students?.id)
        .filter(Boolean)

      let existingGrades: any[] = []
      if (studentIds.length > 0 && section) {
        const { data: grades } = await (supabase
          .from('grades')
          .select('*')
          .eq('section_id', sectionId)
          .in('student_id', studentIds) as any)
        existingGrades = grades ?? []
      }

      // Map enrollments to StudentGradeEntry, pre-filling any existing grades
      const studentEntries: StudentGradeEntry[] = (enrollments ?? [])
        .filter((e: any) => e.students)
        .map((enrollment: any) => {
          const student = enrollment.students
          const existingGrade = existingGrades.find(
            (g: any) => g.student_id === student.id,
          )
          return {
            student_id: student.id,
            student_number: student.student_number,
            first_name: student.first_name,
            last_name: student.last_name,
            midterm: existingGrade?.midterm != null ? String(existingGrade.midterm) : '',
            final_grade:
              existingGrade?.final_grade != null ? String(existingGrade.final_grade) : '',
            midterm_error: null,
            final_error: null,
          }
        })
        .sort((a: StudentGradeEntry, b: StudentGradeEntry) =>
          a.last_name.localeCompare(b.last_name),
        )

      setEntries(studentEntries)
    } catch (err) {
      console.error('Error loading students:', err)
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleUpdateEntry = (
    studentId: string,
    field: 'midterm' | 'final_grade',
    value: string,
  ) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.student_id !== studentId) return entry
        const updated = { ...entry, [field]: value }
        if (field === 'midterm') {
          updated.midterm_error = validateGrade(value)
        } else {
          updated.final_error = validateGrade(value)
        }
        return updated
      }),
    )
  }

  const handleCsvUpload = (rows: CsvRow[]) => {
    setCsvError(null)
    setEntries((prev) => {
      const updated = [...prev]
      let matchCount = 0

      for (const row of rows) {
        const idx = updated.findIndex((e) => e.student_number === row.student_number)
        if (idx === -1) continue
        matchCount++

        const entry = { ...updated[idx]! }
        if (row.midterm) {
          entry.midterm = row.midterm
          entry.midterm_error = validateGrade(row.midterm)
        }
        if (row.final_grade) {
          entry.final_grade = row.final_grade
          entry.final_error = validateGrade(row.final_grade)
        }
        updated[idx] = entry
      }

      if (matchCount === 0) {
        setCsvError('No matching student numbers found in the CSV.')
      } else if (matchCount < rows.length) {
        setCsvError(
          `Matched ${matchCount} of ${rows.length} rows. ${rows.length - matchCount} student numbers not found in this section.`,
        )
      }

      return updated
    })
  }

  const handleCsvError = (message: string) => {
    setCsvError(message)
  }

  const handleSubmit = useCallback(async () => {
    if (!selectedSection || !user) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const facultyId = (profile as any)?.id ?? null

      // Compute final_computed as average of midterm and final_grade
      const gradeRows = entries
        .filter((e) => e.midterm.trim() !== '' && e.final_grade.trim() !== '')
        .map((entry) => {
          const midterm = Number(entry.midterm)
          const finalGrade = Number(entry.final_grade)
          // Simple average, rounded to nearest 0.25
          const rawAvg = (midterm + finalGrade) / 2
          const finalComputed = Math.round(rawAvg * 4) / 4

          return {
            student_id: entry.student_id,
            section_id: selectedSection.id,
            subject_id: selectedSection.subject_id,
            midterm,
            final_grade: finalGrade,
            final_computed: finalComputed,
            status: 'submitted' as const,
            semester: selectedSection.semester,
            academic_year: selectedSection.academic_year,
            submitted_by: facultyId,
            submitted_at: new Date().toISOString(),
          }
        })

      if (gradeRows.length === 0) {
        setSubmitError('No valid grades to submit.')
        setSubmitting(false)
        return
      }

      // Upsert grades — uses unique constraint on (student_id, section_id)
      const { error } = await (supabase
        .from('grades') as any)
        .upsert(gradeRows, { onConflict: 'student_id,section_id' })

      if (error) {
        console.error('Grade submission error:', error)
        setSubmitError(error.message ?? 'Failed to submit grades. Please try again.')
        setSubmitting(false)
        return
      }

      setSubmitted(true)
    } catch (err: any) {
      console.error('Submit error:', err)
      setSubmitError('An unexpected error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [entries, selectedSection, user, profile])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/grades')}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-lighter)] transition-colors duration-150"
          aria-label="Back to grades"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
            Grade Submission
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Submit grades for your sections
          </p>
        </div>
      </div>

      {/* Success state */}
      {submitted && (
        <Card className="border-l-4 border-l-green-500">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-green-700">
                Grades Submitted Successfully
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {stats.filled} grades have been submitted. Students will be notified.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Section Selector */}
      <SectionSelector
        sections={sections}
        loading={sectionsLoading}
        selectedSectionId={selectedSectionId}
        onSelect={handleSelectSection}
      />

      {/* Loading students indicator */}
      {loadingStudents && (
        <div className="flex items-center gap-2 py-4 text-sm text-[var(--color-text-secondary)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading enrolled students...
        </div>
      )}

      {/* Content when section is selected */}
      {selectedSectionId && !submitted && !loadingStudents && (
        <>
          {entries.length === 0 ? (
            <Card>
              <p className="py-4 text-center text-sm text-[var(--color-text-secondary)]">
                No enrolled students found for this section.
              </p>
            </Card>
          ) : (
            <>
              {/* CSV Upload */}
              <CsvUpload onUpload={handleCsvUpload} onError={handleCsvError} />

              {csvError && (
                <div className="rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 px-3 py-2">
                  <p className="text-sm text-amber-700">{csvError}</p>
                </div>
              )}

              {/* Grade Entry Table */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-[var(--color-text-secondary)]" />
                    <h2 className="font-display text-base font-semibold text-[var(--color-text-primary)]">
                      Grade Entry
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={stats.filled === stats.total ? 'success' : 'info'}
                      label={`${stats.filled}/${stats.total} filled`}
                    />
                    {stats.hasErrors && <Badge variant="error" label="Has errors" />}
                  </div>
                </div>
                <GradeEntryTable entries={entries} onUpdateEntry={handleUpdateEntry} />
              </div>

              {/* At-Risk Panel (Story 3.6) */}
              <AtRiskPanel entries={entries} />

              {/* Submit Error */}
              {submitError && (
                <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedSectionId(null)
                    setEntries([])
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={!stats.allValid || submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    `Submit Grades (${stats.filled}/${stats.total})`
                  )}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
