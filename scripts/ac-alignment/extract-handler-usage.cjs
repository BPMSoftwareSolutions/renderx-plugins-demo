#!/usr/bin/env node
/**
 * Extract Handler Usage from Tests
 * Parses test files to find which handlers they import and invoke
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, '.generated', 'ac-alignment', 'handler-usage.json');

function extractHandlerUsage() {
  const result = execSync('npx glob "tests/**/*.spec.ts"', { 
    cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] 
  });
  
  const files = result.split('\n').filter(Boolean);
  const handlerUsage = {};
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
    
    // Extract imports (e.g., import { getCurrentTheme } from '...')
    const importMatches = content.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g);
    const handlers = [];
    
    for (const match of importMatches) {
      const imports = match[1].split(',').map(i => i.trim());
      const modulePath = match[2];
      
      imports.forEach(imp => {
        // Clean up 'type' imports
        const handlerName = imp.replace(/^type\s+/, '');
        handlers.push({
          name: handlerName,
          module: modulePath,
          type: 'import'
        });
      });
    }
    
    // Extract function calls that look like handlers (camelCase functions)
    const callMatches = content.matchAll(/\b([a-z][a-zA-Z0-9]*)\s*\(/g);
    const calls = new Set();
    
    for (const match of callMatches) {
      const funcName = match[1];
      // Filter out common test keywords
      if (!['describe', 'it', 'test', 'expect', 'beforeEach', 'afterEach', 'jest', 'vi'].includes(funcName)) {
        calls.add(funcName);
      }
    }
    
    handlerUsage[file] = {
      imports: handlers,
      calls: Array.from(calls),
      totalHandlers: handlers.length + calls.size
    };
  });
  
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(handlerUsage, null, 2));
  
  console.log(`Analyzed ${files.length} test files`);
  console.log(`Output: ${OUTPUT}`);
  
  return handlerUsage;
}

if (require.main === module) extractHandlerUsage();
module.exports = { extractHandlerUsage };
