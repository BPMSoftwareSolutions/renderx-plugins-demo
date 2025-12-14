#!/usr/bin/env node
/**
 * Compute Canonical Test Count
 * Canonical minimum: 1 test per AC (ideally matching THEN clauses)
 */
const fs = require('fs');
const path = require('path');

const DOMAIN = process.env.ANALYSIS_DOMAIN_ID || 'renderx-web-orchestration';
const ROOT = process.cwd();
const REGISTRY = path.join(ROOT, '.generated', 'acs', `${DOMAIN}.registry.json`);
const OUTPUT = path.join(ROOT, '.generated', 'ac-alignment', 'canonical.json');

function computeCanonical() {
  if (!fs.existsSync(REGISTRY)) {
    console.error('Registry not found:', REGISTRY);
    process.exit(1);
  }

  const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const acs = registry.acs || registry.items || [];

  const canonical = {
    domainId: DOMAIN,
    totalACs: acs.length,
    canonicalMinimumTests: acs.length,
    totalBeats: registry.beats || 0,
    beatBreakdown: {}
  };

  acs.forEach(ac => {
    const key = `${ac.sequenceId}:${ac.beatId}`;
    if (!canonical.beatBreakdown[key]) {
      canonical.beatBreakdown[key] = { count: 0, beatName: ac.beatName };
    }
    canonical.beatBreakdown[key].count++;
  });

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(canonical, null, 2));

  console.log(`Canonical minimum tests: ${canonical.canonicalMinimumTests}`);
  console.log(`Total ACs: ${canonical.totalACs}`);
  console.log(`Output: ${OUTPUT}`);

  return canonical;
}

if (require.main === module) computeCanonical();
module.exports = { computeCanonical };
