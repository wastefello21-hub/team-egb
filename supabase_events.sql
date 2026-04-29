-- Add missing columns to team_members table for online status tracking
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;

-- Enable realtime for team_members table
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;

-- Update existing members to set is_online to false initially
UPDATE team_members SET is_online = false WHERE is_online IS NULL;