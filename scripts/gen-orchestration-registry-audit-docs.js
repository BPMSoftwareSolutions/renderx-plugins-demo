#!/usr/bin/env node
/**
 * Orchestration Registry Audit Documentation Generator
 * 
 * Generates markdown documentation from orchestration-registry-audit-pipeline.json
 * This script is auto-executed during npm run pre:manifests
 * 
 * Output: docs/generated/orchestration-registry-audit-pipeline/INDEX.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEQUENCE_FILE = path.join(__dirname, '../packages/orchestration/json-sequences/orchestration-registry-audit-pipeline.json');
const REGISTRY_FILE = path.join(__dirname, '../orchestration-domains.json');
const OUTPUT_DIR = path.join(__dirname, '../docs/generated/orchestration-registry-audit-pipeline');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'INDEX.md');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read the sequence file
let sequence;
try {
  const content = fs.readFileSync(SEQUENCE_FILE, 'utf8');
  sequence = JSON.parse(content);
} catch (error) {
  console.error(`❌ Failed to read sequence file: ${error.message}`);
  process.exit(1);
}

// Read the registry file to get current stats
let registry;
let auditStats = {};
try {
  const content = fs.readFileSync(REGISTRY_FILE, 'utf8');
  registry = JSON.parse(content);
  
  // Calculate audit statistics
  const orchDomains = registry.domains.filter(d => d.category === 'orchestration');
  const withSequence = orchDomains.filter(d => d.sequenceFile).length;
  const withScripts = orchDomains.filter(d => d.npmScripts).length;
  const totalScripts = orchDomains.reduce((sum, d) => {
    if (d.npmScripts) {
      return sum + d.npmScripts.split(',').length;
    }
    return sum;
  }, 0);
  
  auditStats = {
    totalDomains: orchDomains.length,
    withSequence,
    withScripts,
    totalScripts,
    sequenceCompleteness: ((withSequence / orchDomains.length) * 100).toFixed(1),
    scriptsCompleteness: ((withScripts / orchDomains.length) * 100).toFixed(1),
    complianceScore: ((Math.min(withSequence, withScripts) / orchDomains.length) * 100).toFixed(1)
  };
} catch (error) {
  console.error(`⚠️ Warning: Could not read registry for statistics: ${error.message}`);
}

// Generate markdown documentation
const markdown = generateDocumentation(sequence, auditStats);

// Write the output file
try {
  fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');
  console.log(`✅ Generated: ${OUTPUT_FILE}`);
} catch (error) {
  console.error(`❌ Failed to write output file: ${error.message}`);
  process.exit(1);
}

function generateDocumentation(seq, stats) {
  const timestamp = new Date().toISOString();
  
  return `<!-- AUTO-GENERATED -->
<!-- Source: ${SEQUENCE_FILE} -->
<!-- Generated: ${timestamp} -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# Orchestration Registry Audit Pipeline

**Status**: ${seq.status}  
**Version**: ${seq.version}  
**Category**: ${seq.category}  
**Beats**: ${seq.beats} | **Movements**: ${seq.movements.length}

---

## Overview

${seq.description}

**Purpose**: ${seq.purpose}

---

## Quick Start

\`\`\`bash
npm run audit:registry          # Run full audit
npm run gen:registry:audit:docs # Generate documentation
\`\`\`

---

## Current Audit Status

${stats.totalDomains ? `
| Metric | Value |
|--------|-------|
| Total Orchestration Domains | ${stats.totalDomains} |
| Domains with Sequence Files | ${stats.withSequence}/${stats.totalDomains} (${stats.sequenceCompleteness}%) |
| Domains with NPM Scripts | ${stats.withScripts}/${stats.totalDomains} (${stats.scriptsCompleteness}%) |
| Total NPM Scripts | ${stats.totalScripts} |
| Overall Compliance Score | ${stats.complianceScore}% |
` : '(Registry statistics pending)'}

---

## Movements (${seq.movements.length} Total)

${seq.movements.map((m, i) => `
### Movement ${i + 1}: ${m.name}

**Description**: ${m.description}

**Purpose**: ${m.purpose}

**Beats**: ${m.beats}
`).join('\n')}

---

## Audit Requirements

${seq.auditFramework.requirements.map(r => `- ${r}`).join('\n')}

---

## Audit Checkpoints

${seq.auditFramework.checkpoints.map(c => `
### ${c.name}

**Description**: ${c.description}  
**Severity**: ${c.severity}
`).join('\n')}

---

## Reporting Artifacts

${seq.reportingArtifacts.map(art => `
### ${art.name}

- **Type**: ${art.type}
- **Description**: ${art.description}
- **Location**: ${art.location}
`).join('\n')}

---

## Governance Policies

${seq.governance.policies.map(p => `- ${p}`).join('\n')}

---

## Implementation Details

### Beat Bindings

${seq.implementation.bindings.map(b => `
**Beat ${b.beat}**: \`${b.handler}\`
- Script: \`${b.script}\`
`).join('\n')}

---

## Related Orchestrations

${seq.metadata.relatedDomains.map(d => `- ${d}`).join('\n')}

---

## Events

The audit pipeline emits the following orchestration events:

${seq.events.map(e => `- \`${e}\``).join('\n')}

---

## Integration

### Run Audit

\`\`\`bash
# Full audit with completeness check
npm run audit:registry

# Generate audit documentation
npm run gen:registry:audit:docs
\`\`\`

### Registry Query

\`\`\`bash
# List all orchestration domains
npm run query:domains -- --list orchestration

# Show specific domain
npm run query:domains -- --show build-pipeline-symphony

# Get registry statistics
npm run query:domains -- --stats
\`\`\`

---

## Audit Governance Compliance

✅ JSON Authority Only (no manual documentation)  
✅ Auto-Generated Documentation (marked properly)  
✅ Domain-Scoped Docs (docs/generated/orchestration-registry-audit-pipeline/)  
✅ Registry Entry (linked in orchestration-domains.json)  
✅ Executable Bindings (npm scripts in package.json)  
✅ Type Safe (conforms to MusicalSequence interface)  

---

## Metrics Framework

### Completeness Metrics

- **Sequence File Completeness**: % of domains with valid sequenceFile
- **NPM Scripts Completeness**: % of domains with npmScripts defined
- **Overall Compliance**: Min(sequence %, scripts %) - must pass both requirements

### Governance Metrics

- **Registry Integrity**: No duplicate domain IDs
- **Linkage Validity**: All sequenceFile paths exist
- **Script Bindings**: All npmScripts reference existing scripts
- **Interface Conformance**: All entries conform to MusicalSequence

---

## Data Schema

Audit report output follows this JSON schema:

\`\`\`json
{
  "timestamp": "ISO-8601",
  "auditResult": {
    "status": "pass | fail",
    "complianceScore": 0-100,
    "totalDomains": number,
    "completeness": {
      "sequenceFiles": { "count": number, "percent": number },
      "npmScripts": { "count": number, "percent": number }
    },
    "findings": [
      {
        "domain": "domain-id",
        "type": "missing-sequence | missing-scripts | invalid-path",
        "severity": "critical | major | minor",
        "message": "description"
      }
    ]
  }
}
\`\`\`

---

<!-- DO NOT EDIT - Regenerate with: npm run build -->
`;
}
