#!/usr/bin/env node
/**
 * Threshold Enforcement
 * Gates workflow based on coverage thresholds
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SUMMARY = path.join(ROOT, '.generated', 'ac-alignment', 'summary.json');

const PRESENCE_THRESHOLD = parseFloat(process.argv.find((arg, i) => process.argv[i-1] === '--presence') || '0.3');
const THEN_THRESHOLD = parseFloat(process.argv.find((arg, i) => process.argv[i-1] === '--then') || '0.2');

function enforceThresholds() {
  if (!fs.existsSync(SUMMARY)) {
    console.error('Summary not found:', SUMMARY);
    process.exit(1);
  }

  const summary = JSON.parse(fs.readFileSync(SUMMARY, 'utf8'));
  const presenceCoverage = summary.presenceCoverage || 0;
  const thenCoverage = summary.thenCoverage || 0;

  const presencePass = presenceCoverage >= PRESENCE_THRESHOLD * 100;
  const thenPass = thenCoverage >= THEN_THRESHOLD * 100;

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║ AC-to-Test Alignment Threshold Check  ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  console.log(`Presence Coverage: ${presenceCoverage}% (threshold: ${PRESENCE_THRESHOLD * 100}%)`);
  console.log(`   Status: ${presencePass ? '✅ PASS' : '❌ FAIL'}\n`);
  
  console.log(`THEN Coverage: ${thenCoverage}% (threshold: ${THEN_THRESHOLD * 100}%)`);
  console.log(`   Status: ${thenPass ? '✅ PASS' : '❌ FAIL'}\n`);

  if (!presencePass || !thenPass) {
    console.log('❌ Coverage below thresholds. Next steps:');
    console.log('   1. Review test tagging: npm run suggest:ac-tags');
    console.log('   2. Apply tags: npm run apply:ac-tags:write');
    console.log('   3. Re-run validation: npm run validate:ac-alignment\n');
    process.exit(1);
  }

  console.log('✅ All thresholds met!\n');
  process.exit(0);
}

if (require.main === module) enforceThresholds();
module.exports = { enforceThresholds };
