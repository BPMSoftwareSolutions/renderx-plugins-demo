#!/usr/bin/env node

/**
 * Generate DOCUMENTATION_AUTO_GENERATION_GOVERNANCE.md
 * 
 * Purpose: Auto-generates governance framework documentation from JSON authority
 * Input: orchestration-audit-system-project-plan.json (governanceDocumentation.framework.governanceRules)
 * Output: DOCUMENTATION_AUTO_GENERATION_GOVERNANCE.md
 * 
 * This script demonstrates the governance pattern it enforces:
 * - Reads JSON authority as source-of-truth
 * - Generates markdown with <!-- AUTO-GENERATED --> header
 * - Makes documentation impossible to drift from JSON
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLAN_PATH = path.join(__dirname, '../orchestration-audit-system-project-plan.json');
const OUTPUT_PATH = path.join(__dirname, '../DOCUMENTATION_AUTO_GENERATION_GOVERNANCE.md');

function generateGovernanceFramework() {
  const plan = JSON.parse(fs.readFileSync(PLAN_PATH, 'utf-8'));
  const framework = plan.governanceDocumentation.framework.governanceRules;

  let md = `<!-- AUTO-GENERATED -->
<!-- Source: orchestration-audit-system-project-plan.json (governanceDocumentation.framework.governanceRules) -->
<!-- Generated: ${new Date().toISOString()} -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# Documentation Auto-Generation Governance Framework

**Status**: Architecture Pattern Enforcement  
**Version**: ${framework.version}  
**Enforced Since**: ${framework.enforcedSince}

---

## Core Principle

**"${framework.corePrinciple}"**

${framework.description}

---

## Governance Rule Set

`;

  framework.ruleSet.forEach(rule => {
    md += `### ${rule.title}
- **Level**: ${rule.level}
`;
    if (rule.requirement) md += `- **Requirement**: ${rule.requirement}\n`;
    if (rule.reflection) md += `- **Reflection**: ${rule.reflection}\n`;
    if (rule.pipeline) md += `- **Pipeline**: ${rule.pipeline}\n`;
    if (rule.order) md += `- **Order**: ${rule.order}\n`;
    if (rule.header) md += `- **Header**: ${rule.header}\n`;
    if (rule.footer) md += `- **Footer**: ${rule.footer}\n`;
    if (rule.audit) md += `- **Audit**: ${rule.audit}\n`;
    if (rule.prohibition) md += `- **Prohibition**: ${rule.prohibition}\n`;
    if (rule.alternative) md += `- **Alternative**: ${rule.alternative}\n`;
    if (rule.enforcement) md += `- **Enforcement**: ${rule.enforcement}\n`;
    md += '\n';
  });

  md += `---

## Current Implementation Status

### ✅ Implemented Patterns

| Pattern | Source JSON | Generation Script | Status |
|---------|------------|-------------------|--------|
`;
  framework.implementedPatterns.forEach(impl => {
    md += `| ${impl.pattern} | \`${impl.sourceJson}\` | \`${impl.generationScript}\` | ✅ ${impl.status} |\n`;
  });

  md += `
---

## Enforcement Mechanisms

`;
  framework.enforcementMechanisms.forEach(mech => {
    md += `### ${mech.mechanism}
- **Purpose**: ${mech.purpose}
`;
    if (mech.action) md += `- **Action**: ${mech.action}\n`;
    if (Array.isArray(mech.checks)) {
      md += `- **Checks**:\n`;
      mech.checks.forEach(check => {
        md += `  - ${check}\n`;
      });
    }
    md += '\n';
  });

  md += `---

## Architecture Enforcement

The pattern is self-enforcing:
1. **JSON is Authority** - All rules stored in orchestration-audit-system-project-plan.json
2. **Markdown is Reflection** - This file is generated FROM the JSON
3. **Auto-Marked** - This file itself displays \`<!-- AUTO-GENERATED -->\` proving compliance
4. **Build-Time** - On every \`npm run build\`, this document regenerates from JSON
5. **Anti-Drift** - Impossible to edit this file without editing the JSON source

---

**Framework generated successfully. Documentation is now drift-proof.**

<!-- DO NOT EDIT - Regenerate with: npm run build -->
`;

  fs.writeFileSync(OUTPUT_PATH, md, 'utf-8');
  console.log(`✅ Generated: ${OUTPUT_PATH}`);
}

generateGovernanceFramework();
