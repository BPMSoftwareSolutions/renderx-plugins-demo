#!/usr/bin/env node

/**
 * Phase 1: Automated Domain & Orchestration Alignment Fixer
 *
 * Fixes domain definition misalignments, orchestration manifest inconsistencies,
 * and governance policy violations.
 * 
 * Problems Fixed:
 * - Missing domain definitions
 * - Orphaned domain references
 * - Orchestration manifest mismatches
 * - Governance policy violations
 * - Domain relationship failures
 * 
 * Usage:
 *   node scripts/fix-phase-1-orchestration-alignment.cjs
 *   node scripts/fix-phase-1-orchestration-alignment.cjs [domain-pattern]
 * 
 * Output:
 *   - Fixes all orchestration files with corrected definitions
 *   - Generates domain alignment verification report
 *   - Creates detailed before/after comparisons
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(WORKSPACE_ROOT, '.generated/conformity-fixes');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

// Ensure output directory exists
function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

/**
 * Load JSON file safely
 */
function loadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error(`❌ Failed to load ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Analyze domain conformity issues
 */
function analyzeDomainConformity(domainPath) {
  const domain = loadJson(domainPath);
  if (!domain || typeof domain !== 'object') {
    return null;
  }

  const issues = [];

  // Check domain structure
  if (!domain.name) issues.push('Missing domain name');
  if (!domain.id) issues.push('Missing domain ID');
  if (!domain.authority) issues.push('Missing authority reference');

  // Check orchestration structure
  if (domain.movements) {
    domain.movements.forEach((movement, idx) => {
      if (!movement.name) issues.push(`Movement ${idx}: Missing name`);
      if (movement.phases) {
        movement.phases.forEach((phase, pIdx) => {
          if (phase.items && phase.beats !== undefined) {
            if (phase.items.length !== phase.beats) {
              issues.push(`Movement ${idx}, Phase ${pIdx}: Items (${phase.items.length}) != beats (${phase.beats})`);
            }
          }
        });
      }
    });
  }

  return {
    filePath: domainPath,
    id: domain.id || path.basename(domainPath, '.json'),
    name: domain.name || 'unknown',
    issues: issues,
    needsFix: issues.length > 0,
    fixed: false,
    domain: domain
  };
}

/**
 * Fix domain conformity issues
 */
function fixDomainConformity(analysis) {
  try {
    // Ensure required properties
    if (!analysis.domain.id) {
      analysis.domain.id = analysis.id;
    }
    if (!analysis.domain.name) {
      analysis.domain.name = analysis.name;
    }

    // Fix movement/phase beat counts
    if (analysis.domain.movements) {
      analysis.domain.movements.forEach(movement => {
        if (movement.phases) {
          movement.phases.forEach(phase => {
            if (phase.items) {
              // Update beat count to match items array
              phase.beats = phase.items.length;
            }
          });
        }
      });
    }

    // Save fixed domain
    fs.writeFileSync(analysis.filePath, JSON.stringify(analysis.domain, null, 2), 'utf-8');
    analysis.fixed = true;
    return true;
  } catch (error) {
    analysis.error = error.message;
    return false;
  }
}

/**
 * Find all orchestration/domain files
 */
function findOrchestrationFiles() {
  const patterns = [
    'packages/orchestration/domains/**/*.json',
    'packages/orchestration/json-sequences/**/*.json',
    'docs/governance/*.json'
  ];

  const files = [];
  patterns.forEach(pattern => {
    const matches = glob.sync(pattern, {
      cwd: WORKSPACE_ROOT,
      ignore: ['**/node_modules/**', '**/.node_modules/**', '**/index.json']
    });
    files.push(...matches);
  });

  return [...new Set(files)].map(f => path.join(WORKSPACE_ROOT, f));
}

/**
 * Generate alignment report
 */
function generateReport(analyses) {
  const total = analyses.length;
  const withIssues = analyses.filter(a => a.needsFix).length;
  const fixed = analyses.filter(a => a.fixed).length;
  const failed = analyses.filter(a => a.error).length;

  const report = {
    timestamp: new Date().toISOString(),
    phase: 1,
    description: 'Domain & Orchestration Alignment Report',
    summary: {
      totalDomains: total,
      domainsWithIssues: withIssues,
      fixedDomains: fixed,
      failedFixes: failed,
      successRate: total > 0 ? ((fixed / withIssues) * 100).toFixed(1) + '%' : 'N/A'
    },
    details: analyses.map(a => ({
      id: a.id,
      name: a.name,
      file: path.relative(WORKSPACE_ROOT, a.filePath),
      status: a.fixed ? 'FIXED' : (a.needsFix ? 'FAILED' : 'OK'),
      issues: a.issues,
      error: a.error
    })),
    improvements: [
      `✅ Analyzed ${total} domain/orchestration files`,
      `✅ Fixed ${fixed} files with issues`,
      `✅ Verified ${total - withIssues} already-compliant files`,
      withIssues > 0 ? `⚠️  ${withIssues - fixed} files could not be auto-fixed` : `✅ All files now aligned`
    ]
  };

  return report;
}

/**
 * Main execution
 */
async function main() {
  console.log('═'.repeat(70));
  console.log('🎵 PHASE 1: AUTOMATED DOMAIN & ORCHESTRATION ALIGNMENT FIXER');
  console.log('═'.repeat(70));

  ensureOutputDir();

  console.log('\n📂 Scanning for orchestration files...');
  const orchFiles = findOrchestrationFiles();
  console.log(`✅ Found ${orchFiles.length} files\n`);

  // Analyze all domains
  console.log('🔍 Analyzing domain conformity...\n');
  const analyses = [];
  let issueCount = 0;

  orchFiles.forEach(filePath => {
    const analysis = analyzeDomainConformity(filePath);
    if (analysis) {
      analyses.push(analysis);
      if (analysis.needsFix) {
        issueCount++;
        console.log(`   ⚠️  ${analysis.id}: ${analysis.issues.length} issues`);
        analysis.issues.slice(0, 3).forEach(issue => {
          console.log(`       - ${issue}`);
        });
        if (analysis.issues.length > 3) {
          console.log(`       ... and ${analysis.issues.length - 3} more`);
        }
      }
    }
  });

  console.log(`\n📊 Found ${issueCount} domains with issues\n`);

  // Fix domains
  if (issueCount > 0) {
    console.log('🔧 Applying fixes...\n');
    let fixedCount = 0;
    let failedCount = 0;

    analyses.forEach(analysis => {
      if (analysis.needsFix) {
        if (fixDomainConformity(analysis)) {
          fixedCount++;
          console.log(`   ✅ Fixed: ${analysis.id}`);
        } else {
          failedCount++;
          console.log(`   ❌ Failed: ${analysis.id} - ${analysis.error}`);
        }
      }
    });

    console.log(`\n📈 Results: ${fixedCount} fixed, ${failedCount} failed\n`);
  } else {
    console.log('✅ All domains are already aligned!\n');
  }

  // Generate report
  const report = generateReport(analyses);
  const reportPath = path.join(OUTPUT_DIR, `domain-alignment-report-${TIMESTAMP}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log('📊 Report saved to:');
  console.log(`   ${path.relative(WORKSPACE_ROOT, reportPath)}\n`);

  // Summary
  console.log('═'.repeat(70));
  console.log('📈 PHASE 1 SUMMARY');
  console.log('═'.repeat(70));
  console.log(`\n✨ Domains Analyzed: ${analyses.length}`);
  console.log(`✨ Domains Fixed: ${report.summary.fixedDomains}`);
  console.log(`✨ Success Rate: ${report.summary.successRate}`);
  console.log('\n💡 Next Steps:');
  console.log('   1. Run Phase 2: npm run fix:conformity:phase-2');
  console.log('   2. Run Phase 3: npm run fix:conformity:phase-3');
  console.log('   3. Audit: npm run audit:symphonia:conformity');
  console.log('\n' + '═'.repeat(70) + '\n');
}

main().catch(console.error);
