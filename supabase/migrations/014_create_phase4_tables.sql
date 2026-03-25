-- Migration: 014_create_phase4_tables
-- Description: Create tables for Phase 4 features

-- 1. Document Requests
CREATE TABLE IF NOT EXISTS document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('transcript', 'good_moral', 'certification', 'diploma', 'enrollment_cert', 'grades_cert')),
  purpose VARCHAR(200),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'claimed', 'rejected')),
  notes TEXT,
  processed_by UUID REFERENCES admin_staff(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_doc_requests_student ON document_requests(student_id);
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY student_own_doc_requests ON document_requests FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY student_insert_doc_request ON document_requests FOR INSERT WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY admin_all_doc_requests ON document_requests FOR ALL USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Student Clearance
CREATE TABLE IF NOT EXISTS clearance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  department VARCHAR(100) NOT NULL,
  description VARCHAR(200) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'hold')),
  remarks TEXT,
  cleared_by UUID REFERENCES admin_staff(id),
  semester VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clearance_student ON clearance_items(student_id);
ALTER TABLE clearance_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY student_own_clearance ON clearance_items FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY admin_all_clearance ON clearance_items FOR ALL USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Messages / Chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY own_messages ON messages FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY send_messages ON messages FOR INSERT WITH CHECK (sender_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY read_own_messages ON messages FOR UPDATE USING (recipient_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. Course Reviews
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  workload INTEGER NOT NULL CHECK (workload BETWEEN 1 AND 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  semester VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, subject_id, semester, academic_year)
);
CREATE INDEX IF NOT EXISTS idx_course_reviews_subject ON course_reviews(subject_id);
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY read_reviews ON course_reviews FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY student_insert_review ON course_reviews FOR INSERT WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  remarks TEXT,
  marked_by UUID REFERENCES faculty(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (section_id, student_id, date)
);
CREATE INDEX IF NOT EXISTS idx_attendance_section ON attendance(section_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY student_own_attendance ON attendance FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY faculty_section_attendance ON attendance FOR ALL USING (section_id IN (SELECT id FROM sections WHERE faculty_id IN (SELECT id FROM faculty WHERE user_id = auth.uid()))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY admin_all_attendance ON attendance FOR ALL USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6. Class Materials
CREATE TABLE IF NOT EXISTS class_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type VARCHAR(20),
  uploaded_by UUID NOT NULL REFERENCES faculty(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_materials_section ON class_materials(section_id);
ALTER TABLE class_materials ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY read_materials ON class_materials FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY faculty_manage_materials ON class_materials FOR ALL USING (uploaded_by IN (SELECT id FROM faculty WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7. Consultation Slots
CREATE TABLE IF NOT EXISTS consultation_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  day_of_week VARCHAR(10) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_bookings INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true
);
CREATE TABLE IF NOT EXISTS consultation_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES consultation_slots(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  topic VARCHAR(200),
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (slot_id, student_id, booking_date)
);
ALTER TABLE consultation_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY read_slots ON consultation_slots FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY faculty_manage_slots ON consultation_slots FOR ALL USING (faculty_id IN (SELECT id FROM faculty WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY student_own_bookings ON consultation_bookings FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY student_book ON consultation_bookings FOR INSERT WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY faculty_view_bookings ON consultation_bookings FOR SELECT USING (slot_id IN (SELECT id FROM consultation_slots WHERE faculty_id IN (SELECT id FROM faculty WHERE user_id = auth.uid()))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 8. Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  content TEXT NOT NULL,
  target_programs VARCHAR(20)[] DEFAULT '{}',
  target_year_levels INTEGER[] DEFAULT '{}',
  priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  published_by UUID REFERENCES admin_staff(id),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY read_announcements ON announcements FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY admin_manage_announcements ON announcements FOR ALL USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 9. Scholarships
CREATE TABLE IF NOT EXISTS scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  max_gwa NUMERIC(2,1) NOT NULL DEFAULT 2.0,
  min_year_level INTEGER DEFAULT 1,
  programs VARCHAR(20)[] DEFAULT '{}',
  slots INTEGER,
  deadline TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS scholarship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id UUID NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted')),
  gwa_at_application NUMERIC(3,2),
  remarks TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (scholarship_id, student_id)
);
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarship_applications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY read_scholarships ON scholarships FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY admin_manage_scholarships ON scholarships FOR ALL USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY student_own_applications ON scholarship_applications FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY student_apply ON scholarship_applications FOR INSERT WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY admin_manage_applications ON scholarship_applications FOR ALL USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 10. Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50),
  record_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY admin_read_audit ON audit_log FOR SELECT USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 11. Study Groups
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  max_members INTEGER DEFAULT 10,
  created_by UUID NOT NULL REFERENCES students(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (group_id, student_id)
);
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY read_groups ON study_groups FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY student_create_group ON study_groups FOR INSERT WITH CHECK (created_by IN (SELECT id FROM students WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY read_members ON study_group_members FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY student_join_group ON study_group_members FOR INSERT WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY student_leave_group ON study_group_members FOR DELETE USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 12. Lost & Found
CREATE TABLE IF NOT EXISTS lost_found (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) NOT NULL CHECK (type IN ('lost', 'found')),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(200),
  image_url TEXT,
  contact_info VARCHAR(200),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'expired')),
  posted_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE lost_found ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY read_lost_found ON lost_found FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY post_lost_found ON lost_found FOR INSERT WITH CHECK (posted_by = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY own_lost_found ON lost_found FOR UPDATE USING (posted_by = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
