-- Migration: 013_create_missing_tables
-- Description: Create departments, academic_settings, and enrollments tables

-- 1. Departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  head_faculty_id UUID REFERENCES faculty(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY read_departments ON departments FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY admin_manage_departments ON departments FOR ALL
    USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Academic Settings
CREATE TABLE IF NOT EXISTS academic_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE academic_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY read_settings ON academic_settings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY admin_manage_settings ON academic_settings FOR ALL
    USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  semester VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped', 'pending')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, section_id, semester, academic_year)
);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_section ON enrollments(section_id);
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY student_own_enrollments ON enrollments FOR SELECT
    USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY student_insert_enrollment ON enrollments FOR INSERT
    WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY admin_all_enrollments ON enrollments FOR ALL
    USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY faculty_read_enrollments ON enrollments FOR SELECT
    USING (section_id IN (
      SELECT id FROM sections WHERE faculty_id IN (
        SELECT id FROM faculty WHERE user_id = auth.uid()
      )
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. Seed default academic settings
INSERT INTO academic_settings (key, value) VALUES
  ('current_semester', '"1st"'),
  ('current_academic_year', '"2025-2026"'),
  ('enrollment_status', '"open"'),
  ('enrollment_start', '"2025-08-01"'),
  ('enrollment_end', '"2025-08-15"'),
  ('grading_period_open', 'true')
ON CONFLICT (key) DO NOTHING;

-- 5. Seed departments
INSERT INTO departments (code, name) VALUES
  ('CCS', 'College of Computer Studies'),
  ('COE', 'College of Engineering'),
  ('CON', 'College of Nursing'),
  ('CBA', 'College of Business Administration'),
  ('CED', 'College of Education'),
  ('CAS', 'College of Arts and Sciences')
ON CONFLICT (code) DO NOTHING;
