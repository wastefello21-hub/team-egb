import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const memberId = request.nextUrl.searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId is required' },
        { status: 400 }
      );
    }

    // Fetch the ID card URL for the member
    const { data, error } = await supabase
      .from('team_members')
      .select('id_card_url, name')
      .eq('id', memberId)
      .single();

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    if (!data.id_card_url) {
      return NextResponse.json(
        {
          success: true,
          message: 'No ID card uploaded yet',
          idCardUrl: null,
          name: data.name
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        idCardUrl: data.id_card_url,
        name: data.name
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ID card' },
      { status: 500 }
    );
  }
}
