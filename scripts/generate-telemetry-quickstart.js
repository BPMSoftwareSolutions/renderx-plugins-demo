#!/usr/bin/env node

/**
 * scripts/generate-telemetry-quickstart.js
 * 
 * Auto-generates TELEMETRY_GOVERNANCE_QUICKSTART.md from orchestration-audit-system-project-plan.json
 * 
 * Source: orchestration-audit-system-project-plan.json (governanceDocumentation.telemetryGovernance.quickstart)
 * Generated: npm run build (pre:manifests pipeline, order 42)
 * 
 * This script:
 * 1. Reads JSON authority (project plan)
 * 2. Extracts telemetry quickstart guidance
 * 3. Formats as markdown with AUTO-GENERATED headers
 * 4. Writes to TELEMETRY_GOVERNANCE_QUICKSTART.md
 * 5. Marks all sections as DO NOT EDIT
 * 
 * Governance Rule: JSON is Authority, Markdown is Reflection
 */

import fs from 'fs';
import path from 'path';

const PLAN_FILE = 'orchestration-audit-system-project-plan.json';
const OUTPUT_FILE = 'TELEMETRY_GOVERNANCE_QUICKSTART.md';

function generateMarkdown(plan) {
  const telemetryGov = plan.governanceDocumentation?.telemetryGovernance;
  const quickstart = telemetryGov?.quickstart;

  if (!quickstart) {
    throw new Error('No telemetry quickstart data found in project plan');
  }

  const sections = quickstart.sections || [];
  let content = '';

  // Build markdown from sections
  for (const section of sections) {
    if (section.name === 'npm Scripts') {
      content += `## Quick Reference: npm Scripts\n\n`;
      content += `\`\`\`bash\n`;
      for (const script of section.scripts || []) {
        content += `# ${script.description}\n`;
        content += `${script.command}\n\n`;
      }
      content += `\`\`\`\n\n`;
    } else if (section.name === 'How It Works') {
      content += `## How It Works (End-to-End)\n\n`;
      for (let i = 0; i < section.phases.length; i++) {
        const phase = section.phases[i];
        content += `### ${i + 1}️⃣ ${phase.phase}\n\n`;
        content += `${phase.description}\n\n`;
      }
    }
  }

  const markdown = `<!-- AUTO-GENERATED -->
<!-- Source: orchestration-audit-system-project-plan.json (governanceDocumentation.telemetryGovernance.quickstart) -->
<!-- Generated: ${new Date().toISOString()} -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# ${quickstart.title}

${quickstart.description}

---

${content}
---

**Generated from**: \`orchestration-audit-system-project-plan.json\` (v${plan.version})  
**Generator**: \`scripts/generate-telemetry-quickstart.js\`  
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
    console.log(`[telemetry-quickstart] Wrote ${OUTPUT_FILE}`);
    console.log(`[telemetry-quickstart] Source: ${PLAN_FILE} (governanceDocumentation.telemetryGovernance.quickstart)`);
    console.log(`[telemetry-quickstart] Status: AUTO-GENERATED`);
  } catch (error) {
    console.error(`[telemetry-quickstart] ERROR: ${error.message}`);
    process.exit(1);
  }
}

main();
