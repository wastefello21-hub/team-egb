import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { format } from 'date-fns';

const RECEIPT_WIDTH = 1200;
const RECEIPT_HEIGHT = 840;

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const loadTemplateBuffer = () => {
  const templatePath = path.join(process.cwd(), 'public', 'receipt-template.png');

  if (!fs.existsSync(templatePath)) {
    throw new Error('Receipt template image not found at public/receipt-template.png. Please save the template image there.');
  }

  return fs.readFileSync(templatePath);
};

const buildReceiptOverlaySvg = ({
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
}) => {
  const formattedDate = format(entryDate, 'dd / MM / yyyy');
  const checkedCash = mode.toLowerCase() === 'cash';
  const checkedUpi = mode.toLowerCase() === 'upi';
  const formattedAmount = amount.toLocaleString('en-IN');
  const getAdaptiveFontSize = (value: string, normalSize: number, mediumSize: number, smallSize: number) => {
    if (value.length > 30) return smallSize;
    if (value.length > 20) return mediumSize;
    return normalSize;
  };

  const nameFontSize = getAdaptiveFontSize(name, 28, 24, 20);
  const phoneFontSize = getAdaptiveFontSize(phone, 28, 26, 24);
  const collectorFontSize = getAdaptiveFontSize(collector, 26, 22, 18);

  const lineText = (value: string, attributes: Record<string, string | number>) => {
    const renderedAttributes = Object.entries(attributes)
      .map(([key, attributeValue]) => `${key}="${attributeValue}"`)
      .join(' ');

    return `<text ${renderedAttributes}>${escapeXml(value)}</text>`;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${RECEIPT_WIDTH}" height="${RECEIPT_HEIGHT}" viewBox="0 0 ${RECEIPT_WIDTH} ${RECEIPT_HEIGHT}">
    <defs>
      <style>
        .field-value { font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 600; fill: #24180f; letter-spacing: 0.01em; }
        .field-value-small { font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 600; fill: #24180f; letter-spacing: 0.01em; }
        .checkbox-mark { font-family: 'Arial', sans-serif; font-size: 28px; font-weight: bold; fill: #1f6b2d; }
      </style>
    </defs>

    ${lineText(receiptNumber, {
      x: 1017,
      y: 152,
      class: 'field-value-small',
      'text-anchor': 'middle',
      textLength: 178,
      lengthAdjust: 'spacingAndGlyphs',
    })}
    ${lineText(formattedDate, {
      x: 1017,
      y: 225,
      class: 'field-value-small',
      'text-anchor': 'middle',
      textLength: 198,
      lengthAdjust: 'spacingAndGlyphs',
    })}

    ${lineText(name, {
      x: 351,
      y: 368,
      class: 'field-value',
      'font-size': nameFontSize,
      textLength: 620,
      lengthAdjust: 'spacingAndGlyphs',
    })}
    ${lineText(phone, {
      x: 351,
      y: 440,
      class: 'field-value',
      'font-size': phoneFontSize,
      textLength: 620,
      lengthAdjust: 'spacingAndGlyphs',
    })}
    ${lineText(formattedAmount, {
      x: 529,
      y: 511,
      class: 'field-value',
      textLength: 470,
      lengthAdjust: 'spacingAndGlyphs',
    })}

    ${checkedCash ? '<text x="401" y="581" class="checkbox-mark" text-rendering="geometricPrecision">✓</text>' : ''}
    ${checkedUpi ? '<text x="651" y="581" class="checkbox-mark" text-rendering="geometricPrecision">✓</text>' : ''}

    ${lineText(collector, {
      x: 189,
      y: 739,
      class: 'field-value-small',
      'font-size': collectorFontSize,
      textLength: 255,
      lengthAdjust: 'spacingAndGlyphs',
    })}
  </svg>`;
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
    const overlaySvg = buildReceiptOverlaySvg({
      receiptNumber,
      entryDate,
      name,
      phone,
      amount,
      mode,
      collector,
    });

    // Render SVG to PNG buffer first
    const svgBuffer = await sharp(Buffer.from(overlaySvg), { density: 300 })
      .png()
      .toBuffer();

    // Then composite the rendered SVG onto the template
    return sharp(templateBuffer)
      .composite([{ input: svgBuffer, top: 0, left: 0 }])
      .png()
      .toBuffer();
  } catch (error) {
    console.error('Receipt rendering error:', error);
    throw error;
  }
}