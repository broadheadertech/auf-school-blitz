-- Migration: 015_create_semester_settings
-- Description: Global academic settings — current semester, enrollment window, grading period

CREATE TABLE academic_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(50) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE academic_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_settings ON academic_settings FOR SELECT USING (true);
CREATE POLICY admin_manage_settings ON academic_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));

-- Default settings
INSERT INTO academic_settings (key, value) VALUES
  ('current_semester', '2nd Sem'),
  ('current_academic_year', '2025-2026'),
  ('enrollment_open', 'true'),
  ('enrollment_start', '2026-01-05'),
  ('enrollment_end', '2026-01-20'),
  ('grading_open', 'true'),
  ('grading_deadline', '2026-04-15'),
  ('payment_deadline', '2026-03-31'),
  ('tuition_per_unit', '1500'),
  ('misc_fee', '5000'),
  ('lab_fee', '3000');
