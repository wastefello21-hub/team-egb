import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const receiptNumber = request.nextUrl.searchParams.get('receiptNumber')?.trim();

    if (!receiptNumber || !/^\d{6}$/.test(receiptNumber)) {
      return NextResponse.json(
        { error: 'A valid 6-digit receipt number is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('contributions')
      .select('id, name, phone, amount, mode, date, collector, house, receipt_number, receipt_url, receipt_created_at')
      .eq('receipt_number', receiptNumber)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        receipt: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get receipt error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipt' },
      { status: 500 }
    );
  }
}