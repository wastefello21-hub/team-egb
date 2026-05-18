import { renderReceiptImage as renderWithSharp } from './receiptRenderer';
import { renderReceiptImage as renderWithPuppeteer } from './receiptRendererPuppeteer';

type RenderParams = Parameters<typeof renderWithPuppeteer>[0];

export async function renderReceiptImage(params: RenderParams) {
  const receiptNumber = params.receiptNumber || 'unknown';
  
  try {
    // Prefer Puppeteer for pixel-perfect rendering when available
    console.info(`[Receipt ${receiptNumber}] Attempting Puppeteer renderer...`);
    const result = await renderWithPuppeteer(params);
    console.info(`[Receipt ${receiptNumber}] Puppeteer renderer succeeded`);
    return result;
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.warn(`[Receipt ${receiptNumber}] Puppeteer renderer failed: ${errorMsg}. Falling back to Sharp renderer.`);

    try {
      console.info(`[Receipt ${receiptNumber}] Attempting Sharp renderer...`);
      const result = await renderWithSharp(params);
      console.info(`[Receipt ${receiptNumber}] Sharp renderer succeeded`);
      return result;
    } catch (err2: any) {
      const error2Msg = err2?.message || String(err2);
      console.error(`[Receipt ${receiptNumber}] Sharp renderer also failed: ${error2Msg}`);
      throw err2;
    }
  }
}

export default renderReceiptImage;
