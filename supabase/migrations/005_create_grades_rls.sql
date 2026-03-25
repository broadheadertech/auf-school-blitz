-- Migration: 005_create_grades_rls
-- Description: Row-Level Security policies for subjects, sections, grades tables
-- Dependencies: 004_create_grades_tables

-- Enable RLS on all tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- ========================================
-- SUBJECTS: Read-only for all authenticated users
-- ========================================
CREATE POLICY subjects_read_all ON subjects
  FOR SELECT
  TO authenticated
  USING (true);

-- ========================================
-- SECTIONS: Read-only for all authenticated users
-- ========================================
CREATE POLICY sections_read_all ON sections
  FOR SELECT
  TO authenticated
  USING (true);

-- ========================================
-- GRADES: Students see only their own grades
-- ========================================
CREATE POLICY grades_student_read ON grades
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- GRADES: Faculty see grades for their sections
-- ========================================
CREATE POLICY grades_faculty_read ON grades
  FOR SELECT
  TO authenticated
  USING (
    section_id IN (
      SELECT id FROM sections
      WHERE faculty_id IN (
        SELECT id FROM faculty WHERE user_id = auth.uid()
      )
    )
  );

-- ========================================
-- GRADES: Faculty can INSERT grades for their sections
-- ========================================
CREATE POLICY grades_faculty_insert ON grades
  FOR INSERT
  TO authenticated
  WITH CHECK (
    section_id IN (
      SELECT id FROM sections
      WHERE faculty_id IN (
        SELECT id FROM faculty WHERE user_id = auth.uid()
      )
    )
  );

-- ========================================
-- GRADES: Faculty can UPDATE grades for their sections
-- ========================================
CREATE POLICY grades_faculty_update ON grades
  FOR UPDATE
  TO authenticated
  USING (
    section_id IN (
      SELECT id FROM sections
      WHERE faculty_id IN (
        SELECT id FROM faculty WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    section_id IN (
      SELECT id FROM sections
      WHERE faculty_id IN (
        SELECT id FROM faculty WHERE user_id = auth.uid()
      )
    )
  );

-- ========================================
-- GRADES: Admin can SELECT all grades
-- ========================================
CREATE POLICY grades_admin_read ON grades
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_staff WHERE user_id = auth.uid()
    )
  );
