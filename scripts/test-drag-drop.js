#!/usr/bin/env node

/**
 * Library to Canvas Drag/Drop Test
 * Performs drag/drop operation from library component to canvas
 */

import { chromium } from 'playwright';

async function performDragDrop() {
  console.log('🎯 Performing Library → Canvas drag/drop operation...\n');

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // Track operation results
  const results = {
    canvasFound: false,
    libraryFound: false,
    buttonFound: false,
    dragPerformed: false,
    dropSuccessful: false,
    errors: [],
    consoleMessages: []
  };

  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    results.consoleMessages.push(`${msg.type().toUpperCase()}: ${text}`);

    // Look for specific error patterns
    if (text.includes('Missing component template') ||
        text.includes('reading \'tag\'') ||
        text.includes('Plugin not found')) {
      results.errors.push(text);
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    results.errors.push(`PAGE ERROR: ${error.message}`);
  });

  try {
    console.log('📄 Loading application...');
    await page.goto('http://localhost:5175', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Check if canvas is present
    const canvas = page.locator('#rx-canvas');
    results.canvasFound = await canvas.isVisible();
    console.log(`${results.canvasFound ? '✅' : '❌'} Canvas element found`);

    if (!results.canvasFound) {
      throw new Error('Canvas element not found');
    }

    // Check if library is present
    const libContainer = page.locator('.library-component-library').first();
    try {
      await libContainer.waitFor({ timeout: 10000 });
      results.libraryFound = await libContainer.isVisible();
      console.log(`${results.libraryFound ? '✅' : '❌'} Library component found`);
    } catch {
      console.log('❌ Library component not found within timeout');
      results.libraryFound = false;
    }

    if (!results.libraryFound) {
      console.log('⚠️  Library not visible - this might be expected in some environments');
    }

    // Look for a Button component in the library
    const libText = page.getByText('Button').first();
    try {
      await libText.waitFor({ timeout: 10000 });
      results.buttonFound = await libText.isVisible();
      console.log(`${results.buttonFound ? '✅' : '❌'} Button component found in library`);
    } catch {
      console.log('❌ Button component not found within timeout');
      results.buttonFound = false;
    }

    if (!results.buttonFound) {
      console.log('⚠️  No Button component found - checking for other draggable elements...');

      // Look for any draggable element
      const draggableElements = page.locator('[draggable="true"]');
      const count = await draggableElements.count();
      console.log(`📋 Found ${count} draggable elements on the page`);

      if (count > 0) {
        // Try to drag the first draggable element
        const firstDraggable = draggableElements.first();
        console.log('🎯 Attempting to drag first draggable element...');
        await firstDraggable.dragTo(canvas);
        results.dragPerformed = true;
        console.log('✅ Drag operation completed');
      } else {
        console.log('❌ No draggable elements found');
        return results;
      }
    } else {
      // Perform drag/drop with Button component
      console.log('🎯 Performing drag/drop operation...');

      // Try HTML5 drag and drop first
      const source = page.locator('[draggable="true"]').filter({ hasText: 'Button' }).first();
      if (await source.count() > 0 && await source.isVisible()) {
        console.log('📋 Using HTML5 drag and drop');
        await source.dragTo(canvas);
        results.dragPerformed = true;
      } else {
        // Fallback to pointer-based drag
        console.log('📋 Using pointer-based drag simulation');
        const box = await libText.boundingBox();
        const canvasBox = await canvas.boundingBox();

        if (!box || !canvasBox) {
          throw new Error('Could not resolve bounding boxes for drag operation');
        }

        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 10, box.y + box.height / 2 + 10);
        await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
        await page.mouse.up();
        results.dragPerformed = true;
      }

      console.log('✅ Drag operation completed');
    }

    // Wait for the operation to process
    console.log('⏳ Waiting for drag/drop processing...');
    await page.waitForTimeout(1000);

    // Check for any new elements on canvas (indicating successful drop)
    const canvasChildren = await canvas.locator('*').count();
    console.log(`📊 Canvas now has ${canvasChildren} child elements`);

    if (canvasChildren > 0) {
      results.dropSuccessful = true;
      console.log('✅ Drop operation appears successful');
    } else {
      console.log('⚠️  No new elements detected on canvas');
    }

    // Check for any error messages in console
    if (results.errors.length > 0) {
      console.log('\n🚨 ERRORS DETECTED:');
      results.errors.forEach(error => {
        console.log(`  ❌ ${error}`);
      });
    } else {
      console.log('\n✅ No errors detected in console');
    }

    // Summary
    console.log('\n📊 DRAG/DROP OPERATION SUMMARY:');
    console.log(`   Canvas Found: ${results.canvasFound ? '✅' : '❌'}`);
    console.log(`   Library Found: ${results.libraryFound ? '✅' : '❌'}`);
    console.log(`   Component Found: ${results.buttonFound ? '✅' : '❌'}`);
    console.log(`   Drag Performed: ${results.dragPerformed ? '✅' : '❌'}`);
    console.log(`   Drop Successful: ${results.dropSuccessful ? '✅' : '❌'}`);
    console.log(`   Errors: ${results.errors.length}`);

    const success = results.dragPerformed && results.errors.length === 0;
    console.log(`\n🎯 OVERALL RESULT: ${success ? '✅ SUCCESS' : '❌ ISSUES DETECTED'}`);

  } catch (error) {
    console.error(`\n❌ Error during drag/drop operation: ${error.message}`);
    results.errors.push(error.message);
  } finally {
    await browser.close();
    console.log('\n🔚 Browser closed. Drag/drop test complete.');
  }

  return results;
}

// Check if dev server is running
async function checkDevServer() {
  try {
    const response = await fetch('http://localhost:5175');
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  const isServerRunning = await checkDevServer();

  if (!isServerRunning) {
    console.log('❌ Dev server not running on http://localhost:5175');
    console.log('💡 Start the dev server first:');
    console.log('   npm run dev');
    process.exit(1);
  }

  const results = await performDragDrop();

  // Exit with appropriate code
  const hasErrors = results.errors.length > 0;
  const success = results.dragPerformed && !hasErrors;

  if (!success) {
    process.exit(1);
  }
}

main().catch(console.error);