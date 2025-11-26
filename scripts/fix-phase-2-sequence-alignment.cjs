#!/usr/bin/env node

/**
 * Phase 2: Automated Sequence Beat Alignment Fixer
 *
 * Fixes sequence beat count misalignment issues for any domain/project
 * 
 * Problems Fixed:
 * - Sequences declaring wrong beat counts (e.g., "Phase has 4 items, but beats=41")
 * - Movement/phase definitions not matching actual beat arrays
 * - Beat count validation failures
 * 
 * Usage:
 *   node scripts/fix-phase-2-sequence-alignment.cjs
 *   node scripts/fix-phase-2-sequence-alignment.cjs [pattern]
 * 
 * Output:
 *   - Fixes all sequence JSON files with corrected beat counts
 *   - Generates alignment verification report
 *   - Creates detailed before/after comparisons
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(WORKSPACE_ROOT, '.generated/conformity-fixes');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

// Ensure output directory exists
function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

/**
 * Load JSON file safely
 */
function loadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error(`❌ Failed to load ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Calculate actual beat count from movements/phases
 */
function calculateActualBeats(sequence) {
  const movements = sequence.movements || sequence.phases || [];
  let totalBeats = 0;

  movements.forEach(movement => {
    // Support both 'beats' and 'items' field names
    const beats = movement.beats || movement.items || [];
    totalBeats += beats.length;
  });

  return totalBeats;
}

/**
 * Analyze and fix a sequence file
 */
function analyzeAndFixSequence(filePath) {
  const seq = loadJson(filePath);
  if (!seq || typeof seq !== 'object') {
    return null;
  }

  const actualBeats = calculateActualBeats(seq);
  const declaredBeats = seq.beats || 0;
  const isAligned = actualBeats === declaredBeats;

  return {
    filePath: filePath,
    id: seq.id || path.basename(filePath, '.json'),
    name: seq.name || 'unknown',
    declaredBeats: declaredBeats,
    actualBeats: actualBeats,
    isAligned: isAligned,
    movements: seq.movements?.length || seq.phases?.length || 0,
    needsFix: actualBeats !== declaredBeats,
    fixed: false,
    error: null,
    sequence: seq
  };
}

/**
 * Fix beat alignment in sequence
 */
function fixSequenceAlignment(analysis) {
  try {
    // Update beat count
    analysis.sequence.beats = analysis.actualBeats;

    // Also update movement beat counts if they exist
    const movements = analysis.sequence.movements || analysis.sequence.phases || [];
    movements.forEach((movement, index) => {
      const beats = movement.beats || movement.items || [];
      movement.beats = beats.length;
    });

    // Save fixed sequence
    fs.writeFileSync(analysis.filePath, JSON.stringify(analysis.sequence, null, 2), 'utf-8');
    
    analysis.fixed = true;
    return true;
  } catch (error) {
    analysis.error = error.message;
    return false;
  }
}

/**
 * Find all sequence files to analyze
 */
function findSequenceFiles() {
  const patterns = [
    'packages/*/json-sequences/**/*.json',
    'packages/orchestration/json-sequences/**/*.json',
    'packages/ographx/.ographx/sequences/**/*.json'
  ];

  const files = [];
  patterns.forEach(pattern => {
    const matches = glob.sync(pattern, {
      cwd: WORKSPACE_ROOT,
      ignore: ['**/node_modules/**', '**/.node_modules/**', '**/index.json']
    });
    files.push(...matches);
  });

  return [...new Set(files)].map(f => path.join(WORKSPACE_ROOT, f));
}

/**
 * Generate alignment verification report
 */
function generateReport(analyses) {
  const total = analyses.length;
  const aligned = analyses.filter(a => a.isAligned).length;
  const misaligned = analyses.filter(a => a.needsFix).length;
  const fixed = analyses.filter(a => a.fixed).length;
  const failed = analyses.filter(a => a.error).length;

  const report = {
    timestamp: new Date().toISOString(),
    phase: 2,
    description: 'Sequence Beat Alignment Fix Report',
    summary: {
      totalSequences: total,
      alignedSequences: aligned,
      misalignedSequences: misaligned,
      fixedSequences: fixed,
      failedFixes: failed,
      successRate: total > 0 ? ((fixed / misaligned) * 100).toFixed(1) + '%' : 'N/A'
    },
    details: analyses.map(a => ({
      id: a.id,
      name: a.name,
      file: path.relative(WORKSPACE_ROOT, a.filePath),
      status: a.fixed ? 'FIXED' : (a.isAligned ? 'OK' : 'FAILED'),
      beats: {
        before: a.declaredBeats,
        actual: a.actualBeats,
        aligned: a.isAligned
      },
      movements: a.movements,
      error: a.error
    })),
    improvements: [
      `✅ Analyzed ${total} sequence files`,
      `✅ Fixed ${fixed} misaligned sequences`,
      `✅ Verified ${aligned} already-aligned sequences`,
      misaligned > 0 ? `⚠️  ${misaligned - fixed} sequences could not be auto-fixed` : `✅ All sequences now aligned`
    ]
  };

  return report;
}

/**
 * Main execution
 */
async function main() {
  console.log('═'.repeat(70));
  console.log('🎵 PHASE 2: AUTOMATED SEQUENCE BEAT ALIGNMENT FIXER');
  console.log('═'.repeat(70));

  ensureOutputDir();

  console.log('\n📂 Scanning for sequence files...');
  const seqFiles = findSequenceFiles();
  console.log(`✅ Found ${seqFiles.length} sequence files\n`);

  // Analyze all sequences
  console.log('🔍 Analyzing sequence beat alignment...\n');
  const analyses = [];
  let misalignedCount = 0;

  seqFiles.forEach(filePath => {
    const analysis = analyzeAndFixSequence(filePath);
    if (analysis) {
      analyses.push(analysis);
      if (analysis.needsFix) {
        misalignedCount++;
        console.log(`   ⚠️  ${analysis.id}: declared ${analysis.declaredBeats}, actual ${analysis.actualBeats}`);
      }
    }
  });

  console.log(`\n📊 Found ${misalignedCount} sequences needing alignment\n`);

  // Fix misaligned sequences
  if (misalignedCount > 0) {
    console.log('🔧 Applying fixes...\n');
    let fixedCount = 0;
    let failedCount = 0;

    analyses.forEach(analysis => {
      if (analysis.needsFix) {
        if (fixAnalyzeAndFixSequence(analysis)) {
          fixedCount++;
          console.log(`   ✅ Fixed: ${analysis.id}`);
        } else {
          failedCount++;
          console.log(`   ❌ Failed: ${analysis.id} - ${analysis.error}`);
        }
      }
    });

    console.log(`\n📈 Results: ${fixedCount} fixed, ${failedCount} failed\n`);
  } else {
    console.log('✅ All sequences are already aligned!\n');
  }

  // Generate report
  const report = generateReport(analyses);
  const reportPath = path.join(OUTPUT_DIR, `sequence-alignment-report-${TIMESTAMP}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log('📊 Detailed report saved to:');
  console.log(`   ${path.relative(WORKSPACE_ROOT, reportPath)}\n`);

  // Summary
  console.log('═'.repeat(70));
  console.log('📈 PHASE 2 SUMMARY');
  console.log('═'.repeat(70));
  console.log(`\n✨ Sequences Analyzed: ${analyses.length}`);
  console.log(`✨ Sequences Fixed: ${report.summary.fixedSequences}`);
  console.log(`✨ Success Rate: ${report.summary.successRate}`);
  console.log('\n💡 Next Steps:');
  console.log('   1. Review alignment report');
  console.log('   2. Run Phase 3: Handler & BDD specs fixer');
  console.log('   3. Run: npm run audit:symphonia:conformity');
  console.log('\n' + '═'.repeat(70) + '\n');
}

// Fix function name typo
function fixAnalyzeAndFixSequence(analysis) {
  return fixSequenceAlignment(analysis);
}

main().catch(console.error);
