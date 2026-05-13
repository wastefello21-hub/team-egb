import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { format } from 'date-fns';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const RECEIPT_BUCKET = 'e-receipts';
const MAX_RECEIPT_ATTEMPTS = 20;

type ContributionPayload = {
  id?: string;
  name?: string;
  house?: string;
  phone?: string;
  amount?: number | string;
  mode?: string;
  collector?: string;
};

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const generateReceiptNumber = () => String(Math.floor(100000 + Math.random() * 900000));

const formatCurrency = (amount: number) => amount.toLocaleString('en-IN');

const loadLogoBase64 = () => {
  const logoPath = path.join(process.cwd(), 'public', 'logo_v2.jpg');
  const logoBuffer = fs.readFileSync(logoPath);
  return logoBuffer.toString('base64');
};

const buildReceiptSvg = ({
  receiptNumber,
  entryDate,
  name,
  phone,
  amount,
  mode,
  collector,
  house,
}: {
  receiptNumber: string;
  entryDate: Date;
  name: string;
  phone: string;
  amount: number;
  mode: string;
  collector: string;
  house: string;
}) => {
  const formattedDate = format(entryDate, 'dd / MM / yyyy');
  const checkedCash = mode.toLowerCase() === 'cash';
  const checkedUpi = mode.toLowerCase() === 'upi';
  const logoBase64 = loadLogoBase64();

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1100" viewBox="0 0 1600 1100">
    <defs>
      <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fbf1dc" />
        <stop offset="50%" stop-color="#f8ecd1" />
        <stop offset="100%" stop-color="#f4e2bb" />
      </linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#9a6a14" />
        <stop offset="50%" stop-color="#f2d06b" />
        <stop offset="100%" stop-color="#8c5c08" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#fff7e8" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#fff7e8" stop-opacity="0" />
      </radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#6b4a12" flood-opacity="0.25" />
      </filter>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#3b2a10" flood-opacity="0.15" />
      </filter>
    </defs>

    <rect width="1600" height="1100" fill="url(#paper)" />
    <rect x="18" y="18" width="1564" height="1064" rx="10" fill="none" stroke="url(#gold)" stroke-width="6" />
    <rect x="42" y="42" width="1516" height="1016" rx="6" fill="none" stroke="#b68a31" stroke-width="1.5" opacity="0.8" />
    <ellipse cx="800" cy="560" rx="420" ry="320" fill="url(#glow)" opacity="0.45" />

    <g opacity="0.18">
      <path d="M0 120 C180 40, 280 40, 420 120" stroke="#b8892a" stroke-width="2" fill="none" />
      <path d="M1180 120 C1320 40, 1420 40, 1600 120" stroke="#b8892a" stroke-width="2" fill="none" />
      <path d="M0 980 C180 1060, 280 1060, 420 980" stroke="#b8892a" stroke-width="2" fill="none" />
      <path d="M1180 980 C1320 1060, 1420 1060, 1600 980" stroke="#b8892a" stroke-width="2" fill="none" />
    </g>

    <g filter="url(#shadow)">
      <circle cx="205" cy="190" r="150" fill="#120d08" stroke="url(#gold)" stroke-width="8" />
      <circle cx="205" cy="190" r="136" fill="#0b0907" stroke="#e8c15b" stroke-width="2" opacity="0.95" />
      <circle cx="205" cy="190" r="117" fill="none" stroke="#9b6c12" stroke-width="1.2" opacity="0.8" />
      <image href="data:image/jpeg;base64,${logoBase64}" x="96" y="81" width="218" height="218" preserveAspectRatio="xMidYMid slice" clip-path="url(#logoClip)" />
      <clipPath id="logoClip">
        <circle cx="205" cy="190" r="106" />
      </clipPath>
    </g>

    <text x="800" y="160" text-anchor="middle" font-size="90" font-family="Georgia, 'Times New Roman', serif" font-weight="700" fill="#24170a" filter="url(#softShadow)">
      CONTRIBUTION RECEIPT
    </text>
    <path d="M470 112 L1125 112" stroke="url(#gold)" stroke-width="2" />
    <path d="M520 206 L1080 206" stroke="url(#gold)" stroke-width="2" />
    <path d="M645 113 l-22 0 l14 -16 l14 16 z" fill="#c7922c" opacity="0.9" />
    <path d="M955 113 l-22 0 l14 -16 l14 16 z" fill="#c7922c" opacity="0.9" />

    <text x="1175" y="155" font-size="30" font-family="Georgia, 'Times New Roman', serif" fill="#23160a">Receipt No.: </text>
    <text x="1415" y="155" font-size="30" font-family="Courier New, monospace" font-weight="700" fill="#23160a">${escapeXml(receiptNumber)}</text>
    <line x1="1350" y1="158" x2="1530" y2="158" stroke="#2d1d0c" stroke-width="2" opacity="0.7" />

    <text x="1175" y="225" font-size="30" font-family="Georgia, 'Times New Roman', serif" fill="#23160a">Date: </text>
    <text x="1260" y="225" font-size="28" font-family="Courier New, monospace" fill="#23160a">${escapeXml(formattedDate)}</text>
    <line x1="1235" y1="228" x2="1530" y2="228" stroke="#2d1d0c" stroke-width="2" opacity="0.7" />

    <text x="220" y="410" font-size="44" font-family="Georgia, 'Times New Roman', serif" font-weight="700" fill="#22150a">Name:</text>
    <line x1="375" y1="418" x2="1270" y2="418" stroke="#2f2010" stroke-width="3" opacity="0.85" />
    <text x="390" y="398" font-size="36" font-family="Arial, sans-serif" fill="#22150a">${escapeXml(name)}</text>

    <text x="220" y="510" font-size="44" font-family="Georgia, 'Times New Roman', serif" font-weight="700" fill="#22150a">Mobile Number:</text>
    <line x1="530" y1="518" x2="1270" y2="518" stroke="#2f2010" stroke-width="3" opacity="0.85" />
    <text x="540" y="498" font-size="36" font-family="Arial, sans-serif" fill="#22150a">${escapeXml(phone)}</text>

    <text x="220" y="610" font-size="44" font-family="Georgia, 'Times New Roman', serif" font-weight="700" fill="#22150a">Amount Contributed:</text>
    <text x="650" y="610" font-size="44" font-family="Georgia, 'Times New Roman', serif" font-weight="700" fill="#22150a">₹</text>
    <line x1="695" y1="618" x2="1270" y2="618" stroke="#2f2010" stroke-width="3" opacity="0.85" />
    <text x="710" y="598" font-size="36" font-family="Arial, sans-serif" fill="#22150a">${escapeXml(formatCurrency(amount))}</text>

    <text x="220" y="725" font-size="44" font-family="Georgia, 'Times New Roman', serif" font-weight="700" fill="#22150a">Payment Mode:</text>
    <g transform="translate(560 692)">
      <rect x="0" y="0" width="44" height="44" rx="6" fill="none" stroke="#2f2010" stroke-width="3" />
      ${checkedCash ? '<path d="M11 23 L19 31 L34 13" fill="none" stroke="#1f6b2d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />' : ''}
      <text x="68" y="34" font-size="40" font-family='Georgia, "Times New Roman", serif' fill="#22150a">Cash</text>
    </g>
    <g transform="translate(905 692)">
      <rect x="0" y="0" width="44" height="44" rx="6" fill="none" stroke="#2f2010" stroke-width="3" />
      ${checkedUpi ? '<path d="M11 23 L19 31 L34 13" fill="none" stroke="#1f6b2d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />' : ''}
      <text x="68" y="34" font-size="40" font-family='Georgia, "Times New Roman", serif' fill="#22150a">UPI</text>
    </g>

    <g transform="translate(565 825)">
      <path d="M0 35 C40 10, 70 10, 110 35" stroke="url(#gold)" stroke-width="3" fill="none" />
      <path d="M380 35 C420 10, 450 10, 490 35" stroke="url(#gold)" stroke-width="3" fill="none" />
      <text x="250" y="20" text-anchor="middle" font-size="34" font-family="Georgia, 'Times New Roman', serif" font-style="italic" fill="#5d421a">Thank you for your valuable</text>
      <text x="250" y="58" text-anchor="middle" font-size="34" font-family="Georgia, 'Times New Roman', serif" font-style="italic" fill="#5d421a">contribution and support.</text>
    </g>

    <text x="125" y="930" font-size="34" font-family="Georgia, 'Times New Roman', serif" fill="#22150a">Collected By:</text>
    <line x1="320" y1="938" x2="560" y2="938" stroke="#2f2010" stroke-width="3" opacity="0.85" />
    <text x="330" y="918" font-size="28" font-family="Arial, sans-serif" fill="#22150a">${escapeXml(collector)}</text>

    <text x="1240" y="870" text-anchor="middle" font-size="76" font-family="Georgia, 'Times New Roman', serif" font-weight="700" fill="#1f1307">TEAM</text>
    <text x="1240" y="950" text-anchor="middle" font-size="76" font-family="Georgia, 'Times New Roman', serif" font-weight="700" fill="#1f1307">EGB</text>

    <g opacity="0.45">
      <path d="M800 300 C850 320, 890 380, 905 450 C925 540, 865 630, 800 655 C735 630, 675 540, 695 450 C710 380, 750 320, 800 300 Z" fill="#d7bf8c" />
      <path d="M800 340 C835 356, 860 402, 870 452 C882 506, 847 565, 800 586 C753 565, 718 506, 730 452 C740 402, 765 356, 800 340 Z" fill="#caa35b" />
    </g>
  </svg>`;
};

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

async function renderReceiptImage(params: {
  receiptNumber: string;
  entryDate: Date;
  name: string;
  phone: string;
  amount: number;
  mode: string;
  collector: string;
  house: string;
}) {
  const svg = buildReceiptSvg(params);
  return await sharp(Buffer.from(svg)).png().toBuffer();
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContributionPayload;
    const name = body.name?.trim();
    const house = body.house?.trim() || 'N/A';
    const phone = body.phone?.trim() || 'N/A';
    const collector = body.collector?.trim();
    const mode = body.mode?.trim() || 'Cash';
    const amount = Number(body.amount);

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
      house,
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
      id: body.id || `TXN-${Date.now()}`,
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

    const { error: insertError } = await dbClient
      .from('contributions')
      .insert([contributionRecord]);

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
        contribution: contributionRecord,
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