<!-- AUTO-GENERATED -->
<!-- Source: Senior-level repository architecture cleanup -->
<!-- Generated: 2025-11-24T20:45:00Z -->
<!-- DO NOT EDIT - This is the master plan for file reorganization -->

# 📐 Repository Architecture Restructure Plan

## Current State (CHAOS - SCATTERED EVERYWHERE)

```
root/
├── ❌ DOCUMENTATION_AUTO_GENERATION_GOVERNANCE.md      (governance doc in root!)
├── ❌ DOCUMENTATION_GOVERNANCE_INDEX.md                (governance doc in root!)
├── ❌ DOCUMENTATION_GOVERNANCE_IMPLEMENTATION_COMPLETE.md
├── ❌ DOMAIN_DOCUMENTATION_STRUCTURE.md                (governance doc in root!)
├── ❌ PATTERN_RECOGNITION_ACHIEVEMENT.md              (achievement doc in root!)
├── ❌ FILE_ALLOCATION_SYSTEM.md                        (allocation doc in root!)
├── ❌ DELIVERABLES_COMPLETE.md                        (deliverable doc in root!)
├── ❌ GOVERNANCE_AND_ARCHIVAL_SYSTEM_COMPLETE.md      (system doc in root!)
├── ❌ DEMO_TELEMETRY_INSTRUMENTATION.md               (demo doc in root!)
├── ❌ DOCUMENTATION_ARCHIVAL_COMPLETE.md              (archival doc in root!)
├── ❌ TELEMETRY_GOVERNANCE_COMPLETE.md                (telemetry doc in root!)
├── ❌ TELEMETRY_GOVERNANCE_QUICKSTART.md              (telemetry doc in root!)
├── ❌ TELEMETRY_GOVERNANCE_VERIFICATION.md            (telemetry doc in root!)
├── ✅ README.md                                        (correct location)
│
├── ❌ orchestration-audit-system-project-plan.json    (AUTHORITY JSON in root!)
├── ❌ orchestration-domains.json                       (config JSON in root!)
├── ❌ PROJECT_BOUNDARIES.json                          (project config in root!)
├── ❌ PROJECT_ROLES.json                               (project config in root!)
├── ❌ PROJECT_SCOPE.json                               (project config in root!)
├── ❌ PROJECT_TAGS.json                                (project config in root!)
├── ❌ shape.budgets.json                               (shape config in root!)
├── ❌ SHAPE_EVOLUTION_PLAN.json                        (shape config in root!)
├── ❌ shape-evolutions.json                            (shape config in root!)
├── ❌ shape-evolutions-allowlist.json                  (shape config in root!)
├── ❌ root-context.json                                (generated in root!)
├── ❌ knowledge-index.json                             (generated in root!)
├── ❌ DOC_INDEX.json                                   (generated in root!)
├── ❌ canvas_symphony_data.json                        (data file in root!)
├── ❌ public-api.hash.json                             (generated in root!)
├── ❌ REACT_COMPONENT_SELECTION_TRACE.json            (trace in root!)
├── ❌ react-component-context.json                     (context in root!)
├── ❌ react-component-context-with-publish.json       (context in root!)
├── ❌ react-component-theme-toggle.json               (context in root!)
│
├── ❌ interaction-manifest.json                        (manifest in root!)
├── ❌ layout-manifest.json                             (manifest in root!)
├── ❌ topics-manifest.json                             (manifest in root!)
│
├── ❌ eslint-report.json (7 files!)                    (test reports in root!)
├── ❌ eslint-report3.json
├── ❌ eslint-report4.json
├── ❌ eslint-report5.json
├── ❌ eslint-report6.json
├── ❌ eslint-report7.json
├── ❌ eslint-report8.json
│
├── ✅ package.json                                     (correct)
├── ✅ package-lock.json                                (correct)
├── ✅ tsconfig.json                                    (correct)
├── ✅ tsconfig.base.json                               (correct)
├── ❌ .tmp-telemetry-analysis.json                     (temp file in root!)
│
├── .archived/                                          (orphaned markdown docs - 228 files)
│   └── ✅ [all orphaned/unneeded documentation]
│
├── src/                                                (source code - OK)
├── tests/                                              (test code - OK)
├── node_modules/                                       (dependencies - OK)
└── .venv/                                              (Python env - OK)

TOTAL SCATTERED IN ROOT:
  ❌ 13 Markdown documentation files (should be in docs/)
  ❌ 27 JSON files scattered everywhere
  ❌ 7 ESLint report files (should be in test-results/)
  ❌ Total: 47 files that belong elsewhere
```

---

## Target State (CLEAN - ORGANIZED BY DOMAIN & PURPOSE)

```
root/
├── ✅ README.md                                        (entry point only)
├── ✅ package.json                                     (package config)
├── ✅ package-lock.json                                (lock file)
├── ✅ tsconfig.json                                    (TypeScript config)
├── ✅ tsconfig.base.json                               (TypeScript base)
│
├── .generated/                                         (build-time artifacts)
│   ├── file-allocation-manifest.json                  (allocation decisions)
│   ├── file-allocation-report.json                    (allocation analysis)
│   ├── file-relocation-report.json                    (relocation history)
│   ├── document-governance-manifest.json              (drift classification)
│   ├── documentation-drift-audit.json                 (drift analysis)
│   ├── domain-document-registry.json                  (domain mapping)
│   ├── search-archive-index.json                      (archive search index)
│   └── [other generated JSON artifacts]
│
├── .archived/                                          (orphaned/historical docs)
│   ├── [228 markdown files - fully indexed]
│   ├── archive-index.json                             (search index metadata)
│   └── archive-categories.json                        (categorization)
│
├── docs/                                               (ALL DOCUMENTATION)
│   ├── INDEX.md ✨ Auto-generated global navigation
│   │
│   ├── governance/                                    (Governance & Authority)
│   │   ├── orchestration-audit-system-project-plan.json  (MOVED - Authority!)
│   │   ├── orchestration-domains.json                    (MOVED - Config)
│   │   ├── PROJECT_BOUNDARIES.json                       (MOVED - Config)
│   │   ├── PROJECT_ROLES.json                           (MOVED - Config)
│   │   ├── PROJECT_SCOPE.json                           (MOVED - Config)
│   │   ├── PROJECT_TAGS.json                            (MOVED - Config)
│   │   │
│   │   ├── DOCUMENTATION_AUTO_GENERATION_GOVERNANCE.md   (MOVED)
│   │   ├── DOCUMENTATION_GOVERNANCE_INDEX.md             (MOVED)
│   │   ├── DOCUMENTATION_GOVERNANCE_IMPLEMENTATION_COMPLETE.md
│   │   ├── DOMAIN_DOCUMENTATION_STRUCTURE.md             (MOVED)
│   │   ├── PATTERN_RECOGNITION_ACHIEVEMENT.md            (MOVED)
│   │   ├── FILE_ALLOCATION_SYSTEM.md                     (MOVED)
│   │   ├── GOVERNANCE_AND_ARCHIVAL_SYSTEM_COMPLETE.md    (MOVED)
│   │   └── INDEX.md ✨ Auto-generated governance index
│   │
│   ├── generated/                                     (AUTO-GENERATED by domain)
│   │   ├── orchestration-audit-system/
│   │   │   ├── INDEX.md ✨ Auto-generated domain index
│   │   │   └── [auto-generated domain docs]
│   │   ├── orchestration-audit-session/
│   │   │   ├── INDEX.md ✨ Auto-generated domain index
│   │   │   └── [auto-generated domain docs]
│   │   ├── cag-agent-workflow/
│   │   │   ├── INDEX.md ✨ Auto-generated domain index
│   │   │   └── [auto-generated domain docs]
│   │   ├── graphing-orchestration/
│   │   │   ├── INDEX.md ✨ Auto-generated domain index
│   │   │   └── [auto-generated domain docs]
│   │   ├── self_sequences/
│   │   │   ├── INDEX.md ✨ Auto-generated domain index
│   │   │   └── [auto-generated domain docs]
│   │   └── INDEX.md ✨ Auto-generated all auto-gen index
│   │
│   ├── manual/                                        (MANUALLY-MAINTAINED by domain)
│   │   ├── orchestration-audit-system/
│   │   │   ├── INDEX.md ✨ Auto-generated manual docs index
│   │   │   └── [manual domain docs]
│   │   ├── orchestration-audit-session/
│   │   │   ├── INDEX.md ✨ Auto-generated manual docs index
│   │   │   └── [manual domain docs]
│   │   ├── cag-agent-workflow/
│   │   │   ├── INDEX.md ✨ Auto-generated manual docs index
│   │   │   └── [manual domain docs]
│   │   ├── graphing-orchestration/
│   │   │   ├── INDEX.md ✨ Auto-generated manual docs index
│   │   │   └── [manual domain docs]
│   │   ├── self_sequences/
│   │   │   ├── INDEX.md ✨ Auto-generated manual docs index
│   │   │   └── [manual domain docs]
│   │   └── INDEX.md ✨ Auto-generated all manual docs index
│   │
│   ├── telemetry/                                     (Telemetry Domain Docs)
│   │   ├── TELEMETRY_GOVERNANCE_COMPLETE.md            (MOVED)
│   │   ├── TELEMETRY_GOVERNANCE_QUICKSTART.md          (MOVED)
│   │   ├── TELEMETRY_GOVERNANCE_VERIFICATION.md        (MOVED)
│   │   ├── DEMO_TELEMETRY_INSTRUMENTATION.md           (MOVED)
│   │   └── INDEX.md ✨ Auto-generated index
│   │
│   ├── shape/                                         (Shape/Configuration Domain)
│   │   ├── shape.budgets.json                         (MOVED - config)
│   │   ├── SHAPE_EVOLUTION_PLAN.json                  (MOVED - config)
│   │   ├── shape-evolutions.json                      (MOVED - config)
│   │   ├── shape-evolutions-allowlist.json            (MOVED - config)
│   │   └── INDEX.md ✨ Auto-generated index
│   │
│   ├── react/                                         (React Component Domain)
│   │   ├── react-component-context.json               (MOVED - config)
│   │   ├── react-component-context-with-publish.json  (MOVED - config)
│   │   ├── react-component-theme-toggle.json          (MOVED - config)
│   │   ├── REACT_COMPONENT_SELECTION_TRACE.json       (MOVED - trace)
│   │   └── INDEX.md ✨ Auto-generated index
│   │
│   ├── manifests/                                     (Manifest Configs)
│   │   ├── interaction-manifest.json                  (MOVED - manifest)
│   │   ├── layout-manifest.json                       (MOVED - manifest)
│   │   ├── topics-manifest.json                       (MOVED - manifest)
│   │   └── INDEX.md ✨ Auto-generated index
│   │
│   ├── search/                                        (Search & Archive Metadata)
│   │   ├── knowledge-index.json                       (MOVED - generated)
│   │   ├── root-context.json                          (MOVED - generated)
│   │   ├── public-api.hash.json                       (MOVED - generated)
│   │   ├── canvas_symphony_data.json                  (MOVED - data)
│   │   └── INDEX.md ✨ Auto-generated index
│   │
│   ├── ARCHITECTURE_RESTRUCTURE_PLAN.md               (THIS FILE - reference guide)
│   └── COMPREHENSIVE_MIGRATION_GUIDE.md               (step-by-step migration)
│
├── test-results/                                       (Test Artifacts)
│   ├── eslint-report.json (consolidated)
│   ├── .last-run.json
│   └── [other test reports]
│
├── src/                                                (Source Code - UNCHANGED)
├── tests/                                              (Test Code - UNCHANGED)
├── node_modules/                                       (Dependencies - UNCHANGED)
└── .venv/                                              (Python env - UNCHANGED)
```

---

## Migration Map

### Phase 1: Move Governance & Authority Files

**FROM root/ → TO docs/governance/**

| File | Current | Target | Type |
|------|---------|--------|------|
| orchestration-audit-system-project-plan.json | root/ | docs/governance/ | AUTHORITY (JSON) |
| orchestration-domains.json | root/ | docs/governance/ | CONFIG (JSON) |
| PROJECT_BOUNDARIES.json | root/ | docs/governance/ | CONFIG (JSON) |
| PROJECT_ROLES.json | root/ | docs/governance/ | CONFIG (JSON) |
| PROJECT_SCOPE.json | root/ | docs/governance/ | CONFIG (JSON) |
| PROJECT_TAGS.json | root/ | docs/governance/ | CONFIG (JSON) |
| DOCUMENTATION_AUTO_GENERATION_GOVERNANCE.md | root/ | docs/governance/ | GOVERNANCE (MD) |
| DOCUMENTATION_GOVERNANCE_INDEX.md | root/ | docs/governance/ | GOVERNANCE (MD) |
| DOCUMENTATION_GOVERNANCE_IMPLEMENTATION_COMPLETE.md | root/ | docs/governance/ | GOVERNANCE (MD) |
| DOMAIN_DOCUMENTATION_STRUCTURE.md | root/ | docs/governance/ | GOVERNANCE (MD) |
| PATTERN_RECOGNITION_ACHIEVEMENT.md | root/ | docs/governance/ | ACHIEVEMENT (MD) |
| FILE_ALLOCATION_SYSTEM.md | root/ | docs/governance/ | SYSTEM (MD) |
| GOVERNANCE_AND_ARCHIVAL_SYSTEM_COMPLETE.md | root/ | docs/governance/ | SYSTEM (MD) |

### Phase 2: Move Domain-Specific Configuration

**FROM root/ → TO docs/{domain}/**

| File | Current | Target | Domain |
|------|---------|--------|--------|
| TELEMETRY_GOVERNANCE_COMPLETE.md | root/ | docs/telemetry/ | telemetry |
| TELEMETRY_GOVERNANCE_QUICKSTART.md | root/ | docs/telemetry/ | telemetry |
| TELEMETRY_GOVERNANCE_VERIFICATION.md | root/ | docs/telemetry/ | telemetry |
| DEMO_TELEMETRY_INSTRUMENTATION.md | root/ | docs/telemetry/ | telemetry |
| shape.budgets.json | root/ | docs/shape/ | shape |
| SHAPE_EVOLUTION_PLAN.json | root/ | docs/shape/ | shape |
| shape-evolutions.json | root/ | docs/shape/ | shape |
| shape-evolutions-allowlist.json | root/ | docs/shape/ | shape |
| react-component-context.json | root/ | docs/react/ | react |
| react-component-context-with-publish.json | root/ | docs/react/ | react |
| react-component-theme-toggle.json | root/ | docs/react/ | react |
| REACT_COMPONENT_SELECTION_TRACE.json | root/ | docs/react/ | react |
| interaction-manifest.json | root/ | docs/manifests/ | manifests |
| layout-manifest.json | root/ | docs/manifests/ | manifests |
| topics-manifest.json | root/ | docs/manifests/ | manifests |

### Phase 3: Move Generated & Analysis Files

**FROM root/ → TO .generated/**

| File | Current | Target | Type |
|------|---------|--------|------|
| knowledge-index.json | root/ | docs/search/ | GENERATED INDEX |
| root-context.json | root/ | docs/search/ | GENERATED CONTEXT |
| public-api.hash.json | root/ | docs/search/ | GENERATED HASH |
| canvas_symphony_data.json | root/ | docs/search/ | GENERATED DATA |
| DOC_INDEX.json | root/ | .generated/ | BUILD ARTIFACT |

### Phase 4: Move Test Reports

**FROM root/ → TO test-results/**

| File | Current | Target | Type |
|------|---------|--------|------|
| eslint-report.json | root/ | test-results/ | TEST REPORT |
| eslint-report3.json | root/ | test-results/ | TEST REPORT |
| eslint-report4.json | root/ | test-results/ | TEST REPORT |
| eslint-report5.json | root/ | test-results/ | TEST REPORT |
| eslint-report6.json | root/ | test-results/ | TEST REPORT |
| eslint-report7.json | root/ | test-results/ | TEST REPORT |
| eslint-report8.json | root/ | test-results/ | TEST REPORT |

---

## File Count Summary

### Current State (SCATTERED)
```
Root directory contains:
  ✅ Correct files:        5 (README, package.json, tsconfig files)
  ❌ Documentation files: 13 markdown files
  ❌ JSON files:          27 scattered files
  ❌ Test reports:         7 eslint reports
  ❌ Temp files:           1 (.tmp-telemetry-analysis.json)
  ━━━━━━━━━━━━━━━━━━━━━━━
  🚨 PROBLEMATIC:         48 files that belong elsewhere
  📊 TOTAL IN ROOT:       53 files
```

### Target State (ORGANIZED)
```
Root directory contains:
  ✅ README.md                (1)
  ✅ package.json             (1)
  ✅ package-lock.json        (1)
  ✅ tsconfig.json            (1)
  ✅ tsconfig.base.json       (1)
  ━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ TOTAL IN ROOT:            5 files only!

docs/ contains:
  ✅ Governance files        (13 md + 6 json)
  ✅ Domain-specific docs    (organized by purpose)
  ✅ Generated indexes       (11 auto-generated INDEX.md)
  
.generated/ contains:
  ✅ Build artifacts         (~5 JSON files)

test-results/ contains:
  ✅ Test reports            (consolidated)

.archived/ contains:
  ✅ Historical docs         (228 markdown files, indexed)
```

---

## Scale & Governance Benefits

### ✅ Clarity
- **Before**: 48 files scattered in root - impossible to navigate
- **After**: Root has only 5 files; everything organized by domain/purpose

### ✅ Maintainability
- **Before**: Authority JSONs mixed with generated JSONs mixed with config JSONs
- **After**: Clear separation - governance/config in docs/, generated in .generated/

### ✅ Growth Ready
- **Before**: Adding new features means adding more root-level files
- **After**: New domains go to docs/{domain}/, scales infinitely

### ✅ Search & Discovery
- **Before**: ls -la in root gives 48 results to sort through
- **After**: Find governance docs in docs/governance/, domain docs in docs/{domain}/

### ✅ CI/CD Friendly
- **Before**: Build scripts have to know about 27 different JSON files scattered everywhere
- **After**: Predictable structure - governance in docs/governance/, generated in .generated/

### ✅ Documentation Quality
- **Before**: No clear distinction between auto-generated vs manually maintained
- **After**: docs/generated/ vs docs/manual/ makes it explicit

---

## Implementation Strategy

### Step 1: Create directory structure
```bash
mkdir -p docs/governance
mkdir -p docs/generated/{orchestration-audit-system,orchestration-audit-session,cag-agent-workflow,graphing-orchestration,self_sequences}
mkdir -p docs/manual/{orchestration-audit-system,orchestration-audit-session,cag-agent-workflow,graphing-orchestration,self_sequences}
mkdir -p docs/telemetry
mkdir -p docs/shape
mkdir -p docs/react
mkdir -p docs/manifests
mkdir -p docs/search
mkdir -p test-results
```

### Step 2: Create new file relocation script
- `scripts/allocate-json-files.js` - analyze JSON file placement
- `scripts/relocate-json-files.js` - move JSON files to proper locations
- Update `orchestration-audit-system-project-plan.json` with new paths

### Step 3: Update all references
- Update import paths in source code
- Update build scripts (package.json)
- Update CI/CD pipeline references

### Step 4: Regenerate domain indexes
- Run `npm run generate:domain:indexes`
- Run `npm run generate:governance:indexes`
- Verify all 16+ indexes generated

### Step 5: Build and verify
- `npm run build` - ensures everything still works
- `npm run test` - verify no broken references

---

## Authority & Governance

All moves are derived from **orchestration-audit-system-project-plan.json**:
- This is the source of truth
- All file locations are defined there
- The plan is self-enforcing via build scripts
- Any deviation from the plan can be detected at build time

**Key Principle**: "JSON is Authority, File System is Reflection"

---

## Rollback Protection

Before executing Phase 1-4:
1. ✅ All changes are based on explicit governance rules
2. ✅ Current locations captured in allocation manifest
3. ✅ Each file has a clear target location
4. ✅ Duplicate detection prevents data loss
5. ✅ Can be automated: `npm run relocate:json-files -- --execute`

---

**Status**: ✅ ARCHITECTURE PLAN COMPLETE
**Next Step**: Execute Phase 1-4 file relocation
**Risk Level**: 🟢 LOW (automated, governed, reversible)

Generated: 2025-11-24
Version: 1.0.0 - Complete Senior-Level Architecture Restructure
