/**
 * Seed courses, sections, grades, fees, enrollments, and curriculum map.
 * Usage: npx tsx --env-file=.env.local scripts/seed-courses.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seed() {
  console.log('🌱 Seeding courses, sections, grades...\n')

  // 1. Get subject IDs by code
  const { data: subjects } = await supabase.from('subjects').select('id, code')
  if (!subjects || subjects.length === 0) {
    console.error('❌ No subjects found. Run setup-db.ts first.')
    process.exit(1)
  }
  const subjectMap = new Map(subjects.map((s) => [s.code, s.id]))
  console.log(`✅ Found ${subjects.length} subjects`)

  // 2. Get student and faculty IDs
  const { data: studentRows } = await supabase.from('students').select('id, user_id, student_number')
  const { data: facultyRows } = await supabase.from('faculty').select('id, user_id, employee_id')
  const { data: programRows } = await supabase.from('programs').select('id, code')

  if (!studentRows?.length || !facultyRows?.length || !programRows?.length) {
    console.error('❌ Missing students, faculty, or programs. Run setup-db.ts first.')
    process.exit(1)
  }

  const student = studentRows.find((s) => s.student_number === '2026-00001')!
  const faculty = facultyRows[0]!
  const bscsProgram = programRows.find((p) => p.code === 'BSCS')!

  console.log(`✅ Student: ${student.id}`)
  console.log(`✅ Faculty: ${faculty.id}`)
  console.log(`✅ Program: ${bscsProgram.id} (BSCS)\n`)

  // 3. Seed sections
  console.log('Seeding sections...')
  const sectionData = [
    { subject_code: 'CS 101', section_code: 'CS101-A', schedule: [{ day: 'Mon', start: '08:00', end: '09:30', room: 'CL-301' }, { day: 'Wed', start: '08:00', end: '09:30', room: 'CL-301' }], capacity: 40, enrolled: 38, sem: '1st Sem' },
    { subject_code: 'CS 102', section_code: 'CS102-A', schedule: [{ day: 'Mon', start: '10:00', end: '11:30', room: 'CL-303' }, { day: 'Wed', start: '10:00', end: '11:30', room: 'CL-303' }], capacity: 35, enrolled: 33, sem: '1st Sem' },
    { subject_code: 'MATH 101', section_code: 'MATH101-A', schedule: [{ day: 'Mon', start: '13:00', end: '14:30', room: 'R-201' }, { day: 'Wed', start: '13:00', end: '14:30', room: 'R-201' }], capacity: 45, enrolled: 42, sem: '1st Sem' },
    { subject_code: 'MATH 102', section_code: 'MATH102-A', schedule: [{ day: 'Mon', start: '15:00', end: '16:30', room: 'R-203' }, { day: 'Wed', start: '15:00', end: '16:30', room: 'R-203' }], capacity: 40, enrolled: 38, sem: '1st Sem' },
    { subject_code: 'GE 101', section_code: 'GE101-A', schedule: [{ day: 'Fri', start: '08:00', end: '11:00', room: 'GE-101' }], capacity: 50, enrolled: 48, sem: '1st Sem' },
    { subject_code: 'GE 102', section_code: 'GE102-A', schedule: [{ day: 'Fri', start: '13:00', end: '16:00', room: 'GE-102' }], capacity: 50, enrolled: 45, sem: '1st Sem' },
    { subject_code: 'PE 101', section_code: 'PE101-A', schedule: [{ day: 'Sat', start: '08:00', end: '10:00', room: 'GYM' }], capacity: 60, enrolled: 55, sem: '1st Sem' },
    { subject_code: 'CS 201', section_code: 'CS201-A', schedule: [{ day: 'Mon', start: '08:00', end: '09:30', room: 'CL-301' }, { day: 'Wed', start: '08:00', end: '09:30', room: 'CL-301' }], capacity: 40, enrolled: 35, sem: '2nd Sem' },
    { subject_code: 'GE 103', section_code: 'GE103-A', schedule: [{ day: 'Fri', start: '08:00', end: '11:00', room: 'GE-103' }], capacity: 50, enrolled: 40, sem: '2nd Sem' },
    { subject_code: 'NSTP 101', section_code: 'NSTP101-A', schedule: [{ day: 'Sat', start: '08:00', end: '11:00', room: 'NSTP-RM' }], capacity: 50, enrolled: 42, sem: '2nd Sem' },
  ]

  const sectionInserts = sectionData.map((s) => ({
    subject_id: subjectMap.get(s.subject_code),
    section_code: s.section_code,
    faculty_id: faculty.id,
    schedule_json: s.schedule,
    capacity: s.capacity,
    enrolled_count: s.enrolled,
    semester: s.sem,
    academic_year: '2025-2026',
    status: 'open',
  }))

  const { error: secErr } = await supabase.from('sections').insert(sectionInserts)
  if (secErr?.message.includes('duplicate')) {
    console.log('  ⏭️  Sections already exist')
  } else if (secErr) {
    console.error(`  ❌ Sections: ${secErr.message}`)
  } else {
    console.log(`  ✅ ${sectionInserts.length} sections`)
  }

  // Get section IDs back
  const { data: sections } = await supabase.from('sections').select('id, section_code')
  const sectionMap = new Map(sections?.map((s) => [s.section_code, s.id]) ?? [])

  // 4. Seed grades for Maria Santos
  console.log('Seeding grades...')
  const gradeData = [
    { section: 'CS101-A', subject: 'CS 101', midterm: 1.5, final: 1.5, computed: 1.5, status: 'finalized', sem: '1st Sem' },
    { section: 'CS102-A', subject: 'CS 102', midterm: 2.0, final: 2.0, computed: 2.0, status: 'finalized', sem: '1st Sem' },
    { section: 'MATH101-A', subject: 'MATH 101', midterm: 2.5, final: 2.5, computed: 2.5, status: 'finalized', sem: '1st Sem' },
    { section: 'MATH102-A', subject: 'MATH 102', midterm: 3.0, final: 5.0, computed: 5.0, status: 'finalized', sem: '1st Sem' },
    { section: 'GE101-A', subject: 'GE 101', midterm: 1.5, final: 2.0, computed: 1.75, status: 'finalized', sem: '1st Sem' },
    { section: 'GE102-A', subject: 'GE 102', midterm: 2.0, final: 2.5, computed: 2.25, status: 'finalized', sem: '1st Sem' },
    { section: 'PE101-A', subject: 'PE 101', midterm: 1.5, final: 1.5, computed: 1.5, status: 'finalized', sem: '1st Sem' },
    { section: 'CS201-A', subject: 'CS 201', midterm: 1.75, final: null, computed: null, status: 'in_progress', sem: '2nd Sem' },
    { section: 'GE103-A', subject: 'GE 103', midterm: 2.0, final: null, computed: null, status: 'in_progress', sem: '2nd Sem' },
    { section: 'NSTP101-A', subject: 'NSTP 101', midterm: 1.5, final: 1.5, computed: 1.5, status: 'submitted', sem: '2nd Sem' },
  ]

  const gradeInserts = gradeData.map((g) => ({
    student_id: student.id,
    section_id: sectionMap.get(g.section),
    subject_id: subjectMap.get(g.subject),
    midterm: g.midterm,
    final_grade: g.final,
    final_computed: g.computed,
    status: g.status,
    semester: g.sem,
    academic_year: '2025-2026',
    submitted_by: g.status !== 'in_progress' ? faculty.id : null,
    submitted_at: g.status !== 'in_progress' ? '2025-12-20T08:00:00Z' : null,
  }))

  const { error: gradeErr } = await supabase.from('grades').insert(gradeInserts)
  if (gradeErr?.message.includes('duplicate')) {
    console.log('  ⏭️  Grades already exist')
  } else if (gradeErr) {
    console.error(`  ❌ Grades: ${gradeErr.message}`)
  } else {
    console.log(`  ✅ ${gradeInserts.length} grades for Maria Santos`)
  }

  // 5. Seed curriculum map (BSCS Year 1)
  console.log('Seeding curriculum map...')
  const curriculumData = [
    { subject: 'CS 101', year: 1, sem: '1st Sem', type: 'core', prereqs: [] },
    { subject: 'CS 102', year: 1, sem: '1st Sem', type: 'core', prereqs: [] },
    { subject: 'MATH 101', year: 1, sem: '1st Sem', type: 'core', prereqs: [] },
    { subject: 'MATH 102', year: 1, sem: '1st Sem', type: 'core', prereqs: [] },
    { subject: 'GE 101', year: 1, sem: '1st Sem', type: 'ge', prereqs: [] },
    { subject: 'GE 102', year: 1, sem: '1st Sem', type: 'ge', prereqs: [] },
    { subject: 'PE 101', year: 1, sem: '1st Sem', type: 'ge', prereqs: [] },
    { subject: 'CS 201', year: 1, sem: '2nd Sem', type: 'core', prereqs: ['CS 102'] },
    { subject: 'GE 103', year: 1, sem: '2nd Sem', type: 'ge', prereqs: [] },
    { subject: 'NSTP 101', year: 1, sem: '2nd Sem', type: 'ge', prereqs: [] },
  ]

  const currInserts = curriculumData.map((c) => ({
    program_id: bscsProgram.id,
    subject_id: subjectMap.get(c.subject),
    year_level: c.year,
    semester: c.sem,
    subject_type: c.type,
    prerequisite_subject_ids: c.prereqs.map((p) => subjectMap.get(p)).filter(Boolean),
  }))

  const { error: currErr } = await supabase.from('curriculum_map').insert(currInserts)
  if (currErr?.message.includes('duplicate')) {
    console.log('  ⏭️  Curriculum map already exists')
  } else if (currErr) {
    console.error(`  ❌ Curriculum: ${currErr.message}`)
  } else {
    console.log(`  ✅ ${currInserts.length} curriculum entries`)
  }

  // 6. Seed fees for Maria
  console.log('Seeding fees...')
  const { error: feeErr } = await supabase.from('fees').insert([
    { student_id: student.id, category: 'Tuition', description: 'Tuition Fee (17 units x ₱1,500)', amount: 25500, semester: '2nd Sem', academic_year: '2025-2026' },
    { student_id: student.id, category: 'Miscellaneous', description: 'Miscellaneous Fees', amount: 5000, semester: '2nd Sem', academic_year: '2025-2026' },
    { student_id: student.id, category: 'Laboratory', description: 'Computer Laboratory Fee', amount: 3000, semester: '2nd Sem', academic_year: '2025-2026' },
    { student_id: student.id, category: 'ID', description: 'Student ID Card', amount: 500, semester: '2nd Sem', academic_year: '2025-2026' },
    { student_id: student.id, category: 'Others', description: 'Library Fee', amount: 1000, semester: '2nd Sem', academic_year: '2025-2026' },
    { student_id: student.id, category: 'Others', description: 'Development Fee', amount: 1500, semester: '2nd Sem', academic_year: '2025-2026' },
  ])
  if (feeErr?.message.includes('duplicate')) {
    console.log('  ⏭️  Fees already exist')
  } else if (feeErr) {
    console.error(`  ❌ Fees: ${feeErr.message}`)
  } else {
    console.log('  ✅ 6 fee items')
  }

  // 7. Seed payments for Maria
  console.log('Seeding payments...')
  const adminRows = await supabase.from('admin_staff').select('id').limit(1)
  const adminId = adminRows.data?.[0]?.id

  const { error: payErr } = await supabase.from('payments').insert([
    { student_id: student.id, amount: 20000, method: 'gcash', reference_number: 'GC-2026-001234', status: 'posted', reviewed_by: adminId, reviewed_at: '2026-01-15T10:00:00Z', semester: '2nd Sem', academic_year: '2025-2026', ocr_extracted_text: 'GC-2026-001234', ocr_confidence: 95.5, ocr_matched: true },
    { student_id: student.id, amount: 10000, method: 'bank_transfer', reference_number: 'BDO-2026-5678', status: 'verified', reviewed_by: adminId, reviewed_at: '2026-02-10T14:00:00Z', semester: '2nd Sem', academic_year: '2025-2026', ocr_extracted_text: 'BDO-2026-5678', ocr_confidence: 88.2, ocr_matched: true },
    { student_id: student.id, amount: 5000, method: 'maya', reference_number: 'MY-2026-9012', status: 'under_review', semester: '2nd Sem', academic_year: '2025-2026', ocr_extracted_text: 'MY-2O26-9O12', ocr_confidence: 62.0, ocr_matched: false },
  ])
  if (payErr?.message.includes('duplicate')) {
    console.log('  ⏭️  Payments already exist')
  } else if (payErr) {
    console.error(`  ❌ Payments: ${payErr.message}`)
  } else {
    console.log('  ✅ 3 payments')
  }

  // 8. Seed enrollments for Maria (2nd Sem)
  console.log('Seeding enrollments...')
  const enrollSections = ['CS201-A', 'GE103-A', 'NSTP101-A']
  const enrollInserts = enrollSections.map((sc) => ({
    student_id: student.id,
    section_id: sectionMap.get(sc),
    status: 'confirmed',
    semester: '2nd Sem',
    academic_year: '2025-2026',
  }))

  const { error: enrollErr } = await supabase.from('enrollments').insert(enrollInserts)
  if (enrollErr?.message.includes('duplicate')) {
    console.log('  ⏭️  Enrollments already exist')
  } else if (enrollErr) {
    console.error(`  ❌ Enrollments: ${enrollErr.message}`)
  } else {
    console.log(`  ✅ ${enrollInserts.length} enrollments`)
  }

  console.log('\n🎉 Course data seeded!')
  console.log('   Maria Santos now has: 10 grades, 6 fees, 3 payments, 3 enrollments')
  console.log('   BSCS curriculum: 10 subjects mapped across Year 1')
}

seed().catch(console.error)
