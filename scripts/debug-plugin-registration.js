#!/usr/bin/env node

/**
 * Debug script to check plugin registration issues
 * This script will help diagnose why LibraryComponentPlugin and LibraryComponentDropPlugin
 * are not being registered at runtime.
 */

import { chromium } from 'playwright';

async function debugPluginRegistration() {
  console.log('🔍 Starting plugin registration debug...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console messages
  const consoleMessages = [];
  page.on('console', (msg) => {
    consoleMessages.push(msg.text());
    console.log(`[BROWSER] ${msg.text()}`);
  });
  
  // Capture errors
  page.on('pageerror', (error) => {
    console.error(`[PAGE ERROR] ${error.message}`);
  });
  
  try {
    console.log('📄 Loading application...');
    await page.goto('http://localhost:5174/');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait a bit for plugin registration to complete
    await page.waitForTimeout(3000);
    
    // Check what plugins are mounted
    const mountedPlugins = await page.evaluate(() => {
      const conductor = window.RenderX?.conductor;
      if (!conductor || typeof conductor.getMountedPluginIds !== 'function') {
        return { error: 'Conductor not available or getMountedPluginIds not found' };
      }
      return {
        pluginIds: conductor.getMountedPluginIds(),
        conductorAvailable: true
      };
    });
    
    console.log('\n🔎 Plugin Registration Results:');
    if (mountedPlugins.error) {
      console.log(`❌ ${mountedPlugins.error}`);
    } else {
      console.log(`✅ Conductor available: ${mountedPlugins.conductorAvailable}`);
      console.log(`📋 Mounted plugins (${mountedPlugins.pluginIds.length}):`);
      mountedPlugins.pluginIds.forEach(id => {
        const status = id.includes('LibraryComponent') ? '🎯' : '✅';
        console.log(`   ${status} ${id}`);
      });
      
      // Check specifically for our target plugins
      const hasLibraryComponent = mountedPlugins.pluginIds.includes('LibraryComponentPlugin');
      const hasLibraryComponentDrop = mountedPlugins.pluginIds.includes('LibraryComponentDropPlugin');
      
      console.log('\n🎯 Target Plugin Status:');
      console.log(`   LibraryComponentPlugin: ${hasLibraryComponent ? '✅ FOUND' : '❌ MISSING'}`);
      console.log(`   LibraryComponentDropPlugin: ${hasLibraryComponentDrop ? '✅ FOUND' : '❌ MISSING'}`);
    }
    
    // Check for specific error patterns in console
    console.log('\n🚨 Error Analysis:');
    const runtimeErrors = consoleMessages.filter(msg => 
      msg.includes('Failed runtime register') || 
      msg.includes('Plugin not found') ||
      msg.includes('library-component')
    );
    
    if (runtimeErrors.length > 0) {
      console.log('❌ Found runtime registration errors:');
      runtimeErrors.forEach(error => console.log(`   ${error}`));
    } else {
      console.log('✅ No obvious runtime registration errors found');
    }
    
    // Check if the library-component package can be imported
    const importTest = await page.evaluate(async () => {
      try {
        const mod = await import('@renderx-plugins/library-component');
        return {
          success: true,
          hasRegister: typeof mod.register === 'function',
          exports: Object.keys(mod)
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    console.log('\n📦 Package Import Test:');
    if (importTest.success) {
      console.log('✅ @renderx-plugins/library-component imports successfully');
      console.log(`✅ Has register function: ${importTest.hasRegister}`);
      console.log(`📋 Exports: ${importTest.exports.join(', ')}`);
    } else {
      console.log(`❌ Failed to import @renderx-plugins/library-component: ${importTest.error}`);
    }
    
  } catch (error) {
    console.error('❌ Debug script failed:', error);
  } finally {
    await browser.close();
  }
}

debugPluginRegistration().catch(console.error);
