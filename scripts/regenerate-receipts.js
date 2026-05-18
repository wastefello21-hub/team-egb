const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const RECEIPT_WIDTH = 1200;
const RECEIPT_HEIGHT = 840;
const BUCKET = 'e-receipts';

let embeddedFontCss = null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jiqztujpobafjvoukflt.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppcXp0dWpwb2JhZmp2b3VrZmx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTczMjMsImV4cCI6MjA5Mjc5MzMyM30.iBhklbiJ84K2xF6lF078mEKGzVxR8gifLScWd1hZ1Jo';

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = serviceKey ? createClient(supabaseUrl, serviceKey) : createClient(supabaseUrl, anonKey);

function createTextSvg(text, size, weight, x, y) {
  const encoded = String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function loadEmbeddedFontCss() {
  if (embeddedFontCss !== null) return embeddedFontCss;

  const latinRegularPath = path.join(process.cwd(), 'public', 'fonts', 'receipt', 'noto-serif-devanagari-latin-400-normal.woff');
  const latinBoldPath = path.join(process.cwd(), 'public', 'fonts', 'receipt', 'noto-serif-devanagari-latin-700-normal.woff');
  const devanagariRegularPath = path.join(process.cwd(), 'public', 'fonts', 'receipt', 'noto-serif-devanagari-devanagari-400-normal.woff');
  const devanagariBoldPath = path.join(process.cwd(), 'public', 'fonts', 'receipt', 'noto-serif-devanagari-devanagari-700-normal.woff');

  if (!fs.existsSync(latinRegularPath) || !fs.existsSync(latinBoldPath)) {
    throw new Error('Receipt Latin font files are missing in public/fonts/receipt.');
  }

  if (!fs.existsSync(devanagariRegularPath) || !fs.existsSync(devanagariBoldPath)) {
    throw new Error('Receipt Devanagari font files are missing in public/fonts/receipt.');
  }

  const latinRegularBase64 = fs.readFileSync(latinRegularPath).toString('base64');
  const latinBoldBase64 = fs.readFileSync(latinBoldPath).toString('base64');
  const devanagariRegularBase64 = fs.readFileSync(devanagariRegularPath).toString('base64');
  const devanagariBoldBase64 = fs.readFileSync(devanagariBoldPath).toString('base64');

  function loadEmbeddedFontCss() {
    if (embeddedFontCss !== null) return embeddedFontCss;

    const fontsDir = path.join(process.cwd(), 'public', 'fonts', 'receipt');
    const latinRegular = fs.existsSync(path.join(fontsDir, 'noto-serif-latin-400-normal.woff2'))
      ? path.join(fontsDir, 'noto-serif-latin-400-normal.woff2')
      : path.join(fontsDir, 'noto-serif-latin-400-normal.woff');
    const latinBold = fs.existsSync(path.join(fontsDir, 'noto-serif-latin-700-normal.woff2'))
      ? path.join(fontsDir, 'noto-serif-latin-700-normal.woff2')
      : path.join(fontsDir, 'noto-serif-latin-700-normal.woff');

    const devanagariRegular = fs.existsSync(path.join(fontsDir, 'noto-serif-devanagari-devanagari-400-normal.woff2'))
      ? path.join(fontsDir, 'noto-serif-devanagari-devanagari-400-normal.woff2')
      : path.join(fontsDir, 'noto-serif-devanagari-devanagari-400-normal.woff');
    const devanagariBold = fs.existsSync(path.join(fontsDir, 'noto-serif-devanagari-devanagari-700-normal.woff2'))
      ? path.join(fontsDir, 'noto-serif-devanagari-devanagari-700-normal.woff2')
      : path.join(fontsDir, 'noto-serif-devanagari-devanagari-700-normal.woff');

    if (!fs.existsSync(latinRegular) || !fs.existsSync(latinBold)) {
      throw new Error('Receipt Latin font files are missing in public/fonts/receipt.');
    }

    if (!fs.existsSync(devanagariRegular) || !fs.existsSync(devanagariBold)) {
      throw new Error('Receipt Devanagari font files are missing in public/fonts/receipt.');
    }

    const latinRegularBase64 = fs.readFileSync(latinRegular).toString('base64');
    const latinBoldBase64 = fs.readFileSync(latinBold).toString('base64');
    const devanagariRegularBase64 = fs.readFileSync(devanagariRegular).toString('base64');
    const devanagariBoldBase64 = fs.readFileSync(devanagariBold).toString('base64');

    const latinFormat = latinRegular.endsWith('.woff2') ? 'woff2' : 'woff';
    const devanagariFormat = devanagariRegular.endsWith('.woff2') ? 'woff2' : 'woff';

    embeddedFontCss = `
      @font-face {
        font-family: 'ReceiptLatin';
        src: url(data:font/${latinFormat};base64,${latinRegularBase64}) format('${latinFormat}');
        font-weight: 400;
        font-style: normal;
      }
      @font-face {
        font-family: 'ReceiptLatin';
        src: url(data:font/${latinFormat};base64,${latinBoldBase64}) format('${latinFormat}');
        font-weight: 700;
        font-style: normal;
      }
      @font-face {
        font-family: 'ReceiptDevanagari';
        src: url(data:font/${devanagariFormat};base64,${devanagariRegularBase64}) format('${devanagariFormat}');
        font-weight: 400;
        font-style: normal;
      }
      @font-face {
        font-family: 'ReceiptDevanagari';
        src: url(data:font/${devanagariFormat};base64,${devanagariBoldBase64}) format('${devanagariFormat}');
        font-weight: 700;
        font-style: normal;
      }
    `;

    return embeddedFontCss;
  }
  overlays.push({ input: Buffer.from(createTextSvg(phone, 26, 700, 355, 380)), top: 0, left: 0 });
  overlays.push({ input: Buffer.from(createTextSvg(formattedAmount, 26, 700, 529, 528)), top: 0, left: 0 });
  if (checkedCash) overlays.push({ input: Buffer.from(createTextSvg('✓', 34, 700, 401, 566)), top: 0, left: 0 });
  if (!checkedCash && String(mode || '').toLowerCase() === 'upi') overlays.push({ input: Buffer.from(createTextSvg('✓', 34, 700, 651, 566)), top: 0, left: 0 });
  overlays.push({ input: Buffer.from(createTextSvg(collector, 24, 700, 189, 752)), top: 0, left: 0 });

  const buffer = await sharp(template).composite(overlays).png().toBuffer();
  return buffer;
}

async function run() {
  try {
    const onlyReceipt = process.argv[2]?.trim();
    console.log('Fetching contributions...');
    let query = supabase
      .from('contributions')
      .select('id,receipt_number,name,phone,amount,mode,collector,receipt_created_at,date,receipt_url');

    if (onlyReceipt) {
      query = query.eq('receipt_number', onlyReceipt);
    }

    const { data: rows, error } = await query;
    if (error) throw error;
    if (!rows || rows.length === 0) {
      console.log('No contributions found.');
      return;
    }

    console.log('Found', rows.length, 'records.');
    const template = loadTemplate();

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try {
        const entryDate = r.receipt_created_at || r.date || new Date().toISOString();
        const buffer = await renderReceipt({ receiptNumber: r.receipt_number, entryDate, name: r.name, phone: r.phone, amount: r.amount, mode: r.mode, collector: r.collector });
        const fileName = `receipt-${r.receipt_number}.png`;

        // upload
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, buffer, { upsert: true, contentType: 'image/png' });
        if (uploadError) {
          console.error(`Upload failed for ${fileName}:`, uploadError.message);
        } else {
          console.log(`Uploaded ${fileName} (${i + 1}/${rows.length})`);

          const debugDir = path.join(process.cwd(), 'tmp', 'regenerated-receipts');
          fs.mkdirSync(debugDir, { recursive: true });
          fs.writeFileSync(path.join(debugDir, fileName), buffer);

          // update DB receipt_url if missing
          const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
          if (publicData?.publicUrl) {
            await supabase.from('contributions').update({ receipt_url: publicData.publicUrl }).eq('id', r.id);
          }
        }
      } catch (err) {
        console.error('Failed for record', r.receipt_number, err.message || err);
      }
    }

    console.log('Done.');
  } catch (err) {
    console.error('Regeneration failed:', err.message || err);
    process.exit(1);
  }
}

run();
