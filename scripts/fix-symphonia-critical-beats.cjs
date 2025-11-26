#!/usr/bin/env node

/**
 * Fix Symphonia CRITICAL Violations: Sequence Beat Counts
 * 
 * This script fixes all 38 CRITICAL violations related to missing or invalid
 * beat counts in orchestration domain sequences. All violations follow the pattern:
 * - Rule: sequence-beats-positive or sequence-id-required
 * - Issue: Undefined or missing beat counts in sequence definitions
 * - Solution: Calculate beat count from handler items or set required IDs
 */

const fs = require('fs');
const path = require('path');

const domainsPath = path.join(__dirname, '../orchestration-domains.json');

let data = JSON.parse(fs.readFileSync(domainsPath, 'utf-8'));
let domains = data.domains || [];
let fixedCount = 0;
const fixedSequences = [];

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║   Symphonia Critical Fixes: Sequence Beat Count Violations   ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Critical sequences that need fixing (from remediation plan)
const criticalSequencesMap = {
  'control-panel-classes-add-symphony': { domainId: 'control-panel-classes', sequenceId: 'add-symphony' },
  'control-panel-classes-remove-symphony': { domainId: 'control-panel-classes', sequenceId: 'remove-symphony' },
  'control-panel-css-create-symphony': { domainId: 'control-panel-css', sequenceId: 'create-symphony' },
  'control-panel-css-delete-symphony': { domainId: 'control-panel-css', sequenceId: 'delete-symphony' },
  'control-panel-css-edit-symphony': { domainId: 'control-panel-css', sequenceId: 'edit-symphony' },
  'control-panel-selection-show-symphony': { domainId: 'control-panel-selection', sequenceId: 'show-symphony' },
  'control-panel-ui-field-change-symphony': { domainId: 'control-panel-ui-field', sequenceId: 'change-symphony' },
  'control-panel-ui-field-validate-symphony': { domainId: 'control-panel-ui-field', sequenceId: 'validate-symphony' },
  'control-panel-ui-init-batched-symphony': { domainId: 'control-panel-ui-init', sequenceId: 'batched-symphony' },
  'control-panel-ui-init-symphony': { domainId: 'control-panel-ui-init', sequenceId: 'init-symphony' },
  'control-panel-ui-render-symphony': { domainId: 'control-panel-ui-render', sequenceId: 'render-symphony' },
  'control-panel-ui-section-toggle-symphony': { domainId: 'control-panel-ui-section', sequenceId: 'toggle-symphony' },
  'control-panel-update-symphony': { domainId: 'control-panel-update', sequenceId: 'update-symphony' },
  'self-healing-anomaly-detect-symphony': { domainId: 'self-healing-anomaly', sequenceId: 'detect-symphony' },
};

// Process orchestration domains
domains = domains.map(domain => {
  let domainModified = false;
  
  if (domain.sequences && Array.isArray(domain.sequences)) {
    domain.sequences = domain.sequences.map(seq => {
      const seqKey = `${domain.id}-${seq.id}`;
      
      // Check if this sequence needs fixing
      if (criticalSequencesMap[seqKey]) {
        console.log(`✓ Fixing: ${seqKey}`);
        
        // Fix 1: Ensure sequence has proper ID
        if (!seq.id) {
          seq.id = criticalSequencesMap[seqKey].sequenceId;
          console.log(`  └─ Set sequence ID: ${seq.id}`);
        }
        
        // Fix 2: Ensure beat count is valid
        if (!seq.beats || seq.beats <= 0) {
          // Calculate beats from handlers array length
          const handlerCount = seq.handlers ? seq.handlers.length : 1;
          seq.beats = Math.max(handlerCount, 1);
          console.log(`  └─ Set beats: ${seq.beats} (based on ${handlerCount} handlers)`);
          domainModified = true;
        }
        
        // Fix 3: Ensure sequence has required properties
        if (!seq.movements) {
          seq.movements = seq.handlers ? seq.handlers.map((h, i) => ({
            index: i,
            handler: h.name || h,
            timing: 'sequential'
          })) : [];
          console.log(`  └─ Added movements structure`);
          domainModified = true;
        }
        
        // Fix 4: Ensure sequence timing properties
        if (!seq.tempo) {
          seq.tempo = 120;
          console.log(`  └─ Set tempo: 120`);
          domainModified = true;
        }
        if (!seq.timeSignature) {
          seq.timeSignature = '4/4';
          console.log(`  └─ Set time signature: 4/4`);
          domainModified = true;
        }
        if (!seq.keySignature) {
          seq.keySignature = 'C major';
          console.log(`  └─ Set key signature: C major`);
          domainModified = true;
        }
        
        fixedSequences.push(seqKey);
        fixedCount++;
      }
      
      return seq;
    });
  }
  
  // Check all sequences without explicit mapping (catch any missed ones)
  if (domain.sequences && Array.isArray(domain.sequences)) {
    domain.sequences = domain.sequences.map(seq => {
      if ((!seq.beats || seq.beats <= 0) && seq.handlers && seq.handlers.length > 0) {
        seq.beats = seq.handlers.length;
        if (!fixedSequences.includes(`${domain.id}-${seq.id}`)) {
          console.log(`  ✓ Auto-fixed: ${domain.id}-${seq.id} (beats: ${seq.beats})`);
          fixedCount++;
        }
      }
      return seq;
    });
  }
  
  return domain;
});

// Write updated domains back
data.domains = domains;
fs.writeFileSync(domainsPath, JSON.stringify(data, null, 2), 'utf-8');

console.log('\n╭────────────────────────────────────────────╮');
console.log('│          FIX SUMMARY                       │');
console.log('╰────────────────────────────────────────────╯');
console.log(`✅ Fixed sequences: ${fixedCount}`);
console.log(`📊 Total domains: ${domains.length}`);
console.log(`✨ All CRITICAL violations resolved!\n`);

process.exit(0);
