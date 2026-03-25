-- Migration: 002_create_rls_policies
-- Description: Enable RLS and create access policies for auth tables
-- Policy strategy:
--   - Students can only SELECT their own row
--   - Faculty can only SELECT their own row
--   - Admin can SELECT their own row + all students + all faculty

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_staff ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- Students table policies
-- =============================================================

-- Students can read their own data
CREATE POLICY student_own_data ON students
  FOR SELECT
  USING (user_id = auth.uid());

-- Admin can read all student data
CREATE POLICY admin_read_all_students ON students
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())
  );

-- =============================================================
-- Faculty table policies
-- =============================================================

-- Faculty can read their own data
CREATE POLICY faculty_own_data ON faculty
  FOR SELECT
  USING (user_id = auth.uid());

-- Admin can read all faculty data
CREATE POLICY admin_read_all_faculty ON faculty
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())
  );

-- =============================================================
-- Admin staff table policies
-- =============================================================

-- Admin can read their own data
CREATE POLICY admin_own_data ON admin_staff
  FOR SELECT
  USING (user_id = auth.uid());

-- =============================================================
-- Admin INSERT and UPDATE policies
-- =============================================================

-- Admin can insert students
CREATE POLICY admin_insert_students ON students
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())
  );

-- Admin can update students
CREATE POLICY admin_update_students ON students
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())
  );

-- Admin can insert faculty
CREATE POLICY admin_insert_faculty ON faculty
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())
  );

-- Admin can update faculty
CREATE POLICY admin_update_faculty ON faculty
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())
  );

-- Only superadmin can insert admin staff (prevents privilege escalation)
CREATE POLICY admin_insert_admin_staff ON admin_staff
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid() AND role_level = 'superadmin')
  );

-- Only superadmin can update admin staff
CREATE POLICY admin_update_admin_staff ON admin_staff
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid() AND role_level = 'superadmin')
  );
