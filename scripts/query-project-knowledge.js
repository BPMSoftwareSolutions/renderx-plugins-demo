#!/usr/bin/env node

/**
 * Project Knowledge Map Query Tool
 * 
 * Enables intelligent queries across the project knowledge base
 * 
 * Usage:
 *   node scripts/query-project-knowledge.js "Find self-healing project files"
 *   node scripts/query-project-knowledge.js "Where is sprint workflow"
 *   node scripts/query-project-knowledge.js "Reusable patterns"
 *   node scripts/query-project-knowledge.js "dashboard workflows"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load knowledge maps
const globalMapPath = path.join(__dirname, '..', '.generated', 'global-traceability-map.json');
const projectMapPath = path.join(__dirname, '..', '.generated', 'project-knowledge-map.json');

const globalMap = JSON.parse(fs.readFileSync(globalMapPath, 'utf8'));
const projectMap = JSON.parse(fs.readFileSync(projectMapPath, 'utf8'));

/**
 * Search knowledge maps for relevant content
 */
function searchKnowledge(query) {
  const q = query.toLowerCase();

  // Pattern 1: Find project by name
  if (q.includes('self-healing') || q.includes('self healing')) {
    return formatProjectResult(projectMap.project_registry.projects.find(p => p.id === 'self-healing'));
  }

  if (q.includes('ographx')) {
    return formatProjectResult(projectMap.project_registry.projects.find(p => p.id === 'ographx'));
  }

  if (q.includes('dashboard')) {
    return formatProjectResult(projectMap.project_registry.projects.find(p => p.id === 'slo-dashboard'));
  }

  // Pattern 2: Find workflows
  if (q.includes('sprint') || q.includes('workflow')) {
    const selfHealing = projectMap.project_registry.projects.find(p => p.id === 'self-healing');
    return formatWorkflowResult(selfHealing.workflows.sprint_workflow);
  }

  // Pattern 3: Find patterns
  if (q.includes('pattern') || q.includes('reusable')) {
    const selfHealing = projectMap.project_registry.projects.find(p => p.id === 'self-healing');
    return formatPatternsResult(selfHealing.patterns);
  }

  // Pattern 4: Find files
  if (q.includes('file') || q.includes('location')) {
    if (q.includes('self-healing')) {
      const selfHealing = projectMap.project_registry.projects.find(p => p.id === 'self-healing');
      return formatFilesResult(selfHealing.project_files);
    }
  }

  // Default: show help
  return showHelp();
}

function formatProjectResult(project) {
  let result = `\n📁 PROJECT: ${project.name}\n`;
  result += `${'═'.repeat(60)}\n\n`;
  result += `📍 Location: ${project.path}\n`;
  result += `🏷️  Type: ${project.type}\n`;
  result += `📌 Status: ${project.status}\n`;
  result += `📝 Purpose: ${project.purpose}\n\n`;

  if (project.project_files) {
    result += `📂 Key Files:\n`;
    if (project.project_files.root_files) {
      project.project_files.root_files.forEach(f => {
        result += `   • ${f.file} - ${f.purpose}\n`;
      });
    }
    result += '\n';
  }

  if (project.workflows) {
    result += `🔄 Workflows:\n`;
    Object.entries(project.workflows).forEach(([key, workflow]) => {
      result += `   • ${workflow.name}\n`;
    });
    result += '\n';
  }

  if (project.patterns) {
    result += `🎯 Reusable Patterns: ${Object.keys(project.patterns).length}\n\n`;
  }

  return result;
}

function formatWorkflowResult(workflow) {
  let result = `\n🔄 WORKFLOW: ${workflow.name}\n`;
  result += `${'═'.repeat(60)}\n\n`;
  result += `📍 Location: ${workflow.location}\n`;
  result += `📝 Description: ${workflow.description}\n\n`;

  if (workflow.phases) {
    result += `📊 Phases (${workflow.phases.length}):\n`;
    workflow.phases.forEach(phase => {
      result += `   ${phase.phase}. ${phase.name} (${phase.duration})\n`;
      result += `      • Handlers: ${phase.handlers}\n`;
      result += `      • Tests: ${phase.tests}\n`;
    });
    result += '\n';
  }

  if (workflow.reusable_for) {
    result += `♻️  Reusable For:\n`;
    workflow.reusable_for.forEach(use => {
      result += `   • ${use}\n`;
    });
    result += '\n';
  }

  if (workflow.why_effective) {
    result += `✨ Why Effective:\n`;
    workflow.why_effective.forEach(reason => {
      result += `   • ${reason}\n`;
    });
  }

  return result;
}

function formatPatternsResult(patterns) {
  let result = `\n🎯 REUSABLE PATTERNS\n`;
  result += `${'═'.repeat(60)}\n\n`;

  Object.entries(patterns).forEach(([key, pattern]) => {
    result += `📌 ${pattern.name}\n`;
    result += `   Location: ${pattern.location}\n`;
    result += `   Purpose: ${pattern.description}\n`;
    if (pattern.applicable_to && Array.isArray(pattern.applicable_to)) {
      result += `   Applicable to: ${pattern.applicable_to.join(', ')}\n`;
    }
    result += `\n`;
  });

  return result;
}

function formatFilesResult(projectFiles) {
  let result = `\n📂 PROJECT FILES\n`;
  result += `${'═'.repeat(60)}\n\n`;

  if (projectFiles.root_files) {
    result += `Root Files:\n`;
    projectFiles.root_files.forEach(f => {
      result += `   • ${f.file}\n`;
      result += `     Purpose: ${f.purpose}\n`;
    });
    result += '\n';
  }

  if (projectFiles.source_structure) {
    const structure = projectFiles.source_structure;
    if (structure.handlers) {
      result += `Source Handlers (${structure.handlers.path}):\n`;
      structure.handlers.subdirectories.forEach(sub => {
        result += `   • ${sub.name}/ - ${sub.handlers} handlers\n`;
        result += `     ${sub.purpose}\n`;
      });
      result += '\n';
    }

    if (structure.json_sequences) {
      result += `JSON Sequences (${structure.json_sequences.path}):\n`;
      structure.json_sequences.files.forEach(f => {
        result += `   • ${f.file}\n`;
      });
      result += '\n';
    }

    if (structure.tests) {
      result += `Test Files (${structure.tests.path}):\n`;
      structure.tests.files.forEach(f => {
        result += `   • ${f}\n`;
      });
    }
  }

  return result;
}

function showHelp() {
  return `
🔍 PROJECT KNOWLEDGE QUERY TOOL
${'═'.repeat(60)}

This tool helps you find things in your project knowledge base.

EXAMPLES:
  node scripts/query-project-knowledge.js "self-healing"
    → Shows self-healing project overview, files, workflows

  node scripts/query-project-knowledge.js "sprint workflow"
    → Shows the 7-phase sprint workflow implementation pattern

  node scripts/query-project-knowledge.js "reusable patterns"
    → Shows all reusable patterns from self-healing

  node scripts/query-project-knowledge.js "self-healing files"
    → Shows all files in self-healing project structure

  node scripts/query-project-knowledge.js "ographx"
    → Shows OGraphX analysis tool details

  node scripts/query-project-knowledge.js "dashboard"
    → Shows SLO dashboard project details

SUPPORTED QUERIES:
  • Project names: "self-healing", "ographx", "dashboard"
  • Workflows: "sprint", "workflow", "flow"
  • Patterns: "pattern", "reusable"
  • Files: "file", "location"
  • Components: "component", "structure"

`;
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(showHelp());
    return;
  }

  const query = args.join(' ');
  console.log(searchKnowledge(query));
}

main();
