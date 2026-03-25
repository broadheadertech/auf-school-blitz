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
