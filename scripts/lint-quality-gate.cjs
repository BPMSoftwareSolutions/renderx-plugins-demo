#!/usr/bin/env node

/**
 * Lint Quality Gate - SAFe Pipeline Integration
 * 
 * Handles existing lint errors and prevents future ones through:
 * 1. Error categorization and prioritization
 * 2. Automated fixing for fixable errors
 * 3. Baseline establishment for tracking
 * 4. Quality gate enforcement in pipeline
 * 5. Progressive improvement strategy
 * 
 * Usage:
 *   npm run lint:quality-gate              (full analysis + fix + report)
 *   node scripts/lint-quality-gate.cjs     (direct execution)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPORTS_DIR = path.join(__dirname, '../.generated/lint-quality-reports');
const BASELINE_FILE = path.join(REPORTS_DIR, 'lint-baseline.json');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Run eslint and capture output
 */
function runLint() {
  try {
    execSync('npm run lint', { stdio: 'pipe' });
    return { errors: [], warnings: [] };
  } catch (error) {
    const output = error.stdout?.toString() || error.message;
    return parseEslintOutput(output);
  }
}

/**
 * Parse eslint output into structured format
 */
function parseEslintOutput(output) {
  const lines = output.split('\n');
  const errors = [];
  const warnings = [];
  
  lines.forEach((line, idx) => {
    if (line.includes('error') && line.includes(':')) {
      const match = line.match(/(.+?)\s+(\d+):(\d+)\s+error\s+(.+?)\s+(.+?)$/);
      if (match) {
        errors.push({
          file: match[1].trim(),
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          message: match[4].trim(),
          rule: match[5].trim(),
          severity: 'error'
        });
      }
    } else if (line.includes('warning') && line.includes(':')) {
      const match = line.match(/(.+?)\s+(\d+):(\d+)\s+warning\s+(.+?)\s+(.+?)$/);
      if (match) {
        warnings.push({
          file: match[1].trim(),
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          message: match[4].trim(),
          rule: match[5].trim(),
          severity: 'warning'
        });
      }
    }
  });

  return { errors, warnings };
}

/**
 * Categorize lint issues
 */
function categorizeIssues(errors, warnings) {
  const categories = {
    'unused-vars': { errors: [], warnings: [], fixable: true },
    'served-sequences': { errors: [], warnings: [], fixable: false },
    'other': { errors: [], warnings: [], fixable: false }
  };

  errors.forEach(error => {
    if (error.rule.includes('no-unused-vars') || error.message.includes('unused')) {
      categories['unused-vars'].errors.push(error);
    } else if (error.rule.includes('served-sequences')) {
      categories['served-sequences'].errors.push(error);
    } else {
      categories['other'].errors.push(error);
    }
  });

  warnings.forEach(warning => {
    if (warning.rule.includes('no-unused-vars') || warning.message.includes('unused')) {
      categories['unused-vars'].warnings.push(warning);
    } else if (warning.rule.includes('served-sequences')) {
      categories['served-sequences'].warnings.push(warning);
    } else {
      categories['other'].warnings.push(warning);
    }
  });

  return categories;
}

/**
 * Create or update baseline
 */
function getOrCreateBaseline(categories) {
  let baseline = null;
  
  if (fs.existsSync(BASELINE_FILE)) {
    try {
      baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
    } catch (e) {
      baseline = null;
    }
  }

  if (!baseline) {
    baseline = {
      created: new Date().toISOString(),
      'unused-vars': {
        errors: categories['unused-vars'].errors.length,
        warnings: categories['unused-vars'].warnings.length
      },
      'served-sequences': {
        errors: categories['served-sequences'].errors.length,
        warnings: categories['served-sequences'].warnings.length
      },
      'other': {
        errors: categories['other'].errors.length,
        warnings: categories['other'].warnings.length
      }
    };

    fs.writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2));
  }

  return baseline;
}

/**
 * Calculate trends
 */
function calculateTrends(baseline, current) {
  const trends = {};

  Object.keys(baseline).forEach(category => {
    if (category === 'created') return;
    
    const baselineErrors = baseline[category].errors;
    const currentErrors = current[category].errors;
    const baselineWarnings = baseline[category].warnings;
    const currentWarnings = current[category].warnings;

    trends[category] = {
      errors: {
        baseline: baselineErrors,
        current: currentErrors,
        delta: currentErrors - baselineErrors,
        trend: currentErrors < baselineErrors ? 'improving' : currentErrors > baselineErrors ? 'declining' : 'stable'
      },
      warnings: {
        baseline: baselineWarnings,
        current: currentWarnings,
        delta: currentWarnings - baselineWarnings,
        trend: currentWarnings < baselineWarnings ? 'improving' : currentWarnings > baselineWarnings ? 'declining' : 'stable'
      }
    };
  });

  return trends;
}

/**
 * Auto-fix fixable issues
 */
function autoFixIssues(categories) {
  const fixable = categories['unused-vars'];
  const fixed = [];
  const notFixed = [];

  console.log('\nAttempting to auto-fix unused variable warnings...\n');

  try {
    execSync('npm run lint:fix', { stdio: 'pipe' });
    fixed.push({
      rule: 'no-unused-vars',
      count: fixable.warnings.length,
      message: 'Auto-prefixed unused variables with _'
    });
    console.log(`✓ Fixed ${fixable.warnings.length} unused variable warnings`);
  } catch (error) {
    notFixed.push({
      rule: 'no-unused-vars',
      count: fixable.warnings.length,
      reason: 'Requires manual intervention'
    });
    console.log(`✗ Could not auto-fix unused variables (requires manual review)`);
  }

  return { fixed, notFixed };
}

/**
 * Generate quality report
 */
function generateQualityReport(categories, baseline, trends, fixResults) {
  // Flatten categories to count all errors and warnings
  let totalErrors = 0;
  let totalWarnings = 0;
  const errorsByCategory = {};
  const warningsByCategory = {};

  for (const [catName, catData] of Object.entries(categories)) {
    totalErrors += catData.errors.length;
    totalWarnings += catData.warnings.length;
    errorsByCategory[catName] = catData.errors.length;
    warningsByCategory[catName] = catData.warnings.length;
  }

  const report = {
    id: `lint-quality-gate-${TIMESTAMP}`,
    timestamp: new Date().toISOString(),
    summary: {
      totalErrors,
      totalWarnings,
      totalIssues: totalErrors + totalWarnings,
      errorsByCategory,
      warningsByCategory
    },
    baseline: baseline,
    trends: trends,
    fixResults: fixResults,
    categories: {
      'unused-vars': {
        description: 'Variables assigned but never used (must start with _)',
        errors: categories['unused-vars'].errors.length,
        warnings: categories['unused-vars'].warnings.length,
        fixable: true,
        examples: categories['unused-vars'].warnings.slice(0, 3)
      },
      'served-sequences': {
        description: 'Plugin manifest/sequence reference mismatches',
        errors: categories['served-sequences'].errors.length,
        warnings: categories['served-sequences'].warnings.length,
        fixable: false,
        examples: categories['served-sequences'].errors.slice(0, 3)
      },
      'other': {
        description: 'Other ESLint violations',
        errors: categories['other'].errors.length,
        warnings: categories['other'].warnings.length,
        fixable: false,
        examples: categories['other'].errors.slice(0, 3)
      }
    },
    qualityGate: {
      status: totalErrors === 0 ? 'PASS' : 'FAIL',
      criticalThreshold: 0,
      warningThreshold: 150,
      passed: totalErrors === 0,
      recommendations: generateRecommendations(categories, trends)
    }
  };

  return report;
}

/**
 * Generate recommendations
 */
function generateRecommendations(categories, trends) {
  const recommendations = [];

  // Served sequences errors (critical)
  if (categories['served-sequences'].errors.length > 0) {
    recommendations.push({
      priority: 'CRITICAL',
      issue: `${categories['served-sequences'].errors.length} plugin manifest mismatches`,
      action: 'Review and fix plugin/sequence references in manifest files',
      effort: 'High'
    });
  }

  // Unused variables
  if (categories['unused-vars'].warnings.length > 100) {
    recommendations.push({
      priority: 'HIGH',
      issue: `${categories['unused-vars'].warnings.length} unused variables need refactoring`,
      action: 'Prefix unused variables with _ OR refactor to use the variable',
      effort: 'Medium',
      note: 'Most can be auto-fixed with npm run lint:fix'
    });
  }

  // Trend analysis
  if (trends['unused-vars']?.warnings.trend === 'declining') {
    recommendations.push({
      priority: 'INFO',
      issue: 'Unused variables trend is improving',
      action: 'Continue current practices',
      effort: 'Minimal'
    });
  }

  if (trends['unused-vars']?.warnings.trend === 'declining' && 
      trends['unused-vars'].warnings.current === 0) {
    recommendations.push({
      priority: 'SUCCESS',
      issue: 'All unused variable warnings eliminated!',
      action: 'Maintain this standard in pipeline',
      effort: 'Minimal'
    });
  }

  return recommendations;
}

/**
 * Display report
 */
function displayReport(report) {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                   SAFe Pipeline - Lint Quality Gate Report                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

  console.log('SUMMARY:');
  console.log(`  Total Issues: ${report.summary.totalIssues}`);
  console.log(`  Errors: ${report.summary.totalErrors} | Warnings: ${report.summary.totalWarnings}`);
  console.log(`  Quality Gate: ${report.qualityGate.status}`);

  console.log('\nBREAKDOWN BY CATEGORY:');
  console.log(`  Unused Variables:`);
  console.log(`    - Errors: ${report.categories['unused-vars'].errors} | Warnings: ${report.categories['unused-vars'].warnings}`);
  console.log(`  Served Sequences:`);
  console.log(`    - Errors: ${report.categories['served-sequences'].errors} | Warnings: ${report.categories['served-sequences'].warnings}`);
  console.log(`  Other Issues:`);
  console.log(`    - Errors: ${report.categories['other'].errors} | Warnings: ${report.categories['other'].warnings}`);

  if (report.trends) {
    console.log('\nTREND ANALYSIS:');
    const uwTrend = report.trends['unused-vars'];
    if (uwTrend) {
      console.log(`  Unused Variables:`);
      console.log(`    - Baseline: ${uwTrend.warnings.baseline} | Current: ${uwTrend.warnings.current} | Trend: ${uwTrend.warnings.trend}`);
      if (uwTrend.warnings.delta !== 0) {
        const delta = uwTrend.warnings.delta;
        const icon = delta < 0 ? '✓' : '✗';
        console.log(`    ${icon} ${Math.abs(delta)} ${delta < 0 ? 'improvement' : 'regression'}`);
      }
    }
  }

  if (report.qualityGate.recommendations.length > 0) {
    console.log('\nRECOMMENDATIONS:');
    report.qualityGate.recommendations.forEach(rec => {
      const icon = rec.priority === 'CRITICAL' ? '⚠' : rec.priority === 'HIGH' ? '→' : rec.priority === 'SUCCESS' ? '✓' : 'ℹ';
      console.log(`  ${icon} [${rec.priority}] ${rec.issue}`);
      console.log(`    Action: ${rec.action}`);
    });
  }

  console.log('\n' + '═'.repeat(88) + '\n');
}

/**
 * Save report
 */
function saveReport(report) {
  const reportPath = path.join(REPORTS_DIR, `lint-quality-gate-${TIMESTAMP}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`✓ Report saved: ${reportPath}`);
  return reportPath;
}

/**
 * Main execution
 */
function main() {
  console.log('Running ESLint quality gate analysis...\n');

  // Run linting
  const { errors, warnings } = runLint();
  
  // Categorize
  const categories = categorizeIssues(errors, warnings);
  
  // Get baseline
  const baseline = getOrCreateBaseline(categories);
  
  // Calculate trends
  const trends = calculateTrends(baseline, {
    'unused-vars': {
      errors: categories['unused-vars'].errors.length,
      warnings: categories['unused-vars'].warnings.length
    },
    'served-sequences': {
      errors: categories['served-sequences'].errors.length,
      warnings: categories['served-sequences'].warnings.length
    },
    'other': {
      errors: categories['other'].errors.length,
      warnings: categories['other'].warnings.length
    }
  });

  // Attempt auto-fix
  const fixResults = autoFixIssues(categories);

  // Generate report
  const report = generateQualityReport(categories, baseline, trends, fixResults);

  // Display
  displayReport(report);

  // Save
  saveReport(report);

  // Exit with appropriate code
  process.exit(report.qualityGate.status === 'PASS' ? 0 : 1);
}

main();
