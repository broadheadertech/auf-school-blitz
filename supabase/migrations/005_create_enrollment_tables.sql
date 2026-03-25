-- Migration: 005_create_enrollment_tables
-- Description: Create enrollment-related tables

CREATE TYPE enrollment_status AS ENUM ('pending', 'confirmed', 'dropped');

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  status enrollment_status NOT NULL DEFAULT 'pending',
  semester VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, section_id)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_section ON enrollments(section_id);

-- RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Students see only their own enrollments
CREATE POLICY student_own_enrollments ON enrollments
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Faculty see enrollments in their sections
CREATE POLICY faculty_section_enrollments ON enrollments
  FOR SELECT USING (
    section_id IN (SELECT id FROM sections WHERE faculty_id IN (SELECT id FROM faculty WHERE user_id = auth.uid()))
  );

-- Admin sees all
CREATE POLICY admin_all_enrollments ON enrollments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())
  );

-- Students can insert their own enrollment (pending)
CREATE POLICY student_insert_enrollment ON enrollments
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Admin can manage all enrollments
CREATE POLICY admin_manage_enrollments ON enrollments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())
  );

-- Admin section management policies (sections table already exists from 001)
CREATE POLICY admin_insert_sections ON sections
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())
  );

CREATE POLICY admin_update_sections ON sections
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())
  );
