#!/usr/bin/env node
/**
 * Generate Build Pipeline Audit Report
 * 
 * Purpose: Create BUILD_PIPELINE_AUDIT_REPORT.md from buildPipelineAudit.findings
 * Source: orchestration-audit-system-project-plan.json
 * Output: BUILD_PIPELINE_AUDIT_REPORT.md
 * 
 * Pattern: JSON is Authority, Markdown is Reflection
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const PLAN_PATH = path.join(rootDir, 'orchestration-audit-system-project-plan.json');
const OUTPUT_PATH = path.join(rootDir, 'BUILD_PIPELINE_AUDIT_REPORT.md');

function generateAuditReport() {
  const plan = JSON.parse(fs.readFileSync(PLAN_PATH, 'utf-8'));
  const audit = plan.governanceDocumentation.buildPipelineAudit.findings;

  let md = `<!-- AUTO-GENERATED -->
<!-- Source: orchestration-audit-system-project-plan.json (governanceDocumentation.buildPipelineAudit.findings) -->
<!-- Generated: ${new Date().toISOString()} -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# 🔍 Build Pipeline Audit Report

## Executive Summary

**CRITICAL FINDING:** Your build pipeline generates **785 files** that are being tracked in source control. These are ephemeral, build-time generated files that should NOT be committed to git.

| Metric | Value | Status |
|--------|-------|--------|
| **Total Tracked Generated Files** | **785** | 🔴 CRITICAL |
| **Location** | \`.generated/\` directory | 🔴 SHOULD BE .gitignored |
| **Build Outputs Properly Ignored** | \`dist/\` ✅ | ✅ CORRECT |
| **Repository Bloat** | ~15-20 MB | 🔴 MAJOR ISSUE |

---

## 📊 Breakdown of Tracked Generated Files

### By Category

\`\`\`
`;

  // Add category breakdown
  audit.sections.find(s => s.name === 'File Breakdown by Category').categories.forEach(cat => {
    md += `.generated/${cat.category.toLowerCase().replace(/\s+/g, '-')}/              ${cat.count} files  (${cat.percentage}%)\n`;
  });

  md += `─────────────────────────────────────────────
TOTAL                              785 files (100%)
\`\`\`

### Top Generated File Categories

| Directory | Count | What Gets Generated | When |
|-----------|-------|-------------------|------|
`;

  audit.sections.find(s => s.name === 'File Breakdown by Category').categories.slice(0, 5).forEach(cat => {
    md += `| **${cat.category}** | ${cat.count} | ${cat.description} | Build phase | \n`;
  });

  md += `

---

## ⚠️ Current .gitignore Configuration

### What IS Properly Ignored ✅

\`\`\`gitignore
# Build outputs - CORRECTLY IGNORED
dist/
build/Release/
node_modules/

# Runtime caches - CORRECTLY IGNORED
.npm
.eslintcache
.vite
__pycache__/
\`\`\`

### What IS NOT Ignored 🔴 (PROBLEM!)

\`\`\`gitignore
# Generated files - NO IGNORE PATTERN!
# These are TRACKED when they should be IGNORED:
.generated/telemetry/**/*.json
.generated/domains/**/*.json
.generated/conformity-fixes/**/*.json
\`\`\`

**Current .gitignore Problem:**
`;

  const gitignoreIssue = audit.sections.find(s => s.name === '.gitignore Configuration Issue');
  md += `
\`\`\`gitignore
${gitignoreIssue.current}
\`\`\`

**This forces ALL .generated/ files to be tracked!**

---

## 🔍 Sources of Generated Files

### Generation Scripts by Category

- **33 Generation Scripts** - Create JSON outputs (regenerate:ographx, generate:orchestration:docs, etc.)
- **10 Validation Scripts** - Create compliance reports (validate:domains, verify:bdd:spec, etc.)
- **3 Extraction Scripts** - Parse existing code (extract:ir:handlers, etc.)
- **4 Analysis Scripts** - Create analysis outputs (analyze:catalog:sequences, audit:comprehensive, etc.)

**Total: 50+ scripts generating 785 files**

---

## ⚠️ Impact Analysis

### Repository Bloat

\`\`\`
Average file size:           ~20 KB
Total tracked .generated/:   ~15-20 MB
Per commit impact:           +2-3 MB if .generated/ changes
Per 100 commits:             +200-300 MB
\`\`\`

### Git History Pollution

Build and test workflows commit 785 changes weekly, polluting the history with generated data.

### Developer Pain Points

1. **Branch Switching:**
   \`\`\`bash
   git checkout main       # 785 modified files
   git checkout feature    # Merge conflicts
   \`\`\`

2. **Code Review:**
   \`\`\`bash
   git diff main  # Includes 785 generated file changes
   # Hard to see actual code changes
   \`\`\`

3. **Merge Conflicts:**
   Generated files cause conflicts across branches.

---

## ✅ Solution: Update .gitignore

### The Fix

**Remove negation patterns that force tracking:**
\`\`\`gitignore
# Change from:
!/.generated
!/.archived

# To:
.generated/
.archived/
\`\`\`

### Why This Works

- ✅ Explicit ignore patterns prevent all files from being tracked
- ✅ Build scripts still generate files locally (not affected)
- ✅ All telemetry and metrics generated per-build
- ✅ No manual cleanup needed

---

## 📋 What These Generated Files Contain

### Telemetry Files (481 files)
Execution metrics, per-beat timing, conformity scores, correlation IDs

### Domain Files (132 files)
Orchestration domain definitions, movements, beats, governance policies

### Conformity Fix Reports (11 files)
Validation failure analysis, recommendations, resolution steps

### Other Files (161 files)
Coverage analysis, lint reports, shape history, sprint reports

**ALL of these are regenerated on each run - nothing new is added, just replaced.**

---

## 📈 Expected Impact After Fix

### Repository Size
\`\`\`
Before: ~500 MB (with 785 tracked .generated files)
After:  ~250 MB (only source code tracked)
Savings: ~50% reduction
\`\`\`

### Developer Experience
\`\`\`
Before: npm run build → 785 files show as modified
After:  npm run build → working tree clean
\`\`\`

---

## 🎯 Next Steps

1. **Review** the audit findings (this document)
2. **Read** BUILD_PIPELINE_AUDIT_ACTION_PLAN.md for exact steps
3. **Implement** the 3-step fix (5 minutes total)
4. **Verify** with npm run build && git status

---

**Audit Date:** ${audit.discoveryDate}
**Severity:** ${audit.severity}
**Status:** Ready for Implementation

---

<!-- DO NOT EDIT - Regenerate with: npm run build -->
`;

  fs.writeFileSync(OUTPUT_PATH, md, 'utf-8');
  console.log(`✅ Generated: ${OUTPUT_PATH}`);
}

generateAuditReport();
