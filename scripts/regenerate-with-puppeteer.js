#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { createClient } = require('@supabase/supabase-js');

// Dynamic import for the Puppeteer renderer
(async () => {
  try {
    const { renderReceiptImage } = await import(
      path.join(__dirname, '..', 'src', 'lib', 'receiptRendererPuppeteer.ts')
    );

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceKey)) {
      console.error('Missing Supabase configuration in .env.local');
      process.exit(1);
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey || supabaseAnonKey
    );

    const receiptNumber = process.argv[2] || '932328';

    console.log(`Fetching contribution for receipt ${receiptNumber}...`);
    const { data, error } = await supabase
      .from('contributions')
      .select('id, name, phone, amount, mode, collector, date, receipt_number, receipt_created_at')
      .eq('receipt_number', receiptNumber)
      .single();

    if (error || !data) {
      console.error(`Receipt ${receiptNumber} not found in database`);
      process.exit(1);
    }

    console.log(`Rendering receipt for ${data.name}...`);
    const entryDate = data.receipt_created_at
      ? new Date(data.receipt_created_at)
      : new Date(data.date);

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
    console.log(`Uploading ${fileName} to storage...`);

    const { error: uploadError } = await supabase.storage
      .from('e-receipts')
      .upload(fileName, receiptImage, {
        upsert: true,
        contentType: 'image/png',
        cacheControl: '31536000',
      });

    if (uploadError) {
      console.error('Upload failed:', uploadError.message);
      process.exit(1);
    }

    const { data: publicData } = supabase.storage
      .from('e-receipts')
      .getPublicUrl(fileName);

    console.log(`✓ Receipt regenerated successfully!`);
    console.log(`  Download: ${publicData.publicUrl}?ts=${Date.now()}`);

    // Write debug copy locally
    const tmpDir = path.join(__dirname, '..', 'tmp', 'regenerated-receipts');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    fs.writeFileSync(path.join(tmpDir, fileName), receiptImage);
    console.log(`  Local copy: ${path.join(tmpDir, fileName)}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
