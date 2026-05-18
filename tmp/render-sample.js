const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const RECEIPT_WIDTH = 1200;
const RECEIPT_HEIGHT = 840;
const FIELD_POSITIONS = {
  receiptNumber: { x: 1066, y: 102, size: 18 },
  date: { x: 1042, y: 168, size: 18 },
  name: { x: 355, y: 364, size: 24 },
  phone: { x: 355, y: 417, size: 24 },
  amount: { x: 529, y: 470, size: 24 },
  cashCheck: { x: 413, y: 555, size: 34 },
  collector: { x: 189, y: 724, size: 22 },
};

function svg(text, size, x, y) {
  const encoded = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&apos;');

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${RECEIPT_WIDTH}" height="${RECEIPT_HEIGHT}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${RECEIPT_WIDTH} ${RECEIPT_HEIGHT}"><style>text{font-family:Arial,Helvetica,sans-serif;fill:#000;}</style><text x="${x}" y="${y}" font-size="${size}" font-weight="700" dominant-baseline="hanging">${encoded}</text></svg>`);
}

(async () => {
  const template = fs.readFileSync(path.join(process.cwd(), 'public', 'receipt-template.png'));
  const overlays = [
    { input: svg('123456', FIELD_POSITIONS.receiptNumber.size, FIELD_POSITIONS.receiptNumber.x, FIELD_POSITIONS.receiptNumber.y), top: 0, left: 0 },
    { input: svg('17/05/26', FIELD_POSITIONS.date.size, FIELD_POSITIONS.date.x, FIELD_POSITIONS.date.y), top: 0, left: 0 },
    { input: svg('Rahul Sharma', FIELD_POSITIONS.name.size, FIELD_POSITIONS.name.x, FIELD_POSITIONS.name.y), top: 0, left: 0 },
    { input: svg('9876543210', FIELD_POSITIONS.phone.size, FIELD_POSITIONS.phone.x, FIELD_POSITIONS.phone.y), top: 0, left: 0 },
    { input: svg('1,500', FIELD_POSITIONS.amount.size, FIELD_POSITIONS.amount.x, FIELD_POSITIONS.amount.y), top: 0, left: 0 },
    { input: svg('?', FIELD_POSITIONS.cashCheck.size, FIELD_POSITIONS.cashCheck.x, FIELD_POSITIONS.cashCheck.y), top: 0, left: 0 },
    { input: svg('EGB-01', FIELD_POSITIONS.collector.size, FIELD_POSITIONS.collector.x, FIELD_POSITIONS.collector.y), top: 0, left: 0 },
  ];

  const out = await sharp(template).composite(overlays).png().toBuffer();
  const outPath = path.join(process.cwd(), 'tmp', 'sample-receipt.png');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, out);
  console.log('Wrote', outPath);
})();
