-- Add ID card URL column to team_members table
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS id_card_url TEXT;

-- Create bucket if missing and keep it public because app uses getPublicUrl()
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-id-cards', 'team-id-cards', true)
ON CONFLICT (id) DO NOTHING;

UPDATE storage.buckets
SET public = true
WHERE id = 'team-id-cards';

-- Remove older policies (safe if they don't exist)
DROP POLICY IF EXISTS "ID cards insert anon" ON storage.objects;
DROP POLICY IF EXISTS "ID cards insert authenticated" ON storage.objects;
DROP POLICY IF EXISTS "ID cards select public" ON storage.objects;
DROP POLICY IF EXISTS "ID cards update anon" ON storage.objects;
DROP POLICY IF EXISTS "ID cards update authenticated" ON storage.objects;
DROP POLICY IF EXISTS "ID cards delete anon" ON storage.objects;
DROP POLICY IF EXISTS "ID cards delete authenticated" ON storage.objects;

-- Allow uploads from app server fallback (anon key) and authenticated users
CREATE POLICY "ID cards insert anon"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'team-id-cards');

CREATE POLICY "ID cards insert authenticated"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'team-id-cards');

-- Allow reads for this bucket (public bucket + explicit policy)
CREATE POLICY "ID cards select public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'team-id-cards');

-- Optional: allow overwrite/delete if needed by admin flows
CREATE POLICY "ID cards update anon"
ON storage.objects
FOR UPDATE
TO anon
USING (bucket_id = 'team-id-cards')
WITH CHECK (bucket_id = 'team-id-cards');

CREATE POLICY "ID cards update authenticated"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'team-id-cards')
WITH CHECK (bucket_id = 'team-id-cards');

CREATE POLICY "ID cards delete anon"
ON storage.objects
FOR DELETE
TO anon
USING (bucket_id = 'team-id-cards');

CREATE POLICY "ID cards delete authenticated"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'team-id-cards');
