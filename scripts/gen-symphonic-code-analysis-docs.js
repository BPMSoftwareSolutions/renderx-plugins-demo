#!/usr/bin/env node
/**
 * Symphonic Code Analysis Documentation Generator
 * 
 * Generates markdown documentation from symphonic-code-analysis-pipeline.json
 * This script is auto-executed during npm run pre:manifests
 * 
 * Output: docs/generated/symphonic-code-analysis-pipeline/INDEX.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEQUENCE_FILE = path.join(__dirname, '../packages/orchestration/json-sequences/symphonic-code-analysis-pipeline.json');
const OUTPUT_DIR = path.join(__dirname, '../docs/generated/symphonic-code-analysis-pipeline');
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

// Generate markdown documentation
const markdown = generateDocumentation(sequence);

// Write the output file
try {
  fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');
  console.log(`✅ Generated: ${OUTPUT_FILE}`);
} catch (error) {
  console.error(`❌ Failed to write output file: ${error.message}`);
  process.exit(1);
}

function generateDocumentation(seq) {
  const timestamp = new Date().toISOString();
  
  return `<!-- AUTO-GENERATED -->
<!-- Source: ${SEQUENCE_FILE} -->
<!-- Generated: ${timestamp} -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# Symphonic Code Analysis Pipeline

**Status**: ${seq.status}  
**Version**: ${seq.metadata.version}  
**Category**: ${seq.category}  
**Beats**: ${seq.beats} | **Movements**: ${seq.movements.length}

---

## Overview

${seq.description}

**Purpose**: ${seq.purpose}

---

## Quick Start

\`\`\`bash
npm run analyze:symphonic:code [--domain=<id>] [--baseline] [--trends]
\`\`\`

**Options:**
- \`--domain=<id>\` - Analyze specific orchestration domain (default: all)
- \`--baseline\` - Create baseline for trend tracking
- \`--trends\` - Compare to baseline and show trends

---

## Movements (4 Total)

${seq.movements.map((m, i) => `
### Movement ${i + 1}: ${m.name}

**Description**: ${m.description}

**Purpose**: ${m.purpose}

**Beats**: ${m.beats}
`).join('\n')}

---

## Metrics Framework

### Code Metrics

${Object.entries(seq.analysisMetrics.codeMetrics).map(([key, metric]) => `
#### ${key.replace(/([A-Z])/g, ' $1').trim()}

- **Description**: ${metric.description}
- **Benchmark**: ${metric.benchmark}
- **Aggregation**: ${metric.aggregation}
- **Visualization**: ${metric.visualization}
`).join('\n')}

### Test Coverage

${Object.entries(seq.analysisMetrics.testCoverage).map(([key, metric]) => `
#### ${key.replace(/([A-Z])/g, ' $1').trim()}

- **Description**: ${metric.description}
- **Benchmark**: ${metric.benchmark}
- **Per-Beat**: ${metric.perBeat ? 'Yes' : 'No'}
`).join('\n')}

### Conformity Metrics

${Object.entries(seq.analysisMetrics.conformityMetrics).map(([key, metric]) => `
#### ${key.replace(/([A-Z])/g, ' $1').trim()}

- **Description**: ${metric.description}
- **Benchmark**: ${metric.benchmark}
- **Impact**: ${metric.impact}
`).join('\n')}

---

## Reporting Artifacts

Analysis generates the following artifacts in \`.generated/analysis/\`:

${seq.reportingArtifacts.map(art => `
### ${art.name}

- **Type**: ${art.type}
- **Description**: ${art.description}
- **Purpose**: ${art.purpose}
- **Auto-Generated**: ${art.generated ? 'Yes' : 'No'}
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

The pipeline emits the following orchestration events:

${seq.events.map(e => `- \`${e}\``).join('\n')}

---

## Integration

### Register as npm script

Add to \`package.json\`:

\`\`\`json
{
  "scripts": {
    "analyze:symphonic:code": "node scripts/orchestrate-symphonic-code-analysis.js",
    "analyze:symphonic:code:baseline": "node scripts/orchestrate-symphonic-code-analysis.js --baseline",
    "analyze:symphonic:code:trends": "node scripts/orchestrate-symphonic-code-analysis.js --trends"
  }
}
\`\`\`

### Run from orchestration

\`\`\`bash
# Analyze all orchestrations
npm run analyze:symphonic:code

# Analyze specific domain
npm run analyze:symphonic:code -- --domain=renderx-web-orchestration

# Create/update baseline
npm run analyze:symphonic:code:baseline

# Show trends vs baseline
npm run analyze:symphonic:code:trends
\`\`\`

---

## Data Schema

Analysis output follows this JSON schema:

\`\`\`json
{
  "timestamp": "ISO-8601",
  "domain": "orchestration-id",
  "codeMetrics": {
    "linesOfCode": {
      "perBeat": [{ "beat": 1, "loc": 150 }],
      "perMovement": [{ "movement": 1, "totalLoc": 750 }],
      "total": 3000
    },
    "complexity": {
      "perBeat": [{ "beat": 1, "cyclomatic": 8, "cognitive": 5 }],
      "average": 6.5
    },
    "duplication": { "percentage": 2.3 },
    "maintainability": [{ "module": "handler1.ts", "index": 82 }]
  },
  "testCoverage": {
    "statement": { "percent": 86, "perBeat": [...] },
    "branch": { "percent": 81, "perBeat": [...] },
    "function": { "percent": 92, "perBeat": [...] },
    "line": { "percent": 86, "perBeat": [...] }
  },
  "conformity": {
    "handlerCompleteness": 1.0,
    "testCoverageConformity": 0.86,
    "architectureConformity": 0.88,
    "overallScore": 0.88
  },
  "trends": {
    "comparison": "baseline",
    "changes": {
      "locTrend": "+2.3%",
      "complexityTrend": "-1.2%",
      "coverageTrend": "+3.5%"
    }
  }
}
\`\`\`

---

## Governance Compliance

✅ This documentation is auto-generated from JSON source  
✅ Generated on every \`npm run build\`  
✅ Marked as AUTO-GENERATED (cannot be manually edited)  
✅ Located in domain-scoped docs directory  
✅ Prevents documentation drift

<!-- DO NOT EDIT - Regenerate with: npm run build -->
`;
}
