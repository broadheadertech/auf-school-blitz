import type { CurriculumEntryWithSubject, CurriculumNodeStatus, Program } from '@/types/database'

/** Mock programs */
export const PROGRAMS: Program[] = [
  {
    id: 'p001',
    code: 'BSCS',
    name: 'Bachelor of Science in Computer Science',
    total_units: 160,
    duration_years: 4,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'p002',
    code: 'BSIT',
    name: 'Bachelor of Science in Information Technology',
    total_units: 155,
    duration_years: 4,
    created_at: '2025-01-01T00:00:00Z',
  },
]

/** BSCS curriculum — 4 years, 2 semesters each */
export const BSCS_CURRICULUM: CurriculumEntryWithSubject[] = [
  // Year 1, 1st Sem
  { id: 'c001', program_id: 'p001', subject_id: 's01', year_level: 1, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: [], created_at: '', subject: { id: 's01', code: 'CS 101', name: 'Introduction to Computing', units: 3 } },
  { id: 'c002', program_id: 'p001', subject_id: 's02', year_level: 1, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: [], created_at: '', subject: { id: 's02', code: 'CS 102', name: 'Computer Programming 1', units: 3 } },
  { id: 'c003', program_id: 'p001', subject_id: 's03', year_level: 1, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: [], created_at: '', subject: { id: 's03', code: 'MATH 101', name: 'College Algebra', units: 3 } },
  { id: 'c004', program_id: 'p001', subject_id: 's04', year_level: 1, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: [], created_at: '', subject: { id: 's04', code: 'MATH 102', name: 'Plane Trigonometry', units: 3 } },
  { id: 'c005', program_id: 'p001', subject_id: 's05', year_level: 1, semester: '1st Sem', subject_type: 'ge', prerequisite_subject_ids: [], created_at: '', subject: { id: 's05', code: 'GE 101', name: 'Understanding the Self', units: 3 } },
  { id: 'c006', program_id: 'p001', subject_id: 's06', year_level: 1, semester: '1st Sem', subject_type: 'ge', prerequisite_subject_ids: [], created_at: '', subject: { id: 's06', code: 'GE 102', name: 'Readings in Philippine History', units: 3 } },
  { id: 'c007', program_id: 'p001', subject_id: 's07', year_level: 1, semester: '1st Sem', subject_type: 'ge', prerequisite_subject_ids: [], created_at: '', subject: { id: 's07', code: 'PE 101', name: 'Physical Fitness', units: 2 } },
  // Year 1, 2nd Sem
  { id: 'c008', program_id: 'p001', subject_id: 's08', year_level: 1, semester: '2nd Sem', subject_type: 'core', prerequisite_subject_ids: ['s02'], created_at: '', subject: { id: 's08', code: 'CS 201', name: 'Computer Programming 2', units: 3 } },
  { id: 'c009', program_id: 'p001', subject_id: 's09', year_level: 1, semester: '2nd Sem', subject_type: 'core', prerequisite_subject_ids: ['s03'], created_at: '', subject: { id: 's09', code: 'MATH 201', name: 'Calculus 1', units: 3 } },
  { id: 'c010', program_id: 'p001', subject_id: 's10', year_level: 1, semester: '2nd Sem', subject_type: 'ge', prerequisite_subject_ids: [], created_at: '', subject: { id: 's10', code: 'GE 103', name: 'The Contemporary World', units: 3 } },
  { id: 'c011', program_id: 'p001', subject_id: 's11', year_level: 1, semester: '2nd Sem', subject_type: 'ge', prerequisite_subject_ids: [], created_at: '', subject: { id: 's11', code: 'NSTP 101', name: 'National Service Training Program 1', units: 3 } },
  { id: 'c012', program_id: 'p001', subject_id: 's12', year_level: 1, semester: '2nd Sem', subject_type: 'ge', prerequisite_subject_ids: [], created_at: '', subject: { id: 's12', code: 'PE 102', name: 'Rhythmic Activities', units: 2 } },
  // Year 2, 1st Sem
  { id: 'c013', program_id: 'p001', subject_id: 's13', year_level: 2, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: ['s08'], created_at: '', subject: { id: 's13', code: 'CS 301', name: 'Data Structures & Algorithms', units: 3 } },
  { id: 'c014', program_id: 'p001', subject_id: 's14', year_level: 2, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: ['s08'], created_at: '', subject: { id: 's14', code: 'CS 302', name: 'Object-Oriented Programming', units: 3 } },
  { id: 'c015', program_id: 'p001', subject_id: 's15', year_level: 2, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: ['s09'], created_at: '', subject: { id: 's15', code: 'MATH 301', name: 'Discrete Mathematics', units: 3 } },
  { id: 'c016', program_id: 'p001', subject_id: 's16', year_level: 2, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: [], created_at: '', subject: { id: 's16', code: 'CS 303', name: 'Digital Logic Design', units: 3 } },
  { id: 'c017', program_id: 'p001', subject_id: 's17', year_level: 2, semester: '1st Sem', subject_type: 'ge', prerequisite_subject_ids: [], created_at: '', subject: { id: 's17', code: 'GE 104', name: 'Mathematics in the Modern World', units: 3 } },
  { id: 'c018', program_id: 'p001', subject_id: 's18', year_level: 2, semester: '1st Sem', subject_type: 'ge', prerequisite_subject_ids: [], created_at: '', subject: { id: 's18', code: 'NSTP 102', name: 'National Service Training Program 2', units: 3 } },
  // Year 2, 2nd Sem
  { id: 'c019', program_id: 'p001', subject_id: 's19', year_level: 2, semester: '2nd Sem', subject_type: 'core', prerequisite_subject_ids: ['s13'], created_at: '', subject: { id: 's19', code: 'CS 401', name: 'Algorithm Analysis', units: 3 } },
  { id: 'c020', program_id: 'p001', subject_id: 's20', year_level: 2, semester: '2nd Sem', subject_type: 'core', prerequisite_subject_ids: ['s14'], created_at: '', subject: { id: 's20', code: 'CS 402', name: 'Database Management Systems', units: 3 } },
  { id: 'c021', program_id: 'p001', subject_id: 's21', year_level: 2, semester: '2nd Sem', subject_type: 'core', prerequisite_subject_ids: ['s16'], created_at: '', subject: { id: 's21', code: 'CS 403', name: 'Computer Architecture', units: 3 } },
  { id: 'c022', program_id: 'p001', subject_id: 's22', year_level: 2, semester: '2nd Sem', subject_type: 'core', prerequisite_subject_ids: ['s15'], created_at: '', subject: { id: 's22', code: 'MATH 401', name: 'Linear Algebra', units: 3 } },
  { id: 'c023', program_id: 'p001', subject_id: 's23', year_level: 2, semester: '2nd Sem', subject_type: 'ge', prerequisite_subject_ids: [], created_at: '', subject: { id: 's23', code: 'GE 105', name: 'Purposive Communication', units: 3 } },
  // Year 3, 1st Sem
  { id: 'c024', program_id: 'p001', subject_id: 's24', year_level: 3, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: ['s19'], created_at: '', subject: { id: 's24', code: 'CS 501', name: 'Operating Systems', units: 3 } },
  { id: 'c025', program_id: 'p001', subject_id: 's25', year_level: 3, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: ['s20'], created_at: '', subject: { id: 's25', code: 'CS 502', name: 'Software Engineering', units: 3 } },
  { id: 'c026', program_id: 'p001', subject_id: 's26', year_level: 3, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: ['s13'], created_at: '', subject: { id: 's26', code: 'CS 503', name: 'Computer Networks', units: 3 } },
  { id: 'c027', program_id: 'p001', subject_id: 's27', year_level: 3, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: ['s19', 's22'], created_at: '', subject: { id: 's27', code: 'CS 504', name: 'Automata Theory', units: 3 } },
  { id: 'c028', program_id: 'p001', subject_id: 's28', year_level: 3, semester: '1st Sem', subject_type: 'ge', prerequisite_subject_ids: [], created_at: '', subject: { id: 's28', code: 'GE 106', name: 'Art Appreciation', units: 3 } },
  // Year 3, 2nd Sem
  { id: 'c029', program_id: 'p001', subject_id: 's29', year_level: 3, semester: '2nd Sem', subject_type: 'core', prerequisite_subject_ids: ['s25'], created_at: '', subject: { id: 's29', code: 'CS 601', name: 'Software Engineering 2', units: 3 } },
  { id: 'c030', program_id: 'p001', subject_id: 's30', year_level: 3, semester: '2nd Sem', subject_type: 'core', prerequisite_subject_ids: ['s24'], created_at: '', subject: { id: 's30', code: 'CS 602', name: 'Information Security', units: 3 } },
  { id: 'c031', program_id: 'p001', subject_id: 's31', year_level: 3, semester: '2nd Sem', subject_type: 'core', prerequisite_subject_ids: ['s20'], created_at: '', subject: { id: 's31', code: 'CS 603', name: 'Web Development', units: 3 } },
  { id: 'c032', program_id: 'p001', subject_id: 's32', year_level: 3, semester: '2nd Sem', subject_type: 'elective', prerequisite_subject_ids: [], created_at: '', subject: { id: 's32', code: 'ELEC 01', name: 'Professional Elective 1', units: 3 } },
  { id: 'c033', program_id: 'p001', subject_id: 's33', year_level: 3, semester: '2nd Sem', subject_type: 'ge', prerequisite_subject_ids: [], created_at: '', subject: { id: 's33', code: 'GE 107', name: 'Science, Technology & Society', units: 3 } },
  // Year 4, 1st Sem
  { id: 'c034', program_id: 'p001', subject_id: 's34', year_level: 4, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: ['s29'], created_at: '', subject: { id: 's34', code: 'CS 701', name: 'Thesis 1', units: 3 } },
  { id: 'c035', program_id: 'p001', subject_id: 's35', year_level: 4, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: ['s27'], created_at: '', subject: { id: 's35', code: 'CS 702', name: 'Artificial Intelligence', units: 3 } },
  { id: 'c036', program_id: 'p001', subject_id: 's36', year_level: 4, semester: '1st Sem', subject_type: 'elective', prerequisite_subject_ids: [], created_at: '', subject: { id: 's36', code: 'ELEC 02', name: 'Professional Elective 2', units: 3 } },
  { id: 'c037', program_id: 'p001', subject_id: 's37', year_level: 4, semester: '1st Sem', subject_type: 'ge', prerequisite_subject_ids: [], created_at: '', subject: { id: 's37', code: 'GE 108', name: 'Ethics', units: 3 } },
  // Year 4, 2nd Sem
  { id: 'c038', program_id: 'p001', subject_id: 's38', year_level: 4, semester: '2nd Sem', subject_type: 'core', prerequisite_subject_ids: ['s34'], created_at: '', subject: { id: 's38', code: 'CS 801', name: 'Thesis 2', units: 3 } },
  { id: 'c039', program_id: 'p001', subject_id: 's39', year_level: 4, semester: '2nd Sem', subject_type: 'core', prerequisite_subject_ids: ['s25'], created_at: '', subject: { id: 's39', code: 'CS 802', name: 'Practicum / OJT', units: 6 } },
  { id: 'c040', program_id: 'p001', subject_id: 's40', year_level: 4, semester: '2nd Sem', subject_type: 'elective', prerequisite_subject_ids: [], created_at: '', subject: { id: 's40', code: 'ELEC 03', name: 'Professional Elective 3', units: 3 } },
  { id: 'c041', program_id: 'p001', subject_id: 's41', year_level: 4, semester: '2nd Sem', subject_type: 'ge', prerequisite_subject_ids: [], created_at: '', subject: { id: 's41', code: 'GE 109', name: 'The Life and Works of Rizal', units: 3 } },
]

/**
 * Mock completed subject IDs — maps to grades from the grades page mock data.
 * Student has completed 1st Sem Year 1 subjects.
 */
export const COMPLETED_SUBJECT_IDS = new Set([
  's01', // CS 101
  's02', // CS 102
  's03', // MATH 101
  's05', // GE 101
  's06', // GE 102
  's07', // PE 101
  // s04 (MATH 102) — failed (grade 5.0)
])

/** In-progress subject IDs (2nd Sem Year 1) */
export const IN_PROGRESS_SUBJECT_IDS = new Set([
  's08', // CS 201
  's10', // GE 103
  's11', // NSTP 101
])

/** Subject ID -> grade for completed subjects */
export const SUBJECT_GRADES: Record<string, number> = {
  's01': 1.5,
  's02': 2.0,
  's03': 2.5,
  's04': 5.0,
  's05': 1.75,
  's06': 2.25,
  's07': 1.5,
}

/**
 * Determine the status of a curriculum node.
 */
export function getNodeStatus(
  subjectId: string,
  prerequisiteIds: string[],
): CurriculumNodeStatus {
  if (COMPLETED_SUBJECT_IDS.has(subjectId)) return 'completed'
  if (IN_PROGRESS_SUBJECT_IDS.has(subjectId)) return 'in_progress'

  // Check if all prerequisites are completed
  if (prerequisiteIds.length === 0) return 'available'
  const allPrereqsMet = prerequisiteIds.every((id) => COMPLETED_SUBJECT_IDS.has(id))
  return allPrereqsMet ? 'available' : 'locked'
}

/** Get curriculum for a program */
export function getCurriculum(programCode: string): CurriculumEntryWithSubject[] {
  if (programCode === 'BSCS') return BSCS_CURRICULUM
  // BSIT reuses BSCS data for MVP
  return BSCS_CURRICULUM
}
