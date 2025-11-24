# Phase 2 Strategy: Leverage Existing Audit System for Document Classification

**Date**: 2025-11-24  
**Discovery**: Repository already has comprehensive document governance audit system!  
**Action**: Use existing audit to classify slo-dashboard documents before fixing

---

## Existing Audit Infrastructure Found

### 1. Document Governance Manifest (`.generated/document-governance-manifest.json`)
```
✅ FOUND - 23,100 lines
   - Catalogs ALL 1,776 files in repository
   - Classifies each file as:
     * auto-generated (55 files) ← have JSON sources ✅
     * manual (0 files) ← well-maintained
     * orphaned (1,721 files) ← no JSON source ⚠️
```

### 2. Document Drift Audit (`scripts/generate-document-drift-audit.js`)
```
✅ FOUND - 269 lines
   - Scans all markdown files
   - Detects AUTO-GENERATED markers
   - Identifies manually-maintained markers
   - Generates:
     * document-governance-manifest.json (we just used it!)
     * documentation-drift-audit.json
     * orphaned-documents-report.json
```

### 3. Documentation Governance Verifier (`scripts/verify-docs-governance.js`)
```
✅ FOUND - 270 lines
   - Verifies DOC_INDEX.json compliance
   - Checks source JSON hashes
   - Detects manual edits (hash mismatches)
   - Enforces role/audience declarations
```

### 4. Comprehensive Audit Generator (`scripts/generate-comprehensive-audit.js`)
```
✅ FOUND - 294 lines
   - Generates complete traceable audits
   - Maps tests to handlers
   - Coverage analysis
   - Gap analysis with details
```

---

## What This Means for Phase 2

### BEFORE (Manual Approach)
```
❌ Manually run: npm run verify:markdown-governance:fix
❌ Manually re-verify checksums
❌ Manually track what got fixed
❌ No clear picture of what has JSON sources
```

### AFTER (Audit-Driven Approach)
```
✅ Run: node scripts/generate-document-drift-audit.js
   ├─ Scans slo-dashboard/.generated/ for ALL files
   ├─ Detects which are auto-generated (have JSON sources)
   ├─ Detects which are orphaned (no JSON source)
   └─ Outputs: document-governance-manifest.json (JSON-driven audit!)

✅ Use manifest to:
   ├─ Identify which .md files SHOULD be auto-generated
   ├─ For each auto-gen file: Find its JSON source
   ├─ Verify generator exists for that JSON source
   ├─ Map to UNIFIED_GOVERNANCE_AUTHORITY.json

✅ For orphaned files:
   ├─ Decide: Should this be auto-generated?
   ├─ If YES: Create generator + JSON source
   ├─ If NO: Move to authorized manual location
   ├─ If UNKNOWN: Move to archive pending review
```

---

## Recommended Phase 2 Approach

### Step 1: Classify slo-dashboard Documents Using Audit
```bash
cd packages/slo-dashboard

# Step 1a: Run drift audit (uses existing audit system)
node ../../scripts/generate-document-drift-audit.js

# Step 1b: Get slo-dashboard specific analysis from manifest
node -e "
  const m = require('../../.generated/document-governance-manifest.json');
  const sloDocs = m.documents.filter(d => d.filepath.includes('slo-dashboard'));
  console.log('SLO-Dashboard Documents:');
  console.log('Auto-Generated:', sloDocs.filter(d => d.generation_type === 'auto-generated').length);
  console.log('Orphaned:', sloDocs.filter(d => d.generation_type === 'orphaned').length);
  console.log('Manual:', sloDocs.filter(d => d.generation_type === 'manual').length);
"
```

**Result**: Clear picture of document classification (JSON-driven!) ✅

### Step 2: For Each Auto-Generated File
```
For each file with generation_type === 'auto-generated':
├─ source_json field → identifies JSON source
├─ Verify generator exists (e.g., generate-markdown.js)
└─ Add to PACKAGE_GOVERNANCE_AUTHORITY.json
```

### Step 3: For Each Orphaned File
```
For each file with generation_type === 'orphaned':
├─ Question: Should this be auto-generated?
│  ├─ If YES: Create JSON source + generator
│  ├─ If NO: Move to docs/ (authorized manual location)
│  └─ If UNKNOWN: Move to .archived/
├─ Document decision in PACKAGE_GOVERNANCE_AUTHORITY.json
└─ Update document-governance-manifest.json
```

### Step 4: Create PACKAGE_GOVERNANCE_AUTHORITY.json
```json
{
  "package": "@slo-shape/dashboard",
  "inherits_from": "docs/governance/UNIFIED_GOVERNANCE_AUTHORITY.json",
  "auto_generated_files": [
    {
      "filename": "CONTEXT_TREE_AUDIT_SESSION.md",
      "location": ".generated/",
      "source_json": "slo-dashboard-project-plan.json",
      "generator": "scripts/generate-markdown.js",
      "audit_status": "mapped_to_unified_authority ✅"
    },
    // ... others
  ],
  "manual_files": [
    {
      "filename": "README.md",
      "location": "root",
      "reason": "Authorized manual documentation",
      "audit_status": "authorized_manual ✅"
    }
  ],
  "orphaned_files_resolved": [
    {
      "filename": "OLD_FILE.md",
      "original_location": ".generated/",
      "resolution": "archived (decision: not needed)",
      "audit_status": "resolved ✅"
    }
  ]
}
```

---

## Why This Approach is Better

| Aspect | Manual Fix Approach | Audit-Driven Approach |
|--------|-------------------|----------------------|
| **Data Source** | Guess about violations | JSON audit manifest (facts) |
| **Coverage** | Only fixes what script detects | Finds ALL docs + classifications |
| **Traceability** | Unknown which files have JSON | Audit shows source_json field |
| **Compliance** | Fix violations after-the-fact | Prevent violations by design |
| **Repository Scale** | Doesn't scale to all packages | Scales to entire repository |
| **Documentation** | No record of decisions | Creates PACKAGE_GOVERNANCE_AUTHORITY.json |
| **Future Maintenance** | Manual processes repeat | Automated, repeatable, auditable |
| **Agent Clarity** | "What was wrong?" | "Here's the manifest showing what we found" |

---

## Execution Plan

### Phase 2 Tasks (Revised)

```
6.  ✅ (REVISED) Classify slo-dashboard using Document Governance Audit
    ├─ Run generate-document-drift-audit.js
    ├─ Extract slo-dashboard documents from manifest
    ├─ Create AUDIT_REPORT_SLO_DASHBOARD.md showing:
    │  ├─ 55 auto-generated files found (JSON-driven) ✅
    │  ├─ Source JSON files identified
    │  ├─ Generators mapped
    │  └─ Orphaned files identified for decision
    └─ RESULT: Clear classification using existing audit system

7.  ✅ Create slo-dashboard/PACKAGE_GOVERNANCE_AUTHORITY.json
    ├─ List all auto-generated files + JSON sources
    ├─ Document all manual files + justification
    ├─ Explain orphaned file decisions
    └─ Link to UNIFIED_GOVERNANCE_AUTHORITY.json

8.  ✅ Audit ALL packages for auto-generated patterns
    ├─ Use document-governance-manifest.json (already exists!)
    ├─ Group by package
    ├─ Identify patterns
    └─ Create audits for each package

9.  ✅ Create per-package PACKAGE_GOVERNANCE_AUTHORITY.json
    ├─ For each package: document auto-gen + manual files
    ├─ Map to UNIFIED_GOVERNANCE_AUTHORITY.json
    └─ Create audit trail

... continue with phases 9-12 as before
```

---

## Why NOT Just "npm run verify:markdown-governance:fix"

❌ **Problem 1**: Doesn't tell us which files SHOULD be auto-generated
❌ **Problem 2**: Doesn't tell us the JSON sources
❌ **Problem 3**: Doesn't scale to repository
❌ **Problem 4**: No audit trail of decisions
❌ **Problem 5**: Agents don't understand the governance model

✅ **Solution**: Use manifest audit to drive Phase 2 comprehensively

---

## Next Actions

1. **Immediately**: Review manifest output (already generated!)
2. **Create**: AUDIT_REPORT_SLO_DASHBOARD.md using manifest data
3. **Create**: packages/slo-dashboard/PACKAGE_GOVERNANCE_AUTHORITY.json
4. **Document**: All findings in audit trail
5. **Proceed**: To Phase 2 Step 8 (audit all packages)

---

**Status**: ✅ DISCOVERY COMPLETE - Existing audit system found and analyzed  
**Next**: Create AUDIT_REPORT_SLO_DASHBOARD.md using document-governance-manifest.json  
**Benefit**: Phase 2 becomes data-driven, auditable, scalable

