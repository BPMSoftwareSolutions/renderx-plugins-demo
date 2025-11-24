#!/usr/bin/env node

/**
 * Generate Orchestration Documentation from JSON
 *
 * Reads orchestration-domains.json and generates markdown documentation
 * This ensures documentation is always in sync with the JSON source of truth
 *
 * ARCHITECTURE: Data-driven generation
 * - All content comes from orchestration-domains.json
 * - No hardcoded strings or sketches
 * - Sketches are generated from domain.sketch data structure
 * - Fully extensible and maintainable
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORCHESTRATION_JSON = path.join(__dirname, '..', 'orchestration-domains.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'generated');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load orchestration domains
const orchestration = JSON.parse(fs.readFileSync(ORCHESTRATION_JSON, 'utf8'));

/**
 * ASCII Sketch Generator
 * Generates ASCII art from structured sketch data
 */
class SketchGenerator {
  /**
   * Generate ASCII sketch from domain sketch data
   * @param {Object} sketch - Sketch data structure from domain
   * @param {string} emoji - Domain emoji
   * @returns {string} ASCII art
   */
  static generatePhaseSketch(sketch, emoji) {
    if (!sketch || !sketch.phases) return '';

    const width = 57;
    let ascii = '';

    // Header
    ascii += `    ┌${'─'.repeat(width)}┐\n`;
    ascii += `    │ ${emoji} ${sketch.title.padEnd(width - 4)}│\n`;
    ascii += `    ├${'─'.repeat(width)}┤\n`;
    ascii += `    │${' '.repeat(width)}│\n`;

    // Phases
    sketch.phases.forEach((phase, idx) => {
      ascii += `    │  ${phase.name.padEnd(width - 4)}│\n`;
      phase.items.forEach((item, itemIdx) => {
        const isLast = itemIdx === phase.items.length - 1;
        const prefix = isLast ? '  └─' : '  ├─';
        ascii += `    │  ${prefix} ${item.padEnd(width - 9)}│\n`;
      });

      // Add flow arrow between phases (except last)
      if (idx < sketch.phases.length - 1) {
        ascii += `    │           │${' '.repeat(width - 14)}│\n`;
        ascii += `    │           ▼${' '.repeat(width - 14)}│\n`;
      }
    });

    ascii += `    │${' '.repeat(width)}│\n`;
    ascii += `    └${'─'.repeat(width)}┘\n`;

    return ascii;
  }

  /**
   * Generate generic pipeline sketch
   * @param {string} emoji - Domain emoji
   * @param {string} title - Sketch title
   * @param {Array} stages - Pipeline stages
   * @returns {string} ASCII art
   */
  static generatePipelineSketch(emoji, title, stages) {
    const width = 57;
    let ascii = '';

    ascii += `    ┌${'─'.repeat(width)}┐\n`;
    ascii += `    │ ${emoji} ${title.padEnd(width - 4)}│\n`;
    ascii += `    ├${'─'.repeat(width)}┤\n`;
    ascii += `    │${' '.repeat(width)}│\n`;

    stages.forEach((stage, idx) => {
      ascii += `    │  ${stage.padEnd(width - 4)}│\n`;
      if (idx < stages.length - 1) {
        ascii += `    │       │${' '.repeat(width - 10)}│\n`;
        ascii += `    │       ▼${' '.repeat(width - 10)}│\n`;
      }
    });

    ascii += `    │${' '.repeat(width)}│\n`;
    ascii += `    └${'─'.repeat(width)}┘\n`;

    return ascii;
  }
}

/**
 * Default sketches for domains without explicit sketch data
 * These are fallback generators for backward compatibility
 */
const defaultSketches = {
  // Fallback sketches for domains without explicit sketch data
  // These are generated dynamically from domain structure
};

/**
 * Generate ASCII sketch for a domain
 * Data-driven from domain.sketch structure
 */
function generateDomainSketch(domain) {
  if (!domain.sketch) return '';

  const sketch = domain.sketch;
  const width = 57;
  let ascii = '';

  // Header
  ascii += `    ┌${'─'.repeat(width)}┐\n`;
  ascii += `    │ ${domain.emoji} ${sketch.title.padEnd(width - 4)}│\n`;
  ascii += `    ├${'─'.repeat(width)}┤\n`;
  ascii += `    │${' '.repeat(width)}│\n`;

  // Phases
  if (sketch.phases && Array.isArray(sketch.phases)) {
    sketch.phases.forEach((phase, idx) => {
      ascii += `    │  ${phase.name.padEnd(width - 4)}│\n`;
      if (phase.items && Array.isArray(phase.items)) {
        phase.items.forEach((item, itemIdx) => {
          const isLast = itemIdx === phase.items.length - 1;
          const prefix = isLast ? '  └─' : '  ├─';
          ascii += `    │  ${prefix} ${item.padEnd(width - 9)}│\n`;
        });
      }

      // Add flow arrow between phases (except last)
      if (idx < sketch.phases.length - 1) {
        ascii += `    │           │${' '.repeat(width - 14)}│\n`;
        ascii += `    │           ▼${' '.repeat(width - 14)}│\n`;
      }
    });
  }

  ascii += `    │${' '.repeat(width)}│\n`;
  ascii += `    └${'─'.repeat(width)}┘\n`;

  return ascii;
}

/**
 * Generate main orchestration domains document
 * Data-driven from orchestration-domains.json
 */
function generateOrchestrationDomainsDoc() {
  let md = `# 🎼 Orchestration Domains\n\n`;
  md += `**Generated from:** \`orchestration-domains.json\`\n`;
  md += `**Last Generated:** ${new Date().toISOString()}\n`;
  md += `**DO NOT EDIT — GENERATED**\n\n`;

  md += `## Overview\n\n`;
  md += `${orchestration.metadata.description}\n\n`;

  md += `**Unified Interface:** \`${orchestration.unifiedInterface.name}\`\n`;
  md += `**Source:** \`${orchestration.unifiedInterface.source}\`\n\n`;

  md += `---\n\n`;
  md += `## The ${orchestration.domains.length} Orchestration Domains\n\n`;

  orchestration.domains.forEach((domain, idx) => {
    md += `### ${idx + 1}. ${domain.emoji} ${domain.name}\n\n`;
    md += `**ID:** \`${domain.id}\`\n\n`;
    md += `${domain.description}\n\n`;

    // Generate ASCII sketch from domain.sketch data
    const sketch = generateDomainSketch(domain);
    if (sketch) {
      md += `\`\`\`\n${sketch}\`\`\`\n\n`;
    }

    if (domain.sequenceFile) {
      md += `**Sequence File:** \`${domain.sequenceFile}\`\n\n`;
    }
    if (domain.sourceFile) {
      md += `**Source File:** \`${domain.sourceFile}\`\n\n`;
    }
    if (domain.sourceDirectory) {
      md += `**Source Directory:** \`${domain.sourceDirectory}\`\n\n`;
    }

    md += `**Category:** \`${domain.category}\`\n\n`;
    md += `**Purpose:** ${domain.purpose}\n\n`;

    if (domain.movements) {
      md += `**Movements:** ${domain.movements}\n\n`;
    }
    if (domain.beats) {
      md += `**Beats:** ${domain.beats}\n\n`;
    }

    if (domain.dynamics && domain.dynamics.length > 0) {
      md += `**Dynamics:** ${domain.dynamics.join(', ')}\n\n`;
    }

    if (domain.relatedDomains && domain.relatedDomains.length > 0) {
      md += `**Related Domains:** ${domain.relatedDomains.map(d => `\`${d}\``).join(', ')}\n\n`;
    }

    md += `**Status:** ${domain.status}\n\n`;
    md += `---\n\n`;
  });

  return md;
}

// Generate execution flow document
function generateExecutionFlowDoc() {
  let md = `# 🎵 Orchestration Execution Flow\n\n`;
  md += `**Generated from:** \`orchestration-domains.json\`\n`;
  md += `**Last Generated:** ${new Date().toISOString()}\n`;
  md += `**DO NOT EDIT — GENERATED**\n\n`;

  md += `## Execution Flow\n\n`;
  md += `Every orchestration domain follows this unified execution flow:\n\n`;

  orchestration.executionFlow.forEach((step) => {
    md += `### Step ${step.step}: ${step.name}\n\n`;
    md += `${step.description}\n\n`;
  });

  return md;
}

// Generate unified interface document
function generateUnifiedInterfaceDoc() {
  let md = `# 🎼 Unified MusicalSequence Interface\n\n`;
  md += `**Generated from:** \`orchestration-domains.json\`\n`;
  md += `**Last Generated:** ${new Date().toISOString()}\n`;
  md += `**DO NOT EDIT — GENERATED**\n\n`;

  md += `## Interface Definition\n\n`;
  md += `**Name:** \`${orchestration.unifiedInterface.name}\`\n\n`;
  md += `**Source:** \`${orchestration.unifiedInterface.source}\`\n\n`;

  md += `### Fields\n\n`;
  md += `| Field | Type | Required | Description |\n`;
  md += `|-------|------|----------|-------------|\n`;

  orchestration.unifiedInterface.fields.forEach((field) => {
    const required = field.required ? '✅' : '❌';
    md += `| \`${field.name}\` | \`${field.type}\` | ${required} | ${field.description} |\n`;
  });

  md += `\n---\n\n`;
  md += `## Categories\n\n`;

  orchestration.categories.forEach((cat) => {
    md += `### ${cat.name}\n\n`;
    md += `**ID:** \`${cat.id}\`\n\n`;
    md += `${cat.description}\n\n`;
  });

  md += `---\n\n`;
  md += `## Dynamics (Priority Levels)\n\n`;

  orchestration.dynamics.forEach((dyn) => {
    md += `- **${dyn.symbol}** (${dyn.name}): ${dyn.description}\n`;
  });

  md += `\n---\n\n`;
  md += `## Timing Options\n\n`;

  orchestration.timing.forEach((tim) => {
    md += `- **${tim.id}**: ${tim.description}\n`;
  });

  return md;
}

// Write files
try {
  console.log('📝 Generating orchestration documentation from JSON...\n');

  const domainsDoc = generateOrchestrationDomainsDoc();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'orchestration-domains.md'), domainsDoc);
  console.log('✅ Generated: docs/generated/orchestration-domains.md');

  const flowDoc = generateExecutionFlowDoc();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'orchestration-execution-flow.md'), flowDoc);
  console.log('✅ Generated: docs/generated/orchestration-execution-flow.md');

  const interfaceDoc = generateUnifiedInterfaceDoc();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'unified-musical-sequence-interface.md'), interfaceDoc);
  console.log('✅ Generated: docs/generated/unified-musical-sequence-interface.md');

  console.log('\n✨ All orchestration documentation generated successfully!');
  console.log('📍 Source: orchestration-domains.json');
  console.log('📍 Output: docs/generated/\n');
} catch (error) {
  console.error('❌ Error generating documentation:', error);
  process.exit(1);
}

