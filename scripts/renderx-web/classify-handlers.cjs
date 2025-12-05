#!/usr/bin/env node

/**
 * Classify Handlers from Code Analysis
 *
 * Categorizes 529 handlers by type:
 * - Orchestration: User-facing feature handlers (documented in sequences)
 * - Domain Logic: Business rules and transformations
 * - Infrastructure: DOM utilities, event binding, state management
 * - Test/Mock: Test infrastructure and stubs
 * - Generated: Code-generated or dynamic handlers
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const CODE_ANALYSIS_REPORT = path.join(WORKSPACE_ROOT, 'docs/generated/renderx-web/renderx-web-orchestration-CODE-ANALYSIS-REPORT.md');
const CANONICAL_MANIFEST = path.join(WORKSPACE_ROOT, '.generated/analysis/renderx-web-orchestration/canonical-sequences.manifest.json');
const AC_REGISTRY = path.join(WORKSPACE_ROOT, '.generated/acs/renderx-web-orchestration.registry.json');

/**
 * Load canonical handlers (documented in sequences)
 */
function loadCanonicalHandlers() {
  if (!fs.existsSync(CANONICAL_MANIFEST)) {
    return new Set();
  }

  const manifest = JSON.parse(fs.readFileSync(CANONICAL_MANIFEST, 'utf-8'));
  const handlerCount = JSON.parse(fs.readFileSync(
    path.join(WORKSPACE_ROOT, '.generated/analysis/renderx-web-orchestration/handler-count.json'),
    'utf-8'
  ));

  return new Set(handlerCount.handlers.allHandlers);
}

/**
 * Load handlers with acceptance criteria
 */
function loadACHandlers() {
  if (!fs.existsSync(AC_REGISTRY)) {
    return new Set();
  }

  const registry = JSON.parse(fs.readFileSync(AC_REGISTRY, 'utf-8'));
  const handlers = new Set();

  for (const ac of registry.acs) {
    if (ac.handler) {
      // Extract handler name from full path (e.g., "header/ui#getCurrentTheme" -> "getCurrentTheme")
      const handlerName = ac.handler.split('#')[1] || ac.handler;
      handlers.add(handlerName);
    }
  }

  return handlers;
}

/**
 * Parse code analysis report to extract handler details
 */
function parseCodeAnalysisReport() {
  if (!fs.existsSync(CODE_ANALYSIS_REPORT)) {
    console.error('❌ Code analysis report not found');
    process.exit(1);
  }

  const content = fs.readFileSync(CODE_ANALYSIS_REPORT, 'utf-8');
  const handlers = [];

  // Extract handler lines from beat portfolio sections
  const beatPortfolioPattern = /║\s+(\d+\.\d+)\s+M(\d+)\s+(\S+)\s+(\d+)\s+(\S+)\s+(\d+)%\s+(\S+)\s+(\S+)/g;

  let match;
  while ((match = beatPortfolioPattern.exec(content)) !== null) {
    const [, beat, movement, name, loc, size, coverage, risk, baton] = match;

    handlers.push({
      beat: beat,
      movement: parseInt(movement),
      name: name,
      loc: parseInt(loc),
      size: size,
      coverage: parseInt(coverage),
      risk: risk,
      baton: baton
    });
  }

  return handlers;
}

/**
 * Classify handler by pattern matching
 */
function classifyHandler(handler, canonicalHandlers, acHandlers) {
  const name = handler.name;

  // Category 1: Orchestration (documented in sequences)
  if (canonicalHandlers.has(name)) {
    return 'orchestration';
  }

  // Category 2: Has acceptance criteria (but not in sequences)
  if (acHandlers.has(name)) {
    return 'orchestration'; // Treat as orchestration if has ACs
  }

  // Category 3: Test/Mock patterns
  const testPatterns = [
    /^mock/i,
    /^stub/i,
    /^fake/i,
    /Test$/,
    /Spec$/,
    /Mock$/,
    /Stub$/
  ];

  if (testPatterns.some(pattern => pattern.test(name))) {
    return 'test';
  }

  // Category 4: Infrastructure patterns (DOM, events, utilities)
  const infraPatterns = [
    /^create.*Element/i,
    /^get.*Or(Throw|Create)/i,
    /^append/i,
    /^inject/i,
    /^apply.*Style/i,
    /^apply.*Class/i,
    /^attach/i,
    /^bind/i,
    /^register/i,
    /^cleanup/i,
    /^derive/i,
    /Utils?$/,
    /Helper$/
  ];

  if (infraPatterns.some(pattern => pattern.test(name))) {
    return 'infrastructure';
  }

  // Category 5: Generated/Dynamic patterns
  const generatedPatterns = [
    /^compile/i,
    /^generate/i,
    /^build/i,
    /Factory$/,
    /Generator$/
  ];

  if (generatedPatterns.some(pattern => pattern.test(name))) {
    return 'generated';
  }

  // Category 6: Domain Logic (transformations, validations, business rules)
  const domainPatterns = [
    /^transform/i,
    /^convert/i,
    /^validate/i,
    /^serialize/i,
    /^deserialize/i,
    /^parse/i,
    /^format/i,
    /^resolve/i,
    /^notify/i,
    /^publish/i,
    /^route/i,
    /^forward/i
  ];

  if (domainPatterns.some(pattern => pattern.test(name))) {
    return 'domain';
  }

  // Default: Domain logic
  return 'domain';
}

/**
 * Identify potential duplicates by name similarity
 */
function identifyDuplicatePatterns(handlers) {
  const patterns = new Map();

  for (const handler of handlers) {
    // Extract base pattern (remove suffixes like "2", "Alt", "New", etc.)
    const baseName = handler.name
      .replace(/\d+$/, '')
      .replace(/Alt$/, '')
      .replace(/New$/, '')
      .replace(/V\d+$/, '')
      .replace(/Legacy$/, '')
      .toLowerCase();

    if (!patterns.has(baseName)) {
      patterns.set(baseName, []);
    }
    patterns.get(baseName).push(handler);
  }

  // Find patterns with multiple handlers (potential duplicates)
  const duplicates = [];
  for (const [baseName, handlers] of patterns.entries()) {
    if (handlers.length > 1) {
      duplicates.push({
        pattern: baseName,
        count: handlers.length,
        handlers: handlers.map(h => h.name),
        totalLoc: handlers.reduce((sum, h) => sum + h.loc, 0),
        avgCoverage: handlers.reduce((sum, h) => sum + h.coverage, 0) / handlers.length
      });
    }
  }

  return duplicates.sort((a, b) => b.count - a.count);
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Classifying 529 Handlers from Code Analysis\n');

  // Load reference data
  const canonicalHandlers = loadCanonicalHandlers();
  const acHandlers = loadACHandlers();

  console.log(`📊 Reference Data:`);
  console.log(`   Canonical handlers: ${canonicalHandlers.size}`);
  console.log(`   Handlers with ACs: ${acHandlers.size}\n`);

  // Parse code analysis report
  const handlers = parseCodeAnalysisReport();

  console.log(`📈 Parsed ${handlers.length} handlers from code analysis report\n`);

  // Classify handlers
  const classification = {
    orchestration: [],
    domain: [],
    infrastructure: [],
    test: [],
    generated: []
  };

  for (const handler of handlers) {
    const category = classifyHandler(handler, canonicalHandlers, acHandlers);
    classification[category].push(handler);
  }

  // Display classification summary
  console.log('📊 Handler Classification:\n');
  console.log(`   🎭 Orchestration:   ${classification.orchestration.length} (${(classification.orchestration.length / handlers.length * 100).toFixed(1)}%)`);
  console.log(`   🔧 Domain Logic:    ${classification.domain.length} (${(classification.domain.length / handlers.length * 100).toFixed(1)}%)`);
  console.log(`   🏗️  Infrastructure:  ${classification.infrastructure.length} (${(classification.infrastructure.length / handlers.length * 100).toFixed(1)}%)`);
  console.log(`   🧪 Test/Mock:       ${classification.test.length} (${(classification.test.length / handlers.length * 100).toFixed(1)}%)`);
  console.log(`   ⚙️  Generated:       ${classification.generated.length} (${(classification.generated.length / handlers.length * 100).toFixed(1)}%)\n`);

  // Identify duplicate patterns
  console.log('🔍 Analyzing Duplication Patterns...\n');
  const duplicates = identifyDuplicatePatterns(handlers);

  const totalDuplicates = duplicates.reduce((sum, d) => sum + (d.count - 1), 0);
  const uniquePatterns = handlers.length - totalDuplicates;

  console.log(`📈 Duplication Analysis:`);
  console.log(`   Total handlers: ${handlers.length}`);
  console.log(`   Unique patterns: ${uniquePatterns}`);
  console.log(`   Duplicate instances: ${totalDuplicates}`);
  console.log(`   Duplication rate: ${(totalDuplicates / handlers.length * 100).toFixed(1)}%\n`);

  console.log(`🔥 Top 10 Duplication Patterns:\n`);
  for (const dup of duplicates.slice(0, 10)) {
    console.log(`   ${dup.pattern}: ${dup.count} variants, ${dup.totalLoc} LOC, ${dup.avgCoverage.toFixed(0)}% avg coverage`);
    console.log(`      Variants: ${dup.handlers.join(', ')}`);
    console.log('');
  }

  // Calculate refined handler count
  const refinedCount = uniquePatterns;
  console.log(`✨ Refined Handler Count: ${refinedCount} unique patterns\n`);

  // Risk analysis by category
  console.log('⚠️  Risk Analysis by Category:\n');
  for (const [category, categoryHandlers] of Object.entries(classification)) {
    const highRisk = categoryHandlers.filter(h => h.risk === 'HIGH').length;
    const medRisk = categoryHandlers.filter(h => h.risk === 'MED').length;
    const lowRisk = categoryHandlers.filter(h => h.risk === 'LOW').length;
    const avgCoverage = categoryHandlers.reduce((sum, h) => sum + h.coverage, 0) / categoryHandlers.length;

    console.log(`   ${category.toUpperCase()}:`);
    console.log(`      Total: ${categoryHandlers.length} | Avg Coverage: ${avgCoverage.toFixed(1)}%`);
    console.log(`      Risk: HIGH=${highRisk}, MED=${medRisk}, LOW=${lowRisk}\n`);
  }

  // Write detailed report
  const reportPath = path.join(WORKSPACE_ROOT, '.generated/analysis/renderx-web-orchestration/handler-classification.json');
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: handlers.length,
      uniquePatterns: uniquePatterns,
      duplicates: totalDuplicates,
      duplicationRate: (totalDuplicates / handlers.length * 100).toFixed(1) + '%'
    },
    classification: {
      orchestration: classification.orchestration.length,
      domain: classification.domain.length,
      infrastructure: classification.infrastructure.length,
      test: classification.test.length,
      generated: classification.generated.length
    },
    handlers: {
      orchestration: classification.orchestration,
      domain: classification.domain,
      infrastructure: classification.infrastructure,
      test: classification.test,
      generated: classification.generated
    },
    duplicatePatterns: duplicates,
    riskByCategory: Object.fromEntries(
      Object.entries(classification).map(([category, categoryHandlers]) => [
        category,
        {
          total: categoryHandlers.length,
          high: categoryHandlers.filter(h => h.risk === 'HIGH').length,
          medium: categoryHandlers.filter(h => h.risk === 'MED').length,
          low: categoryHandlers.filter(h => h.risk === 'LOW').length,
          avgCoverage: (categoryHandlers.reduce((sum, h) => sum + h.coverage, 0) / categoryHandlers.length).toFixed(1)
        }
      ])
    )
  };

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`✅ Classification report written: ${reportPath}\n`);

  // Exit with warning if high duplication
  const duplicationPercent = (totalDuplicates / handlers.length * 100);
  if (duplicationPercent > 50) {
    console.log(`⚠️  Warning: ${duplicationPercent.toFixed(1)}% duplication detected\n`);
    process.exit(1);
  }
}

main();
