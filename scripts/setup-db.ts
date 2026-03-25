/**
 * UniPortal Database Setup — Checks tables exist, then seeds auth users + profile data.
 *
 * PREREQUISITE: Run scripts/combined-migrations.sql in Supabase SQL Editor first!
 * Usage: npx tsx --env-file=.env.local scripts/setup-db.ts
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

async function setup() {
  console.log('🏗️  UniPortal Database Setup\n')

  // Check if tables exist
  const { error: tableCheck } = await supabase.from('students').select('id').limit(1)
  if (tableCheck?.message.includes('not find the table')) {
    console.error('❌ Tables do not exist.')
    console.error('   Run scripts/combined-migrations.sql in Supabase SQL Editor first!')
    console.error('   Dashboard: https://supabase.com/dashboard/project/dsdwsfrfgrmdszfjyvmr/sql')
    process.exit(1)
  }
  console.log('✅ Tables exist\n')

  // Create auth users
  console.log('Creating auth users...')
  const accounts = [
    { email: 'maria.santos@uniportal.test', password: 'Test1234!' },
    { email: 'prof.santos@uniportal.test', password: 'Test1234!' },
    { email: 'rosa.mendoza@uniportal.test', password: 'Test1234!' },
    { email: 'superadmin@uniportal.test', password: 'Test1234!' },
  ]

  const ids: Record<string, string> = {}

  for (const acct of accounts) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: acct.email, password: acct.password, email_confirm: true,
    })
    if (error?.message.includes('already been registered')) {
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const found = users?.find((u) => u.email === acct.email)
      if (found) { ids[acct.email] = found.id; console.log(`  ⏭️  ${acct.email} (${found.id})`) }
      continue
    }
    if (error) { console.error(`  ❌ ${acct.email}: ${error.message}`); continue }
    ids[acct.email] = data.user.id
    console.log(`  ✅ ${acct.email} (${data.user.id})`)
  }

  const sId = ids['maria.santos@uniportal.test']!
  const fId = ids['prof.santos@uniportal.test']!
  const aId = ids['rosa.mendoza@uniportal.test']!
  const saId = ids['superadmin@uniportal.test']!

  // Create profiles
  console.log('\nCreating profiles...')
  await upsert('students', { user_id: sId, student_number: '2026-00001', first_name: 'Maria', last_name: 'Santos', program: 'BSCS', year_level: 1 }, 'Student: Maria Santos')
  await upsert('faculty', { user_id: fId, employee_id: 'FAC-001', first_name: 'Antonio', last_name: 'Santos', department: 'Computer Science' }, 'Faculty: Prof. Santos')
  await insert('admin_staff', { user_id: aId, first_name: 'Rosa', last_name: 'Mendoza', role_level: 'staff', department: 'Registrar' }, 'Admin: Rosa Mendoza')
  await insert('admin_staff', { user_id: saId, first_name: 'System', last_name: 'Admin', role_level: 'superadmin', department: 'IT' }, 'Superadmin: System Admin')

  // Seed subjects
  console.log('\nSeeding subjects...')
  await upsertMany('subjects', [
    { code: 'CS 101', name: 'Introduction to Computing', units: 3, type: 'core', description: 'Fundamentals of computing' },
    { code: 'CS 102', name: 'Computer Programming 1', units: 3, type: 'core', description: 'Intro to programming' },
    { code: 'MATH 101', name: 'College Algebra', units: 3, type: 'core', description: 'Algebraic expressions' },
    { code: 'MATH 102', name: 'Plane Trigonometry', units: 3, type: 'core', description: 'Trigonometric functions' },
    { code: 'GE 101', name: 'Understanding the Self', units: 3, type: 'ge', description: 'Self-awareness' },
    { code: 'GE 102', name: 'Readings in Philippine History', units: 3, type: 'ge', description: 'Philippine history' },
    { code: 'GE 103', name: 'The Contemporary World', units: 3, type: 'ge', description: 'Globalization' },
    { code: 'PE 101', name: 'Physical Fitness', units: 2, type: 'ge', description: 'Physical education' },
    { code: 'CS 201', name: 'Computer Programming 2', units: 3, type: 'core', description: 'OOP and data structures' },
    { code: 'NSTP 101', name: 'National Service Training Program 1', units: 3, type: 'ge', description: 'Civic welfare' },
  ], 'code', '10 subjects')

  // Seed programs
  console.log('Seeding programs...')
  await upsertMany('programs', [
    { code: 'BSCS', name: 'Bachelor of Science in Computer Science', total_units: 160, duration_years: 4 },
    { code: 'BSIT', name: 'Bachelor of Science in Information Technology', total_units: 155, duration_years: 4 },
    { code: 'BSN', name: 'Bachelor of Science in Nursing', total_units: 180, duration_years: 4 },
    { code: 'BSBA', name: 'Bachelor of Science in Business Administration', total_units: 150, duration_years: 4 },
  ], 'code', '4 programs')

  // Seed news
  console.log('Seeding news...')
  await insertMany('news_articles', [
    { title: 'UniPortal Launches New Online Enrollment System', excerpt: 'Schedule-first enrollment.', body: 'The university announces UniPortal.', category: 'Academic', author_name: 'Office of the Registrar', is_featured: true },
    { title: 'Midterm Examination Schedule Released', excerpt: 'Midterms March 25-29.', body: 'Check your exam schedules.', category: 'Academic', author_name: 'Academic Affairs', is_featured: false },
    { title: 'Payment Deadline Extended to March 31', excerpt: 'Extended by two weeks.', body: 'Finance Office extends deadline.', category: 'Administrative', author_name: 'Finance Office', is_featured: false },
    { title: 'Basketball Team Advances to Finals', excerpt: 'Wildcats win 85-82.', body: 'Dramatic semifinal victory.', category: 'Sports', author_name: 'Sports Office', is_featured: false },
    { title: 'Cultural Night 2026', excerpt: 'Filipino Heritage.', body: 'Dance, music, and cuisine.', category: 'Campus Life', author_name: 'Student Affairs', is_featured: false },
  ], '5 news articles')

  // Seed events
  console.log('Seeding events...')
  await insertMany('events', [
    { title: 'Midterm Examinations', description: 'Midterm exam period.', category: 'academic', venue: 'All Classrooms', start_date: '2026-03-25T07:00:00Z', end_date: '2026-03-29T17:00:00Z', rsvp_enabled: false },
    { title: 'UAAP Basketball Finals', description: 'Game 1.', category: 'sports', venue: 'MOA Arena', start_date: '2026-04-05T16:00:00Z', end_date: '2026-04-05T19:00:00Z', rsvp_enabled: true, max_attendees: 200 },
    { title: 'Cultural Night 2026', description: 'Filipino heritage.', category: 'cultural', venue: 'University Auditorium', start_date: '2026-04-12T18:00:00Z', end_date: '2026-04-12T22:00:00Z', rsvp_enabled: true, max_attendees: 500 },
    { title: 'CS Hackathon', description: '24-hour hackathon.', category: 'organization', venue: 'Computer Lab 1-3', start_date: '2026-04-19T08:00:00Z', end_date: '2026-04-20T08:00:00Z', rsvp_enabled: true, max_attendees: 100 },
    { title: 'Final Examinations', description: 'Finals period.', category: 'academic', venue: 'All Classrooms', start_date: '2026-05-25T07:00:00Z', end_date: '2026-05-30T17:00:00Z', rsvp_enabled: false },
  ], '5 events')

  // Seed tenant
  console.log('Seeding tenant...')
  await upsertMany('tenants', [
    { slug: 'demo', name: 'UniPortal Demo University', primary_color: '#0D1B3E', accent_color: '#F5A623', is_active: true },
  ], 'slug', 'default tenant')

  console.log('\n🎉 Setup complete!\n')
  console.log('Test accounts:')
  console.log('  Student:    maria.santos@uniportal.test / Test1234!')
  console.log('  Faculty:    prof.santos@uniportal.test  / Test1234!')
  console.log('  Admin:      rosa.mendoza@uniportal.test / Test1234!')
  console.log('  Superadmin: superadmin@uniportal.test   / Test1234!')
}

async function insert(table: string, data: Record<string, unknown>, label: string) {
  const { error } = await supabase.from(table).insert(data)
  if (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      console.log(`  ⏭️  ${label} (already exists)`)
    } else {
      console.error(`  ❌ ${label}: ${error.message}`)
    }
  } else {
    console.log(`  ✅ ${label}`)
  }
}

async function upsert(table: string, data: Record<string, unknown>, label: string) {
  const { error } = await supabase.from(table).upsert(data)
  console.log(error ? `  ❌ ${label}: ${error.message}` : `  ✅ ${label}`)
}

async function insertMany(table: string, data: Record<string, unknown>[], label: string) {
  const { error } = await supabase.from(table).insert(data)
  if (error) {
    if (error.message.includes('duplicate')) {
      console.log(`  ⏭️  ${label} (already seeded)`)
    } else {
      console.error(`  ❌ ${label}: ${error.message}`)
    }
  } else {
    console.log(`  ✅ ${label}`)
  }
}

async function upsertMany(table: string, data: Record<string, unknown>[], conflict: string, label: string) {
  const { error } = await supabase.from(table).upsert(data, { onConflict: conflict })
  console.log(error ? `  ❌ ${label}: ${error.message}` : `  ✅ ${label}`)
}

setup().catch(console.error)
