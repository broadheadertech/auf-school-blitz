import { createClient } from '@supabase/supabase-js'

const db = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
) as any

async function check() {
  const tables = ['students', 'faculty', 'admin_staff', 'subjects', 'sections', 'grades',
    'programs', 'curriculum_map', 'fees', 'payments', 'news_articles', 'events',
    'peer_tips', 'check_ins', 'streak_records', 'tenants', 'departments', 'academic_settings', 'enrollments']

  console.log('Table status:\n')
  for (const t of tables) {
    const { error } = await db.from(t).select('id').limit(1)
    const status = error?.message?.includes('not find') ? '❌ MISSING' : '✅ EXISTS'
    console.log(`  ${status}  ${t}`)
  }
}

check()
