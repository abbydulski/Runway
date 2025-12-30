-- Onboarding Steps table - stores configurable onboarding steps per organization
CREATE TABLE IF NOT EXISTS onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general', -- 'company', 'team', 'tools', 'general'
  step_type TEXT NOT NULL DEFAULT 'manual', -- 'integration', 'document', 'manual'
  integration_provider TEXT, -- 'slack', 'github', 'google_workspace', etc.
  document_url TEXT,
  step_order INTEGER NOT NULL DEFAULT 0,
  required BOOLEAN NOT NULL DEFAULT false,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Onboarding Progress table - tracks each employee's completion status
CREATE TABLE IF NOT EXISTS user_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES onboarding_steps(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, step_id)
);

-- Add handbook_url column to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS handbook_url TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_org ON onboarding_steps(organization_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_order ON onboarding_steps(organization_id, step_order);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_progress_user ON user_onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_progress_step ON user_onboarding_progress(step_id);

-- Enable RLS
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_steps
CREATE POLICY "Users can view onboarding steps for their organization"
  ON onboarding_steps FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Founders can manage onboarding steps"
  ON onboarding_steps FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- RLS Policies for user_onboarding_progress
CREATE POLICY "Users can view their own progress"
  ON user_onboarding_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own progress"
  ON user_onboarding_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own progress records"
  ON user_onboarding_progress FOR UPDATE
  USING (user_id = auth.uid());

-- Founders can view all progress in their org
CREATE POLICY "Founders can view all progress in their org"
  ON user_onboarding_progress FOR SELECT
  USING (
    user_id IN (
      SELECT u.id FROM users u
      WHERE u.organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'
      )
    )
  );

