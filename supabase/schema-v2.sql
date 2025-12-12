-- Runway Database Schema v2 - Teams & Integrations
-- Run this AFTER the original schema.sql

-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  -- Integration configs stored as JSONB for flexibility
  slack_config JSONB DEFAULT '{"channels": []}',
  github_config JSONB DEFAULT '{"teams": []}',
  deel_config JSONB DEFAULT '{"contract_type": "contractor", "payment_schedule": "monthly"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- ============================================
-- INTEGRATIONS TABLE (OAuth tokens & settings)
-- ============================================
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('slack', 'github', 'deel', 'quickbooks', 'google_workspace', 'notion', 'linear')),
  -- OAuth tokens (encrypted in production)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  -- Provider-specific data (workspace ID, org name, etc.)
  provider_data JSONB DEFAULT '{}',
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  connected_by UUID REFERENCES users(id),
  UNIQUE(organization_id, provider)
);

-- ============================================
-- UPDATE INVITES TABLE
-- ============================================
ALTER TABLE invites 
  ADD COLUMN team_id UUID REFERENCES teams(id),
  ADD COLUMN manager_id UUID REFERENCES users(id),
  ADD COLUMN position TEXT,
  ADD COLUMN invite_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex');

-- ============================================
-- UPDATE USERS TABLE
-- ============================================
ALTER TABLE users
  ADD COLUMN team_id UUID REFERENCES teams(id);

-- ============================================
-- PROVISIONING LOG (audit trail)
-- ============================================
CREATE TABLE provisioning_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  action TEXT NOT NULL, -- 'invite_sent', 'added_to_channel', 'added_to_team', etc.
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  provider_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE provisioning_logs ENABLE ROW LEVEL SECURITY;

-- Teams: org members can view, founders can manage
CREATE POLICY "Users can view org teams"
  ON teams FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Founders can insert teams"
  ON teams FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'));

CREATE POLICY "Founders can update teams"
  ON teams FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'));

CREATE POLICY "Founders can delete teams"
  ON teams FOR DELETE
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'));

-- Integrations: only founders can view/manage (contains sensitive tokens)
CREATE POLICY "Founders can view integrations"
  ON integrations FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'));

CREATE POLICY "Founders can insert integrations"
  ON integrations FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'));

CREATE POLICY "Founders can update integrations"
  ON integrations FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'));

CREATE POLICY "Founders can delete integrations"
  ON integrations FOR DELETE
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'));

-- Provisioning logs: founders can view all, employees can view their own
CREATE POLICY "Users can view own provisioning logs"
  ON provisioning_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Founders can view org provisioning logs"
  ON provisioning_logs FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'));

CREATE POLICY "System can insert provisioning logs"
  ON provisioning_logs FOR INSERT
  WITH CHECK (true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_teams_org ON teams(organization_id);
CREATE INDEX idx_integrations_org ON integrations(organization_id);
CREATE INDEX idx_integrations_provider ON integrations(organization_id, provider);
CREATE INDEX idx_invites_token ON invites(invite_token);
CREATE INDEX idx_provisioning_logs_user ON provisioning_logs(user_id);
CREATE INDEX idx_users_team ON users(team_id);

