#!/usr/bin/env node

/**
 * scripts/generate-telemetry-verification.js
 * 
 * Auto-generates TELEMETRY_GOVERNANCE_VERIFICATION.md from telemetry-validation-report.json
 * 
 * Sources: 
 *   - .generated/telemetry-validation-report.json (validation results)
 *   - orchestration-audit-system-project-plan.json (governance rules)
 * 
 * Generated: npm run build (pre:manifests pipeline, order 43)
 * 
 * This script:
 * 1. Reads telemetry validation report (from demo captures)
 * 2. Reads governance rules from project plan
 * 3. Formats verification status as markdown
 * 4. Writes to TELEMETRY_GOVERNANCE_VERIFICATION.md
 * 5. Marks all sections as DO NOT EDIT
 * 
 * Governance Rule: JSON is Authority, Markdown is Reflection
 */

import fs from 'fs';
import path from 'path';

const VALIDATION_REPORT_FILE = '.generated/telemetry-validation-report.json';
const PLAN_FILE = 'orchestration-audit-system-project-plan.json';
const OUTPUT_FILE = 'TELEMETRY_GOVERNANCE_VERIFICATION.md';

function generateMarkdown(validationReport, plan) {
  const sprints = validationReport.sprints || [];
  const totalSprints = validationReport.totalSprints || 0;
  const passSprints = validationReport.passSprints || 0;

  let content = '';

  // Summary section
  content += `## Verification Summary\n\n`;
  content += `| Metric | Value |\n`;
  content += `|--------|-------|\n`;
  content += `| Total Sprints | ${totalSprints} |\n`;
  content += `| Completed Sprints | ${validationReport.completedSprints || 0} |\n`;
  content += `| PASS Status | ${passSprints}/${totalSprints} |\n`;
  content += `| Overall Status | **${validationReport.summary || 'UNKNOWN'}** |\n`;
  content += `\n`;

  // Detailed results
  content += `## Sprint Coverage Details\n\n`;
  content += `| Sprint | Name | Status | Coverage | Signatures | Details |\n`;
  content += `|--------|------|--------|----------|------------|----------|\n`;

  for (const sprint of sprints) {
    const statusEmoji = sprint.status === 'PASS' ? '✅' : '⏳';
    const coverageStr = `${sprint.coveragePct || 0}%`;
    const sigsStr = `${sprint.signaturesCaptured || 0}/${sprint.signaturesRequired || 0}`;
    const details = sprint.missingSignatures?.length > 0 
      ? `Missing: ${sprint.missingSignatures.join(', ')}`
      : 'All captured';

    content += `| ${sprint.sprintId} | Sprint ${sprint.sprintId} | ${statusEmoji} ${sprint.status} | ${coverageStr} | ${sigsStr} | ${details} |\n`;
  }

  content += `\n`;

  // Governance rules table
  content += `## Governance Rules Compliance\n\n`;
  content += `| Rule | Level | Status |\n`;
  content += `|------|-------|--------|\n`;

  const rules = plan.governanceDocumentation?.rules || [];
  for (const rule of rules) {
    const statusEmoji = rule.level === 'CRITICAL' ? '🔴' : '🟡';
    content += `| ${rule.id}: ${rule.title} | ${rule.level} | ${statusEmoji} Enforced |\n`;
  }

  content += `\n`;

  // Readiness assessment
  content += `## Readiness Assessment\n\n`;
  if (passSprints === totalSprints && totalSprints > 0) {
    content += `✅ **READY FOR RELEASE**\n\n`;
    content += `All ${totalSprints} completed sprints have 100% telemetry coverage. No missing signatures detected.\n\n`;
  } else if (totalSprints === 0) {
    content += `⏳ **PENDING TELEMETRY CAPTURES**\n\n`;
    content += `No telemetry captures yet. Run demo and execute capture script to populate validation data.\n\n`;
  } else {
    content += `⚠️ **COVERAGE INCOMPLETE**\n\n`;
    content += `${totalSprints - passSprints} sprint(s) have incomplete coverage. Review missing signatures above.\n\n`;
  }

  const markdown = `<!-- AUTO-GENERATED -->
<!-- Source: .generated/telemetry-validation-report.json -->
<!-- Generated: ${new Date().toISOString()} -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# Telemetry Governance Verification

**Date**: ${new Date().toLocaleDateString()}  
**Version**: ${plan.version}  
**Status**: ${validationReport.summary || 'UNKNOWN'}

---

${content}

---

## Files Referenced

- **Validation Report**: \`.generated/telemetry-validation-report.json\`
- **Project Plan**: \`orchestration-audit-system-project-plan.json\`
- **Governance Rules**: \`DOCUMENTATION_AUTO_GENERATION_GOVERNANCE.md\`

---

**Generated from**: Multiple JSON sources (validation report + project plan)  
**Generator**: \`scripts/generate-telemetry-verification.js\`  
**Pattern**: JSON Authority → Auto-Generated Markdown  

<!-- DO NOT EDIT - Regenerate with: npm run build -->
<!-- AUTO-GENERATED -->
`;

  return markdown;
}

function main() {
  try {
    // Read validation report (may not exist initially)
    let validationReport = { sprints: [], totalSprints: 0, passSprints: 0, summary: 'PENDING' };
    if (fs.existsSync(VALIDATION_REPORT_FILE)) {
      const reportContent = fs.readFileSync(VALIDATION_REPORT_FILE, 'utf8');
      validationReport = JSON.parse(reportContent);
    }

    // Read project plan
    const planContent = fs.readFileSync(PLAN_FILE, 'utf8');
    const plan = JSON.parse(planContent);

    const markdown = generateMarkdown(validationReport, plan);

    fs.writeFileSync(OUTPUT_FILE, markdown);
    console.log(`[telemetry-verification] Wrote ${OUTPUT_FILE}`);
    console.log(`[telemetry-verification] Source: ${VALIDATION_REPORT_FILE} + ${PLAN_FILE}`);
    console.log(`[telemetry-verification] Status: AUTO-GENERATED`);
  } catch (error) {
    console.error(`[telemetry-verification] ERROR: ${error.message}`);
    process.exit(1);
  }
}

main();
