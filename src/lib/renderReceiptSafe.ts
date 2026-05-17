import { renderReceiptImage as renderWithSharp } from './receiptRenderer';
import { renderReceiptImage as renderWithPuppeteer } from './receiptRendererPuppeteer';

type RenderParams = Parameters<typeof renderWithPuppeteer>[0];

export async function renderReceiptImage(params: RenderParams) {
  try {
    // Prefer Puppeteer for pixel-perfect rendering when available
    return await renderWithPuppeteer(params);
  } catch (err: any) {
    console.warn('Puppeteer renderer failed, falling back to Sharp renderer:', err?.message || err);

    try {
      return await renderWithSharp(params);
    } catch (err2: any) {
      console.error('Sharp renderer also failed:', err2?.message || err2);
      throw err2;
    }
  }
}

export default renderReceiptImage;
