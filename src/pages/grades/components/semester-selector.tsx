/* eslint-disable react-refresh/only-export-components */
import { SEMESTERS } from '@/utils/constants'

interface SemesterOption {
  semester: string
  academicYear: string
  label: string
}

interface SemesterSelectorProps {
  options: SemesterOption[]
  value: string
  onChange: (value: string) => void
}

/**
 * Semester selector dropdown for the grade viewer.
 * Each option is a combination of semester + academic year (e.g., "1st Sem 2025-2026").
 * The value is a composite key: `${semester}|${academicYear}`.
 */
export function SemesterSelector({ options, value, onChange }: SemesterSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="semester-select"
        className="text-sm font-semibold text-[var(--color-text-secondary)] whitespace-nowrap"
      >
        Semester
      </label>
      <select
        id="semester-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] shadow-[var(--shadow-sm)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2 min-w-[200px]"
      >
        {options.map((opt) => (
          <option key={opt.label} value={`${opt.semester}|${opt.academicYear}`}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/** Build semester options from available semesters in grade data */
export function buildSemesterOptions(
  semesters: Array<{ semester: string; academicYear: string }>
): SemesterOption[] {
  const uniqueMap = new Map<string, SemesterOption>()

  for (const s of semesters) {
    const key = `${s.semester}|${s.academicYear}`
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, {
        semester: s.semester,
        academicYear: s.academicYear,
        label: `${s.semester} ${s.academicYear}`,
      })
    }
  }

  // Sort: newest academic year first, then by semester order
  const semesterOrder = SEMESTERS as readonly string[]
  return Array.from(uniqueMap.values()).sort((a, b) => {
    if (a.academicYear !== b.academicYear) {
      return b.academicYear.localeCompare(a.academicYear)
    }
    return semesterOrder.indexOf(a.semester) - semesterOrder.indexOf(b.semester)
  })
}

/** Parse a composite key back into semester + academicYear */
export function parseSemesterKey(key: string): {
  semester: string
  academicYear: string
} {
  const [semester = '', academicYear = ''] = key.split('|')
  return { semester, academicYear }
}
