#!/usr/bin/env node
/**
 * demo-output-enhanced.js
 * 
 * Generates enhanced demo output with file traceability and component drill-down.
 * Reads: anomalies.json, diagnosis-results.json, demo-lineage.json, baseline-metrics.json
 * Outputs: formatted console table + CSV export with sources
 * 
 * Usage: node scripts/demo-output-enhanced.js [--csv]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SELF_HEALING_DIR = path.join(__dirname, '..', 'packages', 'self-healing');
const GENERATED_DIR = path.join(SELF_HEALING_DIR, '.generated');

const ANOMALIES_FILE = path.join(GENERATED_DIR, 'anomalies.json');
const DIAGNOSIS_FILE = path.join(GENERATED_DIR, 'diagnosis-results.json');
const LINEAGE_FILE = path.join(GENERATED_DIR, 'demo-lineage.json');
const BASELINE_FILE = path.join(GENERATED_DIR, 'baseline-metrics.json');

/**
 * Load all demo artifacts.
 */
function loadArtifacts() {
  const artifacts = {};

  if (fs.existsSync(ANOMALIES_FILE)) {
    artifacts.anomalies = JSON.parse(fs.readFileSync(ANOMALIES_FILE, 'utf8'));
  }
  if (fs.existsSync(DIAGNOSIS_FILE)) {
    artifacts.diagnosis = JSON.parse(fs.readFileSync(DIAGNOSIS_FILE, 'utf8'));
  }
  if (fs.existsSync(LINEAGE_FILE)) {
    artifacts.lineage = JSON.parse(fs.readFileSync(LINEAGE_FILE, 'utf8'));
  }
  if (fs.existsSync(BASELINE_FILE)) {
    artifacts.baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  }

  return artifacts;
}

/**
 * Format console output with file traceability.
 */
function formatConsoleOutput(artifacts) {
  const anomalies = artifacts.anomalies || { anomalies: [], summary: {} };
  const diagnosis = artifacts.diagnosis || { slice: {} };
  const lineage = artifacts.lineage || { sourceFiles: [] };
  const baseline = artifacts.baseline || { baselineMeta: {} };

  const summary = anomalies.summary || {};
  const diagnosticSlice = diagnosis.slice || {};
  const impact = diagnosticSlice.impact || {};

  console.log('\n' + '='.repeat(80));
  console.log('╔' + ' '.repeat(78) + '╗');
  console.log('║' + '  DEMO EXECUTION SUMMARY - DEMO-READY OUTPUT'.padEnd(78) + '║');
  console.log('╚' + '='.repeat(78) + '╝\n');

  // File sources summary
  console.log('📁 DATA SOURCES');
  console.log('─'.repeat(80));
  lineage.sourceFiles?.forEach(sf => {
    console.log(`  • ${sf.filename}`);
    console.log(`    ├─ Events parsed: ${sf.eventCount} (success rate: ${(sf.successRate * 100).toFixed(1)}%)`);
    console.log(`    ├─ Handlers invoked: ${Object.keys(sf.handlerInvocations).length}`);
    console.log(`    └─ Anomalies contributed: ${sf.anomalyContribution.performanceAnomalies + sf.anomalyContribution.behavioralAnomalies + sf.anomalyContribution.coverageAnomalies + sf.anomalyContribution.errorAnomalies + sf.anomalyContribution.sloBreaches}`);
  });

  // Anomaly summary
  console.log('\n⚠️  ANOMALY SUMMARY');
  console.log('─'.repeat(80));
  console.log(`  Total anomalies: ${summary.count || 0}`);
  console.log(`  ├─ Severity breakdown: Critical(${summary.severityBreakdown?.critical || 0}) | High(${summary.severityBreakdown?.high || 0}) | Medium(${summary.severityBreakdown?.medium || 0}) | Low(${summary.severityBreakdown?.low || 0})`);
  console.log(`  └─ Type breakdown: Performance(${summary.typeBreakdown?.performance || 0}) | Behavioral(${summary.typeBreakdown?.behavioral || 0}) | Coverage(${summary.typeBreakdown?.coverage || 0}) | Error(${summary.typeBreakdown?.error || 0}) | SLO(${summary.typeBreakdown?.slo || 0})`);

  // Component impact
  console.log('\n🔧 COMPONENT IMPACT');
  console.log('─'.repeat(80));
  const componentMap = lineage.componentMapping || {};
  Object.entries(componentMap).forEach(([handler, info]) => {
    if (info.anomaliesRaised > 0) {
      console.log(`  • ${handler} (${info.component})`);
      console.log(`    ├─ Package: ${info.package}`);
      console.log(`    ├─ Source: ${info.sourceFile}`);
      console.log(`    ├─ Anomalies: ${info.anomaliesRaised} | Recommendations: ${info.recommendationsTriggered}`);
      console.log(`    └─ Drill-down: anomalies.json → filter handler="${handler}" → diagnosis-results.json`);
    }
  });

  // Top recommendations by ROI
  console.log('\n💡 TOP RECOMMENDATIONS (ranked by ROI)');
  console.log('─'.repeat(80));
  const recommendations = diagnosticSlice.recommendations || [];
  recommendations.slice(0, 3).forEach((rec, idx) => {
    const lineageRec = (lineage.recommendationLineage || []).find(r => r.recommendationId === rec.id);
    console.log(`  ${idx + 1}. [Priority ${rec.priority}] ${rec.description}`);
    console.log(`     ├─ Benefit score: ${rec.benefitScore || 'N/A'} | Effort: ${rec.estimatedEffort} | Impact: ${impact.estimatedUsers || 0} users`);
    console.log(`     ├─ Affected component: ${lineageRec?.affectedComponent || 'N/A'}`);
    console.log(`     ├─ File to edit: ${lineageRec?.implementationGuide?.fileToEdit || 'N/A'}`);
    console.log(`     └─ Strategy: ${rec.implementation || 'N/A'}`);
  });

  // Baseline info
  console.log('\n📊 BASELINE REFERENCE');
  console.log('─'.repeat(80));
  const baselineMeta = baseline.baselineMeta || {};
  console.log(`  Methodology: ${baselineMeta.methodology || 'N/A'}`);
  console.log(`  Collection date: ${baselineMeta.collectionDate || 'N/A'}`);
  console.log(`  Confidence: ${baselineMeta.confidence || 'N/A'}`);
  console.log(`  Rebase threshold: ${baselineMeta.rebaseThreshold || 0.05}`);

  // Navigation
  console.log('\n🔍 DRILL-DOWN PATHS');
  console.log('─'.repeat(80));
  const navGuide = lineage.navigationGuide || { quickLinks: {} };
  console.log(`  1. View all anomalies: ${navGuide.quickLinks?.allAnomalies || 'anomalies.json'}`);
  console.log(`  2. View all recommendations: ${navGuide.quickLinks?.allRecommendations || 'diagnosis-results.json'}`);
  console.log(`  3. Trace component sources: ${navGuide.quickLinks?.componentSources || 'packages/self-healing/src/telemetry/handlers/'}`);
  console.log(`  4. Review file traceability: ${LINEAGE_FILE}`);
  console.log(`  5. Export as CSV: node scripts/demo-output-enhanced.js --csv\n`);

  console.log('='.repeat(80) + '\n');
}

/**
 * Generate CSV export with drill-down paths.
 */
function generateCSVExport(artifacts) {
  const anomalies = artifacts.anomalies || { anomalies: [] };
  const lineage = artifacts.lineage || { issueLineage: [], recommendationLineage: [] };

  const csvRows = [
    ['anomalyId', 'type', 'severity', 'handler', 'sourceFile', 'component', 'package', 'relatedRecommendations', 'drillingPath'].join(',')
  ];

  lineage.issueLineage?.forEach(issue => {
    csvRows.push([
      issue.anomalyId,
      issue.type,
      issue.severity,
      issue.handler,
      issue.sourceFile,
      issue.componentName,
      issue.package,
      `"${(issue.relatedRecommendations || []).join('; ')}"`,
      `"${issue.drillingPath}""`
    ].join(','));
  });

  const csvPath = path.join(GENERATED_DIR, 'demo-output-drill-down.csv');
  fs.writeFileSync(csvPath, csvRows.join('\n') + '\n');

  console.log(`[demo-output-enhanced] CSV export: ${csvPath}`);
  return csvPath;
}

/**
 * Main.
 */
function main() {
  try {
    const artifacts = loadArtifacts();

    if (process.argv.includes('--csv')) {
      generateCSVExport(artifacts);
    } else {
      formatConsoleOutput(artifacts);
    }
  } catch (error) {
    console.error('[demo-output-enhanced] ERROR:', error.message);
    process.exit(1);
  }
}

main();
