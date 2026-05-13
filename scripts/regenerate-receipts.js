const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const RECEIPT_WIDTH = 1200;
const RECEIPT_HEIGHT = 840;
const BUCKET = 'e-receipts';

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

  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${RECEIPT_WIDTH}" height="${RECEIPT_HEIGHT}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${RECEIPT_WIDTH} ${RECEIPT_HEIGHT}">\n  <style>text{font-family: Georgia, 'Times New Roman', Times, serif; fill:#000;}</style>\n  <text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" dominant-baseline="hanging">${encoded}</text>\n</svg>`;
}

function loadTemplate() {
  const templatePath = path.join(process.cwd(), 'public', 'receipt-template.png');
  if (!fs.existsSync(templatePath)) {
    throw new Error('Template not found at ' + templatePath);
  }
  return fs.readFileSync(templatePath);
}

async function renderReceipt({ receiptNumber, entryDate, name, phone, amount, mode, collector }) {
  const template = loadTemplate();
  const formattedDate = entryDate ? new Date(entryDate).toLocaleDateString('en-GB').replace(/\//g, ' / ') : new Date().toLocaleDateString('en-GB').replace(/\//g, ' / ');
  const formattedAmount = Number(amount || 0).toLocaleString('en-IN');
  const checkedCash = String(mode || 'Cash').toLowerCase() === 'cash';

  const overlays = [];
  overlays.push({ input: Buffer.from(createTextSvg(receiptNumber, 26, 600, 1017, 152)), top: 0, left: 0 });
  overlays.push({ input: Buffer.from(createTextSvg(formattedDate, 26, 600, 1017, 225)), top: 0, left: 0 });
  overlays.push({ input: Buffer.from(createTextSvg(name, 28, 600, 351, 368)), top: 0, left: 0 });
  overlays.push({ input: Buffer.from(createTextSvg(phone, 28, 600, 351, 440)), top: 0, left: 0 });
  overlays.push({ input: Buffer.from(createTextSvg(formattedAmount, 28, 600, 529, 511)), top: 0, left: 0 });
  if (checkedCash) overlays.push({ input: Buffer.from(createTextSvg('✓', 28, 700, 401, 581)), top: 0, left: 0 });
  if (!checkedCash && String(mode || '').toLowerCase() === 'upi') overlays.push({ input: Buffer.from(createTextSvg('✓', 28, 700, 651, 581)), top: 0, left: 0 });
  overlays.push({ input: Buffer.from(createTextSvg(collector, 26, 600, 189, 739)), top: 0, left: 0 });

  const buffer = await sharp(template).composite(overlays).png().toBuffer();
  return buffer;
}

async function run() {
  try {
    console.log('Fetching contributions...');
    const { data: rows, error } = await supabase.from('contributions').select('id,receipt_number,name,phone,amount,mode,collector,receipt_created_at,date,receipt_url');
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
