-- Migration: 014_create_departments_table
-- Description: Proper departments/colleges table

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  college VARCHAR(200),
  head_name VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_departments_code ON departments(code);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Everyone can read departments
CREATE POLICY read_departments ON departments FOR SELECT USING (true);

-- Only admin can manage
CREATE POLICY admin_manage_departments ON departments FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));
