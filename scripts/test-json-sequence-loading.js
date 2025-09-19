#!/usr/bin/env node

/**
 * Isolated test for JSON sequence catalog loading
 * Tests the loadJsonSequenceCatalogs function in isolation
 */

import { chromium } from 'playwright';

async function testJsonSequenceLoading() {
  console.log('🔍 Testing JSON sequence catalog loading in isolation...\n');

  const browser = await chromium.launch({
    headless: false,
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
    console.log('📄 Loading minimal page...');
    await page.goto('http://localhost:5175/');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for the app to initialize
    await page.waitForTimeout(2000);
    
    console.log('\n🧪 Testing JSON sequence loading in isolation...\n');
    
    // Test the loadJsonSequenceCatalogs function directly
    const result = await page.evaluate(async () => {
      try {
        // Create a mock conductor
        const mockConductor = {
          mount: async (seq, handlers, pluginId) => {
            console.log(`✅ Mock mount: ${seq.name} (${seq.id}) -> ${pluginId}`);
            return Promise.resolve();
          },
          logger: {
            warn: (msg) => console.warn(`⚠️ Mock logger: ${msg}`)
          }
        };

        // Test fetching index.json files directly
        console.log('🔍 Testing direct fetch of index.json files...');
        
        const directories = ['library', 'canvas-component', 'control-panel', 'header'];
        const fetchResults = {};
        
        for (const dir of directories) {
          try {
            console.log(`📁 Testing /json-sequences/${dir}/index.json`);
            const response = await fetch(`/json-sequences/${dir}/index.json`);
            if (response.ok) {
              const data = await response.json();
              fetchResults[dir] = {
                success: true,
                sequenceCount: data.sequences?.length || 0,
                sequences: data.sequences?.map(s => s.name) || []
              };
              console.log(`✅ ${dir}: Found ${data.sequences?.length || 0} sequences`);
            } else {
              fetchResults[dir] = {
                success: false,
                status: response.status,
                statusText: response.statusText
              };
              console.log(`❌ ${dir}: HTTP ${response.status} ${response.statusText}`);
            }
          } catch (error) {
            fetchResults[dir] = {
              success: false,
              error: error.message
            };
            console.log(`❌ ${dir}: ${error.message}`);
          }
        }

        // Test module imports directly
        console.log('\n🔍 Testing handler module imports...');
        
        const moduleResults = {};
        const modules = [
          '@renderx-plugins/library',
          '@renderx-plugins/canvas-component',
          '@renderx-plugins/control-panel'
        ];
        
        for (const moduleName of modules) {
          try {
            console.log(`📦 Testing import of ${moduleName}`);
            const mod = await import(moduleName);
            moduleResults[moduleName] = {
              success: true,
              exports: Object.keys(mod),
              hasHandlers: !!mod.handlers,
              handlersKeys: mod.handlers ? Object.keys(mod.handlers) : []
            };
            console.log(`✅ ${moduleName}: ${Object.keys(mod).join(', ')}`);
            if (mod.handlers) {
              console.log(`   Handlers: ${Object.keys(mod.handlers).join(', ')}`);
            }
          } catch (error) {
            moduleResults[moduleName] = {
              success: false,
              error: error.message
            };
            console.log(`❌ ${moduleName}: ${error.message}`);
          }
        }

        // Test the actual loadJsonSequenceCatalogs function if available
        console.log('\n🔍 Testing loadJsonSequenceCatalogs function...');
        
        let catalogResult = null;
        try {
          // Try to access the function from the global scope or import it
          if (window.loadJsonSequenceCatalogs) {
            console.log('📞 Calling loadJsonSequenceCatalogs from global scope');
            await window.loadJsonSequenceCatalogs(mockConductor, ['LibraryPlugin']);
            catalogResult = { success: true, source: 'global' };
          } else {
            console.log('❌ loadJsonSequenceCatalogs not found in global scope');
            catalogResult = { success: false, error: 'Function not available' };
          }
        } catch (error) {
          catalogResult = { success: false, error: error.message };
          console.log(`❌ loadJsonSequenceCatalogs failed: ${error.message}`);
        }

        return {
          fetchResults,
          moduleResults,
          catalogResult
        };
        
      } catch (error) {
        console.error('❌ Test evaluation failed:', error);
        return { error: error.message };
      }
    });
    
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    if (result.error) {
      console.log(`❌ Test failed: ${result.error}`);
    } else {
      console.log('\n📁 Index.json Fetch Results:');
      Object.entries(result.fetchResults).forEach(([dir, res]) => {
        if (res.success) {
          console.log(`  ✅ ${dir}: ${res.sequenceCount} sequences`);
          res.sequences.forEach(seq => console.log(`     - ${seq}`));
        } else {
          console.log(`  ❌ ${dir}: ${res.error || `HTTP ${res.status}`}`);
        }
      });
      
      console.log('\n📦 Module Import Results:');
      Object.entries(result.moduleResults).forEach(([mod, res]) => {
        if (res.success) {
          console.log(`  ✅ ${mod}: exports [${res.exports.join(', ')}]`);
          if (res.hasHandlers) {
            console.log(`     handlers: [${res.handlersKeys.join(', ')}]`);
          }
        } else {
          console.log(`  ❌ ${mod}: ${res.error}`);
        }
      });
      
      console.log('\n🎼 Catalog Loading Result:');
      if (result.catalogResult.success) {
        console.log(`  ✅ loadJsonSequenceCatalogs executed successfully`);
      } else {
        console.log(`  ❌ loadJsonSequenceCatalogs failed: ${result.catalogResult.error}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testJsonSequenceLoading().catch(console.error);
