#!/usr/bin/env node

/**
 * Runtime Diagnostics Script
 * Runs the app and executes console diagnostics to check plugin loading
 */

import { chromium } from 'playwright';
import { spawn } from 'child_process';

async function runDiagnostics() {
  console.log('🔍 Starting Runtime Diagnostics...\n');

  // Start the dev server
  console.log('🚀 Starting dev server...');
  const devServer = spawn('npm', ['run', 'dev'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  });

  // Wait for dev server to be ready
  await new Promise((resolve) => {
    let output = '';
    devServer.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('ready in') || output.includes('Local:')) {
        console.log('✅ Dev server ready');
        resolve();
      }
    });
  });

  // Give server a moment to fully initialize
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // Launch browser and navigate
    console.log('🌐 Launching browser...');
    const browser = await chromium.launch({
      headless: false, // Keep visible for debugging
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Listen for console messages
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      } else if (msg.text().includes('Plugin') || msg.text().includes('plugin')) {
        console.log(`🔌 Plugin Log: ${msg.text()}`);
      }
    });

    console.log('📄 Navigating to app...');
    await page.goto('http://localhost:5174', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('⏳ Waiting for app to initialize...');
    await page.waitForTimeout(3000);

    // Execute diagnostics in browser console
    console.log('\n🔬 Running Plugin Diagnostics...\n');

    const pluginResults = await page.evaluate(() => {
      // Check if window has the expected global objects
      const results = {
        hasConductor: typeof window.conductor !== 'undefined',
        hasPluginLoader: typeof window.conductor?.pluginLoader !== 'undefined',
        availablePlugins: [],
        pluginErrors: [],
        libraryComponentPlugin: null,
        canvasElement: null,
        libraryElement: null
      };

      // Try to get available plugins
      try {
        if (window.conductor?.pluginLoader?.getAvailablePlugins) {
          results.availablePlugins = window.conductor.pluginLoader.getAvailablePlugins();
        } else if (window.conductor?.plugins) {
          results.availablePlugins = Object.keys(window.conductor.plugins || {});
        }
      } catch (e) {
        results.pluginErrors.push(`Failed to get plugins: ${e.message}`);
      }

      // Check for specific plugins
      if (results.availablePlugins.includes('LibraryComponentPlugin')) {
        results.libraryComponentPlugin = 'FOUND';
      } else if (results.availablePlugins.includes('LibraryComponentDropPlugin')) {
        results.libraryComponentPlugin = 'FOUND (as LibraryComponentDropPlugin)';
      } else {
        results.libraryComponentPlugin = 'NOT FOUND';
      }

      // Check DOM elements
      results.canvasElement = document.querySelector('[data-testid="canvas"]') ? 'FOUND' : 'NOT FOUND';
      results.libraryElement = document.querySelector('[data-testid="library"]') ? 'FOUND' : 'NOT FOUND';

      return results;
    });

    console.log('📊 Diagnostic Results:');
    console.log(`   Conductor: ${pluginResults.hasConductor ? '✅' : '❌'}`);
    console.log(`   Plugin Loader: ${pluginResults.hasPluginLoader ? '✅' : '❌'}`);
    console.log(`   Canvas Element: ${pluginResults.canvasElement}`);
    console.log(`   Library Element: ${pluginResults.libraryElement}`);
    console.log(`   LibraryComponentPlugin: ${pluginResults.libraryComponentPlugin}`);
    console.log(`   Available Plugins (${pluginResults.availablePlugins.length}):`);
    pluginResults.availablePlugins.forEach(plugin => {
      console.log(`     - ${plugin}`);
    });

    if (pluginResults.pluginErrors.length > 0) {
      console.log('\n❌ Plugin Errors:');
      pluginResults.pluginErrors.forEach(error => {
        console.log(`   ${error}`);
      });
    }

    // Test drag/drop if elements are available
    if (pluginResults.canvasElement === 'FOUND' && pluginResults.libraryElement === 'FOUND') {
      console.log('\n🎯 Testing Drag/Drop Flow...\n');

      const dragDropResult = await page.evaluate(async () => {
        const results = {
          libraryComponentFound: false,
          dragStarted: false,
          dropCompleted: false,
          canvasChildrenBefore: 0,
          canvasChildrenAfter: 0,
          errors: []
        };

        try {
          // Find library component
          const library = document.querySelector('[data-testid="library"]');
          const libraryComponent = library?.querySelector('.component-item, [data-component-type="button"]');

          if (libraryComponent) {
            results.libraryComponentFound = true;

            // Get canvas
            const canvas = document.querySelector('[data-testid="canvas"]');
            results.canvasChildrenBefore = canvas?.children.length || 0;

            // Simulate drag start
            const dragStartEvent = new DragEvent('dragstart', {
              bubbles: true,
              dataTransfer: new DataTransfer()
            });
            libraryComponent.dispatchEvent(dragStartEvent);
            results.dragStarted = true;

            // Wait a moment
            await new Promise(resolve => setTimeout(resolve, 500));

            // Simulate drop on canvas
            const dropEvent = new DragEvent('drop', {
              bubbles: true,
              dataTransfer: dragStartEvent.dataTransfer
            });
            canvas?.dispatchEvent(dropEvent);
            results.dropCompleted = true;

            // Wait for processing
            await new Promise(resolve => setTimeout(resolve, 1000));

            results.canvasChildrenAfter = canvas?.children.length || 0;

          } else {
            results.errors.push('No draggable library component found');
          }
        } catch (e) {
          results.errors.push(`Drag/drop test failed: ${e.message}`);
        }

        return results;
      });

      console.log('🎯 Drag/Drop Test Results:');
      console.log(`   Library Component: ${dragDropResult.libraryComponentFound ? '✅' : '❌'}`);
      console.log(`   Drag Started: ${dragDropResult.dragStarted ? '✅' : '❌'}`);
      console.log(`   Drop Completed: ${dragDropResult.dropCompleted ? '✅' : '❌'}`);
      console.log(`   Canvas Children: ${dragDropResult.canvasChildrenBefore} → ${dragDropResult.canvasChildrenAfter}`);

      if (dragDropResult.errors.length > 0) {
        console.log('\n❌ Drag/Drop Errors:');
        dragDropResult.errors.forEach(error => {
          console.log(`   ${error}`);
        });
      }

      if (dragDropResult.canvasChildrenAfter > dragDropResult.canvasChildrenBefore) {
        console.log('\n🎉 SUCCESS: Component was added to canvas!');
      } else {
        console.log('\n⚠️  WARNING: No component was added to canvas');
      }
    }

    console.log('\n🔚 Diagnostics complete. Browser will remain open for manual inspection.');
    console.log('   Press Ctrl+C to exit...\n');

    // Keep browser open for manual inspection
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down...');
      await browser.close();
      devServer.kill();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Diagnostics failed:', error);
    devServer.kill();
    process.exit(1);
  }
}

runDiagnostics().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});