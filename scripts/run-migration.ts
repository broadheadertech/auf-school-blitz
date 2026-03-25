/**
 * Run a SQL migration against Supabase using PostgreSQL session pooler.
 * Usage: npx tsx --env-file=.env.local scripts/run-migration.ts <path-to-sql>
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import postgres from 'postgres'

const sqlPath = process.argv[2]
if (!sqlPath) {
  console.error('❌ Usage: npx tsx --env-file=.env.local scripts/run-migration.ts <path-to-sql>')
  process.exit(1)
}

const sqlContent = readFileSync(resolve(sqlPath), 'utf-8')
console.log(`📄 Running migration: ${sqlPath}`)
console.log(`   SQL length: ${sqlContent.length} chars\n`)

async function run() {
  const sql = postgres({
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    username: 'postgres.dsdwsfrfgrmdszfjyvmr',
    password: '@Broadheader_8080',
    ssl: 'require',
    connect_timeout: 15,
  })

  try {
    console.log('Connecting to aws-1-ap-south-1.pooler.supabase.com:5432 ...')
    await sql`SELECT 1`
    console.log('✅ Connected! Running migration...\n')
    await sql.unsafe(sqlContent)
    console.log('✅ Migration executed successfully!')
  } catch (e: any) {
    console.error(`❌ Migration failed: ${e.message}`)
  } finally {
    await sql.end()
  }
}

run().catch(console.error)
