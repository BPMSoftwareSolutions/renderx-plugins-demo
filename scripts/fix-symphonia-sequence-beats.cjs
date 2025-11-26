#!/usr/bin/env node

/**
 * Symphonia Violation Cleanup - Phase 1: Sequence Beat Count Fixer
 * 
 * Automatically fixes CRITICAL violations:
 * - Missing or invalid beat counts in orchestration domains
 * - Invalid key signatures
 * - Missing sequence IDs and names
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 Symphonia Violation Cleanup - Phase 1: Sequence Beat Counts\n');

const DOMAINS_FILE = './orchestration-domains.json';
const WORKSPACE_ROOT = process.cwd();

// Load orchestration domains
const domains = JSON.parse(fs.readFileSync(DOMAINS_FILE, 'utf8'));

let fixed = 0;
let skipped = 0;

// Fix violations in orchestration domains
domains.domains = domains.domains.map(domain => {
  const updates = {};
  let hasUpdates = false;

  // Fix 1: Ensure domain has ID
  if (!domain.id) {
    domain.id = (domain.name || 'unknown').toLowerCase().replace(/\s+/g, '-');
    updates.id = domain.id;
    hasUpdates = true;
  }

  // Fix 2: Set default beats if missing
  if (!domain.beats || domain.beats <= 0) {
    // Calculate from sketch phases if available
    if (domain.sketch?.phases && domain.sketch.phases.length > 0) {
      const maxBeats = Math.max(...domain.sketch.phases.map(p => p.items?.length || 0));
      domain.beats = Math.max(maxBeats, 5);
    } else {
      // Default to 5 beats (standard movement)
      domain.beats = 5;
    }
    updates.beats = domain.beats;
    hasUpdates = true;
  }

  // Fix 3: Align movements with beats
  if (domain.movements && domain.beats && domain.movements > domain.beats) {
    domain.movements = Math.ceil(domain.beats / 5);
    updates.movements = domain.movements;
    hasUpdates = true;
  }

  // Fix 4: Set default movements if missing
  if (!domain.movements || domain.movements <= 0) {
    domain.movements = Math.ceil(domain.beats / 5) || 1;
    updates.movements = domain.movements;
    hasUpdates = true;
  }

  // Fix 5: Ensure valid key signature
  const validKeys = [
    'C Major', 'D Major', 'E Major', 'F Major', 'G Major', 'A Major', 'B Major',
    'C Minor', 'D Minor', 'E Minor', 'F Minor', 'G Minor', 'A Minor', 'B Minor'
  ];
  if (!domain.key || !validKeys.includes(domain.key)) {
    domain.key = 'C Major';
    updates.key = domain.key;
    hasUpdates = true;
  }

  // Fix 6: Ensure valid time signature
  if (!domain.timeSignature || !domain.timeSignature.match(/^\d+\/\d+$/)) {
    domain.timeSignature = '4/4';
    updates.timeSignature = domain.timeSignature;
    hasUpdates = true;
  }

  // Fix 7: Ensure tempo is valid (60-240)
  if (!domain.tempo || domain.tempo < 60 || domain.tempo > 240) {
    domain.tempo = 120;
    updates.tempo = domain.tempo;
    hasUpdates = true;
  }

  if (hasUpdates) {
    fixed++;
    console.log(`✓ Fixed ${domain.id}`);
    console.log(`  Updates: ${Object.keys(updates).join(', ')}`);
  } else {
    skipped++;
  }

  return domain;
});

// Save updated domains
fs.writeFileSync(DOMAINS_FILE, JSON.stringify(domains, null, 2));

console.log(`
✅ Cleanup Complete!

Fixed: ${fixed} domains
Skipped: ${skipped} domains
Total: ${domains.domains.length}

Changes:
- Added missing beat counts (calculated from sketch or default 5)
- Aligned movements with beats
- Set default movements
- Standardized key signatures (C Major)
- Standardized time signatures (4/4)
- Normalized tempo to 120 bpm

Next: Run audit to verify improvements
  npm run audit:symphonia:conformity
`);

process.exit(0);
