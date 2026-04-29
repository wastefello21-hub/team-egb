-- Settings table for syncing app settings across devices
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  show_names_publicly BOOLEAN DEFAULT true,
  show_amounts_publicly BOOLEAN DEFAULT false,
  show_expenditure_publicly BOOLEAN DEFAULT true,
  festival_name TEXT DEFAULT 'TEAM EGB - Ganesha Chaturthi Celebrations',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings
DROP POLICY IF EXISTS "Public can view settings" ON app_settings;
CREATE POLICY "Public can view settings" ON app_settings
  FOR SELECT USING (true);

-- Allow authenticated users to update settings
DROP POLICY IF EXISTS "Admin can update settings" ON app_settings;
CREATE POLICY "Admin can update settings" ON app_settings
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admin can insert settings" ON app_settings;
CREATE POLICY "Admin can insert settings" ON app_settings
  FOR INSERT WITH CHECK (true);

-- Insert default settings if not exists
INSERT INTO app_settings (id, show_names_publicly, show_amounts_publicly, show_expenditure_publicly, festival_name)
VALUES ('default', true, false, true, 'TEAM EGB - Ganesha Chaturthi Celebrations')
ON CONFLICT (id) DO NOTHING;

-- Events table for storing festival events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  date TEXT,
  time TEXT,
  venue TEXT,
  application_last_date TEXT,
  is_registration_open BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Applications table for participants
CREATE TABLE IF NOT EXISTS event_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER NOT NULL,
  activity TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_applications ENABLE ROW LEVEL SECURITY;

-- Allow public read access to events
DROP POLICY IF EXISTS "Public can view events" ON events;
CREATE POLICY "Public can view events" ON events
  FOR SELECT USING (true);

-- Allow authenticated users to insert events (admin)
DROP POLICY IF EXISTS "Admin can insert events" ON events;
CREATE POLICY "Admin can insert events" ON events
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to update events
DROP POLICY IF EXISTS "Admin can update events" ON events;
CREATE POLICY "Admin can update events" ON events
  FOR UPDATE USING (true);

-- Allow authenticated users to delete events
DROP POLICY IF EXISTS "Admin can delete events" ON events;
CREATE POLICY "Admin can delete events" ON events
  FOR DELETE USING (true);

-- Allow public to apply for events
DROP POLICY IF EXISTS "Public can apply for events" ON event_applications;
CREATE POLICY "Public can apply for events" ON event_applications
  FOR INSERT WITH CHECK (true);

-- Allow admin to view all applications
DROP POLICY IF EXISTS "Admin can view applications" ON event_applications;
CREATE POLICY "Admin can view applications" ON event_applications
  FOR SELECT USING (true);

-- Allow admin to delete applications
DROP POLICY IF EXISTS "Admin can delete applications" ON event_applications;
CREATE POLICY "Admin can delete applications" ON event_applications
  FOR DELETE USING (true);

-- Add is_online column to team_members table for real-time status tracking
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT true;

-- Update RLS policies for team_members to allow public read of online status
DROP POLICY IF EXISTS "Public can view team members" ON team_members;
CREATE POLICY "Public can view team members" ON team_members
  FOR SELECT USING (true);

-- Allow authenticated users to update team member status
DROP POLICY IF EXISTS "Authenticated can update team members" ON team_members;
CREATE POLICY "Authenticated can update team members" ON team_members
  FOR UPDATE USING (true);

-- Storage bucket for event posters (ignore if already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-posters', 'event-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Allow all operations on event-posters bucket (no RLS restrictions)
DROP POLICY IF EXISTS "Public can view event posters" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads to event-posters" ON storage.objects;
DROP POLICY IF EXISTS "Allow all deletes from event-posters" ON storage.objects;

CREATE POLICY "Public can view event posters" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-posters');

CREATE POLICY "Allow all uploads to event-posters" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'event-posters');

CREATE POLICY "Allow all deletes from event-posters" ON storage.objects
  FOR DELETE USING (bucket_id = 'event-posters');