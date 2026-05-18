import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { renderReceiptImage } from '@/lib/renderReceiptSafe';

export const runtime = 'nodejs';

const RECEIPT_BUCKET = 'e-receipts';
const DEFAULT_BATCH_SIZE = 100;

function getDbClient() {
  return supabaseAdmin ?? supabase;
}

async function resolveCollectorName(dbClient: ReturnType<typeof getDbClient>, collectorIdOrName: string) {
  const { data, error } = await dbClient
    .from('team_members')
    .select('name')
    .eq('id', collectorIdOrName)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.name || collectorIdOrName;
}

type RegenerateAllBody = {
  receiptNumbers?: string[];
  batchSize?: number;
};

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.REGENERATE_SECRET;
    const authHeader = request.headers.get('authorization') || request.headers.get('x-regenerate-secret');

    if (!secret) {
      return NextResponse.json({ error: 'Server regeneration secret not configured' }, { status: 500 });
    }

    if (!authHeader || authHeader.replace(/^Bearer\s*/i, '') !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbClient = getDbClient();
    if (!dbClient) {
      return NextResponse.json({ error: 'Server requires SUPABASE_SERVICE_ROLE_KEY to run' }, { status: 500 });
    }

    const body = (await request.json()) as RegenerateAllBody;
    const receiptNumbers = Array.isArray(body?.receiptNumbers) && body.receiptNumbers.length > 0 ? body.receiptNumbers : null;
    const batchSize = Math.max(1, Math.min(1000, Number(body?.batchSize) || DEFAULT_BATCH_SIZE));

    const results: { receiptNumber: string; ok: boolean; error?: string }[] = [];

    if (receiptNumbers) {
      // Regenerate only the provided receipts
      for (const rn of receiptNumbers) {
        try {
          const { data, error } = await dbClient
            .from('contributions')
            .select('id, name, phone, amount, mode, collector, date, receipt_number, receipt_created_at')
            .eq('receipt_number', rn)
            .single();

          if (error || !data) {
            results.push({ receiptNumber: rn, ok: false, error: 'Not found' });
            continue;
          }

          const entryDate = data.receipt_created_at ? new Date(data.receipt_created_at) : new Date(data.date);
          const collectorDisplayName = await resolveCollectorName(dbClient, data.collector);
          const receiptImage = await renderReceiptImage({
            receiptNumber: data.receipt_number || rn,
            entryDate: Number.isNaN(entryDate.getTime()) ? new Date() : entryDate,
            name: data.name,
            phone: data.phone,
            amount: Number(data.amount),
            mode: data.mode,
            collector: collectorDisplayName,
          });

          const fileName = `receipt-${rn}.png`;
          const storageClient = supabaseAdmin ?? supabase;

          const { error: uploadError } = await storageClient.storage.from(RECEIPT_BUCKET).upload(fileName, receiptImage, {
            upsert: true,
            contentType: 'image/png',
            cacheControl: '31536000',
          });

          if (uploadError) {
            results.push({ receiptNumber: rn, ok: false, error: uploadError.message });
            continue;
          }

          const { data: publicData } = storageClient.storage.from(RECEIPT_BUCKET).getPublicUrl(fileName);
          const publicUrl = publicData.publicUrl;

          await dbClient.from('contributions').update({ receipt_url: publicUrl }).eq('id', data.id);
          results.push({ receiptNumber: rn, ok: true });
        } catch (err: any) {
          results.push({ receiptNumber: rn, ok: false, error: err?.message || String(err) });
        }
      }

      return NextResponse.json({ success: true, results }, { status: 200 });
    }

    // Regenerate all receipts in batches
    let offset = 0;
    while (true) {
      const from = offset;
      const to = offset + batchSize - 1;

      const { data, error } = await dbClient
        .from('contributions')
        .select('id, name, phone, amount, mode, collector, date, receipt_number, receipt_created_at')
        .range(from, to)
        .order('id', { ascending: true });

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch contributions', details: error.message }, { status: 500 });
      }

      if (!data || data.length === 0) break;

      for (const row of data) {
        const rn = String(row.receipt_number || '').padStart(6, '0');
        try {
          const entryDate = row.receipt_created_at ? new Date(row.receipt_created_at) : new Date(row.date);
          const collectorDisplayName = await resolveCollectorName(dbClient, row.collector);
          const receiptImage = await renderReceiptImage({
            receiptNumber: row.receipt_number || rn,
            entryDate: Number.isNaN(entryDate.getTime()) ? new Date() : entryDate,
            name: row.name,
            phone: row.phone,
            amount: Number(row.amount),
            mode: row.mode,
            collector: collectorDisplayName,
          });

          const fileName = `receipt-${rn}.png`;
          const storageClient = supabaseAdmin ?? supabase;

          const { error: uploadError } = await storageClient.storage.from(RECEIPT_BUCKET).upload(fileName, receiptImage, {
            upsert: true,
            contentType: 'image/png',
            cacheControl: '31536000',
          });

          if (uploadError) {
            results.push({ receiptNumber: rn, ok: false, error: uploadError.message });
            continue;
          }

          const { data: publicData } = storageClient.storage.from(RECEIPT_BUCKET).getPublicUrl(fileName);
          const publicUrl = publicData.publicUrl;

          await dbClient.from('contributions').update({ receipt_url: publicUrl }).eq('id', row.id);
          results.push({ receiptNumber: rn, ok: true });
        } catch (err: any) {
          results.push({ receiptNumber: rn, ok: false, error: err?.message || String(err) });
        }
      }

      offset += batchSize;
    }

    return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (error: any) {
    console.error('Regenerate all error:', error);
    return NextResponse.json({ error: 'Failed to regenerate receipts', details: error?.message || String(error) }, { status: 500 });
  }
}
