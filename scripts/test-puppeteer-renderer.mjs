import { renderReceiptImage } from '../src/lib/receiptRendererPuppeteer.ts';
import fs from 'fs';
import path from 'path';

async function test() {
  try {
    console.log('Testing Puppeteer receipt renderer with embedded fonts...');
    
    const buffer = await renderReceiptImage({
      receiptNumber: '932328',
      entryDate: new Date('2024-01-15'),
      name: 'John Doe',
      phone: '9876543210',
      amount: 5000,
      mode: 'cash',
      collector: 'Collector Name',
    });
    
    const outputPath = path.join(process.cwd(), 'tmp', 'test-puppeteer-receipt.png');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✓ Receipt rendered successfully (${buffer.length} bytes)`);
    console.log(`✓ Saved to: ${outputPath}`);
    console.log('RESULT: Puppeteer renderer is working!');
  } catch (error) {
    console.error('✗ Puppeteer renderer test failed:', error instanceof Error ? error.message : error);
    console.error(error);
    process.exit(1);
  }
}

test();
