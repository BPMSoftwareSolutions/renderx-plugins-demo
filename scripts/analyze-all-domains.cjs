#!/usr/bin/env node

/**
 * Analyze All Domains
 *
 * Iterates DOMAIN_REGISTRY.json and runs analysis for each domain
 * that defines an `analysisConfig` block. Uses `scripts/analyze-domain.cjs`
 * to execute per-domain analysis and report generation.
 *
 * Usage:
 *   node scripts/analyze-all-domains.cjs
 *   node scripts/analyze-all-domains.cjs --fail-fast
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const options = {
  failFast: args.includes('--fail-fast')
};

const log = (msg, icon = '  ') => console.log(`${icon} ${msg}`);
const header = (title) => {
  console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║ ${title.padEnd(61)} ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);
};

function loadRegistry() {
  const registryPath = path.join(process.cwd(), 'DOMAIN_REGISTRY.json');
  if (!fs.existsSync(registryPath)) {
    console.error('❌ DOMAIN_REGISTRY.json not found at project root');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
}

function getDomainsWithAnalysis(registry) {
  const entries = Object.entries(registry.domains || {});
  const targets = entries
    .filter(([id, def]) => {
      const cfg = def && def.analysisConfig;
      return (
        !!cfg &&
        !!cfg.analysisSourcePath &&
        !!cfg.analysisOutputPath &&
        !!cfg.reportOutputPath &&
        !!cfg.reportAuthorityRef
      );
    })
    .map(([id]) => id);
  return targets;
}

function analyzeDomain(domainId) {
  header(`ANALYZE DOMAIN: ${domainId}`);
  try {
    execSync(`node scripts/analyze-domain.cjs "${domainId}"`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    return { domainId, status: 'PASS' };
  } catch (err) {
    console.error(`❌ Analysis failed for ${domainId}`);
    if (options.failFast) {
      process.exit(1);
    }
    return { domainId, status: 'FAIL', error: err.message };
  }
}

function main() {
  header('DOMAIN ANALYSIS ORCHESTRATOR — ALL DOMAINS');
  const registry = loadRegistry();
  const targets = getDomainsWithAnalysis(registry);

  if (targets.length === 0) {
    console.log('ℹ No domains with analysisConfig found. Nothing to do.');
    return;
  }

  log(`Domains to analyze: ${targets.length}`, '📋');
  targets.forEach(d => log(`- ${d}`, '  '));

  const results = [];
  for (const domainId of targets) {
    results.push(analyzeDomain(domainId));
  }

  // Summary
  header('DOMAIN ANALYSIS SUMMARY');
  const pass = results.filter(r => r.status === 'PASS');
  const fail = results.filter(r => r.status === 'FAIL');
  log(`Total: ${results.length}`, '📊');
  log(`PASS: ${pass.length}`, '✅');
  log(`FAIL: ${fail.length}`, '❌');
  fail.forEach(f => log(`- ${f.domainId}: ${f.error || 'error'}`, '  '));

  if (fail.length > 0) {
    process.exitCode = 1;
  }
}

main();
