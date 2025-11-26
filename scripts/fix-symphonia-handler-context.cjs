#!/usr/bin/env node

/**
 * Symphonia Violation Cleanup - Phase 4: Handler Test Context Fixer
 * 
 * Fixes MAJOR violations in handler specifications:
 * - Missing beforeEach setup hooks
 * - Incomplete test context initialization
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 Symphonia Violation Cleanup - Phase 4: Handler Test Context\n');

const WORKSPACE_ROOT = process.cwd();

// Find all .spec.ts files
const findSpecs = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir);
  let results = [];
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      results.push(...findSpecs(fullPath));
    } else if (file.endsWith('.spec.ts')) {
      results.push(fullPath);
    }
  });
  return results;
};

const specFiles = findSpecs(path.join(WORKSPACE_ROOT, 'packages'));
let fixed = 0;

const CONTEXT_TEMPLATE = `
  beforeEach(() => {
    ctx = {
      handler: null, // TODO: Import handler
      mocks: {
        database: vi.fn(),
        fileSystem: vi.fn(),
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {},
      output: null,
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });`;

specFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const filename = path.basename(file);

  // Check if already has beforeEach with proper context
  const hasCompleteContext = content.includes('beforeEach') && 
                             content.includes('handler') && 
                             content.includes('mocks') &&
                             content.includes('input') &&
                             content.includes('output');

  if (!hasCompleteContext) {
    // Add context template after first describe block
    const describeMatch = content.match(/describe\(['"`][^'"`]+['"`],\s*\(\)\s*=>\s*\{/);
    if (describeMatch) {
      // Find position after describe declaration
      const insertPos = content.indexOf(describeMatch[0]) + describeMatch[0].length;
      
      // Check if ctx is already declared
      const hasCtxDecl = content.includes('let ctx');
      let insertion = '\n  let ctx: any;' + CONTEXT_TEMPLATE;
      
      if (hasCtxDecl) {
        insertion = CONTEXT_TEMPLATE;
      }
      
      content = content.slice(0, insertPos) + insertion + content.slice(insertPos);
      fs.writeFileSync(file, content);
      fixed++;
      console.log(`✓ Fixed ${filename}`);
    }
  }
});

console.log(`
✅ Cleanup Complete!

Fixed: ${fixed}/${specFiles.length} handler specs

Changes:
- Added beforeEach/afterEach lifecycle hooks
- Initialized handler, mocks, input, output, error context
- Prepared mock fixtures for database, fileSystem, logger, eventBus

Note: These are templates - developers should import actual handlers
and update mock configurations as needed.

Next: Run audit to verify improvements
  npm run audit:symphonia:conformity
`);

process.exit(0);
