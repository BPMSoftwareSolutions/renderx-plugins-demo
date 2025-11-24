#!/usr/bin/env node

/**
 * 🧠 Context Remounting Algorithm
 * 
 * Enforces root-goal alignment before every agent action.
 * Prevents drift by reloading canonical context from root-context.json
 * 
 * Usage:
 *   node scripts/context-remount-algorithm.js \
 *     --action "implement-sprint-1" \
 *     --agent "RenderX" \
 *     --verify
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

class ContextRemountAlgorithm {
  constructor() {
    this.rootContext = null;
    this.currentSprint = null;
    this.agentId = process.env.AGENT_ID || 'unknown';
    this.violations = [];
  }

  /**
   * Step 1: Load canonical root context
   */
  loadRootContext() {
    const rcPath = path.join(ROOT, 'root-context.json');
    if (!fs.existsSync(rcPath)) {
      throw new Error(`❌ root-context.json not found at ${rcPath}`);
    }
    this.rootContext = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
    console.log(`✅ Loaded root context: "${this.rootContext.rootGoal}"`);
    return this;
  }

  /**
   * Step 2: Verify agent action aligns with root goal
   */
  verifyRootGoalAlignment(action) {
    if (!this.rootContext) throw new Error('Root context not loaded');

    const allowedActions = [
      'implement-sprint-1',
      'implement-sprint-2',
      'implement-sprint-3',
      'implement-sprint-4',
      'emit-telemetry',
      'validate-shape',
      'check-budget',
      'generate-map',
      'validate-contract',
      'build-composite'
    ];

    if (!allowedActions.includes(action)) {
      this.violations.push(`❌ Action "${action}" not aligned with root goal`);
    } else {
      console.log(`✅ Action "${action}" aligns with root goal`);
    }
    return this;
  }

  /**
   * Step 3: Determine current sprint context
   */
  determineSprint(action) {
    const sprintMap = {
      'implement-sprint-1': 'sprint-1',
      'emit-telemetry': 'sprint-1',
      'validate-shape': 'sprint-1',
      'implement-sprint-2': 'sprint-2',
      'implement-sprint-3': 'sprint-3',
      'check-budget': 'sprint-3',
      'generate-map': 'sprint-3',
      'implement-sprint-4': 'sprint-4',
      'validate-contract': 'sprint-4',
      'build-composite': 'sprint-4'
    };

    this.currentSprint = sprintMap[action];
    console.log(`✅ Sprint context: ${this.currentSprint}`);
    return this;
  }

  /**
   * Step 4: Load sprint-specific governance artifacts
   */
  loadGovernanceArtifacts() {
    const artifacts = this.rootContext.governanceArtifacts.required;
    const missing = [];

    artifacts.forEach(artifact => {
      const artifactPath = path.join(ROOT, artifact);
      if (!fs.existsSync(artifactPath)) {
        missing.push(artifact);
      }
    });

    if (missing.length > 0) {
      this.violations.push(`⚠️ Missing governance artifacts: ${missing.join(', ')}`);
    } else {
      console.log(`✅ All governance artifacts present`);
    }
    return this;
  }

  /**
   * Step 5: Verify context boundaries
   */
  verifyBoundaries(targetPath) {
    const boundaries = this.rootContext.contextBoundaries;
    const isInScope = boundaries.inScope.some(pattern => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(targetPath);
    });

    const isOutOfScope = boundaries.outOfScope.some(pattern => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(targetPath);
    });

    if (isOutOfScope && !isInScope) {
      this.violations.push(`❌ Path "${targetPath}" is out of scope`);
      return false;
    }
    console.log(`✅ Path "${targetPath}" is within boundaries`);
    return true;
  }

  /**
   * Step 6: Generate context envelope for agent
   */
  generateContextEnvelope(action) {
    return {
      timestamp: new Date().toISOString(),
      rootGoal: this.rootContext.rootGoal,
      currentSprint: this.currentSprint,
      action: action,
      agentId: this.agentId,
      principles: this.rootContext.principles,
      requiredTelemetryFields: this.rootContext.governanceArtifacts.telemetryFields.required,
      boundaries: this.rootContext.contextBoundaries,
      successCriteria: this.rootContext.successCriteria[this.currentSprint],
      violations: this.violations
    };
  }

  /**
   * Step 7: Validate envelope before proceeding
   */
  validateEnvelope(envelope) {
    if (envelope.violations.length > 0) {
      console.log('\n❌ CONTEXT VALIDATION FAILED:');
      envelope.violations.forEach(v => console.log(`   ${v}`));
      return false;
    }
    console.log('\n✅ CONTEXT VALIDATION PASSED');
    return true;
  }

  /**
   * Display context for agent
   */
  display(envelope) {
    console.log('\n' + '═'.repeat(70));
    console.log('🧠 CONTEXT REMOUNTING - ROOT GOAL ALIGNMENT');
    console.log('═'.repeat(70));
    console.log(`\n🎯 Root Goal: ${envelope.rootGoal}`);
    console.log(`📍 Sprint: ${envelope.currentSprint}`);
    console.log(`🔧 Action: ${envelope.action}`);
    console.log(`👤 Agent: ${envelope.agentId}`);
    console.log(`\n📋 Required Telemetry Fields:`);
    envelope.requiredTelemetryFields.forEach(f => console.log(`   • ${f}`));
    console.log(`\n✅ Success Criteria: ${envelope.successCriteria}`);
    console.log('\n' + '═'.repeat(70));
  }

  /**
   * Save envelope for audit trail
   */
  saveEnvelope(envelope, outputFile) {
    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputFile, JSON.stringify(envelope, null, 2));
    console.log(`\n✅ Context envelope saved to: ${outputFile}`);
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
    const cra = new ContextRemountAlgorithm();
    
    cra.loadRootContext()
      .verifyRootGoalAlignment(options.action || 'emit-telemetry')
      .determineSprint(options.action || 'emit-telemetry')
      .loadGovernanceArtifacts()
      .verifyBoundaries(options.path || 'packages/self-healing/__tests__');

    const envelope = cra.generateContextEnvelope(options.action);
    const isValid = cra.validateEnvelope(envelope);

    cra.display(envelope);

    const outputFile = options.output || path.join(ROOT, '.generated', 'context-remount-envelope.json');
    cra.saveEnvelope(envelope, outputFile);

    if (!isValid && options.verify) {
      process.exit(1);
    }

    console.log('\n✅ Agent is ready to proceed with root-goal alignment.\n');
  } catch (error) {
    console.error(`\n❌ Context remounting failed: ${error.message}\n`);
    process.exit(1);
  }
}

main();

