/**
 * UniPortal Phase 4 Seed — Populates all new tables with realistic data.
 * Depends on setup-db.ts and seed-full.ts having been run first.
 *
 * Usage: npx tsx --env-file=.env.local scripts/seed-phase4.ts
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
}) as any

async function seed() {
  console.log('🌱 UniPortal Phase 4 Seed\n')

  // ── Resolve existing IDs ──────────────────────────────────────
  console.log('Resolving existing records...')

  const { data: students } = await db.from('students').select('id, user_id, student_number, first_name, last_name, program, year_level')
  const { data: facultyRows } = await db.from('faculty').select('id, user_id, employee_id, first_name, last_name')
  const { data: adminRows } = await db.from('admin_staff').select('id, user_id, role_level')
  const { data: subjectRows } = await db.from('subjects').select('id, code, name')
  const { data: sectionRows } = await db.from('sections').select('id, section_code, subject_id, faculty_id, semester, academic_year, status')
  const { data: authUsers } = await db.auth.admin.listUsers()

  if (!students?.length || !facultyRows?.length || !sectionRows?.length) {
    console.error('❌ Missing base data. Run setup-db.ts and seed-full.ts first.')
    process.exit(1)
  }

  const student = students[0]!
  const faculty = facultyRows[0]!
  const admin = adminRows?.find((a: any) => a.role_level === 'staff')
  const superadmin = adminRows?.find((a: any) => a.role_level === 'superadmin')
  const openSections = sectionRows.filter((s: any) => s.status === 'open')

  console.log(`  Students: ${students.length}`)
  console.log(`  Faculty: ${facultyRows.length}`)
  console.log(`  Sections: ${sectionRows.length} (${openSections.length} open)`)

  // ── 1. Document Requests ──────────────────────────────────────
  console.log('\nSeeding document requests...')
  const docData = [
    { student_id: student.id, document_type: 'transcript', purpose: 'Scholarship application at ABC Foundation', status: 'ready', processed_by: admin?.id, requested_at: '2026-02-15T08:00:00Z', completed_at: '2026-02-20T10:00:00Z' },
    { student_id: student.id, document_type: 'good_moral', purpose: 'Job application for summer internship', status: 'processing', processed_by: admin?.id, requested_at: '2026-03-10T09:00:00Z' },
    { student_id: student.id, document_type: 'enrollment_cert', purpose: 'Bank student loan requirement', status: 'pending', requested_at: '2026-03-20T14:00:00Z' },
    { student_id: student.id, document_type: 'grades_cert', purpose: 'Transfer evaluation to another university', status: 'claimed', processed_by: admin?.id, requested_at: '2026-01-10T08:00:00Z', completed_at: '2026-01-15T10:00:00Z' },
  ]
  const { error: docErr } = await db.from('document_requests').insert(docData)
  console.log(docErr ? `  ❌ ${docErr.message}` : `  ✅ ${docData.length} document requests`)

  // ── 2. Clearance Items ────────────────────────────────────────
  console.log('\nSeeding clearance items...')
  const clearanceData = [
    { student_id: student.id, department: 'Library', description: 'No pending borrowed books', status: 'cleared', cleared_by: admin?.id, semester: '2nd Sem', academic_year: '2025-2026' },
    { student_id: student.id, department: 'Finance', description: 'No outstanding balance', status: 'pending', semester: '2nd Sem', academic_year: '2025-2026', remarks: 'Outstanding balance of ₱6,000' },
    { student_id: student.id, department: 'Registrar', description: 'Enrollment verified', status: 'cleared', cleared_by: admin?.id, semester: '2nd Sem', academic_year: '2025-2026' },
    { student_id: student.id, department: 'CS Department', description: 'No pending laboratory equipment', status: 'cleared', cleared_by: admin?.id, semester: '2nd Sem', academic_year: '2025-2026' },
    { student_id: student.id, department: 'Student Affairs', description: 'No disciplinary cases', status: 'cleared', cleared_by: admin?.id, semester: '2nd Sem', academic_year: '2025-2026' },
    { student_id: student.id, department: 'IT Department', description: 'Return student laptop / access card', status: 'hold', semester: '2nd Sem', academic_year: '2025-2026', remarks: 'Access card not yet returned' },
  ]
  const { error: clrErr } = await db.from('clearance_items').insert(clearanceData)
  console.log(clrErr ? `  ❌ ${clrErr.message}` : `  ✅ ${clearanceData.length} clearance items`)

  // ── 3. Messages ───────────────────────────────────────────────
  console.log('\nSeeding messages...')
  const msgData = [
    { sender_id: student.user_id, recipient_id: faculty.user_id, content: 'Good day, Prof. Santos! I have a question about our CS 201 midterm exam. Can I visit during your consultation hours?', is_read: true, created_at: '2026-03-18T08:30:00Z' },
    { sender_id: faculty.user_id, recipient_id: student.user_id, content: 'Hi Maria! Of course, you can visit me on Wednesday from 2-4 PM at my office in CSB Room 303.', is_read: true, created_at: '2026-03-18T09:15:00Z' },
    { sender_id: student.user_id, recipient_id: faculty.user_id, content: 'Thank you, Prof! I\'ll be there. Also, is it possible to get feedback on my programming project?', is_read: true, created_at: '2026-03-18T09:30:00Z' },
    { sender_id: faculty.user_id, recipient_id: student.user_id, content: 'Sure, bring your laptop with the project code. We can review it together.', is_read: false, created_at: '2026-03-18T10:00:00Z' },
    { sender_id: student.user_id, recipient_id: superadmin?.user_id ?? admin?.user_id, content: 'Good day! I need help resetting my portal password. My student number is 2026-00001.', is_read: true, created_at: '2026-03-15T14:00:00Z' },
    { sender_id: superadmin?.user_id ?? admin?.user_id, recipient_id: student.user_id, content: 'Hi Maria, I\'ve sent a password reset link to your email. Please check your inbox.', is_read: true, created_at: '2026-03-15T14:30:00Z' },
  ]
  const { error: msgErr } = await db.from('messages').insert(msgData)
  console.log(msgErr ? `  ❌ ${msgErr.message}` : `  ✅ ${msgData.length} messages`)

  // ── 4. Course Reviews ─────────────────────────────────────────
  console.log('\nSeeding course reviews...')
  const reviewSubjects = subjectRows.slice(0, 7)
  const reviewData = reviewSubjects.map((s: any, i: number) => ({
    student_id: student.id,
    subject_id: s.id,
    rating: [5, 4, 3, 4, 5, 3, 4][i],
    difficulty: [3, 4, 2, 5, 2, 3, 4][i],
    workload: [3, 5, 2, 4, 2, 3, 3][i],
    comment: [
      'Great introduction to computing! Prof. Santos makes the concepts easy to understand.',
      'Challenging but rewarding. The programming exercises really helped me learn.',
      'Straightforward algebra course. Good review of high school math.',
      'Very difficult — the final exam was brutal. Study hard for this one!',
      'Fun and thought-provoking class. Lots of reflection activities.',
      'Interesting take on Philippine history. The discussions were engaging.',
      'Easy PE class, just show up and participate. Great stress reliever!',
    ][i],
    is_anonymous: [false, true, false, true, false, true, false][i],
    semester: '1st Sem',
    academic_year: '2025-2026',
  }))
  const { error: revErr } = await db.from('course_reviews').insert(reviewData)
  console.log(revErr ? `  ❌ ${revErr.message}` : `  ✅ ${reviewData.length} course reviews`)

  // ── 5. Attendance Records ─────────────────────────────────────
  console.log('\nSeeding attendance records...')
  const attendanceDates = ['2026-03-03', '2026-03-05', '2026-03-10', '2026-03-12', '2026-03-17', '2026-03-19', '2026-03-24']
  const attendanceStatuses = ['present', 'present', 'present', 'late', 'present', 'absent', 'present']
  const attendanceSection = openSections[0]
  const attendanceData = attendanceDates.map((date, i) => ({
    section_id: attendanceSection?.id,
    student_id: student.id,
    date,
    status: attendanceStatuses[i],
    remarks: attendanceStatuses[i] === 'late' ? 'Arrived 10 minutes late' : attendanceStatuses[i] === 'absent' ? 'No excuse letter submitted' : null,
    marked_by: faculty.id,
  })).filter(a => a.section_id)
  const { error: attErr } = await db.from('attendance').insert(attendanceData)
  console.log(attErr ? `  ❌ ${attErr.message}` : `  ✅ ${attendanceData.length} attendance records`)

  // ── 6. Class Materials ────────────────────────────────────────
  console.log('\nSeeding class materials...')
  const materialsSection = openSections[0]
  const materialsData = [
    { section_id: materialsSection?.id, title: 'CS 201 Course Syllabus', description: 'Complete course syllabus for Computer Programming 2, including grading breakdown and schedule.', file_url: 'https://example.com/syllabus-cs201.pdf', file_type: 'pdf', uploaded_by: faculty.id },
    { section_id: materialsSection?.id, title: 'Week 1-4 Lecture Slides', description: 'Object-Oriented Programming fundamentals — classes, objects, inheritance, polymorphism.', file_url: 'https://example.com/cs201-w1-4.pptx', file_type: 'pptx', uploaded_by: faculty.id },
    { section_id: materialsSection?.id, title: 'Programming Exercise 1', description: 'Create a student management system using OOP principles. Due: March 28, 2026.', file_url: 'https://example.com/cs201-exercise1.pdf', file_type: 'pdf', uploaded_by: faculty.id },
    { section_id: materialsSection?.id, title: 'Midterm Study Guide', description: 'Topics covered: Chapters 1-8, focus on design patterns and data structures.', file_url: 'https://example.com/cs201-midterm-guide.pdf', file_type: 'pdf', uploaded_by: faculty.id },
    { section_id: materialsSection?.id, title: 'Sample Midterm Exam', description: 'Past midterm exam for practice. Answers will be discussed in class.', file_url: 'https://example.com/cs201-sample-midterm.pdf', file_type: 'pdf', uploaded_by: faculty.id },
  ].filter(m => m.section_id)
  const { error: matErr } = await db.from('class_materials').insert(materialsData)
  console.log(matErr ? `  ❌ ${matErr.message}` : `  ✅ ${materialsData.length} class materials`)

  // ── 7. Consultation Slots & Bookings ──────────────────────────
  console.log('\nSeeding consultation slots...')
  const slotsData = [
    { faculty_id: faculty.id, day_of_week: 'Monday', start_time: '14:00', end_time: '16:00', max_bookings: 3, is_active: true },
    { faculty_id: faculty.id, day_of_week: 'Wednesday', start_time: '14:00', end_time: '16:00', max_bookings: 3, is_active: true },
    { faculty_id: faculty.id, day_of_week: 'Friday', start_time: '10:00', end_time: '12:00', max_bookings: 2, is_active: true },
  ]
  const { data: insertedSlots, error: slotErr } = await db.from('consultation_slots').insert(slotsData).select('id, day_of_week')
  console.log(slotErr ? `  ❌ ${slotErr.message}` : `  ✅ ${insertedSlots?.length} consultation slots`)

  if (insertedSlots?.length) {
    const mondaySlot = insertedSlots.find((s: any) => s.day_of_week === 'Monday')
    if (mondaySlot) {
      const bookingData = [
        { slot_id: mondaySlot.id, student_id: student.id, booking_date: '2026-03-31', topic: 'Midterm exam review and CS 201 project feedback', status: 'confirmed' },
      ]
      const { error: bookErr } = await db.from('consultation_bookings').insert(bookingData)
      console.log(bookErr ? `  ❌ Bookings: ${bookErr.message}` : `  ✅ 1 consultation booking`)
    }
  }

  // ── 8. Announcements ──────────────────────────────────────────
  console.log('\nSeeding announcements...')
  const announcementData = [
    { title: 'Midterm Week Reminder', content: 'Midterm examinations will be held from March 25-29, 2026. Please review your exam schedules on UniPortal. Bring your student ID to all exams. No electronic devices allowed in the examination room.', target_programs: ['BSCS', 'BSIT', 'BSN', 'BSBA'], target_year_levels: [1, 2, 3, 4], priority: 'high', published_by: admin?.id },
    { title: 'Enrollment for 1st Sem AY 2026-2027 Opens May 5', content: 'Online enrollment for continuing students will open on May 5, 2026. Freshmen enrollment: May 12-16. Please settle all outstanding balances before enrolling.', target_programs: [], target_year_levels: [], priority: 'normal', published_by: admin?.id },
    { title: 'CS Department: Hackathon Registration', content: 'The CS Department Hackathon is on April 19-20, 2026. Open to all CS and IT students. Register on UniPortal Events page. Prizes: 1st — ₱10,000, 2nd — ₱5,000, 3rd — ₱3,000.', target_programs: ['BSCS', 'BSIT'], target_year_levels: [], priority: 'normal', published_by: admin?.id },
    { title: 'URGENT: System Maintenance on March 30', content: 'UniPortal will be down for maintenance on March 30, 2026 from 12:00 AM to 6:00 AM. Please save your work and log out before midnight.', target_programs: [], target_year_levels: [], priority: 'urgent', published_by: superadmin?.id ?? admin?.id },
    { title: 'Scholarship Applications Now Open', content: 'Applications for the Academic Excellence Scholarship and the Financial Assistance Grant are now open. Check the Scholarships page for requirements and deadlines.', target_programs: [], target_year_levels: [], priority: 'normal', published_by: admin?.id },
    { title: 'Library Extended Hours During Midterms', content: 'The university library will extend operating hours during midterm week. New hours: 6:00 AM - 12:00 AM (March 24-30). Study rooms available on a first-come, first-served basis.', target_programs: [], target_year_levels: [], priority: 'low', published_by: admin?.id },
  ]
  const { error: annErr } = await db.from('announcements').insert(announcementData)
  console.log(annErr ? `  ❌ ${annErr.message}` : `  ✅ ${announcementData.length} announcements`)

  // ── 9. Scholarships ───────────────────────────────────────────
  console.log('\nSeeding scholarships...')
  const scholarshipData = [
    { name: 'Academic Excellence Scholarship', description: 'Full tuition waiver for students with outstanding academic performance. Must maintain GWA of 1.5 or better each semester.', max_gwa: 1.5, min_year_level: 1, programs: ['BSCS', 'BSIT', 'BSN', 'BSBA'], slots: 10, deadline: '2026-04-30T23:59:59Z', is_active: true },
    { name: 'Financial Assistance Grant', description: '50% tuition discount for students with demonstrated financial need. Must maintain GWA of 2.5 or better.', max_gwa: 2.5, min_year_level: 1, programs: ['BSCS', 'BSIT', 'BSN', 'BSBA'], slots: 25, deadline: '2026-04-30T23:59:59Z', is_active: true },
    { name: 'CS Department Merit Award', description: 'Cash prize of ₱15,000 for the top CS student each academic year. Based on GWA and extracurricular involvement.', max_gwa: 1.75, min_year_level: 2, programs: ['BSCS'], slots: 1, deadline: '2026-05-15T23:59:59Z', is_active: true },
    { name: 'Student-Athlete Scholarship', description: 'Full tuition + monthly stipend for varsity athletes. Must maintain GWA of 2.5 and active varsity membership.', max_gwa: 2.5, min_year_level: 1, programs: [], slots: 15, deadline: '2026-04-15T23:59:59Z', is_active: true },
    { name: 'International Exchange Fund', description: 'Travel and tuition support for students accepted to partner university exchange programs.', max_gwa: 2.0, min_year_level: 3, programs: ['BSCS', 'BSIT'], slots: 5, deadline: '2026-04-30T23:59:59Z', is_active: true },
  ]
  const { data: insertedScholarships, error: schErr } = await db.from('scholarships').insert(scholarshipData).select('id, name')
  console.log(schErr ? `  ❌ ${schErr.message}` : `  ✅ ${insertedScholarships?.length} scholarships`)

  // Add a scholarship application for Maria
  if (insertedScholarships?.length) {
    const financialAid = insertedScholarships.find((s: any) => s.name.includes('Financial'))
    if (financialAid) {
      const { error: appErr } = await db.from('scholarship_applications').insert({
        scholarship_id: financialAid.id,
        student_id: student.id,
        status: 'pending',
        gwa_at_application: 2.17,
      })
      console.log(appErr ? `  ❌ Application: ${appErr.message}` : `  ✅ 1 scholarship application`)
    }
  }

  // ── 10. Study Groups ──────────────────────────────────────────
  console.log('\nSeeding study groups...')
  const studySection = openSections[0]
  if (studySection) {
    const { data: insertedGroup, error: grpErr } = await db.from('study_groups').insert({
      section_id: studySection.id,
      name: 'CS 201 Study Squad',
      description: 'Study group for Computer Programming 2. We meet every Tuesday and Thursday before class at the library.',
      max_members: 8,
      created_by: student.id,
    }).select('id').single()
    console.log(grpErr ? `  ❌ ${grpErr.message}` : `  ✅ 1 study group`)

    if (insertedGroup) {
      const { error: memErr } = await db.from('study_group_members').insert({
        group_id: insertedGroup.id,
        student_id: student.id,
      })
      console.log(memErr ? `  ❌ Member: ${memErr.message}` : `  ✅ 1 group member`)
    }
  }

  // ── 11. Lost & Found ──────────────────────────────────────────
  console.log('\nSeeding lost & found...')
  const lostFoundData = [
    { type: 'lost', title: 'Blue Scientific Calculator (Casio fx-991)', description: 'Left it in Room 301 after Math class on Monday. Has my name written on the back with permanent marker.', location: 'Main Academic Building, Room 301', contact_info: 'maria.santos@uniportal.test', status: 'active', posted_by: student.user_id },
    { type: 'found', title: 'Black USB Flash Drive (32GB)', description: 'Found in Computer Lab 2 near the window seats. Contains files labeled "BSCS Thesis".', location: 'CS Building, Computer Lab 2', contact_info: 'Bring ID to IT Department', status: 'active', posted_by: faculty.user_id },
    { type: 'lost', title: 'Student ID Card — Juan dela Cruz', description: 'Lost somewhere between the cafeteria and the library. Student number 2025-00234.', location: 'Student Center / Library area', contact_info: 'Please turn in to Student Affairs Office', status: 'active', posted_by: student.user_id },
    { type: 'found', title: 'Umbrella — Red with floral pattern', description: 'Found at the lobby of the Administration Building after the rain on March 15.', location: 'Administration Building Lobby', contact_info: 'Claim at Guard House', status: 'active', posted_by: admin?.user_id ?? student.user_id },
    { type: 'lost', title: 'Eyeglasses — Black frame, rectangular', description: 'Might have left them at the Gym during PE class on Wednesday afternoon.', location: 'University Gymnasium', contact_info: 'maria.santos@uniportal.test', status: 'resolved', posted_by: student.user_id },
  ]
  const { error: lfErr } = await db.from('lost_found').insert(lostFoundData)
  console.log(lfErr ? `  ❌ ${lfErr.message}` : `  ✅ ${lostFoundData.length} lost & found posts`)

  // ── 12. Audit Log ─────────────────────────────────────────────
  console.log('\nSeeding audit log...')
  const auditData = [
    { user_id: admin?.user_id, action: 'INSERT', table_name: 'students', details: { description: 'Registered new student: Maria Santos (2026-00001)' }, created_at: '2026-01-05T08:00:00Z' },
    { user_id: admin?.user_id, action: 'UPDATE', table_name: 'academic_settings', details: { key: 'enrollment_status', old_value: 'closed', new_value: 'open' }, created_at: '2026-01-05T07:00:00Z' },
    { user_id: faculty.user_id, action: 'INSERT', table_name: 'grades', details: { description: 'Submitted grades for CS101-A, 1st Sem 2025-2026' }, created_at: '2025-12-20T08:00:00Z' },
    { user_id: admin?.user_id, action: 'UPDATE', table_name: 'payments', details: { payment_id: 'p01', old_status: 'uploaded', new_status: 'posted' }, created_at: '2026-01-15T10:00:00Z' },
    { user_id: superadmin?.user_id, action: 'INSERT', table_name: 'admin_staff', details: { description: 'Created admin account: Rosa Mendoza (Registrar)' }, created_at: '2026-01-01T08:00:00Z' },
    { user_id: student.user_id, action: 'LOGIN', table_name: null, details: { ip: '192.168.1.100', browser: 'Chrome 120' }, created_at: '2026-03-25T07:30:00Z' },
    { user_id: faculty.user_id, action: 'LOGIN', table_name: null, details: { ip: '192.168.1.101', browser: 'Firefox 115' }, created_at: '2026-03-25T08:00:00Z' },
    { user_id: admin?.user_id, action: 'UPDATE', table_name: 'sections', details: { section: 'CS201-A', change: 'status open → closed' }, created_at: '2026-03-20T16:00:00Z' },
    { user_id: admin?.user_id, action: 'INSERT', table_name: 'announcements', details: { title: 'Midterm Week Reminder' }, created_at: '2026-03-18T09:00:00Z' },
    { user_id: student.user_id, action: 'INSERT', table_name: 'document_requests', details: { type: 'transcript', purpose: 'Scholarship application' }, created_at: '2026-02-15T08:00:00Z' },
  ]
  const { error: audErr } = await db.from('audit_log').insert(auditData)
  console.log(audErr ? `  ❌ ${audErr.message}` : `  ✅ ${auditData.length} audit log entries`)

  // ── Done ──────────────────────────────────────────────────────
  console.log('\n🎉 Phase 4 seed complete!')
  console.log('\nNew data seeded:')
  console.log('  4 document requests')
  console.log('  6 clearance items')
  console.log('  6 messages')
  console.log('  7 course reviews')
  console.log('  7 attendance records')
  console.log('  5 class materials')
  console.log('  3 consultation slots + 1 booking')
  console.log('  6 announcements')
  console.log('  5 scholarships + 1 application')
  console.log('  1 study group + 1 member')
  console.log('  5 lost & found posts')
  console.log('  10 audit log entries')
}

seed().catch(console.error)
