#!/usr/bin/env node

/**
 * Validation script to ensure plugin packages export a 'handlers' object
 * This ensures JSON sequence catalogs can mount handlers using handlersPath
 */

const fs = require('fs');
const path = require('path');

function validateHandlersExport() {
  console.log('🔍 Validating handlers export...');

  // Check if dist/index.js exists
  const distPath = path.join(process.cwd(), 'dist', 'index.js');
  if (!fs.existsSync(distPath)) {
    console.error('❌ Error: dist/index.js not found. Run `npm run build` first.');
    process.exit(1);
  }

  // Check if dist/index.d.ts exists and contains handlers export
  const dtsPath = path.join(process.cwd(), 'dist', 'index.d.ts');
  if (!fs.existsSync(dtsPath)) {
    console.error('❌ Error: dist/index.d.ts not found. Run `npm run build` first.');
    process.exit(1);
  }

  // Read the TypeScript definitions
  const dtsContent = fs.readFileSync(dtsPath, 'utf-8');
  
  // Check for handlers export in TypeScript definitions
  const hasHandlersInDts = /export\s*{\s*[^}]*handlers[^}]*}/.test(dtsContent) || 
                           /declare\s+const\s+handlers/.test(dtsContent);

  if (!hasHandlersInDts) {
    console.error('❌ Error: No "handlers" export found in TypeScript definitions.');
    console.error('   Plugin packages must export a handlers object for JSON sequence mounting.');
    process.exit(1);
  }

  // Try to dynamically import and check the actual export
  // Convert Windows path to file:// URL for dynamic import
  const distUrl = `file://${distPath.replace(/\\/g, '/')}`;
  import(distUrl)
    .then(module => {
      if (!module.handlers) {
        console.error('❌ Error: No "handlers" export found in built module.');
        console.error('   Plugin packages must export a handlers object for JSON sequence mounting.');
        process.exit(1);
      }

      if (typeof module.handlers !== 'object') {
        console.error('❌ Error: "handlers" export is not an object.');
        console.error('   The handlers export must be an object containing handler functions.');
        process.exit(1);
      }

      const handlerKeys = Object.keys(module.handlers);
      if (handlerKeys.length === 0) {
        console.error('❌ Error: "handlers" export is empty.');
        console.error('   The handlers object must contain at least one handler function.');
        process.exit(1);
      }

      // Check that all handlers are functions
      for (const key of handlerKeys) {
        if (typeof module.handlers[key] !== 'function') {
          console.error(`❌ Error: handlers.${key} is not a function.`);
          console.error('   All handlers must be functions.');
          process.exit(1);
        }
      }

      console.log('✅ Handlers export validation passed!');
      console.log(`   Found handlers: ${handlerKeys.join(', ')}`);
      console.log('   JSON sequence catalogs can now mount handlers using handlersPath.');
    })
    .catch(error => {
      console.error('❌ Error importing built module:', error.message);
      process.exit(1);
    });
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateHandlersExport();
}

module.exports = { validateHandlersExport };
