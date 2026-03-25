
-- === 001_create_auth_tables.sql ===
-- Migration: 001_create_auth_tables
-- Description: Create authentication-related user profile tables
-- Tables: students, faculty, admin_staff
-- All tables reference auth.users(id) for Supabase Auth integration

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_number VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  program VARCHAR(20) NOT NULL,
  year_level INTEGER NOT NULL CHECK (year_level BETWEEN 1 AND 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faculty table
CREATE TABLE faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin staff table
CREATE TABLE admin_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role_level VARCHAR(50) NOT NULL,
  department VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for role detection queries (getUserRole checks user_id on all 3 tables)
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_faculty_user_id ON faculty(user_id);
CREATE INDEX idx_admin_staff_user_id ON admin_staff(user_id);


-- === 004_create_grades_tables.sql ===
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


-- === 004_create_curriculum_tables.sql ===
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


-- === 006_create_payment_tables.sql ===
-- Migration: 006_create_payment_tables
-- Description: Create payment and fee tables

CREATE TYPE payment_status AS ENUM ('uploaded', 'under_review', 'verified', 'rejected', 'posted');
CREATE TYPE payment_method AS ENUM ('gcash', 'maya', 'bank_transfer', 'credit_card', 'cashier');

CREATE TABLE fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  description VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method payment_method NOT NULL,
  reference_number VARCHAR(100),
  proof_url TEXT,
  status payment_status NOT NULL DEFAULT 'uploaded',
  reject_reason TEXT,
  reviewed_by UUID REFERENCES admin_staff(id),
  reviewed_at TIMESTAMPTZ,
  semester VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fees_student ON fees(student_id);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(status);

-- RLS
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY student_own_fees ON fees FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
CREATE POLICY admin_all_fees ON fees FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));
CREATE POLICY admin_manage_fees ON fees FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));

CREATE POLICY student_own_payments ON payments FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
CREATE POLICY student_insert_payment ON payments FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
CREATE POLICY admin_all_payments ON payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));
CREATE POLICY admin_update_payments ON payments FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));


-- === 007_create_news_tables.sql ===
-- Migration: 007_create_news_tables

CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  thumbnail_url TEXT,
  author_name VARCHAR(100) NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE news_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, category)
);

CREATE INDEX idx_news_category ON news_articles(category);
CREATE INDEX idx_news_published ON news_articles(published_at DESC);
CREATE INDEX idx_news_subs_user ON news_subscriptions(user_id);

ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_news ON news_articles FOR SELECT USING (true);
CREATE POLICY own_subscriptions ON news_subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY manage_own_subscriptions ON news_subscriptions FOR ALL USING (user_id = auth.uid());
CREATE POLICY admin_manage_news ON news_articles FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));


-- === 008_create_events_tables.sql ===
-- Migration: 008_create_events_tables

CREATE TYPE event_category AS ENUM ('academic', 'sports', 'cultural', 'organization', 'administrative');

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  category event_category NOT NULL,
  venue VARCHAR(200) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  rsvp_enabled BOOLEAN DEFAULT true,
  max_attendees INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_events_date ON events(start_date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_rsvps_event ON event_rsvps(event_id);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_events ON events FOR SELECT USING (true);
CREATE POLICY own_rsvps ON event_rsvps FOR SELECT USING (user_id = auth.uid());
CREATE POLICY manage_own_rsvps ON event_rsvps FOR ALL USING (user_id = auth.uid());
CREATE POLICY admin_manage_events ON events FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));


-- === 009_create_peer_tips_tables.sql ===
-- Migration: 009_create_peer_tips_tables

CREATE TYPE tip_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE tip_context AS ENUM ('dashboard', 'grades', 'enrollment', 'events', 'payments', 'curriculum');

CREATE TABLE peer_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  content VARCHAR(280) NOT NULL,
  page_context tip_context NOT NULL,
  status tip_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_peer_tips_context ON peer_tips(page_context);
CREATE INDEX idx_peer_tips_status ON peer_tips(status);

ALTER TABLE peer_tips ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read approved tips
CREATE POLICY read_approved_tips ON peer_tips
  FOR SELECT USING (status = 'approved');

-- 3rd year+ students can insert (checked at application level)
CREATE POLICY student_insert_tips ON peer_tips
  FOR INSERT WITH CHECK (
    author_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Admin can update status
CREATE POLICY admin_manage_tips ON peer_tips
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())
  );


-- === 010_add_ocr_results.sql ===
-- Migration: 010_add_ocr_results
-- Description: Add OCR extraction columns to payments table for auto-matching

ALTER TABLE payments
  ADD COLUMN ocr_extracted_text TEXT,
  ADD COLUMN ocr_confidence DECIMAL(5,2),
  ADD COLUMN ocr_matched BOOLEAN DEFAULT false;


-- === 011_create_streaks_table.sql ===
-- Migration: 011_create_streaks_table
-- Description: Track daily check-ins for engagement streaks

CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, check_in_date)
);

CREATE TABLE streak_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_check_in DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_check_ins_student ON check_ins(student_id);
CREATE INDEX idx_check_ins_date ON check_ins(check_in_date);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY student_own_checkins ON check_ins FOR ALL
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
CREATE POLICY student_own_streaks ON streak_records FOR ALL
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));


-- === 012_create_tenant_tables.sql ===
-- Migration: 012_create_tenant_tables
-- Description: Multi-university white-label tenant configuration

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color VARCHAR(7) NOT NULL DEFAULT '#0D1B3E',
  accent_color VARCHAR(7) NOT NULL DEFAULT '#F5A623',
  favicon_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add tenant_id to all major tables for data isolation
-- (In production, this would be added to students, faculty, admin_staff, etc.)
-- For MVP, we create the tenant infrastructure without migrating existing tables

CREATE INDEX idx_tenants_slug ON tenants(slug);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Only superadmin can manage tenants
CREATE POLICY superadmin_manage_tenants ON tenants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid() AND role_level = 'superadmin')
  );

-- All authenticated users can read their own tenant config
CREATE POLICY read_active_tenants ON tenants
  FOR SELECT USING (is_active = true);

-- Seed default tenant
INSERT INTO tenants (name, slug, primary_color, accent_color)
VALUES ('UniPortal Demo University', 'demo', '#0D1B3E', '#F5A623');


-- === 002_create_rls_policies.sql ===
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


-- === 005_create_grades_rls.sql ===
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

