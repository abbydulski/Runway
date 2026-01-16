-- Add team_type column to teams table
-- Allows distinguishing between regular teams and field teams (with Ayer access)

ALTER TABLE teams 
  ADD COLUMN IF NOT EXISTS team_type TEXT DEFAULT 'regular' 
  CHECK (team_type IN ('regular', 'field'));

-- Update existing teams to have 'regular' type
UPDATE teams SET team_type = 'regular' WHERE team_type IS NULL;

