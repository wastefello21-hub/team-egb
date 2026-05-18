import { renderReceiptImage } from '../src/lib/renderReceiptSafe.ts';
import fs from 'fs';
import path from 'path';

async function test() {
  try {
    console.log('Testing receipt rendering via renderReceiptSafe (API flow)...');
    console.log('');
    
    const buffer = await renderReceiptImage({
      receiptNumber: '932328',
      entryDate: new Date('2024-01-15'),
      name: 'Test Donor Name',
      phone: '9876543210',
      amount: 5000,
      mode: 'cash',
      collector: 'Test Collector',
    });
    
    const outputDir = path.join(process.cwd(), 'tmp');
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'test-api-receipt.png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log('✓ Receipt rendered successfully via API flow');
    console.log(`  Size: ${buffer.length} bytes`);
    console.log(`  Output: ${outputPath}`);
    console.log('');
    console.log('If this image shows text (not boxes), the API download fix is working!');
  } catch (error) {
    console.error('✗ Receipt rendering failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

test();
