#!/usr/bin/env node

/**
 * scripts/generate-telemetry-instrumentation.js
 * 
 * Auto-generates DEMO_TELEMETRY_INSTRUMENTATION.md from orchestration-audit-system-project-plan.json
 * 
 * Source: orchestration-audit-system-project-plan.json (governanceDocumentation.telemetryGovernance.instrumentation)
 * Generated: npm run build (pre:manifests pipeline, order 41)
 * 
 * This script:
 * 1. Reads JSON authority (project plan)
 * 2. Extracts telemetry instrumentation guidance
 * 3. Formats as markdown with AUTO-GENERATED headers
 * 4. Writes to DEMO_TELEMETRY_INSTRUMENTATION.md
 * 5. Marks all sections as DO NOT EDIT
 * 
 * Governance Rule: JSON is Authority, Markdown is Reflection
 */

import fs from 'fs';
import path from 'path';

const PLAN_FILE = 'orchestration-audit-system-project-plan.json';
const OUTPUT_FILE = 'DEMO_TELEMETRY_INSTRUMENTATION.md';

function generateMarkdown(plan) {
  const telemetryGov = plan.governanceDocumentation?.telemetryGovernance;
  const instrumentation = telemetryGov?.instrumentation;

  if (!instrumentation) {
    throw new Error('No telemetry instrumentation data found in project plan');
  }

  const sections = instrumentation.sections || [];
  let content = '';

  // Build markdown from sections
  for (const section of sections) {
    if (section.name === 'Overview') {
      content += `## Overview\n\n${section.content}\n\n`;
    } else if (section.name === 'Format Requirements') {
      content += `## Format Requirements\n\n`;
      for (const subsection of section.subsections || []) {
        content += `### ${subsection.name}\n\n`;
        content += `**Format**: \`${subsection.format}\`\n\n`;
        content += `**Example**: \`${subsection.example}\`\n\n`;
      }
    } else if (section.name === 'Integration Workflow') {
      content += `## Integration Workflow\n\n`;
      for (let i = 0; i < section.steps.length; i++) {
        content += `${i + 1}. ${section.steps[i]}\n`;
      }
      content += '\n';
    } else if (section.name === 'Troubleshooting') {
      content += `## Troubleshooting\n\n`;
      for (const entry of section.entries || []) {
        content += `### Q: ${entry.issue}\n\n`;
        content += `**A**: ${entry.solution}\n\n`;
      }
    }
  }

  const markdown = `<!-- AUTO-GENERATED -->
<!-- Source: orchestration-audit-system-project-plan.json (governanceDocumentation.telemetryGovernance.instrumentation) -->
<!-- Generated: ${new Date().toISOString()} -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# ${instrumentation.title}

${instrumentation.description}

---

${content}
---

**Generated from**: \`orchestration-audit-system-project-plan.json\` (v${plan.version})  
**Generator**: \`scripts/generate-telemetry-instrumentation.js\`  
**Pattern**: JSON Authority → Auto-Generated Markdown  

<!-- DO NOT EDIT - Regenerate with: npm run build -->
<!-- AUTO-GENERATED -->
`;

  return markdown;
}

function main() {
  try {
    const planContent = fs.readFileSync(PLAN_FILE, 'utf8');
    const plan = JSON.parse(planContent);

    const markdown = generateMarkdown(plan);

    fs.writeFileSync(OUTPUT_FILE, markdown);
    console.log(`[telemetry-instrumentation] Wrote ${OUTPUT_FILE}`);
    console.log(`[telemetry-instrumentation] Source: ${PLAN_FILE} (governanceDocumentation.telemetryGovernance.instrumentation)`);
    console.log(`[telemetry-instrumentation] Status: AUTO-GENERATED`);
  } catch (error) {
    console.error(`[telemetry-instrumentation] ERROR: ${error.message}`);
    process.exit(1);
  }
}

main();
