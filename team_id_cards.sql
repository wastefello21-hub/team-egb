-- Add ID card URL column to team_members table
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS id_card_url TEXT;

-- Create a bucket for ID card images if it doesn't exist
-- Note: Run this in Supabase dashboard manually or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('team-id-cards', 'team-id-cards', true);

-- Set up RLS policy for ID card bucket (run in Supabase dashboard)
-- CREATE POLICY "Team members can read their own ID cards"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'team-id-cards' AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.jwt() -> 'role' = '"authenticated"'));

-- CREATE POLICY "Admin can upload ID cards"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'team-id-cards' AND auth.jwt() -> 'role' = '"authenticated"');

-- CREATE POLICY "Admin can update ID cards"
-- ON storage.objects FOR UPDATE
-- USING (bucket_id = 'team-id-cards' AND auth.jwt() -> 'role' = '"authenticated"');

-- CREATE POLICY "Admin can delete ID cards"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'team-id-cards' AND auth.jwt() -> 'role' = '"authenticated"');
