/**
 * UniPortal Full Seed — Populates ALL tables with realistic data.
 * Depends on setup-db.ts having been run first (auth users + profiles exist).
 *
 * Usage: npx tsx --env-file=.env.local scripts/seed-full.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seed() {
  console.log('🌱 UniPortal Full Seed\n')

  // ── 1. Resolve existing IDs ──────────────────────────────────
  console.log('Resolving existing records...')

  const { data: students } = await db.from('students').select('id, student_number, user_id, program')
  const { data: facultyRows } = await db.from('faculty').select('id, employee_id, user_id')
  const { data: adminRows } = await db.from('admin_staff').select('id, user_id, role_level')
  const { data: subjectRows } = await db.from('subjects').select('id, code')
  const { data: programRows } = await db.from('programs').select('id, code')

  if (!students?.length || !facultyRows?.length || !subjectRows?.length || !programRows?.length) {
    console.error('❌ Missing base data. Run setup-db.ts first.')
    process.exit(1)
  }

  const student = students[0]!
  const faculty = facultyRows[0]!
  const admin = adminRows?.find(a => a.role_level === 'staff')
  const subjectMap = Object.fromEntries(subjectRows.map(s => [s.code, s.id]))
  const programMap = Object.fromEntries(programRows.map(p => [p.code, p.id]))

  console.log(`  Student: ${student.id}`)
  console.log(`  Faculty: ${faculty.id}`)
  console.log(`  Subjects: ${subjectRows.length}`)
  console.log(`  Programs: ${programRows.length}`)

  // ── 2. Departments ───────────────────────────────────────────
  console.log('\nSeeding departments...')
  const deptData = [
    { code: 'CS', name: 'Computer Science', head_faculty_id: faculty.id },
    { code: 'MATH', name: 'Mathematics' },
    { code: 'GE', name: 'General Education' },
    { code: 'PE', name: 'Physical Education' },
    { code: 'NSTP', name: 'National Service Training' },
    { code: 'BUS', name: 'Business Administration' },
    { code: 'NUR', name: 'Nursing' },
  ]
  const { error: deptErr } = await db.from('departments').upsert(deptData, { onConflict: 'code' })
  console.log(deptErr ? `  ❌ ${deptErr.message}` : `  ✅ ${deptData.length} departments`)

  // ── 3. Academic Settings ─────────────────────────────────────
  console.log('\nSeeding academic settings...')
  const settingsData = [
    { key: 'current_semester', value: '"2nd Sem"' },
    { key: 'current_academic_year', value: '"2025-2026"' },
    { key: 'enrollment_start', value: '"2026-01-05"' },
    { key: 'enrollment_end', value: '"2026-01-20"' },
    { key: 'enrollment_status', value: '"open"' },
    { key: 'grading_start', value: '"2026-03-01"' },
    { key: 'grading_end', value: '"2026-04-15"' },
    { key: 'grading_status', value: '"open"' },
    { key: 'payment_deadline', value: '"2026-03-31"' },
    { key: 'late_payment_fee', value: '500' },
  ]
  const { error: settErr } = await db.from('academic_settings').upsert(settingsData, { onConflict: 'key' })
  console.log(settErr ? `  ❌ ${settErr.message}` : `  ✅ ${settingsData.length} settings`)

  // ── 4. Curriculum Map ────────────────────────────────────────
  console.log('\nSeeding curriculum map...')
  const bscsId = programMap['BSCS']
  if (bscsId) {
    const curriculumData = [
      // Year 1, 1st Sem
      { program_id: bscsId, subject_id: subjectMap['CS 101'], year_level: 1, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: [] },
      { program_id: bscsId, subject_id: subjectMap['CS 102'], year_level: 1, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: [] },
      { program_id: bscsId, subject_id: subjectMap['MATH 101'], year_level: 1, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: [] },
      { program_id: bscsId, subject_id: subjectMap['MATH 102'], year_level: 1, semester: '1st Sem', subject_type: 'core', prerequisite_subject_ids: [] },
      { program_id: bscsId, subject_id: subjectMap['GE 101'], year_level: 1, semester: '1st Sem', subject_type: 'ge', prerequisite_subject_ids: [] },
      { program_id: bscsId, subject_id: subjectMap['GE 102'], year_level: 1, semester: '1st Sem', subject_type: 'ge', prerequisite_subject_ids: [] },
      { program_id: bscsId, subject_id: subjectMap['PE 101'], year_level: 1, semester: '1st Sem', subject_type: 'ge', prerequisite_subject_ids: [] },
      // Year 1, 2nd Sem
      { program_id: bscsId, subject_id: subjectMap['CS 201'], year_level: 1, semester: '2nd Sem', subject_type: 'core', prerequisite_subject_ids: [subjectMap['CS 102']] },
      { program_id: bscsId, subject_id: subjectMap['GE 103'], year_level: 1, semester: '2nd Sem', subject_type: 'ge', prerequisite_subject_ids: [] },
      { program_id: bscsId, subject_id: subjectMap['NSTP 101'], year_level: 1, semester: '2nd Sem', subject_type: 'ge', prerequisite_subject_ids: [] },
    ].filter(c => c.subject_id) // skip any with missing subjects

    const { error: curErr } = await db.from('curriculum_map').upsert(curriculumData, { onConflict: 'program_id,subject_id' })
    console.log(curErr ? `  ❌ ${curErr.message}` : `  ✅ ${curriculumData.length} curriculum entries for BSCS`)
  }

  // ── 5. Sections (for both semesters) ─────────────────────────
  console.log('\nSeeding sections...')

  // Delete existing sections first to avoid conflicts
  await db.from('sections').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const sectionsData = [
    // 1st Sem 2025-2026
    { subject_id: subjectMap['CS 101'], section_code: 'CS101-A', faculty_id: faculty.id, schedule_json: [{ day: 'Mon', start: '08:00', end: '09:30', room: 'Room 301' }, { day: 'Wed', start: '08:00', end: '09:30', room: 'Room 301' }], capacity: 40, enrolled_count: 38, semester: '1st Sem', academic_year: '2025-2026', status: 'closed' },
    { subject_id: subjectMap['CS 102'], section_code: 'CS102-A', faculty_id: faculty.id, schedule_json: [{ day: 'Mon', start: '10:00', end: '11:30', room: 'Lab 1' }, { day: 'Wed', start: '10:00', end: '11:30', room: 'Lab 1' }], capacity: 40, enrolled_count: 40, semester: '1st Sem', academic_year: '2025-2026', status: 'closed' },
    { subject_id: subjectMap['MATH 101'], section_code: 'MATH101-A', faculty_id: faculty.id, schedule_json: [{ day: 'Tue', start: '08:00', end: '09:30', room: 'Room 201' }, { day: 'Thu', start: '08:00', end: '09:30', room: 'Room 201' }], capacity: 45, enrolled_count: 42, semester: '1st Sem', academic_year: '2025-2026', status: 'closed' },
    { subject_id: subjectMap['MATH 102'], section_code: 'MATH102-A', faculty_id: faculty.id, schedule_json: [{ day: 'Tue', start: '10:00', end: '11:30', room: 'Room 202' }, { day: 'Thu', start: '10:00', end: '11:30', room: 'Room 202' }], capacity: 45, enrolled_count: 40, semester: '1st Sem', academic_year: '2025-2026', status: 'closed' },
    { subject_id: subjectMap['GE 101'], section_code: 'GE101-A', faculty_id: faculty.id, schedule_json: [{ day: 'Fri', start: '08:00', end: '11:00', room: 'Room 101' }], capacity: 50, enrolled_count: 48, semester: '1st Sem', academic_year: '2025-2026', status: 'closed' },
    { subject_id: subjectMap['GE 102'], section_code: 'GE102-A', faculty_id: faculty.id, schedule_json: [{ day: 'Fri', start: '13:00', end: '16:00', room: 'Room 102' }], capacity: 50, enrolled_count: 45, semester: '1st Sem', academic_year: '2025-2026', status: 'closed' },
    { subject_id: subjectMap['PE 101'], section_code: 'PE101-A', faculty_id: faculty.id, schedule_json: [{ day: 'Wed', start: '14:00', end: '16:00', room: 'Gym' }], capacity: 50, enrolled_count: 50, semester: '1st Sem', academic_year: '2025-2026', status: 'closed' },

    // 2nd Sem 2025-2026 (currently open)
    { subject_id: subjectMap['CS 201'], section_code: 'CS201-A', faculty_id: faculty.id, schedule_json: [{ day: 'Mon', start: '08:00', end: '09:30', room: 'Room 301' }, { day: 'Wed', start: '08:00', end: '09:30', room: 'Room 301' }], capacity: 40, enrolled_count: 35, semester: '2nd Sem', academic_year: '2025-2026', status: 'open' },
    { subject_id: subjectMap['CS 201'], section_code: 'CS201-B', faculty_id: faculty.id, schedule_json: [{ day: 'Tue', start: '10:00', end: '11:30', room: 'Room 302' }, { day: 'Thu', start: '10:00', end: '11:30', room: 'Room 302' }], capacity: 40, enrolled_count: 38, semester: '2nd Sem', academic_year: '2025-2026', status: 'open' },
    { subject_id: subjectMap['GE 103'], section_code: 'GE103-A', faculty_id: faculty.id, schedule_json: [{ day: 'Tue', start: '13:00', end: '14:30', room: 'Room 101' }, { day: 'Thu', start: '13:00', end: '14:30', room: 'Room 101' }], capacity: 50, enrolled_count: 42, semester: '2nd Sem', academic_year: '2025-2026', status: 'open' },
    { subject_id: subjectMap['NSTP 101'], section_code: 'NSTP101-A', faculty_id: faculty.id, schedule_json: [{ day: 'Fri', start: '08:00', end: '11:00', room: 'Auditorium' }], capacity: 100, enrolled_count: 75, semester: '2nd Sem', academic_year: '2025-2026', status: 'open' },
  ].filter(s => s.subject_id)

  const { data: insertedSections, error: secErr } = await db.from('sections').insert(sectionsData).select('id, section_code, semester, academic_year')
  console.log(secErr ? `  ❌ ${secErr.message}` : `  ✅ ${insertedSections?.length} sections`)

  if (!insertedSections?.length) {
    console.error('❌ Sections failed. Cannot seed grades or enrollments.')
    process.exit(1)
  }

  const sectionMap: Record<string, string> = {}
  for (const s of insertedSections) {
    sectionMap[`${s.section_code}|${s.semester}|${s.academic_year}`] = s.id
  }

  // ── 6. Grades (for Maria Santos) ─────────────────────────────
  console.log('\nSeeding grades...')

  // Delete existing grades for this student
  await db.from('grades').delete().eq('student_id', student.id)

  const gradesData = [
    // 1st Sem 2025-2026 — finalized
    { student_id: student.id, section_id: sectionMap['CS101-A|1st Sem|2025-2026'], subject_id: subjectMap['CS 101'], midterm: 1.5, final_grade: 1.5, final_computed: 1.5, status: 'finalized', semester: '1st Sem', academic_year: '2025-2026', submitted_by: faculty.id, submitted_at: '2025-12-20T08:00:00Z' },
    { student_id: student.id, section_id: sectionMap['CS102-A|1st Sem|2025-2026'], subject_id: subjectMap['CS 102'], midterm: 2.0, final_grade: 2.0, final_computed: 2.0, status: 'finalized', semester: '1st Sem', academic_year: '2025-2026', submitted_by: faculty.id, submitted_at: '2025-12-20T08:00:00Z' },
    { student_id: student.id, section_id: sectionMap['MATH101-A|1st Sem|2025-2026'], subject_id: subjectMap['MATH 101'], midterm: 2.5, final_grade: 2.5, final_computed: 2.5, status: 'finalized', semester: '1st Sem', academic_year: '2025-2026', submitted_by: faculty.id, submitted_at: '2025-12-20T09:00:00Z' },
    { student_id: student.id, section_id: sectionMap['MATH102-A|1st Sem|2025-2026'], subject_id: subjectMap['MATH 102'], midterm: 3.0, final_grade: 5.0, final_computed: 5.0, status: 'finalized', semester: '1st Sem', academic_year: '2025-2026', submitted_by: faculty.id, submitted_at: '2025-12-20T09:00:00Z' },
    { student_id: student.id, section_id: sectionMap['GE101-A|1st Sem|2025-2026'], subject_id: subjectMap['GE 101'], midterm: 1.5, final_grade: 2.0, final_computed: 1.75, status: 'finalized', semester: '1st Sem', academic_year: '2025-2026', submitted_by: faculty.id, submitted_at: '2025-12-20T10:00:00Z' },
    { student_id: student.id, section_id: sectionMap['GE102-A|1st Sem|2025-2026'], subject_id: subjectMap['GE 102'], midterm: 2.0, final_grade: 2.5, final_computed: 2.25, status: 'finalized', semester: '1st Sem', academic_year: '2025-2026', submitted_by: faculty.id, submitted_at: '2025-12-20T10:00:00Z' },
    { student_id: student.id, section_id: sectionMap['PE101-A|1st Sem|2025-2026'], subject_id: subjectMap['PE 101'], midterm: 1.5, final_grade: 1.5, final_computed: 1.5, status: 'finalized', semester: '1st Sem', academic_year: '2025-2026', submitted_by: faculty.id, submitted_at: '2025-12-20T10:00:00Z' },

    // 2nd Sem 2025-2026 — in progress
    { student_id: student.id, section_id: sectionMap['CS201-A|2nd Sem|2025-2026'], subject_id: subjectMap['CS 201'], midterm: 1.75, final_grade: null, final_computed: null, status: 'in_progress', semester: '2nd Sem', academic_year: '2025-2026', submitted_by: null, submitted_at: null },
    { student_id: student.id, section_id: sectionMap['GE103-A|2nd Sem|2025-2026'], subject_id: subjectMap['GE 103'], midterm: 2.0, final_grade: null, final_computed: null, status: 'in_progress', semester: '2nd Sem', academic_year: '2025-2026', submitted_by: null, submitted_at: null },
    { student_id: student.id, section_id: sectionMap['NSTP101-A|2nd Sem|2025-2026'], subject_id: subjectMap['NSTP 101'], midterm: 1.5, final_grade: 1.5, final_computed: 1.5, status: 'submitted', semester: '2nd Sem', academic_year: '2025-2026', submitted_by: faculty.id, submitted_at: '2026-03-15T08:00:00Z' },
  ].filter(g => g.section_id && g.subject_id)

  const { error: gradeErr } = await db.from('grades').insert(gradesData)
  console.log(gradeErr ? `  ❌ ${gradeErr.message}` : `  ✅ ${gradesData.length} grades`)

  // ── 7. Fees (for Maria Santos) ───────────────────────────────
  console.log('\nSeeding fees...')
  await db.from('fees').delete().eq('student_id', student.id)

  const feesData = [
    { student_id: student.id, category: 'Tuition', description: 'Tuition Fee (20 units x ₱1,500)', amount: 30000, semester: '2nd Sem', academic_year: '2025-2026' },
    { student_id: student.id, category: 'Miscellaneous', description: 'Miscellaneous Fees', amount: 5000, semester: '2nd Sem', academic_year: '2025-2026' },
    { student_id: student.id, category: 'Laboratory', description: 'Computer Laboratory Fee', amount: 3000, semester: '2nd Sem', academic_year: '2025-2026' },
    { student_id: student.id, category: 'ID', description: 'Student ID Card', amount: 500, semester: '2nd Sem', academic_year: '2025-2026' },
    { student_id: student.id, category: 'Others', description: 'Library Fee', amount: 1000, semester: '2nd Sem', academic_year: '2025-2026' },
    { student_id: student.id, category: 'Others', description: 'Development Fee', amount: 1500, semester: '2nd Sem', academic_year: '2025-2026' },
  ]
  const { error: feeErr } = await db.from('fees').insert(feesData)
  console.log(feeErr ? `  ❌ ${feeErr.message}` : `  ✅ ${feesData.length} fees`)

  // ── 8. Payments (for Maria Santos) ───────────────────────────
  console.log('\nSeeding payments...')
  await db.from('payments').delete().eq('student_id', student.id)

  const paymentsData = [
    { student_id: student.id, amount: 20000, method: 'gcash', reference_number: 'GC-2026-001234', status: 'posted', reviewed_by: admin?.id ?? null, reviewed_at: '2026-01-15T10:00:00Z', semester: '2nd Sem', academic_year: '2025-2026', ocr_extracted_text: 'GC-2026-001234', ocr_confidence: 95.5, ocr_matched: true },
    { student_id: student.id, amount: 10000, method: 'bank_transfer', reference_number: 'BDO-2026-5678', status: 'verified', reviewed_by: admin?.id ?? null, reviewed_at: '2026-02-10T14:00:00Z', semester: '2nd Sem', academic_year: '2025-2026', ocr_extracted_text: 'BDO-2026-5678', ocr_confidence: 88.2, ocr_matched: true },
    { student_id: student.id, amount: 5000, method: 'maya', reference_number: 'MY-2026-9012', status: 'under_review', semester: '2nd Sem', academic_year: '2025-2026', ocr_extracted_text: 'MY-2O26-9O12', ocr_confidence: 62.0, ocr_matched: false },
  ]
  const { error: payErr } = await db.from('payments').insert(paymentsData)
  console.log(payErr ? `  ❌ ${payErr.message}` : `  ✅ ${paymentsData.length} payments`)

  // ── 9. Enrollments (for Maria Santos, 2nd Sem) ───────────────
  console.log('\nSeeding enrollments...')
  await db.from('enrollments').delete().eq('student_id', student.id)

  const enrollmentData = [
    { student_id: student.id, section_id: sectionMap['CS201-A|2nd Sem|2025-2026'], semester: '2nd Sem', academic_year: '2025-2026', status: 'enrolled' },
    { student_id: student.id, section_id: sectionMap['GE103-A|2nd Sem|2025-2026'], semester: '2nd Sem', academic_year: '2025-2026', status: 'enrolled' },
    { student_id: student.id, section_id: sectionMap['NSTP101-A|2nd Sem|2025-2026'], semester: '2nd Sem', academic_year: '2025-2026', status: 'enrolled' },
  ].filter(e => e.section_id)

  const { error: enrErr } = await db.from('enrollments').insert(enrollmentData)
  console.log(enrErr ? `  ❌ ${enrErr.message}` : `  ✅ ${enrollmentData.length} enrollments`)

  // ── 10. Peer Tips ────────────────────────────────────────────
  console.log('\nSeeding peer tips...')
  const tipsData = [
    { author_id: student.id, content: 'Pro tip: Enroll in your MWF subjects first para hindi ma-conflict ang sched mo.', page_context: 'enrollment', status: 'approved' },
    { author_id: student.id, content: 'Always check your GWA trend — it helps you identify which subjects need more study time.', page_context: 'grades', status: 'approved' },
    { author_id: student.id, content: 'Pay early para walang stress sa deadline. GCash is fastest!', page_context: 'payments', status: 'approved' },
    { author_id: student.id, content: 'Check the curriculum flowchart to see which subjects unlock prerequisites for next sem.', page_context: 'curriculum', status: 'approved' },
    { author_id: student.id, content: 'Set notifications for events so you don\'t miss RSVP deadlines!', page_context: 'events', status: 'approved' },
  ]
  const { error: tipErr } = await db.from('peer_tips').upsert(tipsData)
  console.log(tipErr ? `  ❌ ${tipErr.message}` : `  ✅ ${tipsData.length} peer tips`)

  // ── 11. Streak Data ──────────────────────────────────────────
  console.log('\nSeeding streak data...')
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]

  await db.from('check_ins').upsert([
    { student_id: student.id, check_in_date: twoDaysAgo },
    { student_id: student.id, check_in_date: yesterday },
    { student_id: student.id, check_in_date: today },
  ], { onConflict: 'student_id,check_in_date' })

  await db.from('streak_records').upsert([
    { student_id: student.id, current_streak: 3, longest_streak: 7, last_check_in: today },
  ], { onConflict: 'student_id' })
  console.log('  ✅ Streak records')

  // ── Done ─────────────────────────────────────────────────────
  console.log('\n🎉 Full seed complete!')
  console.log('\nAll pages should now show live data from Supabase.')
}

seed().catch(console.error)
