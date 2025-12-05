#!/usr/bin/env node

/**
 * AC-to-Test Implementation Validator
 *
 * Audits tagged tests to verify they actually implement their AC specifications.
 * Checks:
 * - Given conditions are properly set up
 * - When actions are executed
 * - Then assertions match AC requirements
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const AC_REGISTRY_PATH = path.join(WORKSPACE_ROOT, '.generated/acs/renderx-web-orchestration.registry.json');
const OUTPUT_DIR = path.join(WORKSPACE_ROOT, '.generated/ac-alignment');
const REPORT_PATH = path.join(WORKSPACE_ROOT, 'docs/generated/renderx-web-orchestration/ac-validation-report.md');

// Tag pattern: [AC:domain:sequence:beat:acIndex]
const AC_TAG_PATTERN = /\[AC:([^:]+):([^:]+):([^:]+):(\d+)\]/g;
const BEAT_TAG_PATTERN = /\[BEAT:([^:]+):([^:]+):([^:]+)\]/g;

/**
 * Load AC registry
 */
function loadACRegistry() {
  if (!fs.existsSync(AC_REGISTRY_PATH)) {
    throw new Error(`AC registry not found at ${AC_REGISTRY_PATH}`);
  }
  return JSON.parse(fs.readFileSync(AC_REGISTRY_PATH, 'utf-8'));
}

/**
 * Find all test files
 */
async function findTestFiles() {
  const patterns = [
    'tests/**/*.spec.ts',
    'tests/**/*.spec.js',
    'tests/**/*.test.ts',
    'tests/**/*.test.js',
    'packages/*/tests/**/*.spec.ts',
    'packages/*/tests/**/*.spec.js'
  ];

  const files = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      cwd: WORKSPACE_ROOT,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });
    files.push(...matches);
  }

  return [...new Set(files)];
}

/**
 * Extract AC tags from test file content
 */
function extractACTags(content) {
  const tags = [];
  let match;

  while ((match = AC_TAG_PATTERN.exec(content)) !== null) {
    tags.push({
      full: match[0],
      domain: match[1],
      sequence: match[2],
      beat: match[3],
      acIndex: parseInt(match[4], 10)
    });
  }

  return tags;
}

/**
 * Find AC in registry by tag components
 */
function findAC(registry, tag) {
  // Registry has flat acs array with acId format: domain:sequence:beatId:acIndex
  const acId = `${tag.domain}:${tag.sequence}:${tag.beat}:${tag.acIndex}`;

  const ac = registry.acs.find(ac => ac.acId === acId);
  return ac || null;
}

/**
 * Analyze test implementation for AC compliance
 */
function analyzeTestImplementation(testContent, ac) {
  const issues = [];
  const strengths = [];

  // Extract Given conditions from AC
  const givenConditions = ac.given || [];
  const whenActions = ac.when || [];
  const thenAssertions = ac.then || [];
  const andClauses = ac.and || [];

  // Check for Given setup in test
  for (const given of givenConditions) {
    const keywords = extractKeywords(given);
    const foundInTest = keywords.some(keyword =>
      testContent.toLowerCase().includes(keyword.toLowerCase())
    );

    if (foundInTest) {
      strengths.push(`Given condition referenced: "${given}"`);
    } else {
      issues.push(`Missing Given setup: "${given}"`);
    }
  }

  // Check for When actions
  for (const when of whenActions) {
    const keywords = extractKeywords(when);
    const foundInTest = keywords.some(keyword =>
      testContent.toLowerCase().includes(keyword.toLowerCase())
    );

    if (foundInTest) {
      strengths.push(`When action referenced: "${when}"`);
    } else {
      issues.push(`Missing When action: "${when}"`);
    }
  }

  // Check for Then assertions (expanded patterns)
  let hasAssertions = false;
  const assertionPatterns = [
    /expect\s*\(/g,
    /assert\./g,
    /should\./g,
    /\.to\./g,
    /\.toBe/g,
    /\.toEqual/g,
    /\.toContain/g,
    /\.toHaveBeenCalled/g,
    /\.toHaveBeenCalledWith/g,
    /\.toMatchObject/g,
    /\.toHaveProperty/g,
    /\.toHaveLength/g,
    /\.toMatch/g,
    /\.toBeTruthy/g,
    /\.toBeFalsy/g,
    /\.toBeDefined/g,
    /\.toBeUndefined/g,
    /\.toBeNull/g,
    /\.toBeGreaterThan/g,
    /\.toBeLessThan/g,
    /\.toBeCloseTo/g,
    /\.toThrow/g,
    /\.rejects/g,
    /\.resolves/g,
    // Cypress assertions
    /cy\.contains/g,
    /cy\.get.*should/g,
    /\.should\(/g,
    // Event/telemetry assertions
    /\.emit/g,
    /\.dispatch/g,
    /\.publish/g,
    /\.toHaveBeenCalledTimes/g,
    // Performance assertions
    /performance\.now/g,
    /Date\.now/g,
    /\.lessThan/g,
    /\.greaterThan/g
  ];

  for (const pattern of assertionPatterns) {
    if (pattern.test(testContent)) {
      hasAssertions = true;
      break;
    }
  }

  if (!hasAssertions) {
    issues.push('No assertions found in test');
  }

  // Check for Then clause keywords in assertions
  for (const then of thenAssertions) {
    const keywords = extractKeywords(then);
    const foundInTest = keywords.some(keyword =>
      testContent.toLowerCase().includes(keyword.toLowerCase())
    );

    if (foundInTest) {
      strengths.push(`Then assertion referenced: "${then}"`);
    } else {
      issues.push(`Missing Then assertion: "${then}"`);
    }
  }

  // Check And clauses
  for (const and of andClauses) {
    const keywords = extractKeywords(and);
    const foundInTest = keywords.some(keyword =>
      testContent.toLowerCase().includes(keyword.toLowerCase())
    );

    if (foundInTest) {
      strengths.push(`And clause referenced: "${and}"`);
    } else {
      issues.push(`Missing And clause: "${and}"`);
    }
  }

  return { issues, strengths };
}

/**
 * Synonym map for domain vocabulary
 */
const SYNONYM_MAP = {
  'logged': ['recorded', 'tracked', 'captured', 'saved'],
  'published': ['emitted', 'dispatched', 'sent', 'fired', 'triggered'],
  'latency': ['duration', 'time', 'elapsed', 'performance'],
  'validates': ['checks', 'verifies', 'ensures', 'confirms'],
  'theme': ['styling', 'appearance', 'color-scheme'],
  'storage': ['localstorage', 'cache', 'persisted'],
  'registry': ['manifest', 'catalog', 'index'],
  'handler': ['function', 'method', 'action'],
  'telemetry': ['analytics', 'metrics', 'instrumentation', 'events'],
  'schema': ['structure', 'format', 'shape', 'type'],
  'error': ['exception', 'failure', 'throw'],
  'initialize': ['init', 'setup', 'prepare', 'load'],
  'configuration': ['config', 'settings', 'options', 'preferences']
};

/**
 * Build expanded synonym set
 */
function buildSynonymSet(word) {
  const normalized = word.toLowerCase().replace(/s$/, ''); // Simple stemming
  const synonyms = new Set([word, normalized]);

  // Add known synonyms
  for (const [key, values] of Object.entries(SYNONYM_MAP)) {
    if (key === normalized || values.includes(normalized)) {
      synonyms.add(key);
      values.forEach(v => synonyms.add(v));
    }
  }

  return synonyms;
}

/**
 * Normalize token for matching
 */
function normalizeToken(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ') // Strip punctuation
    .replace(/s\b/g, '') // Simple plural removal
    .trim();
}

/**
 * Extract meaningful keywords from AC text with synonyms
 */
function extractKeywords(text) {
  // Remove common words and extract significant terms
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'of', 'at', 'by', 'for', 'with', 'about', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once']);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  // Expand with synonyms
  const expandedWords = new Set();
  for (const word of words) {
    const synonyms = buildSynonymSet(word);
    synonyms.forEach(s => expandedWords.add(s));
  }

  return Array.from(expandedWords);
}

/**
 * Calculate compliance score and classification
 * Strict mode: ALL THENs must be met for compliant status
 */
function calculateComplianceScore(analysis, ac) {
  const totalRequirements =
    (ac.given?.length || 0) +
    (ac.when?.length || 0) +
    (ac.then?.length || 0) +
    (ac.and?.length || 0);

  if (totalRequirements === 0) return { score: 100, allThensMet: true };

  const metRequirements = analysis.strengths.length;
  const score = Math.round((metRequirements / totalRequirements) * 100);

  // Check if ALL THEN clauses are met (strict requirement for compliant)
  const thenCount = ac.then?.length || 0;
  const thensMet = analysis.strengths.filter(s => s.startsWith('Then assertion referenced')).length;
  const allThensMet = thenCount === 0 || thensMet === thenCount;

  return { score, allThensMet };
}

/**
 * Analyze a single test file
 */
async function analyzeTestFile(filePath, registry) {
  const fullPath = path.join(WORKSPACE_ROOT, filePath);
  const content = fs.readFileSync(fullPath, 'utf-8');

  const tags = extractACTags(content);
  if (tags.length === 0) {
    return null; // No AC tags in this file
  }

  const results = [];

  for (const tag of tags) {
    const ac = findAC(registry, tag);

    if (!ac) {
      results.push({
        tag: tag.full,
        status: 'invalid',
        message: 'AC not found in registry',
        score: 0
      });
      continue;
    }

    const analysis = analyzeTestImplementation(content, ac);
    const { score, allThensMet } = calculateComplianceScore(analysis, ac);

    // Strict classification: Must have all THENs for compliant status
    let status;
    if (allThensMet && score >= 75) {
      status = 'compliant';
    } else if (score >= 40) {
      status = 'partial';
    } else {
      status = 'non-compliant';
    }

    results.push({
      tag: tag.full,
      ac: ac,
      status: status,
      score: score,
      allThensMet: allThensMet,
      issues: analysis.issues,
      strengths: analysis.strengths
    });
  }

  return {
    file: filePath,
    results
  };
}

/**
 * Generate compliance report with deduplication
 */
function generateReport(validationResults, registry) {
  const compliant = [];
  const partial = [];
  const nonCompliant = [];
  const invalid = [];
  const seen = new Set(); // For deduplication

  for (const fileResult of validationResults) {
    if (!fileResult) continue;

    for (const result of fileResult.results) {
      // Deduplicate by file + tag
      const key = `${fileResult.file}::${result.tag}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const entry = { file: fileResult.file, ...result };

      if (result.status === 'compliant') {
        compliant.push(entry);
      } else if (result.status === 'partial') {
        partial.push(entry);
      } else if (result.status === 'non-compliant') {
        nonCompliant.push(entry);
      } else {
        invalid.push(entry);
      }
    }
  }

  const totalTagged = compliant.length + partial.length + nonCompliant.length + invalid.length;
  const complianceRate = totalTagged > 0
    ? Math.round((compliant.length / totalTagged) * 100)
    : 0;

  let markdown = `# AC-to-Test Implementation Validation Report\n\n`;
  markdown += `Domain: renderx-web-orchestration\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- Total tagged tests: ${totalTagged}\n`;
  markdown += `- Compliant (≥75% score): ${compliant.length}\n`;
  markdown += `- Partial (40-74% score): ${partial.length}\n`;
  markdown += `- Non-compliant (<40% score): ${nonCompliant.length}\n`;
  markdown += `- Invalid tags: ${invalid.length}\n`;
  markdown += `- Compliance rate: ${complianceRate}%\n\n`;

  markdown += `## Compliance Categories\n\n`;
  markdown += `### ✅ Compliant Tests (${compliant.length})\n\n`;
  if (compliant.length > 0) {
    for (const entry of compliant) {
      markdown += `- **${entry.file}** → ${entry.tag} (${entry.score}%)\n`;
      if (entry.strengths?.length > 0) {
        markdown += `  - ${entry.strengths.join('\n  - ')}\n`;
      }
      markdown += `\n`;
    }
  } else {
    markdown += `No fully compliant tests found.\n\n`;
  }

  markdown += `### ⚠️ Partial Compliance (${partial.length})\n\n`;
  if (partial.length > 0) {
    for (const entry of partial) {
      markdown += `- **${entry.file}** → ${entry.tag} (${entry.score}%)\n`;
      if (entry.issues?.length > 0) {
        markdown += `  - Issues:\n`;
        markdown += `    - ${entry.issues.join('\n    - ')}\n`;
      }
      markdown += `\n`;
    }
  } else {
    markdown += `No partially compliant tests.\n\n`;
  }

  markdown += `### ❌ Non-Compliant Tests (${nonCompliant.length})\n\n`;
  if (nonCompliant.length > 0) {
    for (const entry of nonCompliant) {
      markdown += `- **${entry.file}** → ${entry.tag} (${entry.score}%)\n`;
      if (entry.issues?.length > 0) {
        markdown += `  - Issues:\n`;
        markdown += `    - ${entry.issues.join('\n    - ')}\n`;
      }
      markdown += `\n`;
    }
  } else {
    markdown += `No non-compliant tests.\n\n`;
  }

  markdown += `### 🚫 Invalid Tags (${invalid.length})\n\n`;
  if (invalid.length > 0) {
    for (const entry of invalid) {
      markdown += `- **${entry.file}** → ${entry.tag}: ${entry.message}\n`;
    }
    markdown += `\n`;
  } else {
    markdown += `No invalid tags.\n\n`;
  }

  // Top Offenders: ACs with most non-compliant tests
  markdown += `## 🎯 Top Offenders (ACs with Most Non-Compliant Tests)\n\n`;
  const acCounts = new Map();
  for (const entry of [...nonCompliant, ...partial]) {
    const acId = entry.tag.replace(/\[AC:([^\]]+)\]/, '$1');
    acCounts.set(acId, (acCounts.get(acId) || 0) + 1);
  }
  const topOffenders = Array.from(acCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (topOffenders.length > 0) {
    for (const [acId, count] of topOffenders) {
      markdown += `- **${acId}**: ${count} non-compliant/partial tests\n`;
    }
    markdown += `\n`;
  } else {
    markdown += `No recurring issues found.\n\n`;
  }

  // Quick Wins: Tests missing exactly one requirement
  markdown += `## ⚡ Quick Wins (Tests Missing 1-2 Requirements)\n\n`;
  const quickWins = [...partial, ...nonCompliant].filter(entry =>
    entry.issues && entry.issues.length <= 2
  ).slice(0, 15);

  if (quickWins.length > 0) {
    for (const entry of quickWins) {
      markdown += `- **${entry.file}** → ${entry.tag} (${entry.score}%)\n`;
      markdown += `  - Missing: ${entry.issues.join('; ')}\n`;
    }
    markdown += `\n`;
  } else {
    markdown += `No quick wins identified.\n\n`;
  }

  markdown += `## Next Steps\n\n`;
  markdown += `1. **Quick Wins**: Fix tests missing 1-2 requirements (${quickWins.length} tests)\n`;
  markdown += `2. **Top Offenders**: Focus on ACs with multiple non-compliant tests\n`;
  markdown += `3. **Partial Compliance**: Address ${partial.length} partial tests\n`;
  markdown += `4. **Generate New Tests**: Cover ${registry.totalACs - totalTagged} uncovered ACs\n`;

  return {
    markdown,
    summary: {
      totalTagged,
      compliant: compliant.length,
      partial: partial.length,
      nonCompliant: nonCompliant.length,
      invalid: invalid.length,
      complianceRate,
      compliantTests: compliant,
      partialTests: partial,
      nonCompliantTests: nonCompliant,
      invalidTests: invalid
    }
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 AC-to-Test Implementation Validator\n');

  // Load AC registry
  console.log('📖 Loading AC registry...');
  const registry = loadACRegistry();
  console.log(`   Found ${registry.totalACs} ACs across ${registry.beats} beats\n`);

  // Find test files
  console.log('🔎 Finding test files...');
  const testFiles = await findTestFiles();
  console.log(`   Found ${testFiles.length} test files\n`);

  // Analyze each test file
  console.log('🧪 Analyzing tagged tests...');
  const validationResults = [];
  let analyzed = 0;

  for (const file of testFiles) {
    const result = await analyzeTestFile(file, registry);
    if (result) {
      validationResults.push(result);
      analyzed++;
      process.stdout.write(`\r   Analyzed ${analyzed} tagged files...`);
    }
  }
  console.log(`\n   Analyzed ${analyzed} files with AC tags\n`);

  // Generate report
  console.log('📊 Generating compliance report...');
  const { markdown, summary } = generateReport(validationResults, registry);

  // Write reports
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, markdown);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'validation-summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log(`   ✅ Report written to ${REPORT_PATH}`);
  console.log(`   ✅ Summary written to ${OUTPUT_DIR}/validation-summary.json\n`);

  // Print summary
  console.log('📈 Validation Summary:');
  console.log(`   Total tagged tests: ${summary.totalTagged}`);
  console.log(`   ✅ Compliant: ${summary.compliant} (${Math.round(summary.compliant/summary.totalTagged*100)}%)`);
  console.log(`   ⚠️  Partial: ${summary.partial} (${Math.round(summary.partial/summary.totalTagged*100)}%)`);
  console.log(`   ❌ Non-compliant: ${summary.nonCompliant} (${Math.round(summary.nonCompliant/summary.totalTagged*100)}%)`);
  console.log(`   🚫 Invalid: ${summary.invalid}`);
  console.log(`   📊 Compliance rate: ${summary.complianceRate}%\n`);

  // Adjusted gate: 25% threshold during normalization phase
  const COMPLIANCE_THRESHOLD = 25;

  if (summary.complianceRate < COMPLIANCE_THRESHOLD) {
    console.log(`⚠️  Warning: Compliance rate is below ${COMPLIANCE_THRESHOLD}%. Many tagged tests do not properly implement their ACs.\n`);
    console.log(`   Current: ${summary.complianceRate}% | Target: ${COMPLIANCE_THRESHOLD}%+\n`);
    process.exit(1);
  }

  console.log(`✅ Validation complete! Compliance rate (${summary.complianceRate}%) meets threshold (${COMPLIANCE_THRESHOLD}%).\n`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
