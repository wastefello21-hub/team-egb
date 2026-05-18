import puppeteer from 'puppeteer';

async function testPuppeteer() {
  try {
    console.log('Testing Puppeteer availability...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✓ Puppeteer browser launched successfully');
    
    const page = await browser.newPage();
    console.log('✓ Page created');
    
    await page.setContent('<html><body><p>Hello World</p></body></html>');
    console.log('✓ Content set');
    
    const screenshot = await page.screenshot({ type: 'png' });
    console.log(`✓ Screenshot taken (${screenshot.length} bytes)`);
    
    await browser.close();
    console.log('✓ Browser closed');
    console.log('RESULT: Puppeteer is working!');
  } catch (error) {
    console.error('✗ Puppeteer test failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testPuppeteer();
