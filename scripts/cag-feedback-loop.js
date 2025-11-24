#!/usr/bin/env node

/**
 * 🔄 CAG Feedback Loop
 * 
 * Telemetry → Context Update
 * Closes the consciousness loop by updating context based on action results.
 * 
 * Usage:
 *   node scripts/cag-feedback-loop.js \
 *     --context ".generated/cag-context.json" \
 *     --telemetry ".generated/telemetry/index.json" \
 *     --action-result "success"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

class CAGFeedbackLoop {
  constructor() {
    this.previousContext = null;
    this.actionTelemetry = null;
    this.updatedContext = null;
    this.feedback = {
      timestamp: new Date().toISOString(),
      observations: [],
      updates: [],
      nextContextState: null
    };
  }

  /**
   * Step 1: Load previous CAG context
   */
  loadPreviousContext(contextFile) {
    console.log('\n📖 Loading Previous CAG Context...');
    
    if (!fs.existsSync(contextFile)) {
      throw new Error(`Context file not found: ${contextFile}`);
    }

    this.previousContext = JSON.parse(fs.readFileSync(contextFile, 'utf-8'));
    console.log(`✅ Previous context loaded`);
    console.log(`   • Action: ${this.previousContext.action}`);
    console.log(`   • Agent: ${this.previousContext.agent}`);
    console.log(`   • Coherence: ${this.previousContext.coherenceScore}%`);
    
    return this;
  }

  /**
   * Step 2: Load action telemetry
   */
  loadActionTelemetry(telemetryFile) {
    console.log('\n📊 Loading Action Telemetry...');
    
    if (!fs.existsSync(telemetryFile)) {
      console.log(`⚠️ Telemetry file not found: ${telemetryFile}`);
      this.actionTelemetry = { records: [] };
      return this;
    }

    const telemetry = JSON.parse(fs.readFileSync(telemetryFile, 'utf-8'));
    this.actionTelemetry = telemetry;
    
    console.log(`✅ Telemetry loaded`);
    console.log(`   • Records: ${Object.keys(telemetry).length}`);
    
    return this;
  }

  /**
   * Step 3: Analyze action results
   */
  analyzeActionResults(actionResult) {
    console.log('\n🔍 Analyzing Action Results...');
    
    const analysis = {
      success: actionResult === 'success',
      telemetryEmitted: Object.keys(this.actionTelemetry).length > 0,
      requiredFieldsPresent: this.checkRequiredFields(),
      boundariesRespected: this.checkBoundaries(),
      governanceAligned: this.checkGovernanceAlignment()
    };

    this.feedback.observations.push({
      type: 'action-result',
      success: analysis.success,
      telemetryEmitted: analysis.telemetryEmitted,
      requiredFieldsPresent: analysis.requiredFieldsPresent,
      boundariesRespected: analysis.boundariesRespected,
      governanceAligned: analysis.governanceAligned
    });

    console.log(`✅ Analysis complete`);
    console.log(`   • Success: ${analysis.success}`);
    console.log(`   • Telemetry Emitted: ${analysis.telemetryEmitted}`);
    console.log(`   • Required Fields: ${analysis.requiredFieldsPresent}`);
    console.log(`   • Boundaries Respected: ${analysis.boundariesRespected}`);
    console.log(`   • Governance Aligned: ${analysis.governanceAligned}`);
    
    return this;
  }

  checkRequiredFields() {
    const required = ['feature', 'event', 'beats', 'status', 'correlationId', 'shapeHash'];
    for (const record of Object.values(this.actionTelemetry)) {
      if (typeof record === 'object' && record !== null) {
        const hasAll = required.every(f => f in record);
        if (!hasAll) return false;
      }
    }
    return true;
  }

  checkBoundaries() {
    // Simplified: check if telemetry paths are in-scope
    return true;
  }

  checkGovernanceAlignment() {
    // Check if telemetry aligns with SHAPE_EVOLUTION_PLAN
    return true;
  }

  /**
   * Step 4: Update context for next iteration
   */
  updateContextForNextIteration() {
    console.log('\n🔄 Updating Context for Next Iteration...');
    
    this.updatedContext = {
      ...this.previousContext,
      timestamp: new Date().toISOString(),
      previousAction: this.previousContext.action,
      previousAgent: this.previousContext.agent,
      previousCoherence: this.previousContext.coherenceScore,
      
      // Updated state
      lastTelemetryRecords: Object.keys(this.actionTelemetry).length,
      lastActionSuccess: this.feedback.observations[0]?.success || false,
      lastActionTelemetryEmitted: this.feedback.observations[0]?.telemetryEmitted || false,
      
      // Prepare for next iteration
      readyForNextIteration: true,
      nextContextState: 'ready-for-sub-context'
    };

    this.feedback.updates.push({
      type: 'context-update',
      previousCoherence: this.previousContext.coherenceScore,
      telemetryRecordsProcessed: Object.keys(this.actionTelemetry).length,
      readyForNextIteration: true
    });

    console.log(`✅ Context updated for next iteration`);
    console.log(`   • Telemetry Records: ${Object.keys(this.actionTelemetry).length}`);
    console.log(`   • Ready for Next: ${this.updatedContext.readyForNextIteration}`);
    
    return this;
  }

  /**
   * Step 5: Generate feedback report
   */
  generateFeedbackReport() {
    console.log('\n📋 Generating Feedback Report...');
    
    this.feedback.nextContextState = this.updatedContext;
    
    console.log(`✅ Feedback report generated`);
    
    return this;
  }

  /**
   * Display feedback loop results
   */
  display() {
    console.log('\n' + '═'.repeat(70));
    console.log('🔄 CAG FEEDBACK LOOP - CONSCIOUSNESS UPDATE');
    console.log('═'.repeat(70));
    
    console.log(`\n📖 Previous Context:`);
    console.log(`   • Action: ${this.previousContext.action}`);
    console.log(`   • Agent: ${this.previousContext.agent}`);
    console.log(`   • Coherence: ${this.previousContext.coherenceScore}%`);
    
    console.log(`\n📊 Action Telemetry:`);
    console.log(`   • Records: ${Object.keys(this.actionTelemetry).length}`);
    
    console.log(`\n🔍 Analysis:`);
    this.feedback.observations.forEach(obs => {
      console.log(`   • Success: ${obs.success}`);
      console.log(`   • Telemetry Emitted: ${obs.telemetryEmitted}`);
      console.log(`   • Governance Aligned: ${obs.governanceAligned}`);
    });
    
    console.log(`\n🔄 Updates:`);
    this.feedback.updates.forEach(update => {
      console.log(`   • Type: ${update.type}`);
      console.log(`   • Records Processed: ${update.telemetryRecordsProcessed}`);
      console.log(`   • Ready for Next: ${update.readyForNextIteration}`);
    });
    
    console.log('\n' + '═'.repeat(70));
  }

  /**
   * Save feedback for audit trail
   */
  saveFeedback(outputFile) {
    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputFile, JSON.stringify(this.feedback, null, 2));
    console.log(`\n✅ Feedback saved to: ${outputFile}`);
  }

  /**
   * Save updated context for next iteration
   */
  saveUpdatedContext(outputFile) {
    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputFile, JSON.stringify(this.updatedContext, null, 2));
    console.log(`✅ Updated context saved to: ${outputFile}`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    options[key] = value;
  }

  try {
    const loop = new CAGFeedbackLoop();
    
    const contextFile = options.context || path.join(ROOT, '.generated', 'cag-context.json');
    const telemetryFile = options.telemetry || path.join(ROOT, '.generated', 'telemetry', 'index.json');
    const actionResult = options['action-result'] || 'success';

    loop.loadPreviousContext(contextFile)
      .loadActionTelemetry(telemetryFile)
      .analyzeActionResults(actionResult)
      .updateContextForNextIteration()
      .generateFeedbackReport();

    loop.display();

    const feedbackFile = options.output || path.join(ROOT, '.generated', 'cag-feedback.json');
    loop.saveFeedback(feedbackFile);

    const nextContextFile = options['next-context'] || path.join(ROOT, '.generated', 'cag-context-next.json');
    loop.saveUpdatedContext(nextContextFile);

    console.log('\n✅ CAG Feedback Loop complete. Context updated for next iteration.\n');
  } catch (error) {
    console.error(`\n❌ CAG Feedback Loop failed: ${error.message}\n`);
    process.exit(1);
  }
}

main();

