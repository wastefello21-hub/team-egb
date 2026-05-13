import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { renderReceiptImage } from '@/lib/receiptRenderer';

export const runtime = 'nodejs';

const RECEIPT_BUCKET = 'e-receipts';
const MAX_RECEIPT_ATTEMPTS = 20;

type ContributionPayload = {
  name?: string;
  house?: string;
  phone?: string;
  amount?: number | string;
  mode?: string;
  collector?: string;
};

const generateReceiptNumber = () => String(Math.floor(100000 + Math.random() * 900000));

async function getDbClient() {
  return supabaseAdmin ?? supabase;
}

async function generateUniqueReceiptNumber() {
  const dbClient = await getDbClient();

  for (let attempt = 0; attempt < MAX_RECEIPT_ATTEMPTS; attempt += 1) {
    const candidate = generateReceiptNumber();
    const { data, error } = await dbClient
      .from('contributions')
      .select('id')
      .eq('receipt_number', candidate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return candidate;
    }
  }

  throw new Error('Unable to generate a unique receipt number');
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContributionPayload;
    const name = body.name?.trim();
    const house = body.house?.trim() || 'N/A';
    const phone = body.phone?.trim() || 'N/A';
    const collector = body.collector?.trim();
    const mode = body.mode?.trim() || 'Cash';
    const amount = Math.floor(Number(body.amount));

    if (!name || !collector || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Name, amount, and collector are required' },
        { status: 400 }
      );
    }

    const entryDate = new Date();
    const receiptNumber = await generateUniqueReceiptNumber();
    const receiptImage = await renderReceiptImage({
      receiptNumber,
      entryDate,
      name,
      phone,
      amount,
      mode,
      collector,
    });

    const fileName = `receipt-${receiptNumber}.png`;
    const storageClient = supabaseAdmin ?? supabase;

    const { error: uploadError } = await storageClient.storage
      .from(RECEIPT_BUCKET)
      .upload(fileName, receiptImage, {
        upsert: true,
        contentType: 'image/png',
        cacheControl: '31536000'
      });

    if (uploadError) {
      return NextResponse.json(
        {
          error: 'Failed to upload receipt image',
          details: uploadError.message
        },
        { status: 500 }
      );
    }

    const { data: publicData } = storageClient.storage
      .from(RECEIPT_BUCKET)
      .getPublicUrl(fileName);

    const receiptUrl = publicData.publicUrl;
    const dbClient = await getDbClient();

    const contributionRecord = {
      name,
      house,
      phone,
      amount,
      mode,
      date: format(entryDate, 'dd MMM yyyy, hh:mm a'),
      collector,
      receipt_number: receiptNumber,
      receipt_url: receiptUrl,
      receipt_created_at: entryDate.toISOString(),
    };

    const { data: insertedContribution, error: insertError } = await dbClient
      .from('contributions')
      .insert([contributionRecord])
      .select('*')
      .single();

    if (insertError) {
      await storageClient.storage.from(RECEIPT_BUCKET).remove([fileName]);
      return NextResponse.json(
        {
          error: 'Failed to save contribution',
          details: insertError.message
        },
        { status: 500 }
      );
    }

    const { data: collectorMember } = await dbClient
      .from('team_members')
      .select('collections')
      .eq('id', collector)
      .maybeSingle();

    if (collectorMember) {
      const nextCollections = Number(collectorMember.collections || 0) + amount;
      const { error: updateError } = await dbClient
        .from('team_members')
        .update({ collections: nextCollections })
        .eq('id', collector);

      if (updateError) {
        console.warn('Failed to update team member collections:', updateError.message);
      }
    }

    return NextResponse.json(
      {
        success: true,
        contribution: insertedContribution ?? contributionRecord,
        receiptNumber,
        receiptUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Create contribution error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create contribution receipt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}