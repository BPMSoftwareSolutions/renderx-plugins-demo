#!/usr/bin/env node
/**
 * Quality Difference Report
 * Compares existing tests against AC registry to find gaps
 */
const fs = require('fs');
const path = require('path');

const DOMAIN = process.env.ANALYSIS_DOMAIN_ID || 'renderx-web-orchestration';
const ROOT = process.cwd();
const REGISTRY = path.join(ROOT, '.generated', 'acs', `${DOMAIN}.registry.json`);
const RESULTS = path.join(ROOT, '.generated', 'ac-alignment', 'results', 'collected-results.json');
const OUTPUT = path.join(ROOT, '.generated', 'ac-alignment', 'quality-diff.json');

function computeQualityDiff() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const results = JSON.parse(fs.readFileSync(RESULTS, 'utf8'));

  const acs = registry.acs || registry.items || [];
  const tests = results.tests || [];

  const gaps = {
    missingAcTags: tests.filter(t => t.acTags.length === 0).length,
    missingBeatTags: tests.filter(t => t.beatTags.length === 0).length,
    uncoveredACs: acs.length - new Set(tests.flatMap(t => t.acTags.map(tag => tag.full))).size,
    totalTests: tests.length,
    totalACs: acs.length
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(gaps, null, 2));
  console.log('Quality gaps:', gaps);
  console.log('Output:', OUTPUT);

  return gaps;
}

if (require.main === module) computeQualityDiff();
module.exports = { computeQualityDiff };
