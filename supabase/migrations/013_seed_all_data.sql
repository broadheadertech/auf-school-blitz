-- Migration: 013_seed_all_data
-- Description: Comprehensive seed data for all Phase 1-3 tables
-- ⚠ WARNING: LOCAL DEVELOPMENT ONLY. DO NOT run in production.
-- Depends on: 003_seed_dev_users, 006_seed_grades (for students, faculty, subjects, sections)

-- ========================================
-- PROGRAMS (Story 4.1)
-- ========================================
INSERT INTO programs (id, code, name, total_units, duration_years) VALUES
  ('p0000000-0000-0000-0000-000000000001', 'BSCS', 'Bachelor of Science in Computer Science', 160, 4),
  ('p0000000-0000-0000-0000-000000000002', 'BSIT', 'Bachelor of Science in Information Technology', 155, 4),
  ('p0000000-0000-0000-0000-000000000003', 'BSN', 'Bachelor of Science in Nursing', 180, 4),
  ('p0000000-0000-0000-0000-000000000004', 'BSBA', 'Bachelor of Science in Business Administration', 150, 4),
  ('p0000000-0000-0000-0000-000000000005', 'BSED', 'Bachelor of Secondary Education', 145, 4),
  ('p0000000-0000-0000-0000-000000000006', 'BSECE', 'Bachelor of Science in Electronics & Communications Engineering', 170, 5)
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- CURRICULUM MAP — BSCS Year 1 (Story 4.1)
-- Links subjects to program with year/semester placement
-- ========================================
INSERT INTO curriculum_map (program_id, subject_id, year_level, semester, subject_type, prerequisite_subject_ids) VALUES
  -- Year 1, 1st Sem
  ('p0000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 1, '1st Sem', 'core', '{}'),
  ('p0000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 1, '1st Sem', 'core', '{}'),
  ('p0000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 1, '1st Sem', 'core', '{}'),
  ('p0000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 1, '1st Sem', 'core', '{}'),
  ('p0000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 1, '1st Sem', 'ge', '{}'),
  ('p0000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000006', 1, '1st Sem', 'ge', '{}'),
  ('p0000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000008', 1, '1st Sem', 'ge', '{}'),
  -- Year 1, 2nd Sem
  ('p0000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000009', 1, '2nd Sem', 'core', ARRAY['a1000000-0000-0000-0000-000000000002']::UUID[]),
  ('p0000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000007', 1, '2nd Sem', 'ge', '{}'),
  ('p0000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000010', 1, '2nd Sem', 'ge', '{}')
ON CONFLICT (program_id, subject_id) DO NOTHING;

-- ========================================
-- ENROLLMENTS (Story 5.1)
-- Maria Santos enrolled in 2nd Sem 2025-2026
-- ========================================
INSERT INTO enrollments (student_id, section_id, status, semester, academic_year) VALUES
  ('s1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000011', 'confirmed', '2nd Sem', '2025-2026'),
  ('s1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000012', 'confirmed', '2nd Sem', '2025-2026'),
  ('s1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000013', 'confirmed', '2nd Sem', '2025-2026')
ON CONFLICT (student_id, section_id) DO NOTHING;

-- ========================================
-- FEES (Story 6.1)
-- Maria Santos 2nd Sem 2025-2026 fee assessment
-- ========================================
INSERT INTO fees (id, student_id, category, description, amount, semester, academic_year) VALUES
  ('fe000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'Tuition', 'Tuition Fee (17 units x ₱1,500)', 25500, '2nd Sem', '2025-2026'),
  ('fe000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 'Miscellaneous', 'Miscellaneous Fees', 5000, '2nd Sem', '2025-2026'),
  ('fe000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000001', 'Laboratory', 'Computer Laboratory Fee', 3000, '2nd Sem', '2025-2026'),
  ('fe000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', 'ID', 'Student ID Card', 500, '2nd Sem', '2025-2026'),
  ('fe000000-0000-0000-0000-000000000005', 's1000000-0000-0000-0000-000000000001', 'Others', 'Library Fee', 1000, '2nd Sem', '2025-2026'),
  ('fe000000-0000-0000-0000-000000000006', 's1000000-0000-0000-0000-000000000001', 'Others', 'Development Fee', 1500, '2nd Sem', '2025-2026');

-- ========================================
-- PAYMENTS (Story 6.2-6.4)
-- Maria Santos payment history with OCR data
-- ========================================
INSERT INTO payments (id, student_id, amount, method, reference_number, proof_url, status, reject_reason, reviewed_by, reviewed_at, semester, academic_year, ocr_extracted_text, ocr_confidence, ocr_matched) VALUES
  ('pa000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 20000, 'gcash', 'GC-2026-001234', NULL, 'posted', NULL, 'c3d4e5f6-a7b8-9012-cdef-123456789012', '2026-01-15T10:00:00Z', '2nd Sem', '2025-2026', 'GC-2026-001234', 95.5, true),
  ('pa000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 10000, 'bank_transfer', 'BDO-2026-5678', NULL, 'verified', NULL, 'c3d4e5f6-a7b8-9012-cdef-123456789012', '2026-02-10T14:00:00Z', '2nd Sem', '2025-2026', 'BDO-2026-5678', 88.2, true),
  ('pa000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000001', 5000, 'maya', 'MY-2026-9012', NULL, 'under_review', NULL, NULL, NULL, '2nd Sem', '2025-2026', 'MY-2O26-9O12', 62.0, false);

-- ========================================
-- NEWS ARTICLES (Story 7.1)
-- Filipino university context news
-- ========================================
INSERT INTO news_articles (id, title, excerpt, body, category, thumbnail_url, author_name, is_featured, published_at) VALUES
  ('ne000000-0000-0000-0000-000000000001', 'UniPortal Launches New Online Enrollment System', 'Students can now enroll using a schedule-first approach with automatic conflict detection.', 'The university is proud to announce the launch of UniPortal, a modern web application that revolutionizes the enrollment process. Students can now define their preferred schedule first, and the system will automatically show only subjects that fit.', 'Academic', NULL, 'Office of the Registrar', true, '2026-03-15T08:00:00Z'),
  ('ne000000-0000-0000-0000-000000000002', 'Midterm Examination Schedule Released', 'The midterm examination period for 2nd Semester AY 2025-2026 has been announced.', 'The midterm examinations will be held from March 25-29, 2026. Students are advised to check their exam schedules on UniPortal.', 'Academic', NULL, 'Academic Affairs', false, '2026-03-12T10:00:00Z'),
  ('ne000000-0000-0000-0000-000000000003', 'Payment Deadline Extended to March 31', 'The deadline for 2nd semester tuition payment has been extended by two weeks.', 'In response to student requests, the Finance Office has extended the payment deadline to March 31, 2026.', 'Administrative', NULL, 'Finance Office', false, '2026-03-10T14:00:00Z'),
  ('ne000000-0000-0000-0000-000000000004', 'University Basketball Team Advances to Finals', 'The Wildcats defeated their rivals in a thrilling semifinal match.', 'The university basketball team has advanced to the UAAP finals after a dramatic 85-82 victory.', 'Sports', NULL, 'Sports Office', false, '2026-03-08T18:00:00Z'),
  ('ne000000-0000-0000-0000-000000000005', 'Cultural Night 2026: Celebrating Filipino Heritage', 'Join us for an evening of Filipino performances, food, and art.', 'The Student Affairs Office invites everyone to Cultural Night 2026, celebrating Filipino heritage through dance, music, and cuisine.', 'Campus Life', NULL, 'Student Affairs', false, '2026-03-05T09:00:00Z'),
  ('ne000000-0000-0000-0000-000000000006', 'International Exchange Program Applications Now Open', 'Students can apply for semester-long exchange programs at partner universities abroad.', 'The Office of International Affairs is now accepting applications for the 2026-2027 exchange program.', 'International', NULL, 'International Affairs', false, '2026-03-01T07:00:00Z');

-- ========================================
-- EVENTS (Story 8.1)
-- Academic calendar events for 2nd Sem 2025-2026
-- ========================================
INSERT INTO events (id, title, description, category, venue, start_date, end_date, rsvp_enabled, max_attendees) VALUES
  ('ev000000-0000-0000-0000-000000000001', 'Midterm Examinations', 'Midterm examination period for all programs.', 'academic', 'All Classrooms', '2026-03-25T07:00:00Z', '2026-03-29T17:00:00Z', false, NULL),
  ('ev000000-0000-0000-0000-000000000002', 'UAAP Basketball Finals Game 1', 'First game of the UAAP basketball finals series.', 'sports', 'MOA Arena', '2026-04-05T16:00:00Z', '2026-04-05T19:00:00Z', true, 200),
  ('ev000000-0000-0000-0000-000000000003', 'Cultural Night 2026', 'Annual celebration of Filipino heritage through dance, music, and cuisine.', 'cultural', 'University Auditorium', '2026-04-12T18:00:00Z', '2026-04-12T22:00:00Z', true, 500),
  ('ev000000-0000-0000-0000-000000000004', 'CS Department Hackathon', '24-hour hackathon open to all CS and IT students.', 'organization', 'Computer Lab 1-3', '2026-04-19T08:00:00Z', '2026-04-20T08:00:00Z', true, 100),
  ('ev000000-0000-0000-0000-000000000005', 'Enrollment for 1st Sem AY 2026-2027', 'Online enrollment opens for all continuing students.', 'administrative', 'Online via UniPortal', '2026-05-05T00:00:00Z', '2026-05-20T23:59:00Z', false, NULL),
  ('ev000000-0000-0000-0000-000000000006', 'Final Examinations', 'Final examination period for 2nd Semester.', 'academic', 'All Classrooms', '2026-05-25T07:00:00Z', '2026-05-30T17:00:00Z', false, NULL),
  ('ev000000-0000-0000-0000-000000000007', 'Commencement Exercises', 'Graduation ceremony for batch 2026.', 'administrative', 'University Gymnasium', '2026-06-15T09:00:00Z', '2026-06-15T12:00:00Z', false, NULL);

-- ========================================
-- EVENT RSVPs
-- Maria Santos RSVPed to hackathon and cultural night
-- ========================================
INSERT INTO event_rsvps (event_id, user_id) VALUES
  ('ev000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('ev000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (event_id, user_id) DO NOTHING;

-- ========================================
-- PEER TIPS (Story 14.1)
-- Crowd-sourced Taglish tips from upperclassmen
-- ========================================
INSERT INTO peer_tips (id, author_id, content, page_context, status) VALUES
  ('pt000000-0000-0000-0000-000000000001', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'Pro tip: Register for hackathons early — slots fill up fast!', 'events', 'approved'),
  ('pt000000-0000-0000-0000-000000000002', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'Check your GWA trend chart regularly — it helps you see patterns in your study habits.', 'grades', 'approved'),
  ('pt000000-0000-0000-0000-000000000003', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'Enroll in your MWF subjects first para hindi ma-conflict ang sched mo.', 'enrollment', 'approved'),
  ('pt000000-0000-0000-0000-000000000004', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'Save your enrollment confirmation PDF — you''ll need it for scholarship applications!', 'enrollment', 'approved'),
  ('pt000000-0000-0000-0000-000000000005', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'Upload your payment proof as soon as you pay — don''t wait for the deadline!', 'payments', 'approved'),
  ('pt000000-0000-0000-0000-000000000006', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'The Degree Progress Tracker shows which subjects you can take next — check it before enrollment!', 'curriculum', 'approved'),
  ('pt000000-0000-0000-0000-000000000007', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'Customize your dashboard — put Grades and Payments at the top for quick access!', 'dashboard', 'approved'),
  ('pt000000-0000-0000-0000-000000000008', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'Wag kalimutan mag-check ng deadline — may countdown timer sa dashboard!', 'dashboard', 'pending');

-- ========================================
-- STREAK RECORDS (Story 20.1)
-- Maria Santos has a 47-day streak
-- ========================================
INSERT INTO streak_records (student_id, current_streak, longest_streak, last_check_in) VALUES
  ('s1000000-0000-0000-0000-000000000001', 47, 47, CURRENT_DATE)
ON CONFLICT (student_id) DO NOTHING;

-- Insert recent check-ins (last 7 days)
INSERT INTO check_ins (student_id, check_in_date) VALUES
  ('s1000000-0000-0000-0000-000000000001', CURRENT_DATE),
  ('s1000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '1 day'),
  ('s1000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '2 days'),
  ('s1000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '3 days'),
  ('s1000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '4 days'),
  ('s1000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '5 days'),
  ('s1000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '6 days')
ON CONFLICT (student_id, check_in_date) DO NOTHING;

-- ========================================
-- NEWS SUBSCRIPTIONS (Story 7.4)
-- Maria Santos subscribed to Academic and Campus Life
-- ========================================
INSERT INTO news_subscriptions (user_id, category) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Academic'),
  ('00000000-0000-0000-0000-000000000001', 'Campus Life')
ON CONFLICT (user_id, category) DO NOTHING;

-- ========================================
-- ADDITIONAL TEST STUDENTS (for faculty grade submission and at-risk features)
-- ========================================
INSERT INTO students (id, user_id, student_number, first_name, last_name, program, year_level) VALUES
  ('s1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', '2025-00002', 'Juan', 'Dela Cruz', 'BSCS', 1),
  ('s1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', '2025-00003', 'Ana', 'Reyes', 'BSCS', 1),
  ('s1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', '2025-00004', 'Pedro', 'Garcia', 'BSCS', 1),
  ('s1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000007', '2025-00005', 'Rosa', 'Mendoza', 'BSIT', 1),
  ('s1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000008', '2025-00006', 'Carlos', 'Santos', 'BSIT', 1),
  ('s1000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000009', '2025-00007', 'Liza', 'Cruz', 'BSCS', 2),
  ('s1000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000010', '2025-00008', 'Mark', 'Aquino', 'BSCS', 3),
  ('s1000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000011', '2025-00009', 'Joy', 'Bautista', 'BSCS', 3),
  ('s1000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000012', '2025-00010', 'Mike', 'Reyes', 'BSCS', 4)
ON CONFLICT (student_number) DO NOTHING;

-- Grades for additional students (mix of passed and at-risk)
INSERT INTO grades (student_id, section_id, subject_id, midterm, final_grade, final_computed, status, semester, academic_year, submitted_by, submitted_at) VALUES
  -- Juan: at-risk (midterm 3.0 in MATH 101)
  ('s1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 3.0, NULL, NULL, 'in_progress', '1st Sem', '2025-2026', NULL, NULL),
  -- Ana: at-risk (midterm 4.0 in MATH 101)
  ('s1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 4.0, NULL, NULL, 'in_progress', '1st Sem', '2025-2026', NULL, NULL),
  -- Pedro: passing (midterm 2.0 in CS 101)
  ('s1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 2.0, NULL, NULL, 'in_progress', '1st Sem', '2025-2026', NULL, NULL),
  -- Rosa: at-risk (midterm 3.5 in MATH 102)
  ('s1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 3.5, NULL, NULL, 'in_progress', '1st Sem', '2025-2026', NULL, NULL),
  -- Carlos: passing (midterm 1.75 in CS 102)
  ('s1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 1.75, NULL, NULL, 'in_progress', '1st Sem', '2025-2026', NULL, NULL);

-- Superadmin is created in 003_seed_dev_users.sql (user_id: 44444444-4444-4444-4444-444444444444)
