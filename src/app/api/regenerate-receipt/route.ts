import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { renderReceiptImage } from '@/lib/renderReceiptSafe';

export const runtime = 'nodejs';

const RECEIPT_BUCKET = 'e-receipts';

type RegenerateBody = {
  receiptNumber?: string;
};

function getDbClient() {
  return supabaseAdmin ?? supabase;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegenerateBody;
    const receiptNumber = body.receiptNumber?.trim();

    if (!receiptNumber || !/^\d{6}$/.test(receiptNumber)) {
      return NextResponse.json(
        { error: 'A valid 6-digit receipt number is required' },
        { status: 400 }
      );
    }

    const dbClient = getDbClient();
    const { data, error } = await dbClient
      .from('contributions')
      .select('id, name, phone, amount, mode, collector, date, receipt_number, receipt_created_at')
      .eq('receipt_number', receiptNumber)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      );
    }

    const entryDate = data.receipt_created_at ? new Date(data.receipt_created_at) : new Date(data.date);
    const receiptImage = await renderReceiptImage({
      receiptNumber: data.receipt_number || receiptNumber,
      entryDate: Number.isNaN(entryDate.getTime()) ? new Date() : entryDate,
      name: data.name,
      phone: data.phone,
      amount: Number(data.amount),
      mode: data.mode,
      collector: data.collector,
    });

    const fileName = `receipt-${receiptNumber}.png`;
    const storageClient = supabaseAdmin ?? supabase;

    const { error: uploadError } = await storageClient.storage
      .from(RECEIPT_BUCKET)
      .upload(fileName, receiptImage, {
        upsert: true,
        contentType: 'image/png',
        cacheControl: '31536000',
      });

    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload regenerated receipt', details: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicData } = storageClient.storage.from(RECEIPT_BUCKET).getPublicUrl(fileName);
    const publicUrl = publicData.publicUrl;

    await dbClient
      .from('contributions')
      .update({ receipt_url: publicUrl })
      .eq('id', data.id);

    return NextResponse.json(
      {
        success: true,
        receiptNumber,
        receiptUrl: publicUrl,
        downloadUrl: `/api/download-receipt?receiptNumber=${encodeURIComponent(receiptNumber)}&ts=${Date.now()}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Regenerate receipt error:', error);
    return NextResponse.json(
      {
        error: 'Failed to regenerate receipt',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
