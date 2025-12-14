#!/usr/bin/env node
/**
 * Test Discovery & Analysis
 * Discovers all test files and provides breakdown by package
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, '.generated', 'test-analysis.json');

const PATTERNS = [
  'tests/**/*.spec.ts',
  'tests/**/*.spec.tsx',
  'tests/**/*.test.ts',
  'tests/**/*.test.tsx',
  'packages/**/tests/**/*.spec.ts',
  'packages/**/tests/**/*.test.ts',
  '**/__tests__/**/*.spec.ts',
  '**/__tests__/**/*.test.ts'
];

function findTests() {
  const files = new Set();
  PATTERNS.forEach(p => {
    try {
      const result = execSync(`npx glob "${p}"`, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      result.split('\n').filter(Boolean).forEach(f => files.add(f));
    } catch {}
  });
  return Array.from(files);
}

function analyzeTests() {
  const files = findTests();
  const byPackage = {};
  let total = 0;

  files.forEach(f => {
    const pkg = f.startsWith('packages/') ? f.split('/')[1] : 'root';
    if (!byPackage[pkg]) byPackage[pkg] = [];
    byPackage[pkg].push(f);
    total++;
  });

  const summary = {
    totalTests: total,
    packages: Object.keys(byPackage).length,
    breakdown: Object.entries(byPackage).map(([pkg, files]) => ({
      package: pkg,
      count: files.length,
      files
    }))
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(summary, null, 2));
  
  console.log(`Total test files: ${total}`);
  console.log(`Packages: ${Object.keys(byPackage).length}`);
  console.log(`Output: ${OUTPUT}`);
  
  return summary;
}

if (require.main === module) analyzeTests();
module.exports = { analyzeTests };
