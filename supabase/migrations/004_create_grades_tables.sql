-- Migration: 004_create_grades_tables
-- Description: Create grades-related tables: subjects, sections, grades
-- Dependencies: 001_create_auth_tables (students, faculty tables)

-- Grade status enum
CREATE TYPE grade_status AS ENUM ('in_progress', 'submitted', 'finalized');

-- Subject type enum
CREATE TYPE subject_type AS ENUM ('core', 'elective', 'ge');

-- Section status enum
CREATE TYPE section_status AS ENUM ('open', 'closed', 'cancelled');

-- Subjects table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  units INTEGER NOT NULL CHECK (units BETWEEN 1 AND 6),
  type subject_type NOT NULL DEFAULT 'core',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sections table
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  section_code VARCHAR(20) NOT NULL,
  faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE RESTRICT,
  schedule_json JSONB NOT NULL DEFAULT '[]',
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  enrolled_count INTEGER NOT NULL DEFAULT 0 CHECK (enrolled_count >= 0),
  semester VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  status section_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (subject_id, section_code, semester, academic_year)
);

-- Grades table
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  midterm NUMERIC(2, 1) CHECK (midterm IS NULL OR (midterm >= 1.0 AND midterm <= 5.0)),
  final_grade NUMERIC(2, 1) CHECK (final_grade IS NULL OR (final_grade >= 1.0 AND final_grade <= 5.0)),
  final_computed NUMERIC(2, 1) CHECK (final_computed IS NULL OR (final_computed >= 1.0 AND final_computed <= 5.0)),
  status grade_status NOT NULL DEFAULT 'in_progress',
  semester VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  submitted_by UUID REFERENCES faculty(id),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, section_id)
);

-- Indexes for common query patterns
CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_type ON subjects(type);

CREATE INDEX idx_sections_subject_id ON sections(subject_id);
CREATE INDEX idx_sections_faculty_id ON sections(faculty_id);
CREATE INDEX idx_sections_semester ON sections(semester, academic_year);

CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_section_id ON grades(section_id);
CREATE INDEX idx_grades_subject_id ON grades(subject_id);
CREATE INDEX idx_grades_semester ON grades(semester, academic_year);
CREATE INDEX idx_grades_student_semester ON grades(student_id, semester, academic_year);
