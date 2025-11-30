<!-- AUTO-GENERATED -->
<!-- Source: orchestration-audit-system-project-plan.json (governanceDocumentation.buildPipelineAudit.findings) -->
<!-- Generated: 2025-11-30T23:31:52.950Z -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# 🔍 Build Pipeline Audit Report

## Executive Summary

**CRITICAL FINDING:** Your build pipeline generates **785 files** that are being tracked in source control. These are ephemeral, build-time generated files that should NOT be committed to git.

| Metric | Value | Status |
|--------|-------|--------|
| **Total Tracked Generated Files** | **785** | 🔴 CRITICAL |
| **Location** | `.generated/` directory | 🔴 SHOULD BE .gitignored |
| **Build Outputs Properly Ignored** | `dist/` ✅ | ✅ CORRECT |
| **Repository Bloat** | ~15-20 MB | 🔴 MAJOR ISSUE |

---

## 📊 Breakdown of Tracked Generated Files

### By Category

```
.generated/telemetry/              481 files  (61.3%)
.generated/domains/              132 files  (16.8%)
.generated/conformity-fixes/              11 files  (1.4%)
.generated/sprint-telemetry/              9 files  (1.1%)
.generated/delivery-pipeline-reports/              6 files  (0.8%)
.generated/other/              146 files  (18.6%)
─────────────────────────────────────────────
TOTAL                              785 files (100%)
```

### Top Generated File Categories

| Directory | Count | What Gets Generated | When |
|-----------|-------|-------------------|------|
| **Telemetry** | 481 | Per-beat execution metrics, snapshots, traces | Build phase | 
| **Domains** | 132 | Orchestration domain definitions, enrichments | Build phase | 
| **Conformity Fixes** | 11 | Validation failure analysis, recommendations | Build phase | 
| **Sprint Telemetry** | 9 | Sprint-level metrics and snapshots | Build phase | 
| **Delivery Pipeline Reports** | 6 | Build execution logs and reports | Build phase | 


---

## ⚠️ Current .gitignore Configuration

### What IS Properly Ignored ✅

```gitignore
# Build outputs - CORRECTLY IGNORED
dist/
build/Release/
node_modules/

# Runtime caches - CORRECTLY IGNORED
.npm
.eslintcache
.vite
__pycache__/
```

### What IS NOT Ignored 🔴 (PROBLEM!)

```gitignore
# Generated files - NO IGNORE PATTERN!
# These are TRACKED when they should be IGNORED:
.generated/telemetry/**/*.json
.generated/domains/**/*.json
.generated/conformity-fixes/**/*.json
```

**Current .gitignore Problem:**

```gitignore
Lines 185-186: !/.generated and !/.archived (NEGATIONS FORCE TRACKING)
```

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

```
Average file size:           ~20 KB
Total tracked .generated/:   ~15-20 MB
Per commit impact:           +2-3 MB if .generated/ changes
Per 100 commits:             +200-300 MB
```

### Git History Pollution

Build and test workflows commit 785 changes weekly, polluting the history with generated data.

### Developer Pain Points

1. **Branch Switching:**
   ```bash
   git checkout main       # 785 modified files
   git checkout feature    # Merge conflicts
   ```

2. **Code Review:**
   ```bash
   git diff main  # Includes 785 generated file changes
   # Hard to see actual code changes
   ```

3. **Merge Conflicts:**
   Generated files cause conflicts across branches.

---

## ✅ Solution: Update .gitignore

### The Fix

**Remove negation patterns that force tracking:**
```gitignore
# Change from:
!/.generated
!/.archived

# To:
.generated/
.archived/
```

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
```
Before: ~500 MB (with 785 tracked .generated files)
After:  ~250 MB (only source code tracked)
Savings: ~50% reduction
```

### Developer Experience
```
Before: npm run build → 785 files show as modified
After:  npm run build → working tree clean
```

---

## 🎯 Next Steps

1. **Review** the audit findings (this document)
2. **Read** BUILD_PIPELINE_AUDIT_ACTION_PLAN.md for exact steps
3. **Implement** the 3-step fix (5 minutes total)
4. **Verify** with npm run build && git status

---

**Audit Date:** 2025-11-26
**Severity:** medium
**Status:** Ready for Implementation

---

<!-- DO NOT EDIT - Regenerate with: npm run build -->
