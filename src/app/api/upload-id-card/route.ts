import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const memberId = formData.get('memberId') as string;

    if (!file || !memberId) {
      return NextResponse.json(
        { error: 'File and memberId are required' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `${memberId}_${timestamp}.jpg`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Prefer admin client for server-side uploads (works with private buckets)
    const storageClient = supabaseAdmin ?? supabase;

    // Upload to Supabase storage
    const { data, error } = await storageClient.storage
      .from('team-id-cards')
      .upload(fileName, buffer, {
        cacheControl: '3600',
        upsert: true, // Replace if exists
        contentType: file.type
      });

    if (error) {
      console.error('Supabase storage error:', error);
      // Return detailed error message for debugging (will show to admin only)
      return NextResponse.json(
        { error: 'Failed to upload file to storage', details: error?.message || error },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicData } = storageClient.storage
      .from('team-id-cards')
      .getPublicUrl(fileName);

    const publicUrl = publicData?.publicUrl;

    // Update team_members table with the ID card URL (use admin client if available)
    const dbClient = supabaseAdmin ?? supabase;
    const { error: updateError } = await dbClient
      .from('team_members')
      .update({ id_card_url: publicUrl })
      .eq('id', memberId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to save ID card URL to database' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'ID card uploaded successfully',
        url: publicUrl
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload ID card' },
      { status: 500 }
    );
  }
}
