/**
 * Run SQL migration via Supabase by creating a temporary RPC function.
 * Step 1: Create a helper function via PostgREST
 * Step 2: Call it to execute DDL
 * Step 3: Drop the helper function
 *
 * Usage: npx tsx --env-file=.env.local scripts/run-migration-rest.ts <path-to-sql>
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const sqlPath = process.argv[2]
if (!sqlPath) {
  console.error('❌ Usage: npx tsx --env-file=.env.local scripts/run-migration-rest.ts <path-to-sql>')
  process.exit(1)
}

const sqlContent = readFileSync(resolve(sqlPath), 'utf-8')
console.log(`📄 Running migration: ${sqlPath}`)
console.log(`   SQL length: ${sqlContent.length} chars\n`)

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function run() {
  // Step 1: Create a temporary function that executes our SQL
  // We use the Supabase rpc endpoint to call pg functions

  // First, we need to create the function. But we can't create functions via PostgREST...
  // However, we CAN use the Supabase SQL endpoint if we find it.

  // Let's try the undocumented /pg endpoint
  const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')

  // Try executing SQL via the pg endpoint (available in newer Supabase versions)
  const endpoints = [
    `${SUPABASE_URL}/pg/query`,
    `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
  ]

  // Actually, the cleanest approach: split the migration into individual CREATE TABLE
  // statements and execute each one using Supabase's ability to create tables via
  // the PostgREST schema cache refresh.

  // Simplest working approach: use fetch to call the Supabase Query API
  // This is available at POST /rest/v1/rpc with a special function

  // Let's first check if we can create the exec_sql function
  console.log('Creating exec_sql helper function...')

  // We'll use a trick: create tables one by one using individual rpc calls
  // But first, let's check the available rpc functions
  const { data: rpcTest, error: rpcErr } = await db.rpc('exec_sql', { sql_text: 'SELECT 1' })

  if (rpcErr?.message?.includes('Could not find the function')) {
    console.log('exec_sql function not found. Need to create it first.')
    console.log('')
    console.log('Please run this ONE LINE in your Supabase SQL Editor first:')
    console.log('─'.repeat(60))
    console.log(`CREATE OR REPLACE FUNCTION exec_sql(sql_text text) RETURNS void AS $$ BEGIN EXECUTE sql_text; END; $$ LANGUAGE plpgsql SECURITY DEFINER;`)
    console.log('─'.repeat(60))
    console.log('')
    console.log('Then re-run this script.')
    process.exit(1)
  }

  if (rpcErr) {
    console.error(`❌ Unexpected error: ${rpcErr.message}`)
    process.exit(1)
  }

  console.log('✅ exec_sql function available\n')

  // Split migration into statements and execute each
  const statements = splitStatements(sqlContent)
  let success = 0
  let failed = 0

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]!.trim()
    if (!stmt || stmt.startsWith('--')) continue

    const preview = stmt.replace(/\s+/g, ' ').substring(0, 80)
    process.stdout.write(`  [${i + 1}/${statements.length}] ${preview}...`)

    const { error } = await db.rpc('exec_sql', { sql_text: stmt })
    if (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log(' ⏭️ (already exists)')
        success++
      } else {
        console.log(` ❌ ${error.message}`)
        failed++
      }
    } else {
      console.log(' ✅')
      success++
    }
  }

  console.log(`\n📊 Results: ${success} succeeded, ${failed} failed`)

  if (failed === 0) {
    console.log('✅ Migration complete!')
  } else {
    console.log('⚠️  Some statements failed — review errors above.')
  }
}

function splitStatements(sql: string): string[] {
  const results: string[] = []
  let current = ''
  let dollarDepth = 0

  const lines = sql.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()

    // Skip pure comment lines at statement boundary
    if (!current.trim() && trimmed.startsWith('--')) continue

    // Count $$ occurrences
    const dollars = (line.match(/\$\$/g) || []).length
    if (dollars % 2 === 1) {
      dollarDepth = dollarDepth === 0 ? 1 : 0
    }

    current += line + '\n'

    if (dollarDepth === 0 && trimmed.endsWith(';')) {
      const stmt = current.trim()
      if (stmt && !stmt.startsWith('--')) {
        results.push(stmt)
      }
      current = ''
    }
  }

  if (current.trim() && !current.trim().startsWith('--')) {
    results.push(current.trim())
  }

  return results
}

run().catch(console.error)
