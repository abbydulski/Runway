-- Runway Database Schema - Complete Fresh Install
-- Run this in your Supabase SQL Editor after resetting the database

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  founder_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('founder', 'employee')),
  avatar_url TEXT,
  organization_id UUID REFERENCES organizations(id),
  position TEXT,
  department TEXT,
  manager_id UUID REFERENCES users(id),
  team_id UUID, -- Will add FK after teams table is created
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  slack_config JSONB DEFAULT '{"channels": []}',
  github_config JSONB DEFAULT '{"teams": []}',
  deel_config JSONB DEFAULT '{"contract_type": "contractor", "payment_schedule": "monthly"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- Add FK from users to teams
ALTER TABLE users ADD CONSTRAINT fk_users_team FOREIGN KEY (team_id) REFERENCES teams(id);

-- Integrations table (OAuth tokens & settings)
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('slack', 'github', 'deel', 'quickbooks', 'google_workspace', 'notion', 'linear')),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  provider_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  connected_by UUID REFERENCES users(id),
  UNIQUE(organization_id, provider)
);

-- Invites table for team invitations
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id),
  manager_id UUID REFERENCES users(id),
  position TEXT,
  invite_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  invited_by UUID REFERENCES users(id),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, organization_id)
);

-- Onboarding steps template
CREATE TABLE onboarding_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('personal', 'company', 'tools', 'team')),
  step_order INTEGER NOT NULL,
  required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User onboarding progress
CREATE TABLE user_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  step_id UUID REFERENCES onboarding_steps(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, step_id)
);

-- Provisioning log (audit trail)
CREATE TABLE provisioning_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES integrations(id),
  action TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'pending_implementation', 'skipped', 'error')),
  details JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- HELPER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION get_my_org_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE provisioning_logs ENABLE ROW LEVEL SECURITY;

-- Organizations
CREATE POLICY "Users can view their organization" ON organizations FOR SELECT
  USING (id = get_my_org_id() OR founder_id = auth.uid());

CREATE POLICY "Founders can update their organization" ON organizations FOR UPDATE
  USING (founder_id = auth.uid());

CREATE POLICY "Anyone can create organization" ON organizations FOR INSERT
  WITH CHECK (true);

-- Users (use get_my_org_id() to avoid infinite recursion)
CREATE POLICY "Users can view organization members" ON users FOR SELECT
  USING (organization_id = get_my_org_id() OR id = auth.uid());

CREATE POLICY "Users can update own profile" ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- Teams
CREATE POLICY "Users can view org teams" ON teams FOR SELECT
  USING (organization_id = get_my_org_id());

CREATE POLICY "Founders can insert teams" ON teams FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'));

CREATE POLICY "Founders can update teams" ON teams FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'));

CREATE POLICY "Founders can delete teams" ON teams FOR DELETE
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'));

-- Integrations (sensitive - founders only)
CREATE POLICY "Founders can view integrations" ON integrations FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'));

CREATE POLICY "Founders can manage integrations" ON integrations FOR ALL
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'));

-- Invites
CREATE POLICY "Founders can view org invites" ON invites FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'));

CREATE POLICY "Founders can manage invites" ON invites FOR ALL
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'));

-- Onboarding steps
CREATE POLICY "Users can view org onboarding steps" ON onboarding_steps FOR SELECT
  USING (organization_id = get_my_org_id());

-- User progress
CREATE POLICY "Users can manage own progress" ON user_onboarding_progress FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Founders can view org progress" ON user_onboarding_progress FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE organization_id = get_my_org_id()));

-- Provisioning logs
CREATE POLICY "Users can view own provisioning logs" ON provisioning_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Founders can view org provisioning logs" ON provisioning_logs FOR SELECT
  USING (organization_id = get_my_org_id());

CREATE POLICY "System can insert provisioning logs" ON provisioning_logs FOR INSERT
  WITH CHECK (true);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_team ON users(team_id);
CREATE INDEX idx_teams_org ON teams(organization_id);
CREATE INDEX idx_integrations_org ON integrations(organization_id);
CREATE INDEX idx_integrations_provider ON integrations(organization_id, provider);
CREATE INDEX idx_invites_org ON invites(organization_id);
CREATE INDEX idx_invites_token ON invites(invite_token);
CREATE INDEX idx_provisioning_logs_user ON provisioning_logs(user_id);
