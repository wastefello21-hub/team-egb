import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { format } from 'date-fns';

const RECEIPT_WIDTH = 1200;
const RECEIPT_HEIGHT = 840;

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
    { name: 'ReceiptLatin', regular: 'noto-serif-latin-400-normal.woff2', bold: 'noto-serif-latin-700-normal.woff2' },
    { name: 'ReceiptDevanagari', regular: 'noto-serif-devanagari-devanagari-400-normal.woff', bold: 'noto-serif-devanagari-devanagari-700-normal.woff' },
  ];

  const rules: string[] = [];

  for (const p of picks) {
    const regularPath = path.join(fontsDir, p.regular);
    const boldPath = path.join(fontsDir, p.bold);

    if (fs.existsSync(regularPath)) {
      const base64 = fs.readFileSync(regularPath).toString('base64');
      rules.push(`@font-face { font-family: '${p.name}'; src: url(data:font/woff2;base64,${base64}) format('woff2'); font-weight: 400; font-style: normal; }`);
    }

    if (fs.existsSync(boldPath)) {
      const base64 = fs.readFileSync(boldPath).toString('base64');
      rules.push(`@font-face { font-family: '${p.name}'; src: url(data:font/woff;base64,${base64}) format('woff'); font-weight: 700; font-style: normal; }`);
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
      .receipt{width:${RECEIPT_WIDTH}px;height:${RECEIPT_HEIGHT}px;position:relative;background-image:url(data:image/png;base64,${templateBase64});background-size:cover;font-family:ReceiptDevanagari,ReceiptLatin,Georgia,'Times New Roman',Times,serif}
      .field{position:absolute;color:#000}
      .receipt-number{left:1118px;top:110px;font-weight:700;font-size:24px}
      .date{left:1090px;top:174px;font-weight:700;font-size:24px}
      .phone{left:355px;top:380px;font-weight:700;font-size:26px}
      .name{left:355px;top:430px;font-weight:700;font-size:26px}
      .amount{left:529px;top:528px;font-weight:700;font-size:26px}
      .check-cash{left:401px;top:566px;font-weight:700;font-size:34px}
      .check-upi{left:651px;top:566px;font-weight:700;font-size:34px}
      .collector{left:189px;top:752px;font-weight:700;font-size:24px}
    </style>
  </head>
  <body>
    <div id="receipt" class="receipt">
      <div class="field receipt-number">${escapeHtml(receiptNumber)}</div>
      <div class="field date">${escapeHtml(formattedDate)}</div>
      <div class="field phone">${escapeHtml(phone)}</div>
      <div class="field name">${escapeHtml(name)}</div>
      <div class="field amount">${escapeHtml(formattedAmount)}</div>
      ${checkedCash ? '<div class="field check-cash">✓</div>' : (mode?.toLowerCase() === 'upi' ? '<div class="field check-upi">✓</div>' : '')}
      <div class="field collector">${escapeHtml(collector)}</div>
    </div>
  </body>
  </html>`;

  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: RECEIPT_WIDTH, height: RECEIPT_HEIGHT });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // ensure fonts loaded
    await page.evaluate(() => (document as any).fonts && (document as any).fonts.ready);
    const el = await page.$('#receipt');
    if (!el) throw new Error('Receipt element not found in renderer HTML');
    const screenshot = await el.screenshot({ type: 'png' }) as Buffer;
    await page.close();
    return screenshot;
  } finally {
    await browser.close();
  }
}
