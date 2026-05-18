const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

(async () => {
  try {
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
    };

    const templatePath = path.join(process.cwd(), 'public', 'receipt-template.png');
    if (!fs.existsSync(templatePath)) {
      console.error('Template not found:', templatePath);
      process.exit(1);
    }
    const templateBuffer = fs.readFileSync(templatePath);
    const templateMetadata = await sharp(templateBuffer).metadata();
    const receiptWidth = templateMetadata.width || BASE_RECEIPT_WIDTH;
    const receiptHeight = templateMetadata.height || BASE_RECEIPT_HEIGHT;
    const scaleX = receiptWidth / BASE_RECEIPT_WIDTH;
    const scaleY = receiptHeight / BASE_RECEIPT_HEIGHT;
    const fontScale = Math.min(scaleX, scaleY);

    const createTextSvg = (text, size, weight, x, y) => {
      const encoded = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      return `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${receiptWidth}" height="${receiptHeight}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${receiptWidth} ${receiptHeight}">\n  <style>text{font-family:'Liberation Sans','DejaVu Sans',Arial,Helvetica,sans-serif; fill:#000;}</style>\n  <text x="${Math.round(x * scaleX)}" y="${Math.round(y * scaleY)}" font-size="${Math.round(size * fontScale)}" font-weight="${weight}" dominant-baseline="hanging">${encoded}</text>\n</svg>`;
    };

    const overlays = [
      { svg: createTextSvg('123456', FIELD_POSITIONS.receiptNumber.size, 700, FIELD_POSITIONS.receiptNumber.x, FIELD_POSITIONS.receiptNumber.y), name: 'receipt' },
      { svg: createTextSvg('13 / 05 / 26', FIELD_POSITIONS.date.size, 700, FIELD_POSITIONS.date.x, FIELD_POSITIONS.date.y), name: 'date' },
      { svg: createTextSvg('Vishal Kumar', FIELD_POSITIONS.name.size, 700, FIELD_POSITIONS.name.x, FIELD_POSITIONS.name.y), name: 'name' },
      { svg: createTextSvg('+91-9876543210', FIELD_POSITIONS.phone.size, 700, FIELD_POSITIONS.phone.x, FIELD_POSITIONS.phone.y), name: 'phone' },
      { svg: createTextSvg('500', FIELD_POSITIONS.amount.size, 700, FIELD_POSITIONS.amount.x, FIELD_POSITIONS.amount.y), name: 'amount' },
      { svg: createTextSvg('✓', FIELD_POSITIONS.cashCheck.size, 700, FIELD_POSITIONS.cashCheck.x, FIELD_POSITIONS.cashCheck.y), name: 'cash' },
      { svg: createTextSvg('Collector Name', FIELD_POSITIONS.collector.size, 700, FIELD_POSITIONS.collector.x, FIELD_POSITIONS.collector.y), name: 'collector' },
    ].map(o => ({ input: Buffer.from(o.svg), top: 0, left: 0, name: o.name }));

    const result = await sharp(templateBuffer).composite(overlays).png().toBuffer();
    const outPath = path.join(process.cwd(), 'tmp', 'debug-receipt.png');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, result);
    console.log('Wrote', outPath);

    // Also write each overlay rasterized separately for inspection
    for (const ov of overlays) {
      const png = await sharp(ov.input).png().toBuffer();
      const p = path.join(process.cwd(), 'tmp', `overlay-${ov.name}.png`);
      fs.writeFileSync(p, png);
      console.log('Wrote overlay', p);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
