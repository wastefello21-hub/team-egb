const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

(async () => {
  try {
    const RECEIPT_WIDTH = 1200;
    const RECEIPT_HEIGHT = 840;
    const templatePath = path.join(process.cwd(), 'public', 'receipt-template.png');
    if (!fs.existsSync(templatePath)) {
      console.error('Template not found:', templatePath);
      process.exit(1);
    }
    const templateBuffer = fs.readFileSync(templatePath);

    const createTextSvg = (text, size, weight, x, y) => {
      const encoded = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      return `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${RECEIPT_WIDTH}" height="${RECEIPT_HEIGHT}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${RECEIPT_WIDTH} ${RECEIPT_HEIGHT}">\n  <style>text{font-family: Georgia, 'Times New Roman', Times, serif; fill:#000;}</style>\n  <text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" dominant-baseline="hanging">${encoded}</text>\n</svg>`;
    };

    const overlays = [
      { svg: createTextSvg('123456', 26, 600, 1017, 152), name: 'receipt' },
      { svg: createTextSvg('13 / 05 / 2026', 26, 600, 1017, 225), name: 'date' },
      { svg: createTextSvg('Vishal Kumar', 28, 600, 351, 368), name: 'name' },
      { svg: createTextSvg('+91-9876543210', 28, 600, 351, 440), name: 'phone' },
      { svg: createTextSvg('500', 28, 600, 529, 511), name: 'amount' },
      { svg: createTextSvg('✓', 28, 700, 401, 581), name: 'cash' },
      { svg: createTextSvg('Collector Name', 26, 600, 189, 739), name: 'collector' },
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
