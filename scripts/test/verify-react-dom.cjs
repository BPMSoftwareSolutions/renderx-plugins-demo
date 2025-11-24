#!/usr/bin/env node

const { chromium } = require('playwright');

async function verifyReactRuntime() {
  console.log('React Component Runtime Verification\n');
  console.log('='.repeat(60) + '\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to http://localhost:5174...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    console.log('Page loaded\n');

    await page.waitForSelector('.control-panel', { timeout: 5000 });
    console.log('Control panel found\n');

    console.log('Sending canvas-component-select sequence...');
    await page.evaluate(async () => {
      return fetch('http://localhost:5173/api/conductor/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sequence: 'canvas-component-select-symphony',
          context: { componentId: 'test-react', type: 'react' }
        })
      }).then(r => r.json());
    });
    console.log('Sequence sent\n');

    await page.waitForTimeout(500);

    // Check for reactCode field
    const hasReactCodeLabel = await page.locator('label:has-text("reactCode")').count() > 0;
    const hasCodeTextarea = await page.locator('textarea[data-field="reactCode"]').count() > 0;

    console.log('Control Panel Content Check:');
    console.log(`  reactCode label: ${hasReactCodeLabel ? 'FOUND' : 'MISSING'}`);
    console.log(`  Code textarea: ${hasCodeTextarea ? 'FOUND' : 'MISSING'}\n`);

    // Get actual HTML
    const controlPanelHTML = await page.locator('.control-panel').innerHTML();
    const hasReactCodeInHTML = controlPanelHTML.includes('reactCode');

    console.log('HTML Content Check:');
    console.log(`  "reactCode" in HTML: ${hasReactCodeInHTML ? 'YES' : 'NO'}\n`);

    // Get all property labels
    const labels = await page.locator('.property-label').allTextContents();
    console.log('Property Labels Found:');
    labels.forEach(l => console.log(`  - ${l.trim()}`));
    console.log();

    if (!hasReactCodeLabel && !hasCodeTextarea) {
      console.log('ISSUE: reactCode field is NOT being rendered!\n');
      console.log('Control Panel HTML (first 1500 chars):');
      console.log(controlPanelHTML.substring(0, 1500));
    } else {
      console.log('SUCCESS: reactCode field is being rendered!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

verifyReactRuntime().catch(console.error);

