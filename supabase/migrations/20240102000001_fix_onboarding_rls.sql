-- Fix RLS policies for onboarding_steps table to allow INSERT/UPDATE/DELETE

-- Drop existing policies
DROP POLICY IF EXISTS "Founders can manage onboarding steps" ON onboarding_steps;
DROP POLICY IF EXISTS "Users can view onboarding steps for their organization" ON onboarding_steps;

-- Recreate with proper permissions

-- SELECT policy for all users in the org
CREATE POLICY "Users can view onboarding steps for their organization"
  ON onboarding_steps FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- INSERT policy for founders
CREATE POLICY "Founders can insert onboarding steps"
  ON onboarding_steps FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- UPDATE policy for founders
CREATE POLICY "Founders can update onboarding steps"
  ON onboarding_steps FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- DELETE policy for founders
CREATE POLICY "Founders can delete onboarding steps"
  ON onboarding_steps FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'
    )
  );

