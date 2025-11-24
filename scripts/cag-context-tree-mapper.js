#!/usr/bin/env node

/**
 * 🌳 CAG Context Tree Mapper
 * 
 * Maps the context tree of ANY script, service, utility, or JSON file in the repo.
 * Traces its governance lineage, dependencies, and relationships.
 * 
 * Usage:
 *   node scripts/cag-context-tree-mapper.js --file "scripts/cag-context-engine.js"
 *   node scripts/cag-context-tree-mapper.js --file "root-context.json"
 *   node scripts/cag-context-tree-mapper.js --file "SHAPE_EVOLUTION_PLAN.json"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

class CAGContextTreeMapper {
  constructor() {
    this.knowledgeIndex = null;
    this.targetFile = null;
    this.contextTree = {
      file: null,
      type: null,
      governance: {},
      dependencies: [],
      dependents: [],
      relatedArtifacts: [],
      contextLayers: {},
      traceability: {}
    };
  }

  /**
   * Load knowledge index
   */
  loadKnowledgeIndex() {
    console.log('\n📚 Loading Knowledge Index...');
    
    const kiPath = path.join(ROOT, 'knowledge-index.json');
    this.knowledgeIndex = JSON.parse(fs.readFileSync(kiPath, 'utf-8'));
    
    console.log(`✅ Knowledge Index loaded`);
    console.log(`   • Sources: ${this.knowledgeIndex.sources.length}`);
    
    return this;
  }

  /**
   * Resolve target file
   */
  resolveTargetFile(filePath) {
    console.log(`\n🎯 Resolving target file: ${filePath}`);
    
    let resolvedPath = filePath;
    if (!path.isAbsolute(filePath)) {
      resolvedPath = path.join(ROOT, filePath);
    }

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found: ${resolvedPath}`);
    }

    this.targetFile = {
      original: filePath,
      resolved: resolvedPath,
      relative: path.relative(ROOT, resolvedPath),
      name: path.basename(resolvedPath),
      ext: path.extname(resolvedPath),
      type: this.determineFileType(resolvedPath)
    };

    console.log(`✅ Target file resolved`);
    console.log(`   • Path: ${this.targetFile.relative}`);
    console.log(`   • Type: ${this.targetFile.type}`);
    
    return this;
  }

  determineFileType(filePath) {
    const ext = path.extname(filePath);
    if (ext === '.json') return 'json';
    if (ext === '.js' || ext === '.cjs' || ext === '.mjs') return 'script';
    if (ext === '.ts' || ext === '.tsx') return 'typescript';
    if (ext === '.md') return 'documentation';
    if (ext === '.py') return 'python';
    if (ext === '.txt') return 'text';
    if (ext === '.html' || ext === '.htm') return 'html';
    if (ext === '.svg') return 'svg';
    if (ext === '.css') return 'stylesheet';
    return 'unknown';
  }

  /**
   * Map governance context
   */
  mapGovernanceContext() {
    console.log('\n🏛️ Mapping Governance Context...');
    
    // Check if file is in knowledge index
    const inIndex = this.knowledgeIndex.sources.some(s => 
      s.path.includes(this.targetFile.name) || 
      s.path.includes(this.targetFile.relative)
    );

    this.contextTree.governance = {
      inKnowledgeIndex: inIndex,
      governedBy: this.findGovernanceRules(),
      evolutionPhase: this.findEvolutionPhase(),
      telemetryRequired: this.isTelemetryRequired(),
      contractsApply: this.findApplicableContracts()
    };

    console.log(`✅ Governance context mapped`);
    console.log(`   • In Knowledge Index: ${inIndex}`);
    console.log(`   • Governed By: ${this.contextTree.governance.governedBy.length} rules`);
    
    return this;
  }

  findGovernanceRules() {
    const rules = [];
    
    // Check SHAPE_EVOLUTION_PLAN
    const shapePath = path.join(ROOT, 'SHAPE_EVOLUTION_PLAN.json');
    if (fs.existsSync(shapePath)) {
      const shape = JSON.parse(fs.readFileSync(shapePath, 'utf-8'));
      if (shape.governance) {
        rules.push({
          source: 'SHAPE_EVOLUTION_PLAN.json',
          rules: Object.keys(shape.governance)
        });
      }
    }

    // Check root-context
    const rcPath = path.join(ROOT, 'root-context.json');
    if (fs.existsSync(rcPath)) {
      const rc = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
      if (rc.contextBoundaries) {
        rules.push({
          source: 'root-context.json',
          boundaries: rc.contextBoundaries
        });
      }
    }

    return rules;
  }

  findEvolutionPhase() {
    const shapePath = path.join(ROOT, 'SHAPE_EVOLUTION_PLAN.json');
    if (!fs.existsSync(shapePath)) return null;

    const shape = JSON.parse(fs.readFileSync(shapePath, 'utf-8'));
    for (const sprint of shape.sprints || []) {
      for (const task of sprint.tasks || []) {
        if (task.desc.includes(this.targetFile.name)) {
          return {
            sprint: sprint.id,
            task: task.desc,
            phase: sprint.phase
          };
        }
      }
    }
    return null;
  }

  isTelemetryRequired() {
    const rcPath = path.join(ROOT, 'root-context.json');
    if (!fs.existsSync(rcPath)) return false;

    const rc = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
    const inScope = rc.contextBoundaries?.inScope || [];
    
    return inScope.some(path => this.targetFile.relative.includes(path));
  }

  findApplicableContracts() {
    const contractsDir = path.join(ROOT, 'contracts');
    if (!fs.existsSync(contractsDir)) return [];

    const contracts = [];
    const files = fs.readdirSync(contractsDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        contracts.push({
          file: file,
          path: path.join(contractsDir, file)
        });
      }
    }

    return contracts;
  }

  /**
   * Map dependencies
   */
  mapDependencies() {
    console.log('\n🔗 Mapping Dependencies...');

    if (this.targetFile.type === 'script' || this.targetFile.type === 'typescript') {
      this.mapScriptDependencies();
    } else if (this.targetFile.type === 'json') {
      this.mapJsonDependencies();
    } else if (this.targetFile.type === 'documentation') {
      this.mapDocumentDependencies();
    } else if (this.targetFile.type === 'html') {
      this.mapHtmlDependencies();
    }

    console.log(`✅ Dependencies mapped`);
    console.log(`   • Direct Dependencies: ${this.contextTree.dependencies.length}`);
    console.log(`   • Dependents: ${this.contextTree.dependents.length}`);

    return this;
  }

  mapScriptDependencies() {
    const content = fs.readFileSync(this.targetFile.resolved, 'utf-8');

    // Find imports
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const requireRegex = /require\(['"]([^'"]+)['"]\)/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      this.contextTree.dependencies.push({
        type: 'import',
        module: match[1],
        line: content.substring(0, match.index).split('\n').length
      });
    }

    while ((match = requireRegex.exec(content)) !== null) {
      this.contextTree.dependencies.push({
        type: 'require',
        module: match[1],
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }

  mapDocumentDependencies() {
    const content = fs.readFileSync(this.targetFile.resolved, 'utf-8');

    // Find markdown links and references
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const refRegex = /\(([^)]*\.(md|json|js|ts|tsx|py))\)/g;
    const codeBlockRegex = /```([a-z]*)\n([\s\S]*?)```/g;

    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      const target = match[2];
      if (target.includes('.') || target.includes('/')) {
        this.contextTree.dependencies.push({
          type: 'link',
          target: target,
          text: match[1],
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }

    while ((match = refRegex.exec(content)) !== null) {
      this.contextTree.dependencies.push({
        type: 'reference',
        target: match[1],
        line: content.substring(0, match.index).split('\n').length
      });
    }

    // Extract code blocks
    let codeBlockCount = 0;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      codeBlockCount++;
    }

    if (codeBlockCount > 0) {
      this.contextTree.metadata = this.contextTree.metadata || {};
      this.contextTree.metadata.codeBlocks = codeBlockCount;
    }
  }

  mapJsonDependencies() {
    const content = JSON.parse(fs.readFileSync(this.targetFile.resolved, 'utf-8'));
    
    // Find references to other files
    const findReferences = (obj, path = '') => {
      if (typeof obj === 'string' && (obj.endsWith('.json') || obj.endsWith('.js'))) {
        this.contextTree.dependencies.push({
          type: 'reference',
          target: obj,
          path: path
        });
      } else if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          findReferences(obj[key], `${path}.${key}`);
        }
      }
    };

    findReferences(content);
  }

  /**
   * Map context layers
   */
  mapContextLayers() {
    console.log('\n📊 Mapping Context Layers...');
    
    this.contextTree.contextLayers = {
      rootContext: this.findRootContext(),
      subContext: this.findSubContext(),
      boundaries: this.findBoundaries(),
      previousContext: this.findPreviousContext()
    };

    console.log(`✅ Context layers mapped`);
    
    return this;
  }

  findRootContext() {
    const rcPath = path.join(ROOT, 'root-context.json');
    if (!fs.existsSync(rcPath)) return null;

    const rc = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
    return {
      goal: rc.rootGoal,
      principles: rc.principles?.length || 0,
      evolutions: rc.eightEvolutions?.length || 0
    };
  }

  findSubContext() {
    // Sub-context is determined by the file's location and purpose
    return {
      location: this.targetFile.relative,
      category: this.categorizeFile(),
      purpose: this.determinePurpose()
    };
  }

  categorizeFile() {
    const rel = this.targetFile.relative;
    if (rel.startsWith('scripts/')) return 'automation';
    if (rel.startsWith('packages/')) return 'package';
    if (rel.startsWith('src/')) return 'source';
    if (rel.startsWith('tests/')) return 'testing';
    if (rel.startsWith('docs/')) return 'documentation';
    if (rel.startsWith('contracts/')) return 'governance';
    return 'root';
  }

  determinePurpose() {
    const name = this.targetFile.name.toLowerCase();
    if (name.includes('test')) return 'testing';
    if (name.includes('validate')) return 'validation';
    if (name.includes('generate')) return 'generation';
    if (name.includes('analyze')) return 'analysis';
    if (name.includes('trace')) return 'traceability';
    if (name.includes('cag')) return 'context-augmentation';
    return 'utility';
  }

  findBoundaries() {
    const rcPath = path.join(ROOT, 'root-context.json');
    if (!fs.existsSync(rcPath)) return null;

    const rc = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
    const boundaries = rc.contextBoundaries || {};
    
    const inScope = boundaries.inScope?.some(p => this.targetFile.relative.includes(p));
    const outOfScope = boundaries.outOfScope?.some(p => this.targetFile.relative.includes(p));

    return {
      inScope: inScope || false,
      outOfScope: outOfScope || false,
      allowed: inScope ? 'YES' : 'NO'
    };
  }

  findPreviousContext() {
    const contextPath = path.join(ROOT, '.generated', 'cag-context.json');
    if (!fs.existsSync(contextPath)) return null;

    const context = JSON.parse(fs.readFileSync(contextPath, 'utf-8'));
    return {
      lastAction: context.action,
      lastAgent: context.agent,
      coherenceScore: context.coherenceScore
    };
  }

  /**
   * Display context tree
   */
  display() {
    console.log('\n' + '═'.repeat(70));
    console.log('🌳 CAG CONTEXT TREE - COMPLETE LINEAGE');
    console.log('═'.repeat(70));
    
    console.log(`\n📄 File: ${this.targetFile.relative}`);
    console.log(`   • Type: ${this.targetFile.type}`);
    console.log(`   • Name: ${this.targetFile.name}`);
    
    console.log(`\n🏛️ Governance:`);
    console.log(`   • In Knowledge Index: ${this.contextTree.governance.inKnowledgeIndex}`);
    console.log(`   • Governed By: ${this.contextTree.governance.governedBy.length} rules`);
    console.log(`   • Telemetry Required: ${this.contextTree.governance.telemetryRequired}`);
    
    console.log(`\n📊 Context Layers:`);
    console.log(`   • Root Goal: ${this.contextTree.contextLayers.rootContext?.goal.substring(0, 50)}...`);
    console.log(`   • Sub-Context: ${this.contextTree.contextLayers.subContext?.category}`);
    console.log(`   • Purpose: ${this.contextTree.contextLayers.subContext?.purpose}`);
    console.log(`   • Boundaries: ${this.contextTree.contextLayers.boundaries?.allowed}`);
    
    console.log(`\n🔗 Dependencies: ${this.contextTree.dependencies.length}`);
    this.contextTree.dependencies.slice(0, 5).forEach(dep => {
      console.log(`   • ${dep.module || dep.target}`);
    });
    if (this.contextTree.dependencies.length > 5) {
      console.log(`   ... and ${this.contextTree.dependencies.length - 5} more`);
    }
    
    console.log('\n' + '═'.repeat(70));
  }

  /**
   * Save context tree
   */
  saveContextTree(outputFile) {
    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputFile, JSON.stringify(this.contextTree, null, 2));
    console.log(`\n✅ Context tree saved to: ${outputFile}`);
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
    const mapper = new CAGContextTreeMapper();
    
    mapper.loadKnowledgeIndex()
      .resolveTargetFile(options.file || 'scripts/cag-context-engine.js')
      .mapGovernanceContext()
      .mapDependencies()
      .mapContextLayers();

    mapper.display();

    const outputFile = options.output || path.join(ROOT, '.generated', `context-tree-${mapper.targetFile.name}.json`);
    mapper.saveContextTree(outputFile);

    console.log('\n✅ Context tree mapping complete.\n');
  } catch (error) {
    console.error(`\n❌ Context tree mapping failed: ${error.message}\n`);
    process.exit(1);
  }
}

main();

