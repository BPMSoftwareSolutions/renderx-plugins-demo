#!/usr/bin/env node

/**
 * 🧠 Context Remounting System (CRS)
 * 
 * Loads 4-layer context envelope before agent workload iteration.
 * Prevents multi-agent context drift through deliberate re-alignment.
 * 
 * Usage:
 *   node scripts/agent-load-context.js \
 *     --root "5-layer telemetry system" \
 *     --sub "Implement metrics.ts handlers" \
 *     --boundaries "packages/slo-dashboard/*" \
 *     --previous ".generated/context-history/latest.json"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

class ContextRemountingSystem {
  constructor() {
    this.envelope = {
      timestamp: new Date().toISOString(),
      layers: {
        root: null,
        sub: null,
        boundaries: null,
        previous: null
      },
      metadata: {
        agentId: process.env.AGENT_ID || 'unknown',
        sessionId: this.generateSessionId(),
        iterationNumber: 0
      }
    };
    this.knowledgeIndex = null;
  }

  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Layer 1: Root Context
   * The big why. Persistent identity of the work.
   */
  loadRootContext(rootDescription) {
    const sources = this.getKnowledgeSources();
    this.envelope.layers.root = {
      description: rootDescription,
      mvp: "Thin-client host with plugin architecture",
      mmf: "5-layer telemetry governance system",
      nonNegotiable: ["100% traceability","Manifest-driven configuration","JSON-first design","Self-improving knowledge system"],
      sourceCount: sources.length,
      sourceSample: sources.slice(0,5).map(s=>s.id),
      timestamp: new Date().toISOString()
    };
    return this;
  }

  /**
   * Layer 2: Sub-Context
   * Current focused feature/task. Working memory.
   */
  loadSubContext(subDescription) {
    this.envelope.layers.sub = {
      description: subDescription,
      focus: subDescription,
      scope: "Current iteration only",
      timestamp: new Date().toISOString()
    };
    return this;
  }

  /**
   * Layer 3: Context Boundaries
   * Allowed/forbidden zones. The rails.
   */
  loadBoundaries(boundariesPattern) {
    this.envelope.layers.boundaries = {
      inScope: [
        boundariesPattern || "packages/slo-dashboard/*",
        "src/handlers/*",
        "scripts/agent-*.js"
      ],
      outOfScope: [
        "packages/*/demo/*",
        "packages/*/examples/*",
        "packages/self-healing/* (unless touched)",
        ".ographx/* (unless involved)"
      ],
      governance: this.knowledgeIndex?.governance?.contextRemounting || null,
      timestamp: new Date().toISOString()
    };
    return this;
  }

  /**
   * Layer 4: Most Recent Context
   * Previous iteration memory. Mental state checkpoint.
   */
  loadPreviousContext(historyFile) {
    try {
      if (historyFile && fs.existsSync(historyFile)) {
        const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
        this.envelope.layers.previous = {
          ...history,
          loadedFrom: historyFile,
          timestamp: new Date().toISOString()
        };
      } else {
        this.envelope.layers.previous = {
          summary: "No previous context (first iteration)",
          lastModifiedFiles: [],
          pendingItems: [],
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn(`⚠️ Could not load previous context: ${error.message}`);
      this.envelope.layers.previous = {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
    return this;
  }

  /**
   * Generate the complete context envelope
   */
  getEnvelope() {
    return this.envelope;
  }

  /** Load knowledge-index.json if present */
  loadKnowledgeIndex() {
    const kiPath = path.join(ROOT, 'knowledge-index.json');
    if(fs.existsSync(kiPath)){
      try {
        this.knowledgeIndex = JSON.parse(fs.readFileSync(kiPath,'utf-8'));
        this.envelope.metadata.knowledgeIndexHash = this.hashString(JSON.stringify(this.knowledgeIndex));
      } catch(err){
        console.warn('⚠️ Failed parsing knowledge-index.json:', err.message);
      }
    }
    return this;
  }

  getKnowledgeSources(){
    return this.knowledgeIndex?.sources || [];
  }

  hashString(str){
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  /**
   * Display context envelope in human-readable format
   */
  display() {
    console.log('\n' + '═'.repeat(70));
    console.log('🧠 CONTEXT REMOUNTING SYSTEM - 4-LAYER ENVELOPE');
    console.log('═'.repeat(70));
    
    console.log(`\n📍 Session: ${this.envelope.metadata.sessionId}`);
    console.log(`⏰ Timestamp: ${this.envelope.timestamp}`);
    
    console.log('\n🟪 ROOT CONTEXT (Big Why)');
    console.log('─'.repeat(70));
    console.log(`   ${this.envelope.layers.root?.description || 'Not loaded'}`);
    console.log(`   MVP: ${this.envelope.layers.root?.mvp}`);
    console.log(`   Non-negotiable: ${this.envelope.layers.root?.nonNegotiable?.join(', ')}`);
    
    console.log('\n🟦 SUB-CONTEXT (Current Focus)');
    console.log('─'.repeat(70));
    console.log(`   ${this.envelope.layers.sub?.description || 'Not loaded'}`);
    
    console.log('\n🟩 CONTEXT BOUNDARIES (Allowed/Forbidden)');
    console.log('─'.repeat(70));
    console.log(`   In-Scope: ${this.envelope.layers.boundaries?.inScope?.join(', ')}`);
    console.log(`   Out-of-Scope: ${this.envelope.layers.boundaries?.outOfScope?.join(', ')}`);
    
    console.log('\n🟨 MOST RECENT CONTEXT (Previous Iteration)');
    console.log('─'.repeat(70));
    console.log(`   ${this.envelope.layers.previous?.summary || 'Not loaded'}`);
    if (this.envelope.layers.previous?.lastModifiedFiles?.length > 0) {
      console.log(`   Last Modified: ${this.envelope.layers.previous.lastModifiedFiles.join(', ')}`);
    }
    
    console.log('\n' + '═'.repeat(70));
  }

  /**
   * Save context envelope for next iteration
   */
  saveForNextIteration(outputFile) {
    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputFile, JSON.stringify(this.envelope, null, 2));
    console.log(`✅ Context saved to: ${outputFile}`);
    return this;
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

  const crs = new ContextRemountingSystem();
  
  crs.loadKnowledgeIndex()
    .loadRootContext(options.root || 'Telemetry governance system')
    .loadSubContext(options.sub || 'Current feature implementation')
    .loadBoundaries(options.boundaries)
    .loadPreviousContext(options.previous);
  
  crs.display();
  
  const outputFile = options.output || path.join(ROOT, '.generated', 'context-envelope.json');
  crs.saveForNextIteration(outputFile);
  
  console.log('\n✅ Context remounting complete. Agent is ready to proceed.\n');
}

main().catch(console.error);

