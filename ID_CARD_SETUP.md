# ID Card Feature Setup Guide

## Overview

This guide walks you through setting up the ID card feature for team members in the Ganesha Festival application.

Note: this feature does not use a separate ID card table. Each member's card URL is stored in the existing `team_members` table under `id_card_url`.

## Prerequisites

- Supabase project created and configured
- Access to Supabase dashboard

## Setup Steps

### Step 1: Add the ID Card Column to Team Members Table

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Create a new query and paste the following SQL:

```sql
-- Add ID card URL column to team_members table
ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS id_card_url TEXT;
```

5. Click "Run" to execute the query

### Step 2: Create the ID Card Storage Bucket

1. In Supabase dashboard, go to **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Set the bucket name to: `team-id-cards`
4. Make sure "Public bucket" is **UNCHECKED** (for security)
5. Click **Create bucket**

### Step 3: Set Up Storage Policies

1. In the Storage section, click on the **team-id-cards** bucket
2. Go to the **Policies** tab
3. Click **New Policy** and create the following policies:

#### Policy 1: Allow file uploads

- Click "New Policy" → "For full customization"
- Name: `Allow authenticated uploads`
- Target: `team-id-cards` bucket
- Under "Allowed operations", check: **INSERT**
- For the USING and WITH CHECK clauses, you can use:

```
true
```

#### Policy 2: Allow authenticated users to read their own files

- Click "New Policy" → "For full customization"
- Name: `Allow users to read files`
- Target: `team-id-cards` bucket
- Under "Allowed operations", check: **SELECT**
- For the USING clause:

```
true
```

### Step 4: Test the Feature

1. **Admin Side (Upload ID Card)**:
   - Go to Admin Dashboard
   - Navigate to Team Members section
   - Click the Upload/Camera icon next to a team member's name
   - Select an ID card image (JPG/PNG, max 5MB)
   - Click "Upload ID Card"

2. **Team Member Side (View ID Card)**:
   - Log in with a team member account (e.g., EGB-01)
   - Go to the Team Dashboard
   - Click the "ID Card" button in the top right
   - The ID card should display if one has been uploaded

## Troubleshooting

### "Failed to upload ID card" error

- Check that the `team-id-cards` bucket exists in Storage
- Verify the storage policies are set up correctly
- Check browser console (F12) for detailed error messages

### ID card not showing for team member

- Make sure the image was uploaded successfully (check in admin dashboard for success message)
- Verify that the team member ID matches exactly
- Check if the image URL is accessible in the Supabase Storage

### Column doesn't exist error

- Re-run the SQL migration to add the `id_card_url` column
- Ensure the migration ran successfully

## API Endpoints

### Upload ID Card

- **Endpoint**: `POST /api/upload-id-card`
- **Parameters**:
  - `file` (FormData): Image file
  - `memberId` (FormData): Team member ID
- **Response**: JSON with success status and image URL

### Get ID Card

- **Endpoint**: `GET /api/get-id-card?memberId={memberId}`
- **Response**: JSON with ID card URL and member name

## Features

✅ Each team member has a unique ID card
✅ Only the logged-in team member can view their own ID card
✅ Admin can upload and manage ID cards for all team members
✅ Images are stored in Supabase Storage
✅ Automatic image optimization and caching

## Security Notes

- ID card images are stored in Supabase Storage with appropriate access policies
- Team members can only view their own ID card (enforced at the API level)
- Admin users can manage all ID cards from the admin panel
- Files are validated for type and size before upload
