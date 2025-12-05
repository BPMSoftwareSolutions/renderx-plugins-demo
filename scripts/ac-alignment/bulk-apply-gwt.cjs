#!/usr/bin/env node

/**
 * Bulk Apply GWT Comments
 *
 * Automatically adds GWT comments to all partial/non-compliant tests
 * Uses AST-like pattern matching to insert comments strategically
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const VALIDATION_SUMMARY = path.join(WORKSPACE_ROOT, '.generated/ac-alignment/validation-summary.json');
const AC_REGISTRY_PATH = path.join(WORKSPACE_ROOT, '.generated/acs/renderx-web-orchestration.registry.json');

function loadData() {
  const validation = JSON.parse(fs.readFileSync(VALIDATION_SUMMARY, 'utf-8'));
  const registry = JSON.parse(fs.readFileSync(AC_REGISTRY_PATH, 'utf-8'));
  return { validation, registry };
}

function findAC(registry, acId) {
  return registry.acs.find(ac => ac.acId === acId);
}

/**
 * Insert GWT comments into test
 */
function insertGWTComments(content, acTag, ac, issues) {
  const lines = content.split('\n');
  let testStartLine = -1;

  // Find test line
  const acTagPattern = new RegExp(`\\[AC:${acTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`);

  for (let i = 0; i < lines.length; i++) {
    if (acTagPattern.test(lines[i])) {
      testStartLine = i;
      break;
    }
  }

  if (testStartLine === -1) return content;

  // Check if already has GWT
  const hasGWT = lines.slice(testStartLine, Math.min(testStartLine + 15, lines.length)).some(line =>
    line.trim().startsWith('// Given:') ||
    line.trim().startsWith('// When:') ||
    line.trim().startsWith('// Then:')
  );

  if (hasGWT) return content; // Already has comments

  // Find opening brace after test declaration
  let braceLineIndex = -1;
  for (let i = testStartLine; i < Math.min(testStartLine + 5, lines.length); i++) {
    if (lines[i].includes('() => {') || lines[i].includes('() =>{') || lines[i].includes('() {')) {
      braceLineIndex = i;
      break;
    }
  }

  if (braceLineIndex === -1) return content;

  // Determine indentation
  const testLine = lines[testStartLine];
  const indent = testLine.match(/^(\s*)/)[1] + '    '; // Test indentation + 4 spaces

  // Build GWT comments
  const gwtComments = [];

  // Given
  if (ac.given && ac.given.length > 0) {
    gwtComments.push(`${indent}// Given: ${ac.given.join(', ')}`);
  }

  // Add performance.now() for performance-related ACs
  const needsPerformance = ac.then?.some(t =>
    t.includes('within') && (t.includes('ms') || t.includes('second'))
  );

  if (needsPerformance) {
    gwtComments.push(`${indent}const startTime = performance.now();`);
  }

  // Insert after opening brace
  lines.splice(braceLineIndex + 1, 0, ...gwtComments);

  // Find first substantial code line (not comments/empty)
  let firstCodeLine = -1;
  for (let i = braceLineIndex + gwtComments.length + 1; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && trimmed !== '{' && trimmed !== '}') {
      firstCodeLine = i;
      break;
    }
  }

  // When
  if (ac.when && ac.when.length > 0 && firstCodeLine !== -1) {
    const whenComment = `${indent}// When: ${ac.when.join(', ')}`;
    // Insert before first code line
    lines.splice(firstCodeLine, 0, whenComment);
    firstCodeLine++; // Adjust index
  }

  // Then - find assertions
  let assertionLine = -1;
  for (let i = (firstCodeLine !== -1 ? firstCodeLine : braceLineIndex + gwtComments.length + 1); i < lines.length; i++) {
    if (lines[i].includes('expect(') || lines[i].includes('assert.')) {
      assertionLine = i;
      break;
    }
  }

  if (ac.then && ac.then.length > 0 && assertionLine !== -1) {
    const thenComment = `${indent}// Then: ${ac.then.join(', ')}`;
    lines.splice(assertionLine, 0, thenComment);
  }

  // And clauses - add at end before closing brace
  if (ac.and && ac.and.length > 0) {
    // Find closing brace of test
    let closingBrace = -1;
    let braceCount = 0;
    for (let i = braceLineIndex; i < lines.length; i++) {
      const opens = (lines[i].match(/\{/g) || []).length;
      const closes = (lines[i].match(/\}/g) || []).length;
      braceCount += opens - closes;

      if (braceCount === 0 && i > braceLineIndex) {
        closingBrace = i;
        break;
      }
    }

    if (closingBrace !== -1) {
      const andComments = ac.and.map(andClause => `${indent}// And: ${andClause}`);

      // Add performance check if needed
      if (needsPerformance) {
        const perfMatch = ac.then.find(t => t.includes('within'))?.match(/(\d+)\s*(ms|second)/);
        if (perfMatch) {
          const time = perfMatch[1];
          const unit = perfMatch[2];
          const ms = unit === 'second' ? parseInt(time) * 1000 : parseInt(time);
          andComments.push(`${indent}const elapsed = performance.now() - startTime;`);
          andComments.push(`${indent}expect(elapsed).toBeLessThan(${ms});`);
        }
      }

      lines.splice(closingBrace, 0, ...andComments);
    }
  }

  return lines.join('\n');
}

/**
 * Process file
 */
function processFile(filePath, tests, registry) {
  const fullPath = path.join(WORKSPACE_ROOT, filePath);

  if (!fs.existsSync(fullPath)) {
    return 0;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  let modified = 0;

  for (const test of tests) {
    const acId = test.tag.replace(/\[AC:([^\]]+)\]/, '$1');
    const ac = findAC(registry, acId);

    if (!ac) continue;

    const newContent = insertGWTComments(content, acId, ac, test.issues);

    if (newContent !== content) {
      content = newContent;
      modified++;
      console.log(`   ✅ ${path.basename(filePath)} → ${acId}`);
    }
  }

  if (modified > 0) {
    fs.writeFileSync(fullPath, content);
  }

  return modified;
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Bulk Apply GWT Comments to Tests\n');

  const { validation, registry } = loadData();

  // Target partial + non-compliant
  const targets = [...validation.partialTests, ...validation.nonCompliantTests];

  console.log(`🎯 Targeting ${targets.length} tests\n`);

  const byFile = new Map();
  for (const test of targets) {
    if (!byFile.has(test.file)) {
      byFile.set(test.file, []);
    }
    byFile.get(test.file).push(test);
  }

  let totalModified = 0;
  let filesModified = 0;

  for (const [file, tests] of byFile) {
    const modified = processFile(file, tests, registry);
    if (modified > 0) {
      totalModified += modified;
      filesModified++;
    }
  }

  console.log(`\n✅ Modified ${totalModified} tests across ${filesModified} files`);
  console.log(`\n📋 Next Steps:`);
  console.log(`   1. Review changes in modified files`);
  console.log(`   2. Run: node scripts/ac-alignment/validate-test-implementations.cjs`);
  console.log(`   3. Check for 50%+ compliance\n`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
