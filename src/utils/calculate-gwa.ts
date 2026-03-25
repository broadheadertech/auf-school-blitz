import type { GradeWithSubject } from '@/types/database'
import { GRADE_SCALE } from './constants'

/**
 * Calculate GWA (General Weighted Average) for a set of grades.
 * Formula: sum(final_grade * units) / sum(units)
 * Only includes finalized grades with a final_computed value.
 */
export function calculateGwa(grades: GradeWithSubject[]): number | null {
  const finalized = grades.filter(
    (g) => g.status === 'finalized' && g.final_computed !== null,
  )

  if (finalized.length === 0) return null

  let totalWeighted = 0
  let totalUnits = 0

  for (const grade of finalized) {
    totalWeighted += grade.final_computed! * grade.subject.units
    totalUnits += grade.subject.units
  }

  if (totalUnits === 0) return null

  return Math.round((totalWeighted / totalUnits) * 100) / 100
}

/**
 * Calculate cumulative GWA across all semester grade sets.
 */
export function calculateCumulativeGwa(
  semesterGrades: GradeWithSubject[][],
): number | null {
  const allGrades = semesterGrades.flat()
  return calculateGwa(allGrades)
}

/**
 * Get GWA status label based on PH grading scale.
 */
export function getGwaStatus(gwa: number): string {
  if (gwa <= 1.25) return "President's Lister"
  if (gwa <= 1.5) return "Dean's Lister"
  if (gwa <= 1.75) return 'With High Honors'
  if (gwa <= 2.0) return 'With Honors'
  if (gwa <= GRADE_SCALE.PASSING) return 'Good Standing'
  return 'Below Passing'
}

export interface SemesterInfo {
  semester: string
  academicYear: string
  grades: GradeWithSubject[]
}

/** Alias used by PDF export — flat grade row for table rendering. */
export interface GradeEntry {
  subject_code: string
  subject_name: string
  units: number
  midterm: number | null
  final_grade: number | null
  final_computed: number | null
  status: string
}

/** Alias used by PDF export — semester with its grade rows. */
export interface SemesterGrades {
  semester: string
  academic_year: string
  grades: GradeEntry[]
}

/**
 * Get trend data for the GWA chart — one point per semester.
 */
export function getGwaTrendData(
  semesters: SemesterInfo[],
): { label: string; gwa: number }[] {
  return semesters
    .map((s) => {
      const gwa = calculateGwa(s.grades)
      return gwa !== null
        ? { label: `${s.semester} ${s.academicYear}`, gwa }
        : null
    })
    .filter((d): d is { label: string; gwa: number } => d !== null)
}

/**
 * Group flat grade array into semester buckets.
 */
export function groupGradesBySemester(
  grades: GradeWithSubject[],
): SemesterInfo[] {
  const map = new Map<string, SemesterInfo>()

  for (const grade of grades) {
    const key = `${grade.semester}|${grade.academic_year}`
    let entry = map.get(key)
    if (!entry) {
      entry = {
        semester: grade.semester,
        academicYear: grade.academic_year,
        grades: [],
      }
      map.set(key, entry)
    }
    entry.grades.push(grade)
  }

  // Sort chronologically: by academic year ascending, then semester order
  const semOrder = ['1st Sem', '2nd Sem', 'Summer']
  return Array.from(map.values()).sort((a, b) => {
    if (a.academicYear !== b.academicYear) {
      return a.academicYear.localeCompare(b.academicYear)
    }
    return semOrder.indexOf(a.semester) - semOrder.indexOf(b.semester)
  })
}
