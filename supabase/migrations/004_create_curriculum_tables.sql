-- Migration: 004_create_curriculum_tables
-- Description: Create curriculum-related tables for degree progress tracking
-- Tables: programs, curriculum_map

-- Programs table
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  total_units INTEGER NOT NULL,
  duration_years INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Curriculum map: links subjects to programs with year/semester placement and prerequisites
CREATE TABLE curriculum_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  year_level INTEGER NOT NULL CHECK (year_level BETWEEN 1 AND 6),
  semester VARCHAR(20) NOT NULL,
  subject_type VARCHAR(20) NOT NULL CHECK (subject_type IN ('core', 'elective', 'ge')),
  prerequisite_subject_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (program_id, subject_id)
);

-- Indexes
CREATE INDEX idx_curriculum_map_program ON curriculum_map(program_id);
CREATE INDEX idx_curriculum_map_subject ON curriculum_map(subject_id);

-- Enable RLS
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_map ENABLE ROW LEVEL SECURITY;

-- Everyone can read programs and curriculum (public academic data)
CREATE POLICY read_programs ON programs FOR SELECT USING (true);
CREATE POLICY read_curriculum ON curriculum_map FOR SELECT USING (true);

-- Only admin can modify
CREATE POLICY admin_insert_programs ON programs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));
CREATE POLICY admin_update_programs ON programs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));
CREATE POLICY admin_insert_curriculum ON curriculum_map FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));
CREATE POLICY admin_update_curriculum ON curriculum_map FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));
