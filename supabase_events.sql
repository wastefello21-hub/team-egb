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
CREATE POLICY "Public can view events" ON events
  FOR SELECT USING (true);

-- Allow authenticated users to insert events (admin)
CREATE POLICY "Admin can insert events" ON events
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to update events
CREATE POLICY "Admin can update events" ON events
  FOR UPDATE USING (true);

-- Allow authenticated users to delete events
CREATE POLICY "Admin can delete events" ON events
  FOR DELETE USING (true);

-- Allow public to apply for events
CREATE POLICY "Public can apply for events" ON event_applications
  FOR INSERT WITH CHECK (true);

-- Allow admin to view all applications
CREATE POLICY "Admin can view applications" ON event_applications
  FOR SELECT USING (true);

-- Allow admin to delete applications
CREATE POLICY "Admin can delete applications" ON event_applications
  FOR DELETE USING (true);

-- Storage bucket for event posters (ignore if already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-posters', 'event-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public to view event posters
DROP POLICY IF EXISTS "Public can view event posters" ON storage.objects;
CREATE POLICY "Public can view event posters" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-posters');

-- Allow authenticated users to upload event posters
DROP POLICY IF EXISTS "Authenticated can upload event posters" ON storage.objects;
CREATE POLICY "Authenticated can upload event posters" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'event-posters' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete event posters
DROP POLICY IF EXISTS "Authenticated can delete event posters" ON storage.objects;
CREATE POLICY "Authenticated can delete event posters" ON storage.objects
  FOR DELETE USING (bucket_id = 'event-posters' AND auth.role() = 'authenticated');