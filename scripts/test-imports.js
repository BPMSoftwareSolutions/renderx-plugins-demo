#!/usr/bin/env node

/**
 * Test script to check if the plugin packages can be imported in the browser
 */

import { chromium } from 'playwright';

async function testImports() {
  console.log('🔍 Testing plugin package imports...');
  
  const browser = await chromium.launch({ headless: false });
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
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait a bit for the app to initialize
    await page.waitForTimeout(2000);
    
    // Test individual package imports
    const packages = [
      '@renderx-plugins/header',
      '@renderx-plugins/library', 
      '@renderx-plugins/library-component',
      '@renderx-plugins/control-panel'
    ];
    
    console.log('\n🧪 Testing package imports:');
    
    for (const pkg of packages) {
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
            error: error.message
          };
        }
      }, pkg);
      
      if (result.success) {
        console.log(`✅ ${pkg}: SUCCESS`);
        console.log(`   Exports: ${result.exports.join(', ')}`);
        console.log(`   Has register: ${result.hasRegister}`);
      } else {
        console.log(`❌ ${pkg}: FAILED`);
        console.log(`   Error: ${result.error}`);
      }
    }
    
    // Test the static loader system
    console.log('\n🔧 Testing static loader system:');
    const loaderTest = await page.evaluate(async () => {
      try {
        // Try to access the runtime loaders
        const mod = await import('/src/core/conductor/runtime-loaders.ts');
        const loaders = mod.runtimePackageLoaders;
        
        const results = {};
        for (const [pkg, loader] of Object.entries(loaders)) {
          try {
            const result = await loader();
            results[pkg] = {
              success: true,
              exports: Object.keys(result),
              hasRegister: typeof result.register === 'function'
            };
          } catch (error) {
            results[pkg] = {
              success: false,
              error: error.message
            };
          }
        }
        
        return { success: true, results };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (loaderTest.success) {
      console.log('✅ Static loader system accessible');
      for (const [pkg, result] of Object.entries(loaderTest.results)) {
        if (result.success) {
          console.log(`   ✅ ${pkg}: SUCCESS (${result.exports.join(', ')})`);
        } else {
          console.log(`   ❌ ${pkg}: FAILED (${result.error})`);
        }
      }
    } else {
      console.log(`❌ Static loader system failed: ${loaderTest.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test script failed:', error);
  } finally {
    await browser.close();
  }
}

testImports().catch(console.error);
