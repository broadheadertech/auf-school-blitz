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
