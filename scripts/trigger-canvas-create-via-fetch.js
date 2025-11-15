// Trigger canvas.component.create by injecting JavaScript into the running browser
// This uses Playwright to connect to the running dev server

import { chromium } from 'playwright';

async function triggerCanvasCreate() {
  console.log('🎯 Connecting to running app at http://localhost:5173...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to the app
  await page.goto('http://localhost:5173');
  
  // Wait for the app to load
  await page.waitForTimeout(2000);
  
  console.log('📦 Triggering canvas.component.create sequence...');
  
  // Execute the sequence in the browser context
  const result = await page.evaluate(() => {
    const conductor = window.RenderX?.conductor;
    
    if (!conductor) {
      return { success: false, error: 'Conductor not found' };
    }
    
    const payload = {
      component: {
        template: {
          tag: 'button',
          text: 'Test Button',
          classes: ['rx-comp', 'rx-button'],
          style: {
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            backgroundColor: '#007bff',
            color: '#ffffff',
            cursor: 'pointer'
          },
          dimensions: {
            width: 120,
            height: 40
          }
        }
      },
      position: {
        x: 100,
        y: 100
      },
      correlationId: `test-${Date.now()}`
    };
    
    return conductor.play('CanvasComponentPlugin', 'canvas-component-create-symphony', payload)
      .then(() => ({ success: true }))
      .catch((error) => ({ success: false, error: error.message }));
  });
  
  console.log('📊 Result:', result);
  
  if (result.success) {
    console.log('✅ Component created! Check the browser window.');
    console.log('⏳ Waiting 5 seconds for you to see the result...');
    await page.waitForTimeout(5000);
  } else {
    console.error('❌ Failed:', result.error);
  }
  
  await browser.close();
}

triggerCanvasCreate().catch(console.error);

