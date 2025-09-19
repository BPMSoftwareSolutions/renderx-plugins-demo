#!/usr/bin/env node

/**
 * Pure Node.js test for sequence files and structure
 * Tests file system access without browser dependencies
 */

import { readdir, readFile, access } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function testSequenceFiles() {
  console.log('🔍 Testing sequence files and structure...\n');
  
  try {
    // Test 1: Check if json-sequences directory exists
    console.log('📁 Testing json-sequences directory structure...');
    const jsonSequencesDir = join(rootDir, 'public', 'json-sequences');
    
    try {
      await access(jsonSequencesDir);
      console.log('✅ json-sequences directory exists');
      
      const dirs = await readdir(jsonSequencesDir, { withFileTypes: true });
      const subdirs = dirs.filter(d => d.isDirectory()).map(d => d.name);
      console.log(`📂 Found subdirectories: ${subdirs.join(', ')}`);
      
      // Test each subdirectory
      for (const subdir of subdirs) {
        console.log(`\n📁 Testing ${subdir}/`);
        const subdirPath = join(jsonSequencesDir, subdir);
        
        // Check for index.json
        const indexPath = join(subdirPath, 'index.json');
        try {
          await access(indexPath);
          const indexContent = await readFile(indexPath, 'utf8');
          const indexData = JSON.parse(indexContent);
          
          console.log(`  ✅ index.json exists`);
          console.log(`  📄 Version: ${indexData.version}`);
          console.log(`  🎼 Sequences: ${indexData.sequences?.length || 0}`);
          
          // List sequence files
          if (indexData.sequences) {
            for (const seq of indexData.sequences) {
              const seqPath = join(subdirPath, seq.file);
              try {
                await access(seqPath);
                const seqContent = await readFile(seqPath, 'utf8');
                const seqData = JSON.parse(seqContent);
                console.log(`    ✅ ${seq.file}: "${seqData.name}" (${seqData.id})`);
                console.log(`       handlersPath: ${seq.handlersPath}`);
                console.log(`       pluginId: ${seqData.pluginId}`);
              } catch (error) {
                console.log(`    ❌ ${seq.file}: ${error.message}`);
              }
            }
          }
        } catch (error) {
          console.log(`  ❌ index.json: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.log('❌ json-sequences directory not found:', error.message);
    }
    
    // Test 2: Check plugin packages
    console.log('\n📦 Testing plugin packages...');
    const packages = [
      '@renderx-plugins/library',
      '@renderx-plugins/library-component', 
      '@renderx-plugins/canvas-component',
      '@renderx-plugins/control-panel'
    ];
    
    for (const pkg of packages) {
      console.log(`\n📦 Testing ${pkg}...`);
      const pkgPath = join(rootDir, 'node_modules', ...pkg.split('/'));
      
      try {
        await access(pkgPath);
        console.log(`  ✅ Package directory exists`);
        
        // Check package.json
        const packageJsonPath = join(pkgPath, 'package.json');
        try {
          const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
          console.log(`  📄 Version: ${packageJson.version}`);
          console.log(`  📄 Main: ${packageJson.main || 'not specified'}`);
          console.log(`  📄 Module: ${packageJson.module || 'not specified'}`);
        } catch (error) {
          console.log(`  ❌ package.json: ${error.message}`);
        }
        
        // Check dist/index.js
        const distIndexPath = join(pkgPath, 'dist', 'index.js');
        try {
          await access(distIndexPath);
          console.log(`  ✅ dist/index.js exists`);
          
          // Read first few lines to check exports
          const distContent = await readFile(distIndexPath, 'utf8');
          const lines = distContent.split('\n').slice(0, 20);
          const exportLine = lines.find(line => line.includes('export'));
          if (exportLine) {
            console.log(`  📤 Exports: ${exportLine.trim()}`);
          }
        } catch (error) {
          console.log(`  ❌ dist/index.js: ${error.message}`);
        }
        
      } catch (error) {
        console.log(`  ❌ Package not found: ${error.message}`);
      }
    }
    
    // Test 3: Check plugin manifest
    console.log('\n📋 Testing plugin manifest...');
    const manifestPath = join(rootDir, '.generated', 'plugin-manifest.json');
    
    try {
      await access(manifestPath);
      const manifestContent = await readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      
      console.log('✅ Plugin manifest exists');
      console.log(`📊 Total plugins: ${manifest.plugins?.length || 0}`);
      
      // Check for specific plugins
      const pluginIds = manifest.plugins?.map(p => p.id) || [];
      const targetPlugins = ['LibraryPlugin', 'LibraryComponentPlugin', 'LibraryComponentDropPlugin'];
      
      for (const pluginId of targetPlugins) {
        if (pluginIds.includes(pluginId)) {
          const plugin = manifest.plugins.find(p => p.id === pluginId);
          console.log(`  ✅ ${pluginId}: runtime module = ${plugin.runtime?.module}`);
        } else {
          console.log(`  ❌ ${pluginId}: not found in manifest`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Plugin manifest: ${error.message}`);
    }
    
    console.log('\n✅ File system tests completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSequenceFiles().catch(console.error);
