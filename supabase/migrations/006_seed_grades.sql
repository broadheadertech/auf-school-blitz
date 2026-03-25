-- Migration: 006_seed_grades
-- Description: Seed subjects, sections, and grades for development/testing
-- Uses test student Maria Santos and test faculty from 003_seed_dev_users

-- ========================================
-- SUBJECTS: BSCS Year 1 subjects (Filipino university context)
-- ========================================
INSERT INTO subjects (id, code, name, units, type, description) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'CS 101', 'Introduction to Computing', 3, 'core', 'Fundamentals of computing, hardware, software, and information systems'),
  ('a1000000-0000-0000-0000-000000000002', 'CS 102', 'Computer Programming 1', 3, 'core', 'Introduction to programming using Python — variables, control structures, functions'),
  ('a1000000-0000-0000-0000-000000000003', 'MATH 101', 'College Algebra', 3, 'core', 'Algebraic expressions, equations, inequalities, functions, and graphs'),
  ('a1000000-0000-0000-0000-000000000004', 'MATH 102', 'Plane Trigonometry', 3, 'core', 'Trigonometric functions, identities, equations, and applications'),
  ('a1000000-0000-0000-0000-000000000005', 'GE 101', 'Understanding the Self', 3, 'ge', 'Self-awareness, identity formation, and social context of the self'),
  ('a1000000-0000-0000-0000-000000000006', 'GE 102', 'Readings in Philippine History', 3, 'ge', 'Philippine history through primary sources and critical analysis'),
  ('a1000000-0000-0000-0000-000000000007', 'GE 103', 'The Contemporary World', 3, 'ge', 'Globalization, cultural exchange, and contemporary global issues'),
  ('a1000000-0000-0000-0000-000000000008', 'PE 101', 'Physical Fitness', 2, 'ge', 'Physical education and wellness activities'),
  ('a1000000-0000-0000-0000-000000000009', 'CS 201', 'Computer Programming 2', 3, 'core', 'Object-oriented programming, data structures, and algorithms'),
  ('a1000000-0000-0000-0000-000000000010', 'NSTP 101', 'National Service Training Program 1', 3, 'ge', 'Civic welfare training service and community engagement');

-- ========================================
-- SECTIONS: 2-3 sections per subject (1st Sem AY 2025-2026)
-- Using a placeholder faculty_id — this requires a faculty record from 003_seed_dev_users
-- We create two faculty members for section variety
-- ========================================

-- Insert faculty if they don't already exist (safe for re-runs)
INSERT INTO faculty (id, user_id, employee_id, first_name, last_name, department)
VALUES
  ('f1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'FAC-2025-001', 'Juan', 'Dela Cruz', 'Computer Science'),
  ('f1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'FAC-2025-002', 'Ana', 'Reyes', 'Mathematics')
ON CONFLICT (employee_id) DO NOTHING;

-- CS 101 sections
INSERT INTO sections (id, subject_id, section_code, faculty_id, schedule_json, capacity, enrolled_count, semester, academic_year, status) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'CS101-A', 'f1000000-0000-0000-0000-000000000001', '[{"day":"MON","start":"08:00","end":"09:30","room":"CL-301"},{"day":"WED","start":"08:00","end":"09:30","room":"CL-301"}]', 40, 38, '1st Sem', '2025-2026', 'open'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'CS101-B', 'f1000000-0000-0000-0000-000000000001', '[{"day":"TUE","start":"10:00","end":"11:30","room":"CL-302"},{"day":"THU","start":"10:00","end":"11:30","room":"CL-302"}]', 40, 35, '1st Sem', '2025-2026', 'open');

-- CS 102 sections
INSERT INTO sections (id, subject_id, section_code, faculty_id, schedule_json, capacity, enrolled_count, semester, academic_year, status) VALUES
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'CS102-A', 'f1000000-0000-0000-0000-000000000001', '[{"day":"MON","start":"10:00","end":"11:30","room":"CL-303"},{"day":"WED","start":"10:00","end":"11:30","room":"CL-303"}]', 35, 33, '1st Sem', '2025-2026', 'open'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'CS102-B', 'f1000000-0000-0000-0000-000000000001', '[{"day":"TUE","start":"13:00","end":"14:30","room":"CL-303"},{"day":"THU","start":"13:00","end":"14:30","room":"CL-303"}]', 35, 30, '1st Sem', '2025-2026', 'open');

-- MATH 101 sections
INSERT INTO sections (id, subject_id, section_code, faculty_id, schedule_json, capacity, enrolled_count, semester, academic_year, status) VALUES
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 'MATH101-A', 'f1000000-0000-0000-0000-000000000002', '[{"day":"MON","start":"13:00","end":"14:30","room":"R-201"},{"day":"WED","start":"13:00","end":"14:30","room":"R-201"}]', 45, 42, '1st Sem', '2025-2026', 'open'),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'MATH101-B', 'f1000000-0000-0000-0000-000000000002', '[{"day":"TUE","start":"08:00","end":"09:30","room":"R-202"},{"day":"THU","start":"08:00","end":"09:30","room":"R-202"}]', 45, 40, '1st Sem', '2025-2026', 'open');

-- MATH 102 sections
INSERT INTO sections (id, subject_id, section_code, faculty_id, schedule_json, capacity, enrolled_count, semester, academic_year, status) VALUES
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 'MATH102-A', 'f1000000-0000-0000-0000-000000000002', '[{"day":"MON","start":"15:00","end":"16:30","room":"R-203"},{"day":"WED","start":"15:00","end":"16:30","room":"R-203"}]', 40, 38, '1st Sem', '2025-2026', 'open');

-- GE 101 sections
INSERT INTO sections (id, subject_id, section_code, faculty_id, schedule_json, capacity, enrolled_count, semester, academic_year, status) VALUES
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000005', 'GE101-A', 'f1000000-0000-0000-0000-000000000002', '[{"day":"FRI","start":"08:00","end":"11:00","room":"GE-101"}]', 50, 48, '1st Sem', '2025-2026', 'open');

-- GE 102 sections
INSERT INTO sections (id, subject_id, section_code, faculty_id, schedule_json, capacity, enrolled_count, semester, academic_year, status) VALUES
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000006', 'GE102-A', 'f1000000-0000-0000-0000-000000000001', '[{"day":"FRI","start":"13:00","end":"16:00","room":"GE-102"}]', 50, 45, '1st Sem', '2025-2026', 'open');

-- PE 101 sections
INSERT INTO sections (id, subject_id, section_code, faculty_id, schedule_json, capacity, enrolled_count, semester, academic_year, status) VALUES
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000008', 'PE101-A', 'f1000000-0000-0000-0000-000000000002', '[{"day":"SAT","start":"08:00","end":"10:00","room":"GYM"}]', 60, 55, '1st Sem', '2025-2026', 'open');

-- CS 201 sections (2nd Sem)
INSERT INTO sections (id, subject_id, section_code, faculty_id, schedule_json, capacity, enrolled_count, semester, academic_year, status) VALUES
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000009', 'CS201-A', 'f1000000-0000-0000-0000-000000000001', '[{"day":"MON","start":"08:00","end":"09:30","room":"CL-301"},{"day":"WED","start":"08:00","end":"09:30","room":"CL-301"}]', 40, 35, '2nd Sem', '2025-2026', 'open');

-- GE 103 sections (2nd Sem)
INSERT INTO sections (id, subject_id, section_code, faculty_id, schedule_json, capacity, enrolled_count, semester, academic_year, status) VALUES
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000007', 'GE103-A', 'f1000000-0000-0000-0000-000000000002', '[{"day":"FRI","start":"08:00","end":"11:00","room":"GE-103"}]', 50, 40, '2nd Sem', '2025-2026', 'open');

-- NSTP 101 sections (2nd Sem)
INSERT INTO sections (id, subject_id, section_code, faculty_id, schedule_json, capacity, enrolled_count, semester, academic_year, status) VALUES
  ('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000010', 'NSTP101-A', 'f1000000-0000-0000-0000-000000000001', '[{"day":"SAT","start":"08:00","end":"11:00","room":"NSTP-RM"}]', 50, 42, '2nd Sem', '2025-2026', 'open');

-- ========================================
-- GRADES for test student Maria Santos
-- Requires a student record from 003_seed_dev_users
-- ========================================

-- Insert student if not exists
INSERT INTO students (id, user_id, student_number, first_name, last_name, program, year_level)
VALUES ('s1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2025-00001', 'Maria', 'Santos', 'BSCS', 1)
ON CONFLICT (student_number) DO NOTHING;

-- 1st Sem 2025-2026 grades (mix of passed, failed, in-progress)
INSERT INTO grades (student_id, section_id, subject_id, midterm, final_grade, final_computed, status, semester, academic_year, submitted_by, submitted_at) VALUES
  -- CS 101: Passed (1.5)
  ('s1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 1.5, 1.5, 1.5, 'finalized', '1st Sem', '2025-2026', 'f1000000-0000-0000-0000-000000000001', '2025-12-20T08:00:00Z'),
  -- CS 102: Passed (2.0)
  ('s1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 2.0, 2.0, 2.0, 'finalized', '1st Sem', '2025-2026', 'f1000000-0000-0000-0000-000000000001', '2025-12-20T08:00:00Z'),
  -- MATH 101: Passed (2.5)
  ('s1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 2.5, 2.5, 2.5, 'finalized', '1st Sem', '2025-2026', 'f1000000-0000-0000-0000-000000000002', '2025-12-20T09:00:00Z'),
  -- MATH 102: Failed (5.0)
  ('s1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 3.0, 5.0, 5.0, 'finalized', '1st Sem', '2025-2026', 'f1000000-0000-0000-0000-000000000002', '2025-12-20T09:00:00Z'),
  -- GE 101: Passed (1.75)
  ('s1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000005', 1.5, 2.0, 1.75, 'finalized', '1st Sem', '2025-2026', 'f1000000-0000-0000-0000-000000000002', '2025-12-20T10:00:00Z'),
  -- GE 102: Passed (2.25)
  ('s1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000006', 2.0, 2.5, 2.25, 'finalized', '1st Sem', '2025-2026', 'f1000000-0000-0000-0000-000000000001', '2025-12-20T10:00:00Z'),
  -- PE 101: Passed (1.5)
  ('s1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000008', 1.5, 1.5, 1.5, 'finalized', '1st Sem', '2025-2026', 'f1000000-0000-0000-0000-000000000002', '2025-12-20T10:00:00Z');

-- 2nd Sem 2025-2026 grades (in-progress and submitted)
INSERT INTO grades (student_id, section_id, subject_id, midterm, final_grade, final_computed, status, semester, academic_year, submitted_by, submitted_at) VALUES
  -- CS 201: In Progress (midterm only)
  ('s1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000009', 1.75, NULL, NULL, 'in_progress', '2nd Sem', '2025-2026', NULL, NULL),
  -- GE 103: In Progress (midterm only)
  ('s1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000007', 2.0, NULL, NULL, 'in_progress', '2nd Sem', '2025-2026', NULL, NULL),
  -- NSTP 101: Submitted (awaiting finalization)
  ('s1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000010', 1.5, 1.5, 1.5, 'submitted', '2nd Sem', '2025-2026', 'f1000000-0000-0000-0000-000000000001', '2026-03-15T08:00:00Z');
