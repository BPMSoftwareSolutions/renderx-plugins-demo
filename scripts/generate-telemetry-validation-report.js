#!/usr/bin/env node
/**
 * Telemetry Validation Report Generator
 * Aggregates telemetry capture results and produces validation summary.
 * Can be used standalone or as part of CI/CD pipeline.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PLAN_FILE = path.join(ROOT, 'orchestration-audit-system-project-plan.json');
const CAPTURE_DIR = path.join(ROOT, '.generated', 'sprint-telemetry-capture');
const VALIDATION_REPORT = path.join(ROOT, '.generated', 'telemetry-validation-report.json');
const MARKDOWN_REPORT = path.join(ROOT, 'docs', 'generated', 'orchestration-telemetry-validation.md');

function load(p) { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; } }
function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function generateValidationReport() {
  ensureDir(path.dirname(VALIDATION_REPORT));
  ensureDir(path.dirname(MARKDOWN_REPORT));

  const captureDir = CAPTURE_DIR;
  const rows = [];
  
  if (!fs.existsSync(captureDir)) {
    console.log('[telemetry-validation] No capture directory; creating empty report');
    const report = {
      generatedAt: new Date().toISOString(),
      totalSprints: 0,
      passCount: 0,
      rows: []
    };
    fs.writeFileSync(VALIDATION_REPORT, JSON.stringify(report, null, 2));
    return report;
  }

  const files = fs.readdirSync(captureDir).filter(f => f.endsWith('.json'));
  
  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(captureDir, f), 'utf-8'));
      if (data.validation) {
        rows.push({
          sprint: data.sprint,
          name: data.name,
          capturedAt: data.capturedAt,
          eventsCount: data.events.length,
          metricsCount: data.metrics.length,
          signaturesCovered: data.validation.captured.length,
          signaturesRequired: data.validation.required.length,
          coverage: data.validation.coverage,
          coveragePct: (data.validation.coverage * 100).toFixed(1) + '%',
          allPresent: data.validation.allPresent,
          missing: data.validation.missing,
          status: data.validation.allPresent ? 'PASS' : 'PENDING'
        });
      }
    } catch (e) {
      console.error(`[telemetry-validation] Error reading ${f}:`, e.message);
    }
  }

  // Sort by sprint id
  rows.sort((a, b) => parseInt(a.sprint, 10) - parseInt(b.sprint, 10));

  const report = {
    generatedAt: new Date().toISOString(),
    totalSprints: rows.length,
    passCount: rows.filter(r => r.status === 'PASS').length,
    rows
  };

  fs.writeFileSync(VALIDATION_REPORT, JSON.stringify(report, null, 2));
  console.log(`[telemetry-validation] Wrote JSON report to ${VALIDATION_REPORT}`);

  // Generate Markdown report
  let md = '# Telemetry Validation Report\n\n';
  md += `> DO NOT EDIT. Generated from sprint telemetry captures.\n\n`;
  md += `**Generated:** ${report.generatedAt}\n`;
  md += `**Status:** ${report.passCount}/${report.totalSprints} sprints PASS\n\n`;

  md += '| Sprint | Name | Status | Events | Metrics | Coverage | Missing |\n';
  md += '|--------|------|--------|--------|---------|----------|----------|\n';
  
  for (const row of rows) {
    const missingList = row.missing.length ? row.missing.join(', ') : 'none';
    md += `| ${row.sprint} | ${row.name} | ${row.status} | ${row.eventsCount} | ${row.metricsCount} | ${row.coveragePct} | ${missingList} |\n`;
  }

  md += '\n## Details\n\n';
  for (const row of rows) {
    md += `### Sprint ${row.sprint}: ${row.name}\n`;
    md += `- **Status:** ${row.status}\n`;
    md += `- **Captured At:** ${row.capturedAt}\n`;
    md += `- **Events:** ${row.eventsCount}\n`;
    md += `- **Metrics:** ${row.metricsCount}\n`;
    md += `- **Signature Coverage:** ${row.coveragePct} (${row.signaturesCovered}/${row.signaturesRequired})\n`;
    if (row.missing.length) {
      md += `- **Missing Signatures:** ${row.missing.join(', ')}\n`;
    } else {
      md += `- **All Signatures Present:** ✓\n`;
    }
    md += '\n';
  }

  fs.writeFileSync(MARKDOWN_REPORT, md);
  console.log(`[telemetry-validation] Wrote Markdown report to ${MARKDOWN_REPORT}`);

  return report;
}

function main() {
  const report = generateValidationReport();
  
  console.log('\n[telemetry-validation] Summary:');
  console.log(`  Total Sprints: ${report.totalSprints}`);
  console.log(`  PASS: ${report.passCount}/${report.totalSprints}`);
  console.log(`  Status: ${report.passCount === report.totalSprints ? 'ALL PASS' : 'SOME PENDING'}`);
  
  // Exit with success if all passed, else 1
  process.exit(report.passCount === report.totalSprints ? 0 : 1);
}

main();
