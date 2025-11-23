#!/usr/bin/env node
/**
 * renderx-web-diagnostics.js
 * 
 * Maps demo anomalies to renderx-web production architecture.
 * Shows which packages are affected, component-level breakdown, and fix priorities.
 * 
 * Usage: node scripts/renderx-web-diagnostics.js
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
const MAPPING_FILE = path.join(GENERATED_DIR, 'renderx-web-mapping.json');

/**
 * Load all artifacts.
 */
function loadArtifacts() {
  const artifacts = {};

  if (fs.existsSync(ANOMALIES_FILE)) {
    artifacts.anomalies = JSON.parse(fs.readFileSync(ANOMALIES_FILE, 'utf8'));
  }
  if (fs.existsSync(DIAGNOSIS_FILE)) {
    artifacts.diagnosis = JSON.parse(fs.readFileSync(DIAGNOSIS_FILE, 'utf8'));
  }
  if (fs.existsSync(MAPPING_FILE)) {
    artifacts.mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
  }

  return artifacts;
}

/**
 * Map anomalies to renderx-web components.
 */
function generateRenderxWebDiagnostics(artifacts) {
  const anomalies = artifacts.anomalies || { anomalies: [], summary: {} };
  const mapping = artifacts.mapping || { componentMapForRenderxWeb: {} };
  const diagnosis = artifacts.diagnosis || { slice: { recommendations: [] } };

  // Build component → anomalies mapping
  const componentAnomalies = {};
  const componentMap = mapping.componentMapForRenderxWeb || {};

  Object.entries(componentMap).forEach(([componentKey, componentInfo]) => {
    componentAnomalies[componentKey] = {
      package: componentInfo.packageName,
      sourceDir: componentInfo.sourceDir,
      relatedHandlers: componentInfo.relatedHandlers,
      anomalies: [],
      recommendations: [],
      riskFactors: componentInfo.anomalyRisks || []
    };
  });

  // Assign anomalies to components based on handler
  (anomalies.anomalies || []).forEach(anomaly => {
    Object.entries(componentMap).forEach(([componentKey, componentInfo]) => {
      if (componentInfo.relatedHandlers?.includes(anomaly.handler)) {
        componentAnomalies[componentKey].anomalies.push(anomaly);
      }
    });
  });

  // Assign recommendations to components
  (diagnosis.slice?.recommendations || []).forEach(rec => {
    const anomalyIds = rec.id ? [rec.id] : [];
    Object.entries(componentAnomalies).forEach(([, compInfo]) => {
      compInfo.anomalies.forEach(anom => {
        if (anomalyIds.includes(anom.id)) {
          compInfo.recommendations.push(rec);
        }
      });
    });
  });

  // Sort components by impact (most anomalies first)
  const sortedComponents = Object.entries(componentAnomalies)
    .sort(([, a], [, b]) => b.anomalies.length - a.anomalies.length);

  console.log('\n' + '='.repeat(90));
  console.log('╔' + ' '.repeat(88) + '╗');
  console.log('║' + '  RENDERX-WEB PRODUCTION DIAGNOSTICS'.padEnd(88) + '║');
  console.log('╚' + '='.repeat(90) + '╝\n');

  // Overall summary
  const totalAnomalies = Object.values(componentAnomalies).reduce(
    (sum, comp) => sum + comp.anomalies.length,
    0
  );
  console.log('📊 OVERALL IMPACT');
  console.log('─'.repeat(90));
  console.log(
    `  Total anomalies detected: ${totalAnomalies}\n  Components affected: ${sortedComponents.filter(([, c]) => c.anomalies.length > 0).length}/${sortedComponents.length}`
  );
  console.log(`  Log files analyzed: 82 from renderx-web (component-*, library-*, theme-*, localhost-*)`);
  console.log(`  Production packages: ${sortedComponents.length} (@renderx-plugins/*)\n`);

  // Component-level breakdown
  console.log('🔧 COMPONENT-LEVEL BREAKDOWN (by impact)');
  console.log('─'.repeat(90));

  sortedComponents.forEach(([componentKey, compInfo], idx) => {
    if (compInfo.anomalies.length === 0) return;

    const severity = compInfo.anomalies.reduce((max, a) => {
      const order = { critical: 4, high: 3, medium: 2, low: 1 };
      return Math.max(max, order[a.severity] || 0);
    }, 0);
    const severityLabel =
      severity >= 4 ? '🔴 CRITICAL' : severity >= 3 ? '🟠 HIGH' : severity >= 2 ? '🟡 MEDIUM' : '🟢 LOW';

    console.log(
      `  ${idx + 1}. ${compInfo.package.padEnd(40)} ${severityLabel}`
    );
    console.log(`     ├─ Source: ${compInfo.sourceDir}`);
    console.log(
      `     ├─ Anomalies: ${compInfo.anomalies.length} (${compInfo.anomalies.map(a => a.type).join(', ')})`
    );

    if (compInfo.recommendations.length > 0) {
      console.log(`     ├─ Fixes needed: ${compInfo.recommendations.length}`);
      compInfo.recommendations.forEach((rec, ri) => {
        const score = rec.benefitScore || 0;
        console.log(`     │  ${ri + 1}. [${rec.priority}] ${rec.description.substring(0, 50)}...`);
        console.log(`     │     └─ Score: ${score} | Effort: ${rec.estimatedEffort}`);
      });
    }

    // Risk factors
    if (compInfo.riskFactors.length > 0) {
      console.log(`     └─ Known risks:`);
      compInfo.riskFactors.forEach(risk => {
        console.log(`        • ${risk}`);
      });
    }

    console.log('');
  });

  // Priority roadmap
  console.log('🎯 FIX PRIORITY ROADMAP');
  console.log('─'.repeat(90));

  const priorities = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };

  sortedComponents.forEach(([componentKey, compInfo]) => {
    if (compInfo.anomalies.length > 0) {
      const maxSeverity = compInfo.anomalies.reduce((max, a) => {
        const order = { critical: 4, high: 3, medium: 2, low: 1 };
        return Math.max(max, order[a.severity] || 0);
      }, 0);

      let category = 'low';
      if (maxSeverity >= 4) category = 'critical';
      else if (maxSeverity >= 3) category = 'high';
      else if (maxSeverity >= 2) category = 'medium';

      priorities[category].push([componentKey, compInfo]);
    }
  });

  ['critical', 'high', 'medium', 'low'].forEach(severity => {
    if (priorities[severity].length > 0) {
      const badge = {
        critical: '🔴 CRITICAL',
        high: '🟠 HIGH',
        medium: '🟡 MEDIUM',
        low: '🟢 LOW'
      }[severity];

      console.log(`  ${badge}:`);
      priorities[severity].forEach(([componentKey, compInfo]) => {
        console.log(
          `    • ${compInfo.package} - ${compInfo.anomalies.length} anomalies, ${compInfo.recommendations.length} fixes`
        );
      });
      console.log('');
    }
  });

  // Implementation guide
  console.log('📝 IMPLEMENTATION GUIDE');
  console.log('─'.repeat(90));
  console.log('  Phase 1: Fix CRITICAL packages (canvasComponent, hostSdk)');
  console.log('    → Run: npm run demo:output:csv');
  console.log('    → Filter CSV: component = critical package');
  console.log('    → For each anomaly: follow drillingPath to sourceDir');
  console.log('    → Edit: packages/[package-name]/src/...');
  console.log('    → Test: npm test (regenerates logs, anomalies)');
  console.log('');
  console.log('  Phase 2: Fix HIGH priority packages');
  console.log('    → Repeat Phase 1 for each high-severity package');
  console.log('');
  console.log('  Phase 3: Validation');
  console.log('    → Collect new logs → npm run demo:output:enhanced');
  console.log('    → Verify anomaly count reduced');
  console.log('    → Use demo-lineage.json to trace improvements');
  console.log('');

  // Quick reference
  console.log('🔍 QUICK REFERENCE');
  console.log('─'.repeat(90));
  console.log('  View anomalies by package:');
  console.log('    $ npm run demo:output:csv');
  console.log('    → Open demo-output-drill-down.csv');
  console.log('    → Filter "package" column by @renderx-plugins/[package-name]');
  console.log('');
  console.log('  Map anomaly to exact source file:');
  console.log('    $ node scripts/renderx-web-diagnostics.js');
  console.log('    → Note package name and sourceDir');
  console.log('    → Look up in packages/ographx/.ographx/artifacts/renderx-web/ir/graph.json');
  console.log('    → Or: grep -r "handler_name" packages/[package-name]/src/');
  console.log('');
  console.log('  Understand component dependencies:');
  console.log('    $ cat packages/self-healing/.generated/renderx-web-mapping.json');
  console.log('');

  console.log('='.repeat(90) + '\n');
}

/**
 * Main.
 */
function main() {
  try {
    const artifacts = loadArtifacts();
    generateRenderxWebDiagnostics(artifacts);
  } catch (error) {
    console.error('[renderx-web-diagnostics] ERROR:', error.message);
    process.exit(1);
  }
}

main();
