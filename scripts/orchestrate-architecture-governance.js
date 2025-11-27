#!/usr/bin/env node

/**
 * Architecture Governance Enforcement Orchestra
 * 
 * Orchestrates the 6-movement governance symphony:
 * 1. JSON Schema Validation
 * 2. Handler-to-Beat Mapping Verification
 * 3. Test Coverage Verification
 * 4. Markdown Consistency Verification
 * 5. Auditability Chain Verification
 * 6. Overall Governance Conformity
 * 
 * Usage:
 *   node scripts/orchestrate-architecture-governance.js [--strict] [--report]
 * 
 * Flags:
 *   --strict   Fail on any violations (default: fail on critical only)
 *   --report   Generate and display full governance report
 */

import handlers from './architecture-governance-handlers.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const strictMode = args.includes('--strict');
const reportMode = args.includes('--report');

// Track execution
const executionTracker = {
  movements: [],
  startTime: Date.now(),
  errors: []
};

/**
 * Execute a handler and track results
 */
async function executeHandler(handler, movement, beat) {
  const beatId = `${movement.number}.${beat.number}`;
  
  try {
    const startTime = Date.now();
    const result = await handler();
    const duration = Date.now() - startTime;

    executionTracker.movements.push({
      movement: movement.number,
      beat: beat.number,
      event: beat.event,
      handler: beat.handler,
      status: 'success',
      duration,
      timestamp: new Date().toISOString()
    });

    return result;
  } catch (error) {
    executionTracker.errors.push({
      movement: movement.number,
      beat: beat.number,
      handler: beat.handler,
      error: error.message
    });

    throw error;
  }
}

/**
 * Run a complete movement
 */
async function runMovement(movement, symphonyDef) {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`🎼 MOVEMENT ${movement.number}: ${movement.name} ${movement.emoji}`);
  console.log(`${'═'.repeat(80)}`);
  console.log(`Purpose: ${movement.description}\n`);

  for (const beat of movement.beats) {
    const handler = handlers[beat.handler];

    if (!handler) {
      throw new Error(`Handler not found: ${beat.handler}`);
    }

    try {
      await executeHandler(handler, movement, beat);
    } catch (error) {
      if (strictMode) {
        throw error;
      }
      console.error(`   ⚠️  Handler failed (continuing): ${error.message}`);
    }
  }
}

/**
 * Main orchestration function
 */
async function orchestrateGovernance() {
  console.log('\n');
  console.log('████████████████████████████████████████████████████████████████████████████');
  console.log('█                                                                          █');
  console.log('█  🎼 ARCHITECTURE GOVERNANCE ENFORCEMENT SYMPHONY                       █');
  console.log('█                                                                          █');
  console.log('█  Enforcing: JSON as Single Source of Truth                            █');
  console.log('█  Verifying: Code → Tests → Markdown Traceability                      █');
  console.log('█  Mode: ' + (strictMode ? 'STRICT (fail on any violation)' : 'NORMAL (fail on critical)').padEnd(61) + '█');
  console.log('█                                                                          █');
  console.log('████████████████████████████████████████████████████████████████████████████\n');

  try {
    // Load the governance symphony definition
    const symphonyPath = path.join(
      process.cwd(),
      'packages/orchestration/json-sequences/architecture-governance-enforcement-symphony.json'
    );

    if (!fs.existsSync(symphonyPath)) {
      throw new Error(`Governance symphony not found: ${symphonyPath}`);
    }

    const symphony = JSON.parse(fs.readFileSync(symphonyPath, 'utf8'));

    console.log(`📋 Loaded Symphony: ${symphony.name}`);
    console.log(`📊 Movements: ${symphony.movements.length}`);
    console.log(`🎵 Total Beats: ${symphony.movements.reduce((sum, m) => sum + m.beats.length, 0)}\n`);

    // Execute each movement in sequence
    for (const movement of symphony.movements) {
      await runMovement(movement, symphony);
      console.log(`\n✅ Movement ${movement.number} Complete\n`);
    }

    // Calculate final results
    const totalDuration = Date.now() - executionTracker.startTime;
    const successfulBeats = executionTracker.movements.filter(m => m.status === 'success').length;
    const totalBeats = executionTracker.movements.length;

    console.log('\n' + '═'.repeat(80));
    console.log('🎼 GOVERNANCE SYMPHONY EXECUTION SUMMARY');
    console.log('═'.repeat(80));
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log(`✅ Successful Beats: ${successfulBeats}/${totalBeats}`);
    console.log(`❌ Failed Beats: ${executionTracker.errors.length}`);

    if (reportMode) {
      console.log('\n' + '═'.repeat(80));
      console.log('📊 DETAILED EXECUTION REPORT');
      console.log('═'.repeat(80));
      
      executionTracker.movements.forEach(m => {
        console.log(`\n   Movement ${m.movement}, Beat ${m.beat}: ${m.event}`);
        console.log(`      Handler: ${m.handler}`);
        console.log(`      Duration: ${m.duration}ms`);
        console.log(`      Status: ${m.status}`);
      });
    }

    console.log('\n' + '═'.repeat(80));
    console.log('🎵 GOVERNANCE ENFORCEMENT COMPLETE');
    console.log('═'.repeat(80));
    console.log('');

    // Exit with appropriate code (handlers determine final decision)
    // Handlers call process.exit() with appropriate code
    
  } catch (error) {
    console.error('\n💥 ORCHESTRATION ERROR');
    console.error(`   ${error.message}`);
    
    if (error.stack) {
      console.error('\nStack Trace:');
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Run the orchestration
orchestrateGovernance().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
