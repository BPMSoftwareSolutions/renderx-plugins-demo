/**
 * Take a screenshot of the canvas to prove the button exists
 */

import puppeteer from 'puppeteer';

async function takeScreenshot() {
  console.log('📸 Taking screenshot of canvas...\n');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    console.log('📂 Opening http://localhost:5174...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    
    // Wait for the canvas to load
    await page.waitForTimeout(3000);
    
    // Take screenshot
    const screenshotPath = '.logs/canvas-screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    console.log(`✅ Screenshot saved to: ${screenshotPath}`);
    console.log('\n🔍 The screenshot should show:');
    console.log('   - "CLI Test Button" at position (150, 150)');
    console.log('   - "PROOF-1763163107507" button at position (200, 200)');
    console.log('\n💡 Open the screenshot to see the proof!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

takeScreenshot();

