#!/usr/bin/env node

/**
 * Headless browser console logger
 * Launches the app in headless mode and captures all console messages
 */

import { chromium } from 'playwright';

async function captureConsoleLogs() {
  console.log('🚀 Launching app in headless browser to capture console logs...\n');

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

  // Capture all console messages
  const consoleMessages = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const timestamp = new Date().toISOString();

    consoleMessages.push({
      timestamp,
      type,
      text,
      location: msg.location()
    });

    // Print to console with color coding
    const color = {
      log: '\x1b[37m',    // white
      info: '\x1b[36m',   // cyan
      warn: '\x1b[33m',   // yellow
      error: '\x1b[31m',  // red
      debug: '\x1b[35m'   // magenta
    }[type] || '\x1b[37m';

    console.log(`${color}[${timestamp}] ${type.toUpperCase()}: ${text}\x1b[0m`);
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log(`\x1b[31m[${new Date().toISOString()}] PAGE ERROR: ${error.message}\x1b[0m`);
  });

  try {
    console.log('📄 Navigating to http://localhost:5173...\n');

    // Navigate to the app
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('\n⏳ Waiting for app to fully initialize...\n');

    // Wait for the app to be ready (adjust selector as needed)
    try {
      await page.waitForSelector('#rx-canvas', { timeout: 10000 });
      console.log('✅ Canvas element found - app appears to be loaded\n');
    } catch {
      console.log('⚠️  Canvas element not found within timeout, but continuing...\n');
    }

    // Wait a bit more for any async initialization
    await page.waitForTimeout(3000);

    console.log('📊 Console Log Summary:\n');

    // Group messages by type
    const grouped = consoleMessages.reduce((acc, msg) => {
      acc[msg.type] = acc[msg.type] || [];
      acc[msg.type].push(msg);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([type, messages]) => {
      console.log(`\x1b[36m${type.toUpperCase()}: ${messages.length} messages\x1b[0m`);
    });

    console.log(`\n📈 Total: ${consoleMessages.length} console messages captured`);

    // Show any errors or warnings prominently
    const errors = consoleMessages.filter(m => m.type === 'error');
    const warnings = consoleMessages.filter(m => m.type === 'warn');

    if (errors.length > 0) {
      console.log(`\n🚨 ERRORS (${errors.length}):`);
      errors.forEach(error => {
        console.log(`  ${error.text}`);
      });
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
      warnings.forEach(warning => {
        console.log(`  ${warning.text}`);
      });
    }

  } catch (error) {
    console.error('\x1b[31m❌ Error during page load:', error.message, '\x1b[0m');
  } finally {
    await browser.close();
    console.log('\n🔚 Browser closed. Console logging complete.');
  }
}

// Check if dev server is running
async function checkDevServer() {
  try {
    const response = await fetch('http://localhost:5173');
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  const isServerRunning = await checkDevServer();

  if (!isServerRunning) {
    console.log('❌ Dev server not running on http://localhost:5173');
    console.log('💡 Start the dev server first:');
    console.log('   npm run dev');
    process.exit(1);
  }

  await captureConsoleLogs();
}

main().catch(console.error);