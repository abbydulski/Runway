-- Migration: Add onboarding step fields and handbook support
-- Run this after schema-fresh.sql

-- ============================================
-- ADD FIELDS TO ONBOARDING_STEPS TABLE
-- ============================================
ALTER TABLE onboarding_steps 
ADD COLUMN IF NOT EXISTS step_type TEXT CHECK (step_type IN ('integration', 'document', 'manual')) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS integration_provider TEXT,
ADD COLUMN IF NOT EXISTS document_url TEXT,
ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE;

-- ============================================
-- ADD HANDBOOK URL TO ORGANIZATIONS
-- ============================================
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS handbook_url TEXT;

-- ============================================
-- ADD FOUNDER POLICIES FOR ONBOARDING STEPS
-- ============================================

-- Allow founders to insert onboarding steps for their org
CREATE POLICY "Founders can insert onboarding steps" ON onboarding_steps FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- Allow founders to update onboarding steps for their org
CREATE POLICY "Founders can update onboarding steps" ON onboarding_steps FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- Allow founders to delete onboarding steps for their org
CREATE POLICY "Founders can delete onboarding steps" ON onboarding_steps FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'
    )
  );

