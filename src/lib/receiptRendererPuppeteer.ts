import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { format } from 'date-fns';

const BASE_RECEIPT_WIDTH = 1200;
const BASE_RECEIPT_HEIGHT = 840;

const FIELD_POSITIONS = {
  receiptNumber: { left: 995, top: 136, size: 24 },
  date: { left: 995, top: 212, size: 24 },
  name: { left: 285, top: 378, size: 28 },
  phone: { left: 411, top: 441, size: 28 },
  amount: { left: 515, top: 502, size: 28 },
  cashCheck: { left: 433, top: 561, size: 36 },
  upiCheck: { left: 688, top: 561, size: 36 },
  collector: { left: 231, top: 718, size: 28 },
} as const;

const hasDevanagariText = (text: string) => /[\u0900-\u097F]/.test(text);

const getTextFontFamily = (text: string) =>
  hasDevanagariText(text)
    ? "'ReceiptDevanagari', 'ReceiptLatin', 'DejaVu Sans', 'Noto Sans', sans-serif"
    : "'ReceiptLatin', 'ReceiptDevanagari', 'DejaVu Sans', 'Noto Sans', sans-serif";

const loadTemplateBuffer = () => {
  const templatePath = path.join(process.cwd(), 'public', 'receipt-template.png');

  if (!fs.existsSync(templatePath)) {
    throw new Error('Receipt template image not found at public/receipt-template.png.');
  }

  return fs.readFileSync(templatePath);
};

const loadFontsCss = () => {
  const fontsDir = path.join(process.cwd(), 'public', 'fonts', 'receipt');
  const picks = [
    { name: 'ReceiptLatin', regular: 'noto-serif-latin-400-normal.woff2', bold: 'noto-serif-latin-700-normal.woff2', fallbackRegular: 'noto-serif-latin-400-normal.woff', fallbackBold: 'noto-serif-latin-700-normal.woff' },
    { name: 'ReceiptDevanagari', regular: 'noto-serif-devanagari-devanagari-400-normal.woff2', bold: 'noto-serif-devanagari-devanagari-700-normal.woff2', fallbackRegular: 'noto-serif-devanagari-devanagari-400-normal.woff', fallbackBold: 'noto-serif-devanagari-devanagari-700-normal.woff' },
  ];

  const rules: string[] = [];

  for (const p of picks) {
    const regularPath = path.join(fontsDir, p.regular);
    const boldPath = path.join(fontsDir, p.bold);

    let useRegular = regularPath;
    let useBold = boldPath;
    if (!fs.existsSync(useRegular) && p.fallbackRegular) useRegular = path.join(fontsDir, p.fallbackRegular);
    if (!fs.existsSync(useBold) && p.fallbackBold) useBold = path.join(fontsDir, p.fallbackBold);

    if (fs.existsSync(useRegular)) {
      const base64 = fs.readFileSync(useRegular).toString('base64');
      const fmt = useRegular.endsWith('.woff2') ? 'woff2' : 'woff';
      rules.push(`@font-face { font-family: '${p.name}'; src: url(data:font/${fmt};base64,${base64}) format('${fmt}'); font-weight: 400; font-style: normal; }`);
    }

    if (fs.existsSync(useBold)) {
      const base64 = fs.readFileSync(useBold).toString('base64');
      const fmt = useBold.endsWith('.woff2') ? 'woff2' : 'woff';
      rules.push(`@font-face { font-family: '${p.name}'; src: url(data:font/${fmt};base64,${base64}) format('${fmt}'); font-weight: 700; font-style: normal; }`);
    }
  }

  return rules.join('\n');
};

function escapeHtml(text: string) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
  const templateBuffer = loadTemplateBuffer();
  const templateMetadata = await sharp(templateBuffer).metadata();
  const receiptWidth = templateMetadata.width ?? BASE_RECEIPT_WIDTH;
  const receiptHeight = templateMetadata.height ?? BASE_RECEIPT_HEIGHT;
  const scaleX = receiptWidth / BASE_RECEIPT_WIDTH;
  const scaleY = receiptHeight / BASE_RECEIPT_HEIGHT;
  const fontScale = Math.min(scaleX, scaleY);
  const scaleLeft = (value: number) => Math.round(value * scaleX);
  const scaleTop = (value: number) => Math.round(value * scaleY);
  const scaleSize = (value: number) => Math.max(12, Math.round(value * fontScale));

  const templateBase64 = templateBuffer.toString('base64');
  const fontsCss = loadFontsCss();

  const formattedDate = format(entryDate, 'dd / MM / yy');
  const formattedAmount = amount.toLocaleString('en-IN');
  const checkedCash = mode?.toLowerCase() === 'cash';

  const html = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      ${fontsCss}
      html,body{margin:0;padding:0}
      .receipt{width:${receiptWidth}px;height:${receiptHeight}px;position:relative;background-image:url(data:image/png;base64,${templateBase64});background-size:cover;font-family:'Liberation Sans', 'DejaVu Sans', Arial, Helvetica, sans-serif}
      .field{position:absolute;color:#000;line-height:1}
      .receipt-number{left:${scaleLeft(FIELD_POSITIONS.receiptNumber.left)}px;top:${scaleTop(FIELD_POSITIONS.receiptNumber.top)}px;font-weight:700;font-size:${scaleSize(FIELD_POSITIONS.receiptNumber.size)}px}
      .date{left:${scaleLeft(FIELD_POSITIONS.date.left)}px;top:${scaleTop(FIELD_POSITIONS.date.top)}px;font-weight:700;font-size:${scaleSize(FIELD_POSITIONS.date.size)}px}
      .name{left:${scaleLeft(FIELD_POSITIONS.name.left)}px;top:${scaleTop(FIELD_POSITIONS.name.top)}px;font-weight:700;font-size:${scaleSize(FIELD_POSITIONS.name.size)}px}
      .phone{left:${scaleLeft(FIELD_POSITIONS.phone.left)}px;top:${scaleTop(FIELD_POSITIONS.phone.top)}px;font-weight:700;font-size:${scaleSize(FIELD_POSITIONS.phone.size)}px}
      .amount{left:${scaleLeft(FIELD_POSITIONS.amount.left)}px;top:${scaleTop(FIELD_POSITIONS.amount.top)}px;font-weight:700;font-size:${scaleSize(FIELD_POSITIONS.amount.size)}px}
      .check-cash{left:${scaleLeft(FIELD_POSITIONS.cashCheck.left)}px;top:${scaleTop(FIELD_POSITIONS.cashCheck.top)}px;font-weight:700;font-size:${scaleSize(FIELD_POSITIONS.cashCheck.size)}px}
      .check-upi{left:${scaleLeft(FIELD_POSITIONS.upiCheck.left)}px;top:${scaleTop(FIELD_POSITIONS.upiCheck.top)}px;font-weight:700;font-size:${scaleSize(FIELD_POSITIONS.upiCheck.size)}px}
      .collector{left:${scaleLeft(FIELD_POSITIONS.collector.left)}px;top:${scaleTop(FIELD_POSITIONS.collector.top)}px;font-weight:700;font-size:${scaleSize(FIELD_POSITIONS.collector.size)}px}
    </style>
  </head>
  <body>
    <div id="receipt" class="receipt">
      <div class="field receipt-number" style="font-family:${getTextFontFamily(receiptNumber)}">${escapeHtml(receiptNumber)}</div>
      <div class="field date" style="font-family:${getTextFontFamily(formattedDate)}">${escapeHtml(formattedDate)}</div>
      <div class="field name" style="font-family:${getTextFontFamily(name)}">${escapeHtml(name)}</div>
      <div class="field phone" style="font-family:${getTextFontFamily(phone)}">${escapeHtml(phone)}</div>
      <div class="field amount" style="font-family:${getTextFontFamily(formattedAmount)}">${escapeHtml(formattedAmount)}</div>
      ${checkedCash ? `<div class="field check-cash" style="font-family:${getTextFontFamily('✓')}">✓</div>` : (mode?.toLowerCase() === 'upi' ? `<div class="field check-upi" style="font-family:${getTextFontFamily('✓')}">✓</div>` : '')}
      <div class="field collector" style="font-family:${getTextFontFamily(collector)}">${escapeHtml(collector)}</div>
    </div>
  </body>
  </html>`;

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: receiptWidth, height: receiptHeight });
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(async () => {
      if ((document as any).fonts?.ready) {
        await (document as any).fonts.ready;
      }
    });
    const el = await page.$('#receipt');
    if (!el) throw new Error('Receipt element not found in renderer HTML');
    const screenshot = await el.screenshot({ type: 'png' }) as Buffer;
    await page.close();
    return screenshot;
  } finally {
    await browser.close();
  }
}
