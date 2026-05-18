const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

// Prefer IPv4 DNS resolution to avoid IPv6 connectivity issues on some networks
try {
  const dns = require('dns');
  if (typeof dns.setDefaultResultOrder === 'function') dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const BASE_RECEIPT_WIDTH = 1200;
const BASE_RECEIPT_HEIGHT = 840;
const BUCKET = 'e-receipts';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is not set');
  process.exit(1);
}
const supabase = serviceKey ? createClient(supabaseUrl, serviceKey) : createClient(supabaseUrl, anonKey);

let embeddedFontCss = null;

const FIELD_POSITIONS = {
  receiptNumber: { x: 995, y: 136, size: 24 },
  date: { x: 995, y: 212, size: 24 },
  name: { x: 285, y: 378, size: 28 },
  phone: { x: 411, y: 441, size: 28 },
  amount: { x: 515, y: 502, size: 28 },
  cashCheck: { x: 433, y: 561, size: 36 },
  upiCheck: { x: 688, y: 561, size: 36 },
  collector: { x: 231, y: 718, size: 28 },
};

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

  if (!fs.existsSync(latinRegular) || !fs.existsSync(latinBold) || !fs.existsSync(devanagariRegular) || !fs.existsSync(devanagariBold)) {
    throw new Error('Required receipt fonts missing in public/fonts/receipt');
  }

  const latinRegularBase64 = fs.readFileSync(latinRegular).toString('base64');
  const latinBoldBase64 = fs.readFileSync(latinBold).toString('base64');
  const devanagariRegularBase64 = fs.readFileSync(devanagariRegular).toString('base64');
  const devanagariBoldBase64 = fs.readFileSync(devanagariBold).toString('base64');

  const latinFormat = latinRegular.endsWith('.woff2') ? 'woff2' : 'woff';
  const devanagariFormat = devanagariRegular.endsWith('.woff2') ? 'woff2' : 'woff';

  embeddedFontCss = `@font-face { font-family: 'ReceiptLatin'; src: url(data:font/${latinFormat};base64,${latinRegularBase64}) format('${latinFormat}'); font-weight:400; }
@font-face { font-family: 'ReceiptLatin'; src: url(data:font/${latinFormat};base64,${latinBoldBase64}) format('${latinFormat}'); font-weight:700; }
@font-face { font-family: 'ReceiptDevanagari'; src: url(data:font/${devanagariFormat};base64,${devanagariRegularBase64}) format('${devanagariFormat}'); font-weight:400; }
@font-face { font-family: 'ReceiptDevanagari'; src: url(data:font/${devanagariFormat};base64,${devanagariBoldBase64}) format('${devanagariFormat}'); font-weight:700; }`;
  return embeddedFontCss;
}

function createTextSvg(text, size, weight, x, y, receiptWidth, receiptHeight, scaleX, scaleY, fontScale, fontCss) {
  const encoded = String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  const fx = Math.round(x * scaleX);
  const fy = Math.round(y * scaleY);
  const fsize = Math.round(size * fontScale);

  // include broader fallback fonts to reduce missing glyphs
  const family = "'ReceiptLatin','ReceiptDevanagari','DejaVu Sans','Noto Sans',Arial,Helvetica,sans-serif";

  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${receiptWidth}" height="${receiptHeight}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${receiptWidth} ${receiptHeight}">\n  <style>${fontCss} text{font-family:${family}; fill:#000;}</style>\n  <text x="${fx}" y="${fy}" font-size="${fsize}" font-weight="${weight}" dominant-baseline="hanging">${encoded}</text>\n</svg>`;
}

function loadTemplate() {
  const templatePath = path.join(process.cwd(), 'public', 'receipt-template.png');
  if (!fs.existsSync(templatePath)) {
    throw new Error('Template not found: ' + templatePath);
  }
  const templateBuffer = fs.readFileSync(templatePath);
  return { buffer: templateBuffer, path: templatePath };
}

async function renderReceipt({ receiptNumber, entryDate, name, phone, amount, mode, collector }) {
  const templateObj = loadTemplate();
  const template = templateObj.buffer;
  const meta = await sharp(template).metadata();
  const receiptWidth = meta.width || BASE_RECEIPT_WIDTH;
  const receiptHeight = meta.height || BASE_RECEIPT_HEIGHT;
  const scaleX = receiptWidth / BASE_RECEIPT_WIDTH;
  const scaleY = receiptHeight / BASE_RECEIPT_HEIGHT;
  const fontScale = Math.min(scaleX, scaleY);

  const fontCss = loadEmbeddedFontCss();

  const formattedAmount = amount != null ? String(amount) : '';
  const checkedCash = String(mode || '').toLowerCase() === 'cash';

  const overlays = [];
  overlays.push({ input: Buffer.from(createTextSvg(receiptNumber || '', FIELD_POSITIONS.receiptNumber.size, 700, FIELD_POSITIONS.receiptNumber.x, FIELD_POSITIONS.receiptNumber.y, receiptWidth, receiptHeight, scaleX, scaleY, fontScale, fontCss)), top: 0, left: 0 });
  overlays.push({ input: Buffer.from(createTextSvg(entryDate || '', FIELD_POSITIONS.date.size, 700, FIELD_POSITIONS.date.x, FIELD_POSITIONS.date.y, receiptWidth, receiptHeight, scaleX, scaleY, fontScale, fontCss)), top: 0, left: 0 });
  overlays.push({ input: Buffer.from(createTextSvg(name || '', FIELD_POSITIONS.name.size, 700, FIELD_POSITIONS.name.x, FIELD_POSITIONS.name.y, receiptWidth, receiptHeight, scaleX, scaleY, fontScale, fontCss)), top: 0, left: 0 });
  overlays.push({ input: Buffer.from(createTextSvg(phone || '', FIELD_POSITIONS.phone.size, 700, FIELD_POSITIONS.phone.x, FIELD_POSITIONS.phone.y, receiptWidth, receiptHeight, scaleX, scaleY, fontScale, fontCss)), top: 0, left: 0 });
  overlays.push({ input: Buffer.from(createTextSvg(formattedAmount, FIELD_POSITIONS.amount.size, 700, FIELD_POSITIONS.amount.x, FIELD_POSITIONS.amount.y, receiptWidth, receiptHeight, scaleX, scaleY, fontScale, fontCss)), top: 0, left: 0 });
  if (checkedCash) overlays.push({ input: Buffer.from(createTextSvg('✓', FIELD_POSITIONS.cashCheck.size, 700, FIELD_POSITIONS.cashCheck.x, FIELD_POSITIONS.cashCheck.y, receiptWidth, receiptHeight, scaleX, scaleY, fontScale, fontCss)), top: 0, left: 0 });
  if (!checkedCash && String(mode || '').toLowerCase() === 'upi') overlays.push({ input: Buffer.from(createTextSvg('✓', FIELD_POSITIONS.upiCheck.size, 700, FIELD_POSITIONS.upiCheck.x, FIELD_POSITIONS.upiCheck.y, receiptWidth, receiptHeight, scaleX, scaleY, fontScale, fontCss)), top: 0, left: 0 });
  overlays.push({ input: Buffer.from(createTextSvg(collector || '', FIELD_POSITIONS.collector.size, 700, FIELD_POSITIONS.collector.x, FIELD_POSITIONS.collector.y, receiptWidth, receiptHeight, scaleX, scaleY, fontScale, fontCss)), top: 0, left: 0 });

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
