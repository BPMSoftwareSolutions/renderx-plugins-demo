#!/usr/bin/env node

/**
 * Generate Orchestration Diagram from JSON
 *
 * Reads orchestration-domains.json and generates Mermaid diagram
 * This ensures diagrams are always in sync with the JSON source of truth
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORCHESTRATION_JSON = path.join(__dirname, '..', 'orchestration-domains.json');
const OUTPUT_DIR = path.join(__dirname, '..', '.ographx', 'artifacts', 'orchestration');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load orchestration domains
const orchestration = JSON.parse(fs.readFileSync(ORCHESTRATION_JSON, 'utf8'));

// Generate Mermaid diagram
function generateMermaidDiagram() {
  let mmd = `graph TB\n`;
  mmd += `    subgraph "🎼 Unified Orchestration System"\n`;
  mmd += `        MS["MusicalSequence Interface<br/>id, name, description, key, tempo<br/>movements, metadata"]\n`;
  mmd += `    end\n\n`;

  mmd += `    subgraph "Orchestration Domains"\n`;
  orchestration.domains.forEach((domain) => {
    const nodeId = domain.id.replace(/-/g, '_');
    mmd += `        ${nodeId}["${domain.emoji} ${domain.name}<br/>${domain.description}"]\n`;
  });
  mmd += `    end\n\n`;

  // Connect interface to all domains
  orchestration.domains.forEach((domain) => {
    const nodeId = domain.id.replace(/-/g, '_');
    mmd += `    MS --> ${nodeId}\n`;
  });

  mmd += `\n`;
  mmd += `    subgraph "Execution"\n`;
  mmd += `        EXEC["🎵 Conductor Execution<br/>Register → Execute → Track"]\n`;
  mmd += `        TRACE["📍 Tracing & Logging<br/>Beat-by-beat execution"]\n`;
  mmd += `        VIZ["📈 Visualization<br/>Sequence diagrams"]\n`;
  mmd += `        CONTEXT["🧭 Context Rehydration<br/>CAG context loading"]\n`;
  mmd += `    end\n\n`;

  // Connect domains to execution
  orchestration.domains.forEach((domain) => {
    const nodeId = domain.id.replace(/-/g, '_');
    mmd += `    ${nodeId} --> EXEC\n`;
  });

  mmd += `\n`;
  mmd += `    EXEC --> TRACE\n`;
  mmd += `    EXEC --> VIZ\n`;
  mmd += `    EXEC --> CONTEXT\n\n`;

  mmd += `    subgraph "Feedback"\n`;
  mmd += `        FEEDBACK["🔁 Feedback Loop<br/>Results → Context Update"]\n`;
  mmd += `        NEXT["🔄 Next Iteration<br/>Evolved system"]\n`;
  mmd += `    end\n\n`;

  mmd += `    TRACE --> FEEDBACK\n`;
  mmd += `    VIZ --> FEEDBACK\n`;
  mmd += `    CONTEXT --> FEEDBACK\n`;
  mmd += `    FEEDBACK --> NEXT\n\n`;

  mmd += `    style MS fill:#9C27B0,stroke:#6A1B9A,color:#fff,stroke-width:3px\n`;
  mmd += `    style EXEC fill:#2196F3,stroke:#1565C0,color:#fff,stroke-width:3px\n`;
  mmd += `    style TRACE fill:#4CAF50,stroke:#2E7D32,color:#fff\n`;
  mmd += `    style VIZ fill:#4CAF50,stroke:#2E7D32,color:#fff\n`;
  mmd += `    style CONTEXT fill:#4CAF50,stroke:#2E7D32,color:#fff\n`;
  mmd += `    style FEEDBACK fill:#FF9800,stroke:#E65100,color:#fff,stroke-width:2px\n`;
  mmd += `    style NEXT fill:#FF9800,stroke:#E65100,color:#fff,stroke-width:2px\n`;

  return mmd;
}

// Generate domain relationship diagram
function generateRelationshipDiagram() {
  let mmd = `graph LR\n`;

  orchestration.domains.forEach((domain) => {
    const nodeId = domain.id.replace(/-/g, '_');
    mmd += `    ${nodeId}["${domain.emoji} ${domain.name}"]\n`;
  });

  mmd += `\n`;

  orchestration.domains.forEach((domain) => {
    const nodeId = domain.id.replace(/-/g, '_');
    if (domain.relatedDomains && domain.relatedDomains.length > 0) {
      domain.relatedDomains.forEach((relatedId) => {
        const relatedNodeId = relatedId.replace(/-/g, '_');
        mmd += `    ${nodeId} -.-> ${relatedNodeId}\n`;
      });
    }
  });

  return mmd;
}

// Write files
try {
  console.log('📊 Generating orchestration diagrams from JSON...\n');

  const mainDiagram = generateMermaidDiagram();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'orchestration-system.mmd'), mainDiagram);
  console.log('✅ Generated: .ographx/artifacts/orchestration/orchestration-system.mmd');

  const relationshipDiagram = generateRelationshipDiagram();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'domain-relationships.mmd'), relationshipDiagram);
  console.log('✅ Generated: .ographx/artifacts/orchestration/domain-relationships.mmd');

  console.log('\n✨ All orchestration diagrams generated successfully!');
  console.log('📍 Source: orchestration-domains.json');
  console.log('📍 Output: .ographx/artifacts/orchestration/\n');
} catch (error) {
  console.error('❌ Error generating diagrams:', error);
  process.exit(1);
}

