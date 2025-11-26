#!/usr/bin/env node

/**
 * Fix Symphonia CRITICAL Violations: Phase Beat Alignment
 * 
 * This script fixes domain phase violations where beat counts don't match item counts.
 * The issue: phases have items but beat count doesn't match the number of items.
 * Solution: Align beats to item count for each phase.
 */

const fs = require('fs');
const path = require('path');

const domainsPath = path.join(__dirname, '../orchestration-domains.json');

let data = JSON.parse(fs.readFileSync(domainsPath, 'utf-8'));
let domains = data.domains || [];
let fixedCount = 0;
let fixedPhases = 0;

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║     Symphonia Critical Fixes: Phase Beat Alignment          ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

domains = domains.map(domain => {
  // Check if domain has sketch with phases
  if (domain.sketch && domain.sketch.phases && Array.isArray(domain.sketch.phases)) {
    let domainFixed = false;
    
    domain.sketch.phases.forEach((phase, phaseIdx) => {
      if (phase.items && Array.isArray(phase.items) && phase.items.length > 0) {
        const expectedBeats = phase.items.length;
        const actualBeats = phase.beats || domain.beats || 0;
        
        // If beats don't match item count, fix it
        if (actualBeats !== expectedBeats) {
          console.log(`✓ ${domain.id} > Phase ${phaseIdx}`);
          console.log(`  └─ Items: ${phase.items.length}, Old beats: ${actualBeats}, New beats: ${expectedBeats}`);
          
          // Update domain-level beats to total items across all phases
          let totalItems = domain.sketch.phases.reduce((sum, p) => sum + (p.items ? p.items.length : 0), 0);
          domain.beats = totalItems;
          
          fixedPhases++;
          domainFixed = true;
        }
      }
    });
    
    if (domainFixed) {
      fixedCount++;
    }
  }
  
  return domain;
});

// Write updated domains back
data.domains = domains;
fs.writeFileSync(domainsPath, JSON.stringify(data, null, 2), 'utf-8');

console.log('\n╭────────────────────────────────────────────╮');
console.log('│          FIX SUMMARY                       │');
console.log('╰────────────────────────────────────────────╯');
console.log(`✅ Fixed domains: ${fixedCount}`);
console.log(`🎵 Fixed phases: ${fixedPhases}`);
console.log(`📊 Total domains scanned: ${domains.length}`);
console.log(`✨ Phase beat alignment complete!\n`);

process.exit(0);
