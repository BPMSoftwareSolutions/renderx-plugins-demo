#!/usr/bin/env node

/**
 * Audit Test Quality
 *
 * Identifies which tests are doing static validation vs runtime execution
 * Prioritizes tests that need refactoring to execute actual handlers
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const VALIDATION_SUMMARY = path.join(WORKSPACE_ROOT, '.generated/ac-alignment/validation-summary.json');
const AC_REGISTRY_PATH = path.join(WORKSPACE_ROOT, '.generated/acs/renderx-web-orchestration.registry.json');

/**
 * Load data
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
 * Analyze test quality
 */
function analyzeTestQuality(filePath, test, ac) {
  const fullPath = path.join(WORKSPACE_ROOT, filePath);

  if (!fs.existsSync(fullPath)) {
    return { quality: 'missing', issues: ['File not found'] };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  // Extract test content around AC tag
  const acId = test.tag.replace(/^\[AC:/, '').replace(/\]$/, '');
  const acTagPattern = new RegExp(`\\[AC:${acId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`);
  const lines = content.split('\n');

  let testStartLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (acTagPattern.test(lines[i])) {
      testStartLine = i;
      break;
    }
  }

  if (testStartLine === -1) {
    return { quality: 'missing', issues: ['AC tag not found in file'] };
  }

  // Find test boundaries
  let testEndLine = testStartLine;
  let braceCount = 0;
  let foundOpenBrace = false;

  for (let i = testStartLine; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;

    braceCount += opens - closes;
    if (opens > 0) foundOpenBrace = true;

    if (foundOpenBrace && braceCount === 0) {
      testEndLine = i;
      break;
    }
  }

  const testContent = lines.slice(testStartLine, testEndLine + 1).join('\n');

  // Quality indicators
  const issues = [];
  const strengths = [];
  let qualityScore = 0;

  // Check for handler import
  const handlerName = ac.handler?.split('#')[1];
  const handlerPath = ac.handler?.split('#')[0];

  if (handlerName) {
    const importPattern = new RegExp(`import\\s+.*${handlerName}.*from`, 'i');
    const hasImport = content.includes(handlerName) && importPattern.test(content);

    if (hasImport) {
      strengths.push(`Imports actual handler: ${handlerName}`);
      qualityScore += 25;
    } else {
      issues.push(`Missing import for handler: ${handlerName}`);
    }

    // Check if handler is called
    const callPattern = new RegExp(`${handlerName}\\s*\\(`, 'i');
    if (callPattern.test(testContent)) {
      strengths.push(`Calls handler: ${handlerName}()`);
      qualityScore += 25;
    } else {
      issues.push(`Does not call handler: ${handlerName}()`);
    }
  }

  // Check for performance measurement
  if (ac.then?.some(t => t.includes('within') && (t.includes('ms') || t.includes('second')))) {
    if (testContent.includes('performance.now()')) {
      strengths.push('Measures performance with performance.now()');
      qualityScore += 20;
    } else {
      issues.push('Missing performance measurement (AC specifies timing)');
    }
  }

  // Check for localStorage testing
  if (ac.given?.some(g => g.includes('localStorage')) ||
      ac.then?.some(t => t.includes('localStorage')) ||
      ac.and?.some(a => a.includes('localStorage') || a.includes('preference'))) {
    if (testContent.includes('localStorage')) {
      strengths.push('Tests localStorage behavior');
      qualityScore += 15;
    } else {
      issues.push('Missing localStorage testing (AC requires it)');
    }
  }

  // Check for static validation anti-patterns
  if (testContent.includes('.includes(') && testContent.includes('expect')) {
    issues.push('Uses string includes() - may be static validation');
    qualityScore -= 10;
  }

  if (testContent.match(/expect\([^)]*\)\.toBe\(['"].*['"]\)/)) {
    const staticStrings = testContent.match(/expect\([^)]*\)\.toBe\(['"].*['"]\)/g) || [];
    if (staticStrings.length > 2) {
      issues.push(`Multiple static string comparisons (${staticStrings.length})`);
      qualityScore -= 5;
    }
  }

  // Check for mock-only testing
  if (testContent.includes('vi.fn()') && !testContent.includes('toHaveBeenCalled')) {
    issues.push('Creates mocks but may not verify calls');
    qualityScore -= 5;
  }

  // Check for assertions
  const assertionCount = (testContent.match(/expect\(/g) || []).length;
  if (assertionCount === 0) {
    issues.push('No assertions found');
  } else if (assertionCount > 0 && assertionCount < 3) {
    issues.push(`Limited assertions (${assertionCount})`);
  } else {
    strengths.push(`Good assertion coverage (${assertionCount})`);
    qualityScore += 10;
  }

  // Determine quality level
  let quality = 'poor';
  if (qualityScore >= 70) quality = 'excellent';
  else if (qualityScore >= 50) quality = 'good';
  else if (qualityScore >= 30) quality = 'fair';

  return { quality, qualityScore, issues, strengths };
}

/**
 * Main
 */
async function main() {
  console.log('🔍 Auditing Test Quality\n');

  const { validation, registry } = loadData();

  console.log(`📊 Analyzing ${validation.compliantTests.length} compliant tests\n`);

  const byQuality = {
    excellent: [],
    good: [],
    fair: [],
    poor: [],
    missing: []
  };

  const byHandler = new Map();

  for (const test of validation.compliantTests) {
    const acId = test.tag.replace(/\[AC:([^\]]+)\]/, '$1');
    const ac = findAC(registry, acId);

    if (!ac) continue;

    const analysis = analyzeTestQuality(test.file, test, ac);

    byQuality[analysis.quality].push({
      file: test.file,
      tag: test.tag,
      acId,
      handler: ac.handler,
      ...analysis
    });

    // Group by handler
    if (ac.handler) {
      if (!byHandler.has(ac.handler)) {
        byHandler.set(ac.handler, []);
      }
      byHandler.get(ac.handler).push({
        file: test.file,
        tag: test.tag,
        acId,
        ...analysis
      });
    }
  }

  // Report by quality
  console.log('📈 Quality Distribution:\n');
  console.log(`   ⭐⭐⭐ Excellent: ${byQuality.excellent.length} tests`);
  console.log(`   ⭐⭐  Good:      ${byQuality.good.length} tests`);
  console.log(`   ⭐   Fair:      ${byQuality.fair.length} tests`);
  console.log(`   ⚠️   Poor:      ${byQuality.poor.length} tests`);
  console.log(`   ❌  Missing:   ${byQuality.missing.length} tests\n`);

  // Report poor quality tests (priority for refactoring)
  if (byQuality.poor.length > 0) {
    console.log('🚨 Priority Refactoring (Poor Quality):\n');
    for (const test of byQuality.poor.slice(0, 10)) {
      console.log(`   ${path.basename(test.file)}`);
      console.log(`   ${test.tag}`);
      console.log(`   Handler: ${test.handler || 'N/A'}`);
      console.log(`   Score: ${test.qualityScore}`);
      console.log(`   Issues: ${test.issues.slice(0, 3).join('; ')}`);
      console.log('');
    }
  }

  // Report by handler (identify groups)
  console.log('🎯 Tests Grouped by Handler:\n');
  const handlerStats = Array.from(byHandler.entries())
    .map(([handler, tests]) => ({
      handler,
      count: tests.length,
      avgScore: tests.reduce((sum, t) => sum + (t.qualityScore || 0), 0) / tests.length,
      poorCount: tests.filter(t => t.quality === 'poor').length
    }))
    .sort((a, b) => b.poorCount - a.poorCount);

  for (const stat of handlerStats.slice(0, 10)) {
    console.log(`   ${stat.handler}`);
    console.log(`   Tests: ${stat.count} | Avg Score: ${stat.avgScore.toFixed(0)} | Poor: ${stat.poorCount}`);
    console.log('');
  }

  // Write detailed report
  const reportPath = path.join(WORKSPACE_ROOT, '.generated/ac-alignment/quality-audit.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      total: validation.compliantTests.length,
      excellent: byQuality.excellent.length,
      good: byQuality.good.length,
      fair: byQuality.fair.length,
      poor: byQuality.poor.length,
      missing: byQuality.missing.length
    },
    byQuality,
    byHandler: Array.from(byHandler.entries()).map(([handler, tests]) => ({ handler, tests })),
    handlerStats
  }, null, 2));

  console.log(`\n✅ Quality audit complete`);
  console.log(`📄 Detailed report: .generated/ac-alignment/quality-audit.json\n`);

  // Exit code based on poor quality count
  const poorPercentage = (byQuality.poor.length / validation.compliantTests.length) * 100;
  if (poorPercentage > 50) {
    console.log(`⚠️  Warning: ${poorPercentage.toFixed(0)}% of tests are poor quality\n`);
    process.exit(1);
  } else {
    console.log(`✅ Quality acceptable: ${poorPercentage.toFixed(0)}% poor quality\n`);
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
