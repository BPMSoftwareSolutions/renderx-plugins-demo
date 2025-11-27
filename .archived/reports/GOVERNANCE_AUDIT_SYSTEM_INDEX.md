# Governance Audit System Index

**Status**: ✅ Discovery Reference (Central Registry)  
**Purpose**: Single source of truth for finding and using audit systems  
**Audience**: All agents, project leads, new team members  
**Updated**: 2025-11-24  

---

## Quick Start: Finding Audit Systems

### If You're Trying To...

| Goal | Audit System | Location | Command |
|------|-------------|----------|---------|
| Find auto-generated files vs orphaned | `generate-document-drift-audit.js` | `scripts/` | `node scripts/generate-document-drift-audit.js` |
| Verify document-JSON compliance | `verify-docs-governance.js` | `scripts/` | `node scripts/verify-docs-governance.js` |
| Analyze test coverage by handler | `generate-comprehensive-audit.js` | `scripts/` | `node scripts/generate-comprehensive-audit.js` |
| Check orchestration layer health | `audit-orchestration.js` | `scripts/` | `node scripts/audit-orchestration.js` |
| Verify no root file drift | `verify-root-cleanliness.js` | `scripts/` | `node scripts/verify-root-cleanliness.js` |
| Find markdown governance issues | `verify-markdown-governance.js` | `packages/slo-dashboard/scripts/` | `npm run verify:markdown-governance` |

---

## Complete Audit System Registry

### Category 1: Document Governance Audits

#### `scripts/generate-document-drift-audit.js`
```
Purpose:        Scan all markdown files, classify as auto-generated/orphaned
Last Updated:   2025-11-24
Lines:          269
Status:         ✅ ACTIVE & TESTED
Outputs:
  ├─ .generated/document-governance-manifest.json (1,776 files indexed)
  ├─ .generated/documentation-drift-audit.json (drift risk analysis)
  └─ .generated/orphaned-documents-report.json (orphaned file list)
Usage:          node scripts/generate-document-drift-audit.js
Query Pattern:  Use manifest to find: auto-generated files + JSON sources
Example Use:    "Which .md files in packages/slo-dashboard/ are auto-generated?"
                → Query manifest for filepath matching "slo-dashboard" + generation_type = "auto-generated"
```

#### `scripts/verify-docs-governance.js`
```
Purpose:        Verify generated markdown matches source JSON compliance
Last Updated:   2025-11-24
Lines:          270
Status:         ✅ ACTIVE & TESTED
Checks:
  ├─ All docs in DOC_INDEX.json have generated markdown
  ├─ Generated files have correct context blocks
  ├─ Source JSON hashes match stored hashes
  ├─ No markdown files manually edited (hash mismatch)
  └─ All docs declare role and audience
Usage:          node scripts/verify-docs-governance.js [--strict]
Query Pattern:  For each auto-generated file: verify source hash matches
Example Use:    "Are MARKDOWN files compliant with source JSON?"
```

#### `docs/governance/GOVERNANCE_AND_ARCHIVAL_SYSTEM_COMPLETE.md`
```
Purpose:        Documents complete document governance system
Content:        System design + what was built + how to use
Key Sections:
  ├─ Problem solved: 94.8% orphaned docs before system
  ├─ Classification: Auto-generated (55) vs Orphaned (1,721)
  ├─ Archival strategy: Preserve with searchable metadata
  └─ Integration: How to use for ongoing governance
Reference:      Read before using document audit system
Status:         ✅ ACTIVE REFERENCE
```

---

### Category 2: Test & Handler Coverage Audits

#### `scripts/generate-comprehensive-audit.js`
```
Purpose:        Generate complete traceable audit with test-to-handler mapping
Last Updated:   2025-11-24
Lines:          294
Status:         ✅ ACTIVE & TESTED
Generates:
  ├─ All test files with paths
  ├─ All tests with descriptions
  ├─ Handler-to-test mappings
  ├─ Coverage analysis by plugin
  └─ Gap analysis with details
Usage:          node scripts/generate-comprehensive-audit.js
Output:         .generated/comprehensive-audit.json
Query Pattern:  Find handlers with/without tests, coverage gaps
Example Use:    "Which handlers lack test coverage?"
```

#### `scripts/audit-orchestration.js`
```
Purpose:        Audit orchestration layer health and sequence definitions
Last Updated:   2025-11-24
Lines:          ~200
Status:         ✅ ACTIVE & TESTED
Checks:
  ├─ Orchestration domain definitions
  ├─ Sequence file compliance
  ├─ Handler registration in sequences
  └─ Orchestration-to-IR mapping
Usage:          node scripts/audit-orchestration.js
Query Pattern:  Find orchestration structure + handler definitions
Example Use:    "Are all handlers defined in orchestration domains?"
```

---

### Category 3: Root Governance Audits

#### `scripts/verify-root-cleanliness.js`
```
Purpose:        Verify root directory complies with ROOT_FILE_PLACEMENT_RULES.json
Last Updated:   2025-11-24
Status:         ✅ ACTIVE & TESTED
Checks:
  ├─ Only authorized root files exist
  ├─ No unauthorized files in root
  ├─ All required files present
  └─ Files in correct locations
Usage:          node scripts/verify-root-cleanliness.js
Query Pattern:  Find root file placement violations
Example Use:    "Are all root files in authorized locations?"
Reference:      docs/governance/ROOT_FILE_PLACEMENT_RULES.json
```

---

### Category 4: Package-Level Audits

#### `packages/slo-dashboard/scripts/verify-markdown-governance.js`
```
Purpose:        Verify markdown files in .generated/ are auto-generated
Last Updated:   2025-11-24
Lines:          246
Status:         ✅ ACTIVE (slo-dashboard specific)
Checks:
  ├─ All .md files have AUTO-GENERATED marker
  ├─ No manual markdown in .generated/
  ├─ Files match expected auto-generation list
  └─ Checksums valid (when implemented)
Usage:          npm run verify:markdown-governance (in slo-dashboard package)
Fix:            npm run verify:markdown-governance:fix
Query Pattern:  For slo-dashboard .generated/: what's auto-generated vs manual?
```

---

## Discovering Audit Systems: Query Pattern

### Step 1: Identify Your Question
```
"I need to find: [something] in the codebase"
Examples:
- "Which markdown files are auto-generated?"
- "Which handlers have test coverage?"
- "Are root files in correct locations?"
- "What documents are orphaned?"
```

### Step 2: Find Matching Audit System
```
Search in this order:
1. Check: scripts/*audit*.js or scripts/*verify*.js
2. Check: .generated/*manifest*.json (data from existing audits)
3. Check: docs/governance/*SYSTEM*.md (audit system documentation)
4. Result: Found your audit system
```

### Step 3: Query the Audit System
```
For manifest files (.generated/*.json):
  const manifest = require('./.generated/document-governance-manifest.json');
  const results = manifest.documents
    .filter(d => d.filepath.includes('slo-dashboard'))
    .filter(d => d.generation_type === 'auto-generated');

For scripts:
  node scripts/[audit-script-name].js [options]
  
Example: Get orphaned documents
  const manifest = require('./.generated/document-governance-manifest.json');
  const orphaned = manifest.documents
    .filter(d => d.generation_type === 'orphaned');
```

### Step 4: Use Results for Task
```
Once you have audit results:
- Create PACKAGE_GOVERNANCE_AUTHORITY.json from manifest
- Map auto-generated files to UNIFIED_GOVERNANCE_AUTHORITY.json
- Document orphaned files (keep, move, or archive)
- Create audit report showing all decisions
```

---

## Common Queries & How to Answer Them

### Query 1: "Which documents have JSON sources?"
```
Source:    .generated/document-governance-manifest.json
Filter:    documents where generation_type === 'auto-generated'
Result:    All auto-generated files + their source_json field
Use:       Map to PACKAGE_GOVERNANCE_AUTHORITY.json
Command:   node scripts/generate-document-drift-audit.js
```

### Query 2: "What handlers lack test coverage?"
```
Source:    .generated/comprehensive-audit.json
Filter:    handlers where covered !== true
Result:    All handlers without tests
Use:       Identify coverage gaps for Phase 3
Command:   node scripts/generate-comprehensive-audit.js
```

### Query 3: "Are all .md files in .generated/ auto-generated?"
```
Source:    packages/slo-dashboard/scripts/verify-markdown-governance.js
Check:     All files have AUTO-GENERATED marker
Result:    Violations (manual files) or compliant
Use:       Fix package-level governance
Command:   npm run verify:markdown-governance (in package dir)
```

### Query 4: "What documents are orphaned?"
```
Source:    .generated/document-governance-manifest.json
Filter:    documents where generation_type === 'orphaned'
Result:    All orphaned files with classification
Use:       Decide: keep, archive, or create generator
Command:   node scripts/generate-document-drift-audit.js
```

### Query 5: "Are root files in correct locations?"
```
Source:    docs/governance/ROOT_FILE_PLACEMENT_RULES.json
Audit:     scripts/verify-root-cleanliness.js
Result:    Root placement violations or compliant
Use:       Fix root governance issues
Command:   node scripts/verify-root-cleanliness.js
```

---

## Using Audit Results in Phase 2

### Phase 2 Workflow: Using This Index

```
Phase 2 Task: "Classify documents in slo-dashboard"

Step 1: Query Audit Systems (DISCOVERY)
  ├─ Read: docs/governance/GOVERNANCE_AND_ARCHIVAL_SYSTEM_COMPLETE.md
  ├─ Run: node scripts/generate-document-drift-audit.js
  └─ Result: .generated/document-governance-manifest.json

Step 2: Extract Package Data
  ├─ Query manifest for documents where filepath includes "slo-dashboard"
  ├─ Filter by generation_type (auto-generated, orphaned, manual)
  └─ Document findings in AUDIT_REPORT_SLO_DASHBOARD.md

Step 3: Map to Unified Authority
  ├─ For auto-generated files: source_json → UNIFIED_GOVERNANCE_AUTHORITY.json
  ├─ For manual files: document reason → UNIFIED_GOVERNANCE_AUTHORITY.json
  └─ For orphaned: decide status → archive/keep/delete

Step 4: Create PACKAGE_GOVERNANCE_AUTHORITY.json
  ├─ List all auto-generated files + JSON sources
  ├─ List all manual files + justification
  ├─ List all orphaned file decisions
  └─ Reference audit trail (this document)

Result: Data-driven Phase 2 execution using existing audit systems
```

---

## Audit System Maintenance

### Adding New Audit Systems

**When You Create a New Audit Script**:
1. Add entry to this index with:
   - Purpose (what it finds)
   - Location (where the script is)
   - Usage (how to run it)
   - Output files (what it generates)
   - Query pattern (how to use results)

2. Update: `UNIFIED_GOVERNANCE_AUTHORITY.json` → supporting_systems section

3. Reference in: Phase 2+ task descriptions

**Template**:
```markdown
#### `scripts/new-audit-system.js`
Purpose:        [What this audits]
Status:         ✅ ACTIVE
Usage:          [How to run]
Outputs:        [What files it generates]
Query Pattern:  [How to use results]
```

### Checking Audit Health

**Monthly Checklist**:
- [ ] All audit systems still exist in scripts/
- [ ] All outputs still generate correctly
- [ ] All manifest files readable and recent
- [ ] All referenced in UNIFIED_GOVERNANCE_AUTHORITY.json
- [ ] All documented in this index

---

## Integration with Governance Authority

### How This Index Connects to UNIFIED_GOVERNANCE_AUTHORITY.json

```json
{
  "governance_authority": "docs/governance/UNIFIED_GOVERNANCE_AUTHORITY.json",
  "supporting_systems": {
    "audit_registry": "GOVERNANCE_AUDIT_SYSTEM_INDEX.md",
    "discovery_pattern": "DISCOVERY_PATTERN.md",
    "all_audit_systems": [
      "scripts/generate-document-drift-audit.js",
      "scripts/verify-docs-governance.js",
      "scripts/generate-comprehensive-audit.js",
      "scripts/audit-orchestration.js",
      "scripts/verify-root-cleanliness.js",
      "packages/slo-dashboard/scripts/verify-markdown-governance.js"
    ]
  },
  "query_pattern": {
    "step_1": "Identify what you need to find",
    "step_2": "Check this index (GOVERNANCE_AUDIT_SYSTEM_INDEX.md)",
    "step_3": "Use matching audit system",
    "step_4": "Apply results to task"
  }
}
```

---

## Status & Maintenance

| System | Created | Last Audited | Status | Next Review |
|--------|---------|--------------|--------|-------------|
| document-drift-audit.js | 2025-11-24 | 2025-11-24 | ✅ ACTIVE | 2025-12-01 |
| verify-docs-governance.js | 2025-11-24 | 2025-11-24 | ✅ ACTIVE | 2025-12-01 |
| generate-comprehensive-audit.js | 2025-11-24 | 2025-11-24 | ✅ ACTIVE | 2025-12-01 |
| audit-orchestration.js | 2025-11-24 | 2025-11-24 | ✅ ACTIVE | 2025-12-01 |
| verify-root-cleanliness.js | 2025-11-24 | 2025-11-24 | ✅ ACTIVE | 2025-12-01 |
| slo-dashboard markdown-governance | 2025-11-24 | 2025-11-24 | ✅ ACTIVE | 2025-12-01 |

---

## Quick Reference Card

**Save this in your terminal/editor for quick lookup**:

```bash
# Find auto-generated files
node scripts/generate-document-drift-audit.js

# Query manifest (Node.js)
node -e "const m = require('./.generated/document-governance-manifest.json'); \
  console.log('Auto-generated:', m.documents.filter(d => d.generation_type === 'auto-generated').length); \
  console.log('Orphaned:', m.documents.filter(d => d.generation_type === 'orphaned').length)"

# Verify markdown governance (in package)
npm run verify:markdown-governance

# Check root cleanliness
node scripts/verify-root-cleanliness.js

# Full audit
node scripts/generate-comprehensive-audit.js
```

---

**Purpose**: This index prevents the "missing audit discovery" problem by making all audit systems discoverable in one place.

**How to Use**: Bookmark this file. Before starting any task, check here for existing audit capability.

**Maintenance**: Update whenever new audit systems are created or existing systems change.

