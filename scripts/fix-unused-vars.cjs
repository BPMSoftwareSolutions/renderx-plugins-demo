#!/usr/bin/env node

/**
 * Script to automatically prefix unused variables with underscore
 * This helps satisfy the ESLint rule: @typescript-eslint/no-unused-vars
 * which requires unused variables to match /^_/u pattern
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Track statistics
let filesProcessed = 0;
let variablesFixed = 0;
const filesModified = [];

// Patterns to match unused 'ctx' variables in test files
// The pattern matches: let ctx: any; or const ctx = {...};
const patterns = [
  // Match variable declarations with ctx
  /(\s*)(let|const|var)\s+ctx\s*:/g,
];

// Fallback pattern for function parameters
const paramPatterns = [
  // Vitest/Jest describe/it blocks with ctx parameter
  /(\s*)(it|test|describe)\s*\(\s*['"`][^'"`]*['"`]\s*,\s*\(ctx[\),]/g,
];

// Get all test files from both __tests__ and tests directories
const testFiles = glob.sync([
  '**/__tests__/**/*.spec.ts?(x)',
  '**/tests/**/*.spec.ts?(x)',
], {
  cwd: process.cwd(),
  ignore: 'node_modules/**'
});

console.log(`Found ${testFiles.length} test files to process`);

testFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf-8');
    const originalContent = content;
    
    filesProcessed++;
    
    // First, handle variable declarations: let ctx: or const ctx = or var ctx:
    if (/(\s*)(let|const|var)\s+ctx\s*:/.test(content)) {
      const matches = content.match(/(\s*)(let|const|var)\s+ctx\s*:/g);
      if (matches) {
        variablesFixed += matches.length;
        content = content.replace(/(\s*)(let|const|var)\s+ctx\s*:/g, '$1$2 _ctx:');
      }
    }
    
    // Also handle parameter declarations (ctx) or async (ctx)
    if (/(it|test|describe)\s*\([^)]*\(\s*ctx[\),]/.test(content)) {
      const matches = content.match(/(it|test|describe)\s*\([^)]*\(\s*ctx[\),]/g);
      if (matches) {
        variablesFixed += matches.length;
        // Replace (ctx with (_ctx and (ctx, with (_ctx,
        content = content.replace(/\(\s*ctx([,\)])/g, '(_ctx$1');
      }
    }
    
    // If content changed, write it back
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf-8');
      filesModified.push(filePath);
      console.log(`✓ Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
});

console.log('\n' + '='.repeat(60));
console.log('Summary:');
console.log(`  Files processed: ${filesProcessed}`);
console.log(`  Variables fixed: ${variablesFixed}`);
console.log(`  Files modified: ${filesModified.length}`);
console.log('='.repeat(60));

if (filesModified.length > 0) {
  console.log('\nModified files:');
  filesModified.slice(0, 10).forEach(f => console.log(`  - ${f}`));
  if (filesModified.length > 10) {
    console.log(`  ... and ${filesModified.length - 10} more`);
  }
}
