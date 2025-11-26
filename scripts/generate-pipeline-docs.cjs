#!/usr/bin/env node

/**
 * Symphony Pipeline Documentation Generator
 * 
 * Generates Markdown documentation from JSON pipeline definitions.
 * - Reads JSON pipeline files
 * - Creates comprehensive Markdown with structure and details
 * - Adds AUTO-GENERATED headers for governance
 * - Validates pipeline completeness
 * 
 * Usage:
 *   node scripts/generate-pipeline-docs.cjs
 *   node scripts/generate-pipeline-docs.cjs symphonia-conformity-alignment-pipeline
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const PIPELINES_DIR = path.join(WORKSPACE_ROOT, 'packages/orchestration/json-sequences');
const DOCS_OUTPUT_DIR = path.join(WORKSPACE_ROOT, 'docs/generated');

function ensureOutputDir() {
  if (!fs.existsSync(DOCS_OUTPUT_DIR)) {
    fs.mkdirSync(DOCS_OUTPUT_DIR, { recursive: true });
  }
}

function loadPipeline(filename) {
  const filePath = path.join(PIPELINES_DIR, filename);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error(`Failed to load pipeline ${filename}:`, error.message);
    return null;
  }
}

function computeHash(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

function generateMarkdownDoc(pipeline, sourceFile) {
  const timestamp = new Date().toISOString();
  
  let doc = `<!-- AUTO-GENERATED: ${path.basename(sourceFile)} -->
<!-- Generated: ${timestamp} -->
<!-- Source: ${sourceFile} -->

# ${pipeline.title}

**Status:** ${pipeline.status}  
**Kind:** ${pipeline.kind}  
**Package:** ${pipeline.packageName}  
**ID:** \`${pipeline.id}\`

---

## 📋 Overview

${pipeline.description}

**Purpose:** ${pipeline.purpose}

**Trigger:** ${pipeline.trigger}

---

## 🎼 Pipeline Structure

- **Total Movements:** ${pipeline.movements ? pipeline.movements.length : 0}
- **Total Beats:** ${pipeline.beats}
- **Governance Policies:** ${pipeline.governance ? pipeline.governance.policies.length : 0}
- **Tracked Metrics:** ${pipeline.governance ? pipeline.governance.metrics.length : 0}

`;

  // Events section
  if (pipeline.events && pipeline.events.length > 0) {
    doc += `## 📡 Events

The pipeline emits ${pipeline.events.length} distinct events during execution:

\`\`\`
${pipeline.events.map((e, i) => `${(i + 1).toString().padStart(2, '0')}. ${e}`).join('\n')}
\`\`\`

`;
  }

  // Governance section
  if (pipeline.governance) {
    doc += `## 🛡️ Governance

### Policies

${pipeline.governance.policies.map(p => `- ${p}`).join('\n')}

### Metrics Tracked

${pipeline.governance.metrics.map(m => `- ${m}`).join('\n')}

`;
  }

  // Movements section
  if (pipeline.movements && pipeline.movements.length > 0) {
    doc += `## 🎵 Movements

`;
    pipeline.movements.forEach(movement => {
      doc += `### Movement ${movement.movement}: ${movement.name}

**Kind:** \`${movement.kind}\`  
**Beats:** ${movement.steps ? movement.steps.length : movement.beats}

${movement.description}

#### Violation Categories Addressed
${movement.violationCategories ? movement.violationCategories.map(v => `- ${v}`).join('\n') : '- (none specified)'}

`;

      // Steps/Beats
      if (movement.steps && movement.steps.length > 0) {
        doc += `#### Beats

`;
        movement.steps.forEach(step => {
          doc += `**Beat ${step.beat}: ${step.title}**
- Description: ${step.description}
- Event: \`${step.event}\`
- Handler: \`${step.handler}\`
- Kind: ${step.kind}
- Timing: ${step.timing}
${step.critical ? '- **Critical:** Yes' : ''}
${step.automationRate ? `- Automation Rate: ${(step.automationRate * 100).toFixed(0)}%` : ''}
${step.violations ? `- Violations Fixed: ${step.violations.length}` : ''}

`;
        });
      }

      doc += '\n';
    });
  }

  // Violations section
  if (pipeline.movements) {
    const allViolations = new Set();
    pipeline.movements.forEach(m => {
      m.steps?.forEach(s => {
        s.violations?.forEach(v => allViolations.add(v));
      });
    });

    if (allViolations.size > 0) {
      doc += `## 🔴 Violation Categories (${allViolations.size} Total)

The pipeline detects and remediates the following violation types:

${Array.from(allViolations).sort().map((v, i) => `${(i + 1).toString().padStart(2, '0')}. \`${v}\``).join('\n')}

`;
    }
  }

  // Handlers section
  if (pipeline.handlers) {
    const handlerCount = Object.keys(pipeline.handlers).length;
    doc += `## 🔧 Handlers (${handlerCount} Total)

The pipeline orchestrates execution through the following handler configurations:

`;
    Object.entries(pipeline.handlers).forEach(([name, config]) => {
      doc += `### \`${name}\`

- Script: \`${config.script}\`
- Method: \`${config.method}\`
- Timeout: ${config.timeout}ms
- Retries: ${config.retries}
${config.rollbackCapable ? '- Rollback Capable: Yes' : ''}

`;
    });
  }

  // Completion criteria section
  if (pipeline.completionCriteria) {
    doc += `## ✅ Completion Criteria

`;
    Object.entries(pipeline.completionCriteria).forEach(([key, criteria]) => {
      doc += `### ${key}

${criteria.description}

**Metrics:**
${criteria.metrics.map(m => `- ${m}`).join('\n')}

`;
    });
  }

  // Rollback strategy section
  if (pipeline.rollbackStrategy) {
    doc += `## 🔄 Rollback Strategy

- **Enabled:** ${pipeline.rollbackStrategy.enabled ? 'Yes' : 'No'}
- **Snapshot Before:** ${pipeline.rollbackStrategy.snapshotBefore ? 'Yes' : 'No'}
- **Atomic:** ${pipeline.rollbackStrategy.atomic ? 'Yes' : 'No'}
- **Rollback Triggers:** ${pipeline.rollbackStrategy.rollbackOn?.join(', ') || '(none)'}

`;
  }

  // Metadata section
  doc += `## 📚 Metadata

- **Version:** ${pipeline.metadata?.version || 'unknown'}
- **Last Updated:** ${pipeline.metadata?.lastUpdated || 'unknown'}
- **Author:** ${pipeline.metadata?.author || 'unknown'}
- **Tags:** ${pipeline.metadata?.tags?.join(', ') || '(none)'}

---

**This documentation is auto-generated from the JSON pipeline definition.**  
**To update, edit the JSON source file, not this Markdown.**

Generated: ${timestamp}
`;

  return doc;
}

async function generateAllPipelineDocs() {
  console.log('🎵 Generating Symphony Pipeline Documentation\n');

  ensureOutputDir();

  const pipelineFiles = fs.readdirSync(PIPELINES_DIR)
    .filter(f => f.endsWith('-pipeline.json'));

  console.log(`Found ${pipelineFiles.length} pipeline files:\n`);

  pipelineFiles.forEach(file => {
    const pipeline = loadPipeline(file);
    if (!pipeline) return;

    console.log(`  📄 ${file}`);
    console.log(`     Title: ${pipeline.title}`);
    console.log(`     Movements: ${pipeline.movements?.length || 0}`);
    console.log(`     Beats: ${pipeline.beats}`);

    // Generate markdown
    const markdown = generateMarkdownDoc(pipeline, file);

    // Determine output filename
    const baseFilename = file.replace('-pipeline.json', '-pipeline');
    const outputFilename = baseFilename
      .split('-')
      .map((word, idx) => idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('_')
      .toUpperCase() + '.md';

    const outputPath = path.join(DOCS_OUTPUT_DIR, outputFilename);

    // Write markdown
    fs.writeFileSync(outputPath, markdown, 'utf-8');
    console.log(`     ✅ Generated: ${outputFilename}\n`);
  });

  console.log(`\n✅ Documentation generated in: ${path.relative(WORKSPACE_ROOT, DOCS_OUTPUT_DIR)}`);
}

// Main
generateAllPipelineDocs().catch(error => {
  console.error('❌ Generation failed:', error);
  process.exit(1);
});
