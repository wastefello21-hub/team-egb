import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { renderReceiptImage } from '@/lib/renderReceiptSafe';

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
      .select('name, phone, amount, mode, collector, date, receipt_number, receipt_created_at')
      .eq('receipt_number', receiptNumber)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      );
    }

    const entryDate = data.receipt_created_at ? new Date(data.receipt_created_at) : new Date(data.date);
    const buffer = await renderReceiptImage({
      receiptNumber: data.receipt_number || receiptNumber,
      entryDate: Number.isNaN(entryDate.getTime()) ? new Date() : entryDate,
      name: data.name,
      phone: data.phone,
      amount: Number(data.amount),
      mode: data.mode,
      collector: data.collector,
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="receipt-${receiptNumber}.png"`,
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Download receipt error:', error);
    return NextResponse.json(
      { error: 'Failed to download receipt' },
      { status: 500 }
    );
  }
}