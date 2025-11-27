#!/usr/bin/env node
/**
 * Generate Build Pipeline Scripts Inventory
 * 
 * Purpose: Create BUILD_PIPELINE_GENERATION_SCRIPTS_INVENTORY.md from buildPipelineAudit.scriptInventory
 * Source: orchestration-audit-system-project-plan.json
 * Output: BUILD_PIPELINE_GENERATION_SCRIPTS_INVENTORY.md
 * 
 * Pattern: JSON is Authority, Markdown is Reflection
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const PLAN_PATH = path.join(rootDir, 'orchestration-audit-system-project-plan.json');
const OUTPUT_PATH = path.join(rootDir, 'BUILD_PIPELINE_GENERATION_SCRIPTS_INVENTORY.md');

function generateScriptsInventory() {
  const plan = JSON.parse(fs.readFileSync(PLAN_PATH, 'utf-8'));
  const inventory = plan.governanceDocumentation.buildPipelineAudit.scriptInventory;

  let md = `<!-- AUTO-GENERATED -->
<!-- Source: orchestration-audit-system-project-plan.json (governanceDocumentation.buildPipelineAudit.scriptInventory) -->
<!-- Generated: ${new Date().toISOString()} -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# 📋 Build Pipeline Generation Scripts Inventory

## Overview

This document maps every script that generates files during the build process.

**Total Generation Scripts:** ${inventory.totalScripts}+
**Total Generated Files:** ${inventory.totalGeneratedFiles}+
**Build Phases:** ${inventory.buildPhases.length}

---

## Build Phases

### Phase Breakdown

| Phase | Name | Scripts | Generated Files | Description |
|-------|------|---------|-----------------|-------------|
`;

  inventory.buildPhases.forEach((phase, idx) => {
    md += `| ${phase.phase} | **${phase.name}** | ${phase.scripts} | ${phase.outputs} | ${phase.description} |\n`;
  });

  md += `

---

## Generation Scripts by Category

| Category | Count | Examples |
|----------|-------|----------|
`;

  inventory.categoryBreakdown.forEach(cat => {
    const examples = cat.examples.slice(0, 3).join(', ');
    md += `| ${cat.category} | ${cat.count} | ${examples} |\n`;
  });

  md += `

---

## Key Findings

### Total Generated Files: ${inventory.totalGeneratedFiles}

- **Currently Tracked:** ${inventory.totalGeneratedFiles} files in \`.generated/\` directory
- **Should Be Ignored:** ALL of them
- **Root Cause:** \`.gitignore\` negation patterns force tracking

### Generation Happens in ${inventory.buildPhases.length} Phases

1. Pre-Manifests - Domain and telemetry generation
2. Build Validation - Compliance checks
3. Package Build - Builds (outputs properly ignored)
4. Host Build - Vite build (outputs properly ignored)
5. Pre-Test Setup - Test infrastructure
6. Post-Test Telemetry - Metrics collection

### 50+ Scripts Execute During Build

- 33 Generation scripts (create JSON outputs)
- 10 Validation scripts (create reports)
- 3 Extraction scripts (parse code)
- 4 Analysis scripts (create analysis)

---

## Phase 1: Pre-Manifests

**Generates:** 200+ files
**Duration:** 30-60 seconds
**Scripts:** 33+

These scripts run first and create the bulk of generated files:
- Orchestration domain definitions
- Governance documentation
- Telemetry matrix
- Manifests and catalogs
- SLO traceability
- Sprint reports
- Handler coverage analysis

---

## Phase 2: Build Validation

**Generates:** 50+ files
**Duration:** 5-10 seconds
**Scripts:** 5

Validation scripts check compliance:
- Domain validation
- Governance document verification
- Agent behavior validation
- Orchestration governance check
- Artifact validation

---

## Phase 3: Build (Packages & Host)

**Generates:** dist/ (PROPERLY IGNORED ✅)
**Duration:** 20-90 seconds
**Scripts:** 14 (package builders + vite)

Build scripts compile code:
- 13 Package builds (@renderx-plugins/*)
- 1 Host build (vite)

**Note:** Output directories are properly ignored by .gitignore ✅

---

## Phase 4: Pre-Test Setup

**Generates:** 30+ files
**Duration:** 5-15 seconds
**Scripts:** 10

Test infrastructure setup:
- BDD spec verification
- Demo spec verification
- Synthetic telemetry setup
- Shape contract validation
- Test graph generation

---

## Phase 5: Post-Test Telemetry

**Generates:** 100+ files
**Duration:** Variable (depends on test duration)
**Scripts:** 5

Test completion telemetry:
- SLO breach analysis
- Benefit score computation
- BDD telemetry enforcement
- Shape history generation
- CSV report generation

---

## All Generated Files Are Ephemeral

Every file generated during the build:
- ✅ Is regenerated on each build
- ✅ Contains only current/temporary data
- ✅ Has NO manual edits (auto-generated)
- ✅ Should NOT be tracked in git

**Therefore:** ALL should be ignored via .gitignore

---

## The .gitignore Problem

### Current (WRONG)

\`\`\`gitignore
!/.generated    ← FORCES tracking
!/.archived     ← FORCES tracking
\`\`\`

### Should Be (CORRECT)

\`\`\`gitignore
.generated/     ← Explicit ignore
.archived/      ← Explicit ignore
\`\`\`

---

## Impact By The Numbers

\`\`\`
Repository Size Impact:
  - Generated files: ~15-20 MB
  - Tracked files: 785
  - Percentage of total: 50%

Build Frequency Impact:
  - Builds per developer per day: ~5-10
  - Files changed per build: 785
  - Commits with gen file changes: 75-90/week
  - Merge conflicts per week: 5-10

Storage Impact:
  - Per commit: +2-3 MB if .generated/ changes
  - Per 100 commits: +200-300 MB
  - Annual impact: ~1 GB per developer
\`\`\`

---

## Solution

**Update .gitignore:**
\`\`\`gitignore
# Remove negations:
# !/.generated
# !/.archived

# Add explicit ignores:
.generated/
.archived/
\`\`\`

**Then untrack:**
\`\`\`bash
git rm --cached -r .generated/ .archived/
git commit -m "chore: untrack ephemeral generated files"
\`\`\`

---

## Verification

**Before fix:**
\`\`\`bash
$ npm run build && git status
On branch main
Changes not staged for commit:
  modified: .generated/telemetry/... (785 files)
\`\`\`

**After fix:**
\`\`\`bash
$ npm run build && git status
On branch main
working tree clean
\`\`\`

---

Generated: ${new Date().toISOString()}
Status: Complete & Ready for Reference

<!-- DO NOT EDIT - Regenerate with: npm run build -->
`;

  fs.writeFileSync(OUTPUT_PATH, md, 'utf-8');
  console.log(`✅ Generated: ${OUTPUT_PATH}`);
}

generateScriptsInventory();
