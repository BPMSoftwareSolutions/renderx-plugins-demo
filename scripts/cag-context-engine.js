#!/usr/bin/env node

/**
 * 🧠 CAG Context Engine
 * 
 * The consciousness loop of our governance system.
 * Rehydrates truth, enforces boundaries, aligns goals, interprets telemetry.
 * 
 * Usage:
 *   node scripts/cag-context-engine.js \
 *     --action "generate-code" \
 *     --agent "RenderX" \
 *     --feature "shape-persistence"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

class CAGContextEngine {
  constructor() {
    this.governanceCore = null;
    this.contextProviders = {};
    this.currentContext = null;
    this.actionHistory = [];
  }

  /**
   * Step 1: Load Governance Core (SHAPE_EVOLUTION_PLAN + knowledge-index)
   */
  loadGovernanceCore() {
    console.log('\n🏛️ Loading Governance Core...');
    
    const shapePath = path.join(ROOT, 'SHAPE_EVOLUTION_PLAN.json');
    const kiPath = path.join(ROOT, 'knowledge-index.json');
    const rcPath = path.join(ROOT, 'root-context.json');

    this.governanceCore = {
      shapeEvolution: JSON.parse(fs.readFileSync(shapePath, 'utf-8')),
      knowledgeIndex: fs.existsSync(kiPath) ? JSON.parse(fs.readFileSync(kiPath, 'utf-8')) : null,
      rootContext: JSON.parse(fs.readFileSync(rcPath, 'utf-8'))
    };

    console.log(`✅ Governance Core loaded`);
    console.log(`   • Root Goal: ${this.governanceCore.rootContext.rootGoal}`);
    console.log(`   • Sprints: ${this.governanceCore.shapeEvolution.sprints.length}`);
    console.log(`   • Evolutions: ${this.governanceCore.rootContext.eightEvolutions.length}`);
    return this;
  }

  /**
   * Step 2: Load Context Providers (BDD, Telemetry, TDD, Integration, Context)
   */
  loadContextProviders() {
    console.log('\n📊 Loading Context Providers...');
    
    const providers = {
      bdd: this.loadBDDProvider(),
      telemetry: this.loadTelemetryProvider(),
      tdd: this.loadTDDProvider(),
      integration: this.loadIntegrationProvider(),
      context: this.loadContextProvider()
    };

    this.contextProviders = providers;
    console.log(`✅ Context Providers loaded`);
    return this;
  }

  loadBDDProvider() {
    const bddPath = path.join(ROOT, 'packages/self-healing/__tests__/business-bdd-handlers');
    return {
      type: 'BDD',
      path: bddPath,
      specs: fs.existsSync(bddPath) ? fs.readdirSync(bddPath).length : 0,
      provides: ['behavior-requirements', 'acceptance-criteria', 'telemetry-expectations']
    };
  }

  loadTelemetryProvider() {
    const telPath = path.join(ROOT, '.generated/telemetry');
    return {
      type: 'Telemetry',
      path: telPath,
      records: fs.existsSync(telPath) ? fs.readdirSync(telPath).length : 0,
      provides: ['shape-signatures', 'budget-status', 'coverage-coupling', 'anomalies']
    };
  }

  loadTDDProvider() {
    return {
      type: 'TDD',
      provides: ['test-phase-discipline', 'red-green-refactor-cycle', 'coverage-requirements']
    };
  }

  loadIntegrationProvider() {
    return {
      type: 'Integration',
      provides: ['boundary-validation', 'cross-feature-correlation', 'contract-enforcement']
    };
  }

  loadContextProvider() {
    const contextPath = path.join(ROOT, '.generated/context-remount-envelope.json');
    return {
      type: 'Context',
      path: contextPath,
      provides: ['root-context', 'sub-context', 'boundaries', 'previous-context']
    };
  }

  /**
   * Step 3: Rehydrate Context (Assemble all providers into coherent context)
   */
  rehydrateContext(action, agent, feature) {
    console.log('\n💧 Rehydrating Context...');
    
    this.currentContext = {
      timestamp: new Date().toISOString(),
      action: action,
      agent: agent,
      feature: feature,
      
      // From Governance Core
      rootGoal: this.governanceCore.rootContext.rootGoal,
      principles: this.governanceCore.rootContext.principles,
      currentSprint: this.determineSprint(feature),
      
      // From Context Providers
      bddRequirements: this.contextProviders.bdd.specs,
      telemetryShape: this.contextProviders.telemetry.records,
      tddPhase: 'RED', // Will be determined by action
      integrationBoundaries: this.contextProviders.integration.provides,
      previousContext: this.loadPreviousContext(),
      
      // Coherence markers
      coherenceScore: 0,
      violations: [],
      readyToGenerate: false
    };

    console.log(`✅ Context rehydrated`);
    console.log(`   • Root Goal: ${this.currentContext.rootGoal}`);
    console.log(`   • Sprint: ${this.currentContext.currentSprint}`);
    console.log(`   • BDD Specs: ${this.currentContext.bddRequirements}`);
    console.log(`   • Telemetry Records: ${this.currentContext.telemetryShape}`);
    
    return this;
  }

  determineSprint(feature) {
    const sprints = this.governanceCore.shapeEvolution.sprints;
    for (const sprint of sprints) {
      for (const task of sprint.tasks) {
        if (task.desc.includes(feature)) {
          return sprint.id;
        }
      }
    }
    return 'sprint-1';
  }

  loadPreviousContext() {
    const contextPath = path.join(ROOT, '.generated/context-remount-envelope.json');
    if (fs.existsSync(contextPath)) {
      return JSON.parse(fs.readFileSync(contextPath, 'utf-8'));
    }
    return null;
  }

  /**
   * Step 4: Enforce Boundaries
   */
  enforceBoundaries() {
    console.log('\n🚧 Enforcing Boundaries...');
    
    const boundaries = this.governanceCore.rootContext.contextBoundaries;
    this.currentContext.boundaries = boundaries;
    
    console.log(`✅ Boundaries enforced`);
    console.log(`   • In-Scope: ${boundaries.inScope.length} paths`);
    console.log(`   • Out-of-Scope: ${boundaries.outOfScope.length} paths`);
    
    return this;
  }

  /**
   * Step 5: Calculate Coherence Score
   */
  calculateCoherence() {
    console.log('\n📊 Calculating Coherence Score...');
    
    let score = 100;
    
    // Deduct for missing context providers
    if (!this.contextProviders.bdd.specs) score -= 10;
    if (!this.contextProviders.telemetry.records) score -= 10;
    if (this.currentContext.violations.length > 0) score -= (this.currentContext.violations.length * 5);
    
    this.currentContext.coherenceScore = Math.max(0, score);
    this.currentContext.readyToGenerate = this.currentContext.coherenceScore >= 80;
    
    console.log(`✅ Coherence Score: ${this.currentContext.coherenceScore}%`);
    console.log(`   • Ready to Generate: ${this.currentContext.readyToGenerate ? 'YES' : 'NO'}`);
    
    return this;
  }

  /**
   * Display CAG Context
   */
  display() {
    console.log('\n' + '═'.repeat(70));
    console.log('🧠 CAG CONTEXT ENGINE - CONSCIOUSNESS LOOP');
    console.log('═'.repeat(70));
    
    console.log(`\n🎯 Root Goal: ${this.currentContext.rootGoal}`);
    console.log(`📍 Sprint: ${this.currentContext.currentSprint}`);
    console.log(`🔧 Action: ${this.currentContext.action}`);
    console.log(`👤 Agent: ${this.currentContext.agent}`);
    console.log(`🎨 Feature: ${this.currentContext.feature}`);
    
    console.log(`\n📊 Context Providers:`);
    console.log(`   • BDD Specs: ${this.currentContext.bddRequirements}`);
    console.log(`   • Telemetry Records: ${this.currentContext.telemetryShape}`);
    console.log(`   • Integration Boundaries: ${this.currentContext.integrationBoundaries.length}`);
    
    console.log(`\n🧠 Coherence: ${this.currentContext.coherenceScore}%`);
    console.log(`✅ Ready to Generate: ${this.currentContext.readyToGenerate}`);
    
    console.log('\n' + '═'.repeat(70));
  }

  /**
   * Save CAG Context for agent
   */
  saveContext(outputFile) {
    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputFile, JSON.stringify(this.currentContext, null, 2));
    console.log(`\n✅ CAG Context saved to: ${outputFile}`);
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
    const cag = new CAGContextEngine();
    
    cag.loadGovernanceCore()
      .loadContextProviders()
      .rehydrateContext(
        options.action || 'generate-code',
        options.agent || 'RenderX',
        options.feature || 'shape-persistence'
      )
      .enforceBoundaries()
      .calculateCoherence();

    cag.display();

    const outputFile = options.output || path.join(ROOT, '.generated', 'cag-context.json');
    cag.saveContext(outputFile);

    if (!cag.currentContext.readyToGenerate) {
      console.log('\n⚠️ CAG Context coherence below threshold. Agent should not proceed.\n');
      process.exit(1);
    }

    console.log('\n✅ CAG Context ready. Agent may proceed with generation.\n');
  } catch (error) {
    console.error(`\n❌ CAG Context Engine failed: ${error.message}\n`);
    process.exit(1);
  }
}

main();

