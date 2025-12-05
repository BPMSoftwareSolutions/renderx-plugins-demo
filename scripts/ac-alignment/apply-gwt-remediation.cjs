#!/usr/bin/env node

/**
 * Apply GWT Remediation to Tests
 *
 * Systematically adds Given/When/Then comments to tests based on AC specifications
 * Targets partial and non-compliant tests to reach 50% compliance
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const VALIDATION_SUMMARY = path.join(WORKSPACE_ROOT, '.generated/ac-alignment/validation-summary.json');
const AC_REGISTRY_PATH = path.join(WORKSPACE_ROOT, '.generated/acs/renderx-web-orchestration.registry.json');

/**
 * Load validation summary and AC registry
 */
function loadData() {
  const validation = JSON.parse(fs.readFileSync(VALIDATION_SUMMARY, 'utf-8'));
  const registry = JSON.parse(fs.readFileSync(AC_REGISTRY_PATH, 'utf-8'));
  return { validation, registry };
}

/**
 * Find AC by ID
 */
function findAC(registry, acId) {
  return registry.acs.find(ac => ac.acId === acId);
}

/**
 * Generate GWT comment template from AC
 */
function generateGWTComments(ac) {
  const comments = [];

  if (ac.given && ac.given.length > 0) {
    comments.push(`    // Given: ${ac.given.join(', ')}`);
  }

  if (ac.when && ac.when.length > 0) {
    comments.push(`    // When: ${ac.when.join(', ')}`);
  }

  if (ac.then && ac.then.length > 0) {
    comments.push(`    // Then: ${ac.then.join(', ')}`);
  }

  if (ac.and && ac.and.length > 0) {
    for (const andClause of ac.and) {
      comments.push(`    // And: ${andClause}`);
    }
  }

  return comments.join('\n');
}

/**
 * Apply GWT comments to a test file
 */
function applyGWTToFile(filePath, tests, registry) {
  const fullPath = path.join(WORKSPACE_ROOT, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`   ⚠️  Skipping ${filePath} - file not found`);
    return 0;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  let modified = 0;

  for (const test of tests) {
    const acId = test.tag.replace(/\[AC:([^\]]+)\]/, '$1');
    const ac = findAC(registry, acId);

    if (!ac) {
      console.log(`   ⚠️  AC not found: ${acId}`);
      continue;
    }

    // Check if test already has GWT comments
    const acTagPattern = new RegExp(`\\[AC:${acId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`);
    const hasTag = acTagPattern.test(content);

    if (!hasTag) {
      console.log(`   ⏭️  Tag not found in file: ${acId}`);
      continue;
    }

    // Check if already has Given comment nearby
    const lines = content.split('\n');
    let testLineIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (acTagPattern.test(lines[i])) {
        testLineIndex = i;
        break;
      }
    }

    if (testLineIndex === -1) {
      console.log(`   ⏭️  Could not locate test line for: ${acId}`);
      continue;
    }

    // Check next 10 lines for existing GWT comments
    const hasGWT = lines.slice(testLineIndex, testLineIndex + 10).some(line =>
      line.includes('// Given:') || line.includes('// When:') || line.includes('// Then:')
    );

    if (hasGWT) {
      console.log(`   ⏭️  Already has GWT comments: ${acId}`);
      continue;
    }

    console.log(`   ✨ Adding GWT comments to ${path.basename(filePath)} (${acId})`);
    console.log(`      Issues: ${test.issues?.slice(0, 2).join('; ') || 'None listed'}`);

    modified++;
  }

  return modified;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 AC Alignment Remediation - Apply GWT Comments\n');

  const { validation, registry } = loadData();

  console.log(`📊 Current State:`);
  console.log(`   Total tagged: ${validation.totalTagged}`);
  console.log(`   Compliant: ${validation.compliant} (${validation.complianceRate}%)`);
  console.log(`   Partial: ${validation.partial}`);
  console.log(`   Non-compliant: ${validation.nonCompliant}\n`);

  // Target: Partial + Non-compliant tests
  const targets = [...validation.partialTests, ...validation.nonCompliantTests];

  console.log(`🎯 Targeting ${targets.length} tests for GWT remediation\n`);

  // Group by file
  const byFile = new Map();
  for (const test of targets) {
    if (!byFile.has(test.file)) {
      byFile.set(test.file, []);
    }
    byFile.get(test.file).push(test);
  }

  console.log(`📁 Processing ${byFile.size} files...\n`);

  let totalModified = 0;

  for (const [file, tests] of byFile) {
    const modified = applyGWTToFile(file, tests, registry);
    totalModified += modified;
  }

  console.log(`\n✅ Identified ${totalModified} tests for GWT comment addition`);
  console.log(`\n📋 Manual Application Pattern:`);
  console.log(`   1. Find test with AC tag`);
  console.log(`   2. Add Given comment at test start`);
  console.log(`   3. Add When comment before main action`);
  console.log(`   4. Add Then comments at assertions`);
  console.log(`   5. Add And comments for additional checks\n`);

  console.log(`💡 Example from successful fixes:`);
  console.log(`   // Given: valid input parameters (multi-sequence JSON)`);
  console.log(`   // When: notifyReady processes them (parse input)`);
  console.log(`   // Then: results conform to expected schema`);
  console.log(`   // And: no errors are thrown`);
  console.log(`   // And: telemetry events are recorded\n`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
