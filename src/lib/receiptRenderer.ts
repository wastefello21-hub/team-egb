import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { format } from 'date-fns';

const RECEIPT_WIDTH = 1200;
const RECEIPT_HEIGHT = 840;

const loadTemplateBuffer = () => {
  const templatePath = path.join(process.cwd(), 'public', 'receipt-template.png');

  if (!fs.existsSync(templatePath)) {
    throw new Error('Receipt template image not found at public/receipt-template.png. Please save the template image there.');
  }

  return fs.readFileSync(templatePath);
};

export async function renderReceiptImage({
  receiptNumber,
  entryDate,
  name,
  phone,
  amount,
  mode,
  collector,
}: {
  receiptNumber: string;
  entryDate: Date;
  name: string;
  phone: string;
  amount: number;
  mode: string;
  collector: string;
}) {
  try {
    const templateBuffer = loadTemplateBuffer();
    const formattedDate = format(entryDate, 'dd / MM / yyyy');
    const formattedAmount = amount.toLocaleString('en-IN');
    const checkedCash = mode.toLowerCase() === 'cash';

    // Create text overlays as SVG overlays and composite them
    const textOverlays: Array<{ input: Buffer; top: number; left: number }> = [];

    // Helper to create text SVG
    const createTextSvg = (text: string, size: number, weight: number, x: number, y: number) => {
      const encoded = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      const svg = `<svg width="1200" height="840" xmlns="http://www.w3.org/2000/svg">
        <text x="${x}" y="${y}" font-family="Georgia, serif" font-size="${size}" font-weight="${weight}" fill="#24180f">${encoded}</text>
      </svg>`;

      return Buffer.from(svg);
    };

    // Receipt number
    textOverlays.push({
      input: createTextSvg(receiptNumber, 26, 600, 1017, 152),
      top: 0,
      left: 0,
    });

    // Date
    textOverlays.push({
      input: createTextSvg(formattedDate, 26, 600, 1017, 225),
      top: 0,
      left: 0,
    });

    // Name
    textOverlays.push({
      input: createTextSvg(name, 28, 600, 351, 368),
      top: 0,
      left: 0,
    });

    // Phone
    textOverlays.push({
      input: createTextSvg(phone, 28, 600, 351, 440),
      top: 0,
      left: 0,
    });

    // Amount
    textOverlays.push({
      input: createTextSvg(formattedAmount, 28, 600, 529, 511),
      top: 0,
      left: 0,
    });

    // Cash checkbox
    if (checkedCash) {
      textOverlays.push({
        input: createTextSvg('✓', 28, 700, 401, 581),
        top: 0,
        left: 0,
      });
    }

    // UPI checkbox
    if (!checkedCash && mode.toLowerCase() === 'upi') {
      textOverlays.push({
        input: createTextSvg('✓', 28, 700, 651, 581),
        top: 0,
        left: 0,
      });
    }

    // Collector
    textOverlays.push({
      input: createTextSvg(collector, 26, 600, 189, 739),
      top: 0,
      left: 0,
    });

    // Composite all text overlays
    return sharp(templateBuffer)
      .composite(textOverlays)
      .png()
      .toBuffer();
  } catch (error) {
    console.error('Receipt rendering error:', error);
    throw error;
  }
}