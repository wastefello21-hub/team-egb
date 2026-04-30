-- Add missing columns to team_members table for online status tracking
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;

-- Update existing members to set is_online to false initially
UPDATE team_members SET is_online = false WHERE is_online IS NULL;

-- Ensure RLS policies allow updates to is_online and last_seen columns
DROP POLICY IF EXISTS "Allow update online status" ON team_members;
CREATE POLICY "Allow update online status" ON team_members
FOR UPDATE USING (true)
WITH CHECK (true);