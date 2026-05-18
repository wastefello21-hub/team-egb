import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { format } from 'date-fns';

const BASE_RECEIPT_WIDTH = 1200;
const BASE_RECEIPT_HEIGHT = 840;

const FIELD_POSITIONS = {
  receiptNumber: { x: 995, y: 136, size: 24 },
  date: { x: 995, y: 212, size: 24 },
  name: { x: 285, y: 378, size: 28 },
  phone: { x: 411, y: 441, size: 28 },
  amount: { x: 515, y: 502, size: 28 },
  cashCheck: { x: 433, y: 561, size: 36 },
  upiCheck: { x: 688, y: 561, size: 36 },
  collector: { x: 231, y: 718, size: 28 },
} as const;

const loadTemplateBuffer = () => {
  const templatePath = path.join(process.cwd(), 'public', 'receipt-template.png');
  if (!fs.existsSync(templatePath)) {
    throw new Error('Receipt template image not found at public/receipt-template.png.');
  }
  return fs.readFileSync(templatePath);
};

export async function renderReceiptImageSharpText({
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
    const templateMetadata = await sharp(templateBuffer).metadata();
    const receiptWidth = templateMetadata.width ?? BASE_RECEIPT_WIDTH;
    const receiptHeight = templateMetadata.height ?? BASE_RECEIPT_HEIGHT;
    const scaleX = receiptWidth / BASE_RECEIPT_WIDTH;
    const scaleY = receiptHeight / BASE_RECEIPT_HEIGHT;
    const fontScale = Math.min(scaleX, scaleY);

    const formattedDate = format(entryDate, 'dd / MM / yy');
    const formattedAmount = amount.toLocaleString('en-IN');
    const checkedCash = mode.toLowerCase() === 'cash';

    // Use SVG with simple web-safe fonts for Sharp rendering
    const createSvgText = (text: string, fontSize: number, x: number, y: number) => {
      const encoded = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      // Use simpler font stack that Sharp can handle
      return `<text x="${Math.round(x * scaleX)}" y="${Math.round(y * scaleY)}" font-size="${Math.max(12, Math.round(fontSize * fontScale))}" font-weight="700" fill="black" font-family="Arial, sans-serif">${encoded}</text>`;
    };

    // Build SVG with all text elements
    const svgElements = [
      createSvgText(receiptNumber || '', FIELD_POSITIONS.receiptNumber.size, FIELD_POSITIONS.receiptNumber.x, FIELD_POSITIONS.receiptNumber.y),
      createSvgText(formattedDate, FIELD_POSITIONS.date.size, FIELD_POSITIONS.date.x, FIELD_POSITIONS.date.y),
      createSvgText(name || '', FIELD_POSITIONS.name.size, FIELD_POSITIONS.name.x, FIELD_POSITIONS.name.y),
      createSvgText(phone || '', FIELD_POSITIONS.phone.size, FIELD_POSITIONS.phone.x, FIELD_POSITIONS.phone.y),
      createSvgText(formattedAmount, FIELD_POSITIONS.amount.size, FIELD_POSITIONS.amount.x, FIELD_POSITIONS.amount.y),
      checkedCash ? createSvgText('✓', FIELD_POSITIONS.cashCheck.size, FIELD_POSITIONS.cashCheck.x, FIELD_POSITIONS.cashCheck.y) : '',
      !checkedCash && mode.toLowerCase() === 'upi' ? createSvgText('✓', FIELD_POSITIONS.upiCheck.size, FIELD_POSITIONS.upiCheck.x, FIELD_POSITIONS.upiCheck.y) : '',
      createSvgText(collector || '', FIELD_POSITIONS.collector.size, FIELD_POSITIONS.collector.x, FIELD_POSITIONS.collector.y),
    ].filter(Boolean).join('\n      ');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${receiptWidth}" height="${receiptHeight}" viewBox="0 0 ${receiptWidth} ${receiptHeight}">
      ${svgElements}
    </svg>`;

    // Composite the SVG text overlay onto the template
    const svgBuffer = Buffer.from(svg);
    return sharp(templateBuffer)
      .composite([
        {
          input: svgBuffer,
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();
  } catch (error) {
    console.error('Sharp text rendering error:', error);
    throw error;
  }
}
