#!/usr/bin/env node

/**
 * Test direct imports in the browser to diagnose the root cause
 */

import { chromium } from 'playwright';

async function testDirectImports() {
  console.log('🔍 Testing direct imports in browser...\n');

  const browser = await chromium.launch({
    headless: false, // Keep visible to see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', (msg) => {
    console.log(`[BROWSER] ${msg.text()}`);
  });
  
  // Capture errors
  page.on('pageerror', (error) => {
    console.error(`[PAGE ERROR] ${error.message}`);
  });
  
  try {
    console.log('📄 Loading application...');
    await page.goto('http://localhost:5175/');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait a bit for the app to initialize
    await page.waitForTimeout(2000);
    
    console.log('\n🧪 Testing direct imports...\n');
    
    // Test each package import directly
    const packages = [
      '@renderx-plugins/library-component',
      '@renderx-plugins/canvas-component', 
      '@renderx-plugins/library',
      '@renderx-plugins/control-panel'
    ];
    
    for (const pkg of packages) {
      console.log(`Testing ${pkg}...`);
      
      const result = await page.evaluate(async (packageName) => {
        try {
          const mod = await import(packageName);
          return {
            success: true,
            exports: Object.keys(mod),
            hasRegister: typeof mod.register === 'function'
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            stack: error.stack
          };
        }
      }, pkg);
      
      if (result.success) {
        console.log(`  ✅ ${pkg}: SUCCESS`);
        console.log(`     Exports: ${result.exports.join(', ')}`);
        console.log(`     Has register: ${result.hasRegister}`);
      } else {
        console.log(`  ❌ ${pkg}: FAILED`);
        console.log(`     Error: ${result.error}`);
      }
      console.log('');
    }
    
    // Test the register function specifically for library-component
    console.log('🎯 Testing library-component register function...\n');
    
    const registerTest = await page.evaluate(async () => {
      try {
        const mod = await import('@renderx-plugins/library-component');
        if (typeof mod.register === 'function') {
          // Create a mock conductor to test the register function
          const mockConductor = {
            mount: (seq, handlers, pluginId) => {
              console.log(`Mock mount called: ${seq.name} (${seq.id}) for plugin ${pluginId}`);
              return Promise.resolve();
            }
          };
          
          await mod.register(mockConductor);
          return { success: true, message: 'Register function executed successfully' };
        } else {
          return { success: false, message: 'No register function found' };
        }
      } catch (error) {
        return { success: false, message: error.message, stack: error.stack };
      }
    });
    
    if (registerTest.success) {
      console.log(`✅ Register function test: ${registerTest.message}`);
    } else {
      console.log(`❌ Register function test: ${registerTest.message}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testDirectImports().catch(console.error);
