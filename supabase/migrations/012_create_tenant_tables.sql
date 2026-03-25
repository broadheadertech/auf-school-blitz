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
