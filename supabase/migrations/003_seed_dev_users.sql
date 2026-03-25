-- Migration: 003_seed_dev_users
-- Description: Seed development users for local testing
-- ⚠ WARNING: This migration is for LOCAL DEVELOPMENT ONLY.
--   DO NOT run in production. Contains test credentials.
--   In a CI/CD pipeline, guard this with an environment check or separate seed script.
-- IMPORTANT: These UUIDs are placeholders. For local development:
--   1. Create auth users via Supabase dashboard or supabase.auth.admin.createUser()
--   2. Replace the UUIDs below with the actual auth.users IDs
--   OR run this after creating auth users with matching UUIDs

-- Fixed UUIDs for development (create matching auth users in Supabase dashboard)
-- Student: maria.santos@uniportal.test
-- Faculty: prof.santos@uniportal.test
-- Admin:   rosa.mendoza@uniportal.test
-- Default dev password for all: Test1234! (NEVER use in production)

-- Test Student: Maria Santos (BSCS, Year 1)
INSERT INTO students (id, user_id, student_number, first_name, last_name, program, year_level)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '11111111-1111-1111-1111-111111111111',
  '2026-00001',
  'Maria',
  'Santos',
  'BSCS',
  1
);

-- Test Faculty: Prof. Antonio Santos (CS Department)
INSERT INTO faculty (id, user_id, employee_id, first_name, last_name, department)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  '22222222-2222-2222-2222-222222222222',
  'FAC-001',
  'Antonio',
  'Santos',
  'Computer Science'
);

-- Test Admin: Rosa Mendoza (Registrar — staff level)
INSERT INTO admin_staff (id, user_id, first_name, last_name, role_level, department)
VALUES (
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  '33333333-3333-3333-3333-333333333333',
  'Rosa',
  'Mendoza',
  'staff',
  'Registrar'
);

-- Superadmin: System Administrator (full tenant management)
INSERT INTO admin_staff (id, user_id, first_name, last_name, role_level, department)
VALUES (
  'ad000000-0000-0000-0000-000000000001',
  '44444444-4444-4444-4444-444444444444',
  'System',
  'Admin',
  'superadmin',
  'IT'
);

-- Multi-role test: Prof. Santos is also a graduate student (FR4 support)
INSERT INTO students (id, user_id, student_number, first_name, last_name, program, year_level)
VALUES (
  'd4e5f6a7-b8c9-0123-defa-234567890123',
  '22222222-2222-2222-2222-222222222222',
  '2026-00002',
  'Antonio',
  'Santos',
  'MSCS',
  1
);
