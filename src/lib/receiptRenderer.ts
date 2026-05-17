import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { format } from 'date-fns';

const RECEIPT_WIDTH = 1200;
const RECEIPT_HEIGHT = 840;

let embeddedFontCss: string | null = null;

const loadTemplateBuffer = () => {
  const templatePath = path.join(process.cwd(), 'public', 'receipt-template.png');

  if (!fs.existsSync(templatePath)) {
    throw new Error('Receipt template image not found at public/receipt-template.png. Please save the template image there.');
  }

  return fs.readFileSync(templatePath);
};

const loadEmbeddedFontCss = () => {
  if (embeddedFontCss !== null) {
    return embeddedFontCss;
  }

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

  embeddedFontCss = `
    @font-face {
      font-family: 'ReceiptLatin';
      src: url(data:font/woff;base64,${latinRegularBase64}) format('woff');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'ReceiptLatin';
      src: url(data:font/woff;base64,${latinBoldBase64}) format('woff');
      font-weight: 700;
      font-style: normal;
    }
    @font-face {
      font-family: 'ReceiptDevanagari';
      src: url(data:font/woff;base64,${devanagariRegularBase64}) format('woff');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'ReceiptDevanagari';
      src: url(data:font/woff;base64,${devanagariBoldBase64}) format('woff');
      font-weight: 700;
      font-style: normal;
    }
  `;

  return embeddedFontCss;
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
    const fontCss = loadEmbeddedFontCss();
    const formattedDate = format(entryDate, 'dd / MM / yy');
    const formattedAmount = amount.toLocaleString('en-IN');
    const checkedCash = mode.toLowerCase() === 'cash';

    // Create text overlays as SVG overlays and composite them
    const textOverlays: Array<{ input: Buffer; top: number; left: number }> = [];

    // Helper to create text SVG
    const createTextSvg = (
      text: string,
      size: number,
      weight: number,
      x: number,
      y: number,
      textAnchor: 'start' | 'middle' | 'end' = 'start'
    ) => {
      const encoded = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="1200" height="840" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${RECEIPT_WIDTH} ${RECEIPT_HEIGHT}">
        <style>
          ${fontCss}
          text { font-family: 'ReceiptDevanagari', 'ReceiptLatin', Georgia, 'Times New Roman', Times, serif; fill: #000000; }
        </style>
        <text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" text-anchor="${textAnchor}" dominant-baseline="hanging">${encoded}</text>
      </svg>`;

      return Buffer.from(svg);
    };

    // Receipt number
    textOverlays.push({
      input: createTextSvg(receiptNumber, 24, 700, 1118, 110),
      top: 0,
      left: 0,
    });

    // Date
    textOverlays.push({
      input: createTextSvg(formattedDate, 24, 700, 1090, 174),
      top: 0,
      left: 0,
    });

    // Name
    textOverlays.push({
      input: createTextSvg(name, 26, 700, 355, 430),
      top: 0,
      left: 0,
    });

    // Phone
    textOverlays.push({
      input: createTextSvg(phone, 26, 700, 355, 380),
      top: 0,
      left: 0,
    });

    // Amount
    textOverlays.push({
      input: createTextSvg(formattedAmount, 26, 700, 529, 528),
      top: 0,
      left: 0,
    });

    // Cash checkbox
    if (checkedCash) {
      textOverlays.push({
        input: createTextSvg('✓', 34, 700, 401, 566),
        top: 0,
        left: 0,
      });
    }

    // UPI checkbox
    if (!checkedCash && mode.toLowerCase() === 'upi') {
      textOverlays.push({
        input: createTextSvg('✓', 34, 700, 651, 566),
        top: 0,
        left: 0,
      });
    }

    // Collector
    textOverlays.push({
      input: createTextSvg(collector, 24, 700, 189, 752),
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