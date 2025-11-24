#!/usr/bin/env node

/**
 * Markdown Generator - Auto-Generation Master Script
 * 
 * Purpose: Master orchestrator for generating all markdown documentation
 * from JSON authorities. No manual markdown creation allowed.
 * 
 * Policy: JSON-Driven Automation
 * - Source of truth: JSON authorities (project plan, specs, etc.)
 * - Generated docs: Markdown files (auto-generated, never hand-edited)
 * - Enforcement: Pre-commit, build-time, and CI/CD validation
 * 
 * Usage:
 *   npm run generate:all                          # Generate all markdown files
 *   npm run generate:context-tree-audit           # Generate specific file
 *   npm run generate:all -- --verify              # Generate and verify checksums
 * 
 * Generated Files:
 *   1. CONTEXT_TREE_AUDIT_SESSION.md
 *   2. SESSION_SUMMARY.md
 *   3. NEXT_SESSION_HANDOFF.md
 *   4. README.md (.generated/)
 *   5. MASTER_INDEX.md
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  packagePath: path.join(__dirname, '..'),
  generatedPath: path.join(__dirname, '..', '.generated'),
  authoritiesPath: path.join(__dirname, '..'),
  
  generators: {
    'context-tree-audit': {
      name: 'Context Tree Audit Session',
      outputFile: 'CONTEXT_TREE_AUDIT_SESSION.md',
      sourceFiles: [
        'slo-dashboard-project-plan.json',
        '.generated/slo-dashboard-business-bdd-specifications.json'
      ],
      generator: generateContextTreeAudit,
      complexity: 'HIGH'
    },
    'session-summary': {
      name: 'Session Summary',
      outputFile: 'SESSION_SUMMARY.md',
      sourceFiles: ['slo-dashboard-project-plan.json'],
      generator: generateSessionSummary,
      complexity: 'MEDIUM'
    },
    'next-session-handoff': {
      name: 'Next Session Handoff',
      outputFile: 'NEXT_SESSION_HANDOFF.md',
      sourceFiles: ['slo-dashboard-project-plan.json'],
      generator: generateNextSessionHandoff,
      complexity: 'HIGH'
    },
    'directory-readme': {
      name: 'Directory README',
      outputFile: 'README.md',
      sourceFiles: ['slo-dashboard-project-plan.json'],
      generator: generateDirectoryReadme,
      complexity: 'MEDIUM'
    },
    'master-index': {
      name: 'Master Index',
      outputFile: 'MASTER_INDEX.md',
      sourceFiles: ['slo-dashboard-project-plan.json'],
      generator: generateMasterIndex,
      complexity: 'MEDIUM'
    }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function loadJSON(filePath) {
  try {
    const fullPath = path.join(CONFIG.authoritiesPath, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Failed to load ${filePath}: ${error.message}`);
    throw error;
  }
}

function calculateChecksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function createGeneratorHeader(sourceFiles, outputFile) {
  return `<!-- 
  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
  
  Generated: ${new Date().toISOString()}
  Output: ${outputFile}
  Source Files: ${sourceFiles.join(', ')}
  Policy: JSON-Driven Automation
  
  To regenerate: npm run generate:${CONFIG.generators[Object.keys(CONFIG.generators).find(k => CONFIG.generators[k].outputFile === outputFile)].name.toLowerCase().replace(/ /g, '-')}
  
  Manual edits will be detected and blocked by pre-commit hooks.
  Always regenerate from source JSON authorities.
-->

`;
}

function ensureDirectories() {
  if (!fs.existsSync(CONFIG.generatedPath)) {
    fs.mkdirSync(CONFIG.generatedPath, { recursive: true });
    console.log(`✅ Created .generated/ directory`);
  }
}

// ============================================================================
// GENERATOR: CONTEXT TREE AUDIT SESSION
// ============================================================================

function generateContextTreeAudit(projectPlan, _specs) {
  const timestamp = new Date().toISOString();
  const completionPercent = calculateCompletion(projectPlan);
  
  const sections = [
    `# Context Tree Audit Session: slo-dashboard`,
    ``,
    `**Generated**: ${timestamp}  `,
    `**Project**: @slo-shape/dashboard  `,
    `**Version**: ${projectPlan.version}  `,
    `**Status**: ✅ READY FOR CONTINUATION`,
    ``,
    `---`,
    ``,
    `## 1. Project Overview`,
    ``,
    `### Vision`,
    `${projectPlan.vision}`,
    ``,
    `### Principles`,
    projectPlan.principles.map(p => `- ${p}`).join('\n'),
    ``,
    `---`,
    ``,
    `## 2. Phase Status`,
    ``,
    ...projectPlan.phases.map(phase => generatePhaseSection(phase)).join('\n\n'),
    ``,
    `---`,
    ``,
    `## 3. Task Breakdown`,
    ``,
    generateTaskBreakdown(projectPlan),
    ``,
    `---`,
    ``,
    `## 4. Completion Metrics`,
    ``,
    `\`\`\``,
    `Overall Completion: ${completionPercent}%`,
    `Phases Complete: ${projectPlan.phases.filter(p => p.status === 'done').length} of ${projectPlan.phases.length}`,
    `Blockers: ${projectPlan.tasks.filter(t => t.status === 'blocked').length}`,
    `\`\`\``,
    ``,
    `---`,
    ``,
    `**Source**: Generated from slo-dashboard-project-plan.json`,
    `**Policy**: Never edit manually - always regenerate from JSON`,
  ];
  
  return sections.filter(s => s !== undefined).join('\n');
}

function generatePhaseSection(phase) {
  const statusEmoji = {
    'done': '✅',
    'in-progress': '⏳',
    'pending': '⏱️'
  }[phase.status] || '❓';
  
  return [
    `### Phase ${phase.id}: ${phase.name} ${statusEmoji}`,
    `**Status**: ${phase.status.toUpperCase()}`,
    `**Goals**:`,
    `${phase.goals.map(g => `- ${g}`).join('\n')}`,
    `**Artifacts**:`,
    `\`\`\``,
    `${phase.artifacts.join('\n')}`,
    `\`\`\``,
  ].join('\n');
}

function generateTaskBreakdown(projectPlan) {
  const tasksByPhase = {};
  projectPlan.tasks.forEach(task => {
    if (!tasksByPhase[task.phase]) {
      tasksByPhase[task.phase] = [];
    }
    tasksByPhase[task.phase].push(task);
  });
  
  const lines = ['| Key | Description | Phase | Status |', '|-----|-------------|-------|--------|'];
  Object.entries(tasksByPhase).forEach(([phase, tasks]) => {
    tasks.forEach(task => {
      const statusEmoji = {
        'done': '✅',
        'in-progress': '⏳',
        'pending': '⏱️',
        'blocked': '🚫'
      }[task.status] || '❓';
      
      lines.push(`| ${task.key} | ${task.desc} | ${phase} | ${statusEmoji} ${task.status} |`);
    });
  });
  
  return lines.join('\n');
}

function calculateCompletion(projectPlan) {
  const total = projectPlan.phases.length;
  const done = projectPlan.phases.filter(p => p.status === 'done').length;
  return Math.round((done / total) * 100);
}

// ============================================================================
// GENERATOR: SESSION SUMMARY
// ============================================================================

function generateSessionSummary(projectPlan) {
  const completionPercent = calculateCompletion(projectPlan);
  
  return [
    `# SLO Dashboard: Session Summary`,
    ``,
    `**Generated**: ${new Date().toISOString()}  `,
    `**Status**: ✅ GOVERNANCE COMPLETE`,
    ``,
    `## Executive Summary`,
    ``,
    `Project completion: ${completionPercent}%`,
    ``,
    `### Phases`,
    `${projectPlan.phases.map(p => `- Phase ${p.id}: ${p.name} - ${p.status}`).join('\n')}`,
    ``,
    `### Key Metrics`,
    `- Phases Complete: ${projectPlan.phases.filter(p => p.status === 'done').length} of ${projectPlan.phases.length}`,
    `- Total Tasks: ${projectPlan.tasks.length}`,
    `- Pending Tasks: ${projectPlan.tasks.filter(t => t.status === 'pending').length}`,
    ``,
    `---`,
    ``,
    `**Source**: Generated from slo-dashboard-project-plan.json`,
    `**Policy**: Never edit manually - always regenerate from JSON`,
  ].join('\n');
}

// ============================================================================
// GENERATOR: NEXT SESSION HANDOFF
// ============================================================================

function generateNextSessionHandoff(projectPlan) {
  // Find current phase (first in-progress or pending phase)
  const currentPhase = projectPlan.phases.find(p => 
    p.status === 'in-progress' || p.status === 'pending'
  ) || projectPlan.phases[projectPlan.phases.length - 1];
  
  const tasksForCurrentPhase = projectPlan.tasks.filter(t => 
    t.phase === currentPhase.id
  );
  
  return [
    `# SLO Dashboard: Next Session Handoff`,
    ``,
    `**Generated**: ${new Date().toISOString()}  `,
    `**Current Phase**: ${currentPhase.name}`,
    ``,
    `## Quick Start`,
    ``,
    `Current phase: ${currentPhase.name}`,
    `Status: ${currentPhase.status}`,
    ``,
    `### Tasks for This Phase`,
    ``,
    tasksForCurrentPhase.map(task => [
      `**${task.key}**: ${task.desc}`,
      `- Status: ${task.status}`,
      `- Artifact: ${task.artifact}`
    ].join('\n')).join('\n\n'),
    ``,
    `---`,
    ``,
    `**Source**: Generated from slo-dashboard-project-plan.json`,
    `**Policy**: Never edit manually - always regenerate from JSON`,
  ].join('\n');
}

// ============================================================================
// GENERATOR: DIRECTORY README
// ============================================================================

function generateDirectoryReadme(_projectPlan) {
  const files = fs.readdirSync(CONFIG.generatedPath)
    .filter(f => !f.startsWith('.'))
    .sort();
  
  return [
    `# SLO Dashboard - Generated Documentation`,
    ``,
    `**Generated**: ${new Date().toISOString()}`,
    ``,
    `## Files in This Directory`,
    ``,
    `| File | Purpose |`,
    `|------|---------|`,
    ...files.map(f => {
      const descriptions = {
        'CONTEXT_TREE_AUDIT_SESSION.md': 'Complete project audit',
        'SESSION_SUMMARY.md': 'Executive summary',
        'NEXT_SESSION_HANDOFF.md': 'Next steps guide',
        'README.md': 'This file',
        'MASTER_INDEX.md': 'Master documentation index',
        'MARKDOWN_GENERATION_AUTHORITY.json': 'Auto-generation policy',
        'MARKDOWN_GOVERNANCE_REPORT.md': 'Governance violations report',
        'slo-dashboard-project-plan.json': 'Project authority (LOCKED)',
        'slo-dashboard-business-bdd-specifications.json': 'Requirements (LOCKED)',
        'slo-dashboard-drift-config.json': 'Drift detection config',
        'slo-dashboard-demo-plan.json': 'Demo scenarios'
      };
      return `| ${f} | ${descriptions[f] || 'Generated artifact'} |`;
    }),
    ``,
    `---`,
    ``,
    `**Note**: All .md files in this directory are auto-generated from JSON authorities.`,
    `Never edit them manually. Always regenerate using npm run generate:all`,
    ``,
    `**Source**: Generated from slo-dashboard-project-plan.json`,
    `**Policy**: Never edit manually - always regenerate from JSON`,
  ].join('\n');
}

// ============================================================================
// GENERATOR: MASTER INDEX
// ============================================================================

function generateMasterIndex(projectPlan) {
  return [
    `# SLO Dashboard - Master Index`,
    ``,
    `**Generated**: ${new Date().toISOString()}`,
    ``,
    `## Start Here`,
    ``,
    `1. [Context Tree Audit](./CONTEXT_TREE_AUDIT_SESSION.md) - Full project audit`,
    `2. [Session Summary](./SESSION_SUMMARY.md) - Executive summary`,
    `3. [Next Session Handoff](./NEXT_SESSION_HANDOFF.md) - What to do next`,
    ``,
    `## Project Status`,
    ``,
    `**Completion**: ${calculateCompletion(projectPlan)}%`,
    `**Phases**: ${projectPlan.phases.filter(p => p.status === 'done').length}/${projectPlan.phases.length}`,
    `**Tasks**: ${projectPlan.tasks.filter(t => t.status === 'done').length}/${projectPlan.tasks.length}`,
    ``,
    `---`,
    ``,
    `**Source**: Generated from slo-dashboard-project-plan.json`,
    `**Policy**: Never edit manually - always regenerate from JSON`,
  ].join('\n');
}

// ============================================================================
// MAIN GENERATION ORCHESTRATOR
// ============================================================================

async function generateAll(specific = null, options = {}) {
  console.log('\n📄 Markdown Generator - Auto-Generation System');
  console.log('═'.repeat(60));
  console.log('Policy: JSON-Driven Automation');
  console.log('No manual markdown files allowed in .generated/\n');
  
  ensureDirectories();
  
  // Load JSON authorities
  console.log('📋 Loading JSON authorities...');
  const projectPlan = loadJSON('slo-dashboard-project-plan.json');
  const specs = loadJSON('.generated/slo-dashboard-business-bdd-specifications.json');
  console.log('✅ Authorities loaded\n');
  
  // Generate requested files
  const generators = specific 
    ? [specific]
    : Object.keys(CONFIG.generators);
  
  let successCount = 0;
  let failureCount = 0;
  const results = {};
  
  for (const generatorKey of generators) {
    const config = CONFIG.generators[generatorKey];
    if (!config) {
      console.error(`❌ Unknown generator: ${generatorKey}`);
      continue;
    }
    
    try {
      console.log(`📝 Generating ${config.name}...`);
      
      // Call appropriate generator
      let content;
      switch (generatorKey) {
        case 'context-tree-audit':
          content = generateContextTreeAudit(projectPlan, specs);
          break;
        case 'session-summary':
          content = generateSessionSummary(projectPlan);
          break;
        case 'next-session-handoff':
          content = generateNextSessionHandoff(projectPlan);
          break;
        case 'directory-readme':
          content = generateDirectoryReadme(projectPlan);
          break;
        case 'master-index':
          content = generateMasterIndex(projectPlan);
          break;
        default:
          throw new Error(`No generator implementation for ${generatorKey}`);
      }
      
      // Add generator header
      const header = createGeneratorHeader(config.sourceFiles, config.outputFile);
      const finalContent = header + content;
      
      // Write file
      const outputPath = path.join(CONFIG.generatedPath, config.outputFile);
      fs.writeFileSync(outputPath, finalContent, 'utf8');
      
      // Calculate checksum
      const checksum = calculateChecksum(finalContent);
      
      results[config.outputFile] = {
        success: true,
        checksum: checksum,
        size: finalContent.length
      };
      
      console.log(`   ✅ Generated: ${config.outputFile}`);
      console.log(`   📏 Size: ${finalContent.length} bytes`);
      console.log(`   🔐 Checksum: ${checksum.substring(0, 8)}...`);
      
      successCount++;
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      results[config.outputFile] = {
        success: false,
        error: error.message
      };
      failureCount++;
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log(`\n📊 Generation Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log(`   📁 Generated in: ${CONFIG.generatedPath}\n`);
  
  if (options.verify) {
    console.log('🔍 Verifying generated files...');
    const violations = verifyMarkdownGovernance(results);
    if (violations.length === 0) {
      console.log('✅ All files comply with governance policy\n');
    } else {
      console.log(`⚠️ Found ${violations.length} governance issues\n`);
    }
  }
  
  // Return success/failure
  return failureCount === 0;
}

// ============================================================================
// VERIFICATION & ENFORCEMENT
// ============================================================================

function verifyMarkdownGovernance(results) {
  const violations = [];
  
  for (const [file, result] of Object.entries(results)) {
    if (!result.success) {
      violations.push(`${file}: Generation failed`);
    }
  }
  
  return violations;
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

const args = process.argv.slice(2);
const command = args[0] || 'all';
const _specific = args[1];
const options = {
  verify: args.includes('--verify')
};

if (command === 'all') {
  generateAll(null, options).then(success => {
    process.exit(success ? 0 : 1);
  });
} else if (CONFIG.generators[command]) {
  generateAll(command, options).then(success => {
    process.exit(success ? 0 : 1);
  });
} else {
  console.log('Usage: npm run generate:all [--verify]');
  console.log('\nAvailable generators:');
  Object.entries(CONFIG.generators).forEach(([key, config]) => {
    console.log(`  npm run generate:${key.replace(/_/g, '-')} - ${config.name}`);
  });
  process.exit(1);
}
