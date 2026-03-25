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
