export const GRADE_SCALE = {
  HIGHEST: 1.0,
  PASSING: 3.0,
  LOWEST: 5.0,
} as const

export const PROGRAMS = [
  { code: 'BSCS', name: 'Bachelor of Science in Computer Science' },
  { code: 'BSIT', name: 'Bachelor of Science in Information Technology' },
  { code: 'BSN', name: 'Bachelor of Science in Nursing' },
  { code: 'BSBA', name: 'Bachelor of Science in Business Administration' },
  { code: 'BSED', name: 'Bachelor of Science in Education' },
  { code: 'BSECE', name: 'Bachelor of Science in Electronics & Communications Engineering' },
] as const

export const SEMESTERS = ['1st Sem', '2nd Sem', 'Summer'] as const

export const MAX_UNITS_PER_SEMESTER = 24
