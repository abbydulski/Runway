-- Runway Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Row Level Security Policies

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Organizations: founders can manage their org, employees can view
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Founders can update their organization"
  ON organizations FOR UPDATE
  USING (founder_id = auth.uid());

-- Users: can view org members, update own profile
CREATE POLICY "Users can view organization members"
  ON users FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- Onboarding steps: org members can view
CREATE POLICY "Users can view org onboarding steps"
  ON onboarding_steps FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE users.id = auth.uid()));

-- User progress: users can manage their own progress
CREATE POLICY "Users can view own progress"
  ON user_onboarding_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own progress"
  ON user_onboarding_progress FOR ALL
  USING (user_id = auth.uid());

-- Founders can view all progress in their org
CREATE POLICY "Founders can view org progress"
  ON user_onboarding_progress FOR SELECT
  USING (
    user_id IN (
      SELECT u.id FROM users u
      WHERE u.organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'founder'
      )
    )
  );

