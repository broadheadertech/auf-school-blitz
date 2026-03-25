/**
 * UniPortal Database Seed Script
 *
 * Creates auth users + profile records in your Supabase database.
 *
 * Usage:
 *   1. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   2. Run: npx tsx scripts/seed.ts
 *
 * Requires: npm install @supabase/supabase-js tsx (tsx is already a dev dep or install globally)
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables.')
  console.error('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  console.error('   Find your service_role key in Supabase Dashboard > Settings > API')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

interface SeedUser {
  email: string
  password: string
  role: 'student' | 'faculty' | 'admin'
  profile: Record<string, unknown>
  table: string
}

const USERS: SeedUser[] = [
  {
    email: 'maria.santos@uniportal.test',
    password: 'Test1234!',
    role: 'student',
    table: 'students',
    profile: {
      student_number: '2026-00001',
      first_name: 'Maria',
      last_name: 'Santos',
      program: 'BSCS',
      year_level: 1,
    },
  },
  {
    email: 'prof.santos@uniportal.test',
    password: 'Test1234!',
    role: 'faculty',
    table: 'faculty',
    profile: {
      employee_id: 'FAC-001',
      first_name: 'Antonio',
      last_name: 'Santos',
      department: 'Computer Science',
    },
  },
  {
    email: 'rosa.mendoza@uniportal.test',
    password: 'Test1234!',
    role: 'admin',
    table: 'admin_staff',
    profile: {
      first_name: 'Rosa',
      last_name: 'Mendoza',
      role_level: 'staff',
      department: 'Registrar',
    },
  },
  {
    email: 'superadmin@uniportal.test',
    password: 'Test1234!',
    role: 'admin',
    table: 'admin_staff',
    profile: {
      first_name: 'System',
      last_name: 'Admin',
      role_level: 'superadmin',
      department: 'IT',
    },
  },
]

async function seed() {
  console.log('🌱 Seeding UniPortal database...\n')

  for (const user of USERS) {
    console.log(`Creating ${user.role}: ${user.email}`)

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // Auto-confirm email
    })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`  ⏭️  Auth user already exists, fetching...`)
        // Get existing user
        const { data: { users } } = await supabase.auth.admin.listUsers()
        const existing = users?.find((u) => u.email === user.email)
        if (existing) {
          await createProfile(user, existing.id)
        } else {
          console.error(`  ❌ Could not find existing user: ${authError.message}`)
        }
        continue
      }
      console.error(`  ❌ Auth error: ${authError.message}`)
      continue
    }

    if (!authData.user) {
      console.error(`  ❌ No user returned`)
      continue
    }

    console.log(`  ✅ Auth user created: ${authData.user.id}`)

    // 2. Create profile record
    await createProfile(user, authData.user.id)
  }

  // 3. Seed subjects
  console.log('\nSeeding subjects...')
  const { error: subjectsError } = await supabase.from('subjects').upsert([
    { code: 'CS 101', name: 'Introduction to Computing', units: 3, type: 'core', description: 'Fundamentals of computing' },
    { code: 'CS 102', name: 'Computer Programming 1', units: 3, type: 'core', description: 'Intro to programming with Python' },
    { code: 'MATH 101', name: 'College Algebra', units: 3, type: 'core', description: 'Algebraic expressions and equations' },
    { code: 'MATH 102', name: 'Plane Trigonometry', units: 3, type: 'core', description: 'Trigonometric functions' },
    { code: 'GE 101', name: 'Understanding the Self', units: 3, type: 'ge', description: 'Self-awareness and identity' },
    { code: 'GE 102', name: 'Readings in Philippine History', units: 3, type: 'ge', description: 'Philippine history through primary sources' },
    { code: 'GE 103', name: 'The Contemporary World', units: 3, type: 'ge', description: 'Globalization and contemporary issues' },
    { code: 'PE 101', name: 'Physical Fitness', units: 2, type: 'ge', description: 'Physical education and wellness' },
    { code: 'CS 201', name: 'Computer Programming 2', units: 3, type: 'core', description: 'OOP and data structures' },
    { code: 'NSTP 101', name: 'National Service Training Program 1', units: 3, type: 'ge', description: 'Civic welfare training' },
  ], { onConflict: 'code', ignoreDuplicates: true })
  console.log(subjectsError ? `  ❌ ${subjectsError.message}` : '  ✅ Subjects seeded')

  // 4. Seed programs
  console.log('Seeding programs...')
  const { error: programsError } = await supabase.from('programs').upsert([
    { code: 'BSCS', name: 'Bachelor of Science in Computer Science', total_units: 160, duration_years: 4 },
    { code: 'BSIT', name: 'Bachelor of Science in Information Technology', total_units: 155, duration_years: 4 },
    { code: 'BSN', name: 'Bachelor of Science in Nursing', total_units: 180, duration_years: 4 },
    { code: 'BSBA', name: 'Bachelor of Science in Business Administration', total_units: 150, duration_years: 4 },
  ], { onConflict: 'code', ignoreDuplicates: true })
  console.log(programsError ? `  ❌ ${programsError.message}` : '  ✅ Programs seeded')

  // 5. Seed news
  console.log('Seeding news articles...')
  const { error: newsError } = await supabase.from('news_articles').insert([
    { title: 'UniPortal Launches New Online Enrollment System', excerpt: 'Students can now enroll using a schedule-first approach.', body: 'The university is proud to announce UniPortal.', category: 'Academic', author_name: 'Office of the Registrar', is_featured: true },
    { title: 'Midterm Examination Schedule Released', excerpt: 'Midterms will be held March 25-29, 2026.', body: 'Check your exam schedules on UniPortal.', category: 'Academic', author_name: 'Academic Affairs', is_featured: false },
    { title: 'Payment Deadline Extended to March 31', excerpt: 'Extended by two weeks.', body: 'The Finance Office has extended the deadline.', category: 'Administrative', author_name: 'Finance Office', is_featured: false },
    { title: 'University Basketball Team Advances to Finals', excerpt: 'Wildcats win 85-82.', body: 'Dramatic semifinal victory.', category: 'Sports', author_name: 'Sports Office', is_featured: false },
    { title: 'Cultural Night 2026', excerpt: 'Celebrating Filipino Heritage.', body: 'Dance, music, and cuisine at the University Auditorium.', category: 'Campus Life', author_name: 'Student Affairs', is_featured: false },
  ])
  console.log(newsError ? `  ❌ ${newsError.message}` : '  ✅ News seeded')

  // 6. Seed events
  console.log('Seeding events...')
  const { error: eventsError } = await supabase.from('events').insert([
    { title: 'Midterm Examinations', description: 'Midterm exam period.', category: 'academic', venue: 'All Classrooms', start_date: '2026-03-25T07:00:00Z', end_date: '2026-03-29T17:00:00Z', rsvp_enabled: false },
    { title: 'UAAP Basketball Finals', description: 'Game 1 of the finals.', category: 'sports', venue: 'MOA Arena', start_date: '2026-04-05T16:00:00Z', end_date: '2026-04-05T19:00:00Z', rsvp_enabled: true, max_attendees: 200 },
    { title: 'Cultural Night 2026', description: 'Filipino heritage celebration.', category: 'cultural', venue: 'University Auditorium', start_date: '2026-04-12T18:00:00Z', end_date: '2026-04-12T22:00:00Z', rsvp_enabled: true, max_attendees: 500 },
    { title: 'CS Hackathon', description: '24-hour hackathon.', category: 'organization', venue: 'Computer Lab 1-3', start_date: '2026-04-19T08:00:00Z', end_date: '2026-04-20T08:00:00Z', rsvp_enabled: true, max_attendees: 100 },
    { title: 'Final Examinations', description: 'Finals period.', category: 'academic', venue: 'All Classrooms', start_date: '2026-05-25T07:00:00Z', end_date: '2026-05-30T17:00:00Z', rsvp_enabled: false },
  ])
  console.log(eventsError ? `  ❌ ${eventsError.message}` : '  ✅ Events seeded')

  // 7. Seed tenant
  console.log('Seeding default tenant...')
  const { error: tenantError } = await supabase.from('tenants').upsert([
    { slug: 'demo', name: 'UniPortal Demo University', primary_color: '#0D1B3E', accent_color: '#F5A623', is_active: true },
  ], { onConflict: 'slug', ignoreDuplicates: true })
  console.log(tenantError ? `  ❌ ${tenantError.message}` : '  ✅ Tenant seeded')

  console.log('\n🎉 Seed complete!')
  console.log('\nTest accounts:')
  console.log('  Student:    maria.santos@uniportal.test / Test1234!')
  console.log('  Faculty:    prof.santos@uniportal.test  / Test1234!')
  console.log('  Admin:      rosa.mendoza@uniportal.test / Test1234!')
  console.log('  Superadmin: superadmin@uniportal.test   / Test1234!')
}

async function createProfile(user: SeedUser, userId: string) {
  const { error } = await supabase.from(user.table).insert({
    user_id: userId,
    ...user.profile,
  })

  if (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      console.log(`  ⏭️  Profile already exists`)
    } else {
      console.error(`  ❌ Profile error: ${error.message}`)
    }
  } else {
    console.log(`  ✅ Profile created in ${user.table}`)
  }
}

seed().catch(console.error)
