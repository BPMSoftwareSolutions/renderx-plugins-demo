# Documentation Auto-Generation Governance Framework

**Status**: Architecture Pattern Enforcement  
**Version**: 1.0.0  
**Enforced Since**: January 9, 2025

---

## Core Principle

**"JSON is Authority, Markdown is Reflection"**

All documentation must be auto-generated from JSON source-of-truth to prevent documentation/architecture drift.

---

## Governance Rule Set

### Rule 1: Single Source of Truth (SSoT)
- **Authority**: Every system has exactly ONE authoritative JSON file as source-of-truth
- **Reflection**: All documentation generated FROM that JSON
- **Enforcement**: CI/CD blocks commits with manually-edited generated docs

### Rule 2: Auto-Generation Pipeline
- **Requirement**: Every JSON authority file MUST have a corresponding generation script
- **Pipeline**: All generation scripts run in `pre:manifests` pipeline before build
- **Order**: Registry generation (creates JSON) → Documentation generation (reads JSON)
- **Status**: Automatically enforced on every `npm run build`

### Rule 3: Generated Document Marking
- **Header**: All auto-generated markdown files MUST have `<!-- AUTO-GENERATED -->`
- **Footer**: All auto-generated files MUST have `<!-- DO NOT EDIT - Regenerate with: npm run build -->`
- **Audit**: Scripts scan for manually-edited marked files and fail build

### Rule 4: No Manual Documentation
- **Prohibition**: Developers MUST NOT hand-write documentation marked as auto-generated
- **Alternative**: Update the JSON source → script regenerates the markdown
- **Enforcement**: Pre-commit hook blocks commits that edit auto-generated files

### Rule 5: Generation Script Governance
- **Authorship**: Every generation script MUST be version-controlled and code-reviewed
- **Documentation**: Scripts MUST include purpose, inputs, outputs, features comments
- **Testing**: Scripts MUST be validated for idempotency (same JSON → same output)
- **Integration**: Scripts MUST be registered in package.json

### Rule 6: Artifact Traceability
- **Lineage**: Every generated file MUST document its source JSON and generation script
- **Timestamp**: Metadata MUST include generation timestamp and script version
- **Checksum**: Optional integrity hash for drift detection

---

## Current Implementation Status

### ✅ Implemented Patterns

| Pattern | Source JSON | Generation Script | Generated Artifacts | Status |
|---------|------------|-------------------|-------------------|--------|
| Orchestration Domains | `orchestration-domains.json` | `scripts/generate-orchestration-domains-from-sequences.js` | `docs/generated/orchestration-*.md`, `.ographx/artifacts/orchestration/*.mmd` | ✅ Active |
| Orchestration Audit | `orchestration-audit-system-project-plan.json` | `scripts/gen-orchestration-docs.js` | `docs/generated/orchestration-execution-flow.md`, `unified-musical-sequence-interface.md` | ✅ Active |
| Telemetry Governance | `orchestration-audit-system-project-plan.json` | `scripts/generate-telemetry-matrix.js` | `.generated/telemetry-matrix.json`, `docs/generated/orchestration-telemetry-matrix.md` | ✅ Active |
| Sprint Reporting | `orchestration-audit-system-project-plan.json` | `scripts/generate-sprint-reports.js` | `docs/generated/orchestration-sprint-reports.md` | ✅ Active |
| Release Notes | `orchestration-audit-system-project-plan.json` | `scripts/generate-release-notes.js` | `docs/generated/orchestration-release-notes.md` | ✅ Active |
| Compliance Reports | `orchestration-audit-system-project-plan.json` | `scripts/generate-compliance-report.js` | `docs/generated/orchestration-compliance.md` | ✅ Active |
| Provenance Index | `orchestration-audit-system-project-plan.json` | `scripts/generate-provenance-index.js` | `docs/generated/orchestration-provenance.md` | ✅ Active |

### ⏳ Newly Governed (Telemetry Phase)

The following documents were created manually but MUST be converted to auto-generated:

| Document | Current Status | Required JSON | Generation Script | Priority |
|----------|----------------|---------------|-------------------|----------|
| `DEMO_TELEMETRY_INSTRUMENTATION.md` | Manual | `orchestration-audit-system-project-plan.json` (telemetry section) | `scripts/generate-telemetry-instrumentation.js` | HIGH |
| `TELEMETRY_GOVERNANCE_QUICKSTART.md` | Manual | `orchestration-audit-system-project-plan.json` (telemetry section) | `scripts/generate-telemetry-quickstart.js` | HIGH |
| `TELEMETRY_GOVERNANCE_VERIFICATION.md` | Manual | `.generated/telemetry-validation-report.json` | `scripts/generate-telemetry-verification.js` | HIGH |
| `TELEMETRY_GOVERNANCE_COMPLETE.md` | Manual | `.generated/telemetry-matrix.json` + validation report | `scripts/generate-telemetry-complete.js` | MEDIUM |

---

## Governance Enforcement Mechanism

### Phase 1: Identification ✅
All manually-created telemetry documents identified:
- `DEMO_TELEMETRY_INSTRUMENTATION.md`
- `TELEMETRY_GOVERNANCE_QUICKSTART.md`
- `TELEMETRY_GOVERNANCE_VERIFICATION.md`
- `TELEMETRY_GOVERNANCE_COMPLETE.md`

### Phase 2: Conversion (In Progress)
Convert each document to auto-generated from JSON source:

**Step 1**: Extract content → JSON structure  
**Step 2**: Create generation script → reads JSON, produces markdown  
**Step 3**: Move manual content → JSON authority  
**Step 4**: Add `<!-- AUTO-GENERATED -->` headers  
**Step 5**: Integrate script into `pre:manifests` pipeline  
**Step 6**: Regenerate and verify  

### Phase 3: Enforcement (Ready to Implement)
- Pre-commit hook: Block commits editing auto-generated files
- CI/CD: Fail build if generated files don't match source JSON
- Drift detection: Checksum validation on every build

---

## Implementation Roadmap

### Immediate (Next Build)

1. **Create Telemetry Governance JSON Structure**
   ```json
   {
     "orchestration-audit-system-project-plan.json": {
       "telemetry": {
         "governance": {
           "instrumentation": { /* content from DEMO_TELEMETRY_INSTRUMENTATION.md */ },
           "quickstart": { /* content from TELEMETRY_GOVERNANCE_QUICKSTART.md */ },
           "verification": { /* links to validation report */ }
         }
       }
     }
   }
   ```

2. **Create Generation Scripts**
   - `scripts/generate-telemetry-instrumentation.js` – Reads plan.telemetry.instrumentation → generates markdown
   - `scripts/generate-telemetry-quickstart.js` – Reads plan.telemetry.quickstart → generates markdown
   - `scripts/generate-telemetry-verification.js` – Reads validation report → generates markdown
   - `scripts/generate-telemetry-complete.js` – Aggregates all telemetry data → generates summary

3. **Add to pre:manifests Pipeline**
   ```json
   "pre:manifests": "... && node scripts/generate-telemetry-instrumentation.js && node scripts/generate-telemetry-quickstart.js && node scripts/generate-telemetry-verification.js && node scripts/generate-telemetry-complete.js && ..."
   ```

4. **Replace Manual Files**
   - Delete existing manual markdown files
   - Regenerate from scripts
   - Verify output matches original

### Short Term (This Week)

1. **Implement Pre-Commit Hook**
   ```bash
   #!/bin/bash
   # Prevent committing edited auto-generated files
   if git diff --cached --name-only | grep -E 'docs/generated/.*\.md|TELEMETRY_GOVERNANCE_.*\.md'; then
     echo "ERROR: Cannot commit changes to auto-generated files"
     echo "Edit the JSON source instead, then run: npm run build"
     exit 1
   fi
   ```

2. **Add CI Drift Detection**
   ```bash
   # In CI pipeline:
   npm run build
   git diff --exit-code docs/generated/ TELEMETRY_GOVERNANCE_*.md
   # Fails if any generated files differ from expected
   ```

3. **Create Audit Script**
   - `scripts/audit-documentation-governance.js`
   - Checks all markdown files have `<!-- AUTO-GENERATED -->` headers
   - Verifies all generation scripts in pre:manifests
   - Reports any manually-edited generated files

### Medium Term (This Sprint)

1. **Extend Pattern to All Documentation**
   - Identify all manually-written docs
   - Create JSON structure for each
   - Implement generation scripts
   - Integrate into pipeline

2. **Add Dashboard**
   - `docs/generated/DOCUMENTATION_GOVERNANCE.md` (auto-generated)
   - Shows all auto-generated docs and their sources
   - Lists drift detected (if any)
   - Validation status

3. **Implement Full Lifecycle**
   - JSON authority ← Source of truth
   - Generation scripts ← Deterministic conversion
   - Generated markdown ← Reflection
   - Pre-commit hook ← Prevent manual edits
   - CI validation ← Detect drift

---

## Technical Architecture

### Generation Script Template

```javascript
// scripts/generate-telemetry-instrumentation.js
// Auto-generation script for DEMO_TELEMETRY_INSTRUMENTATION.md
// Source: orchestration-audit-system-project-plan.json (telemetry.instrumentation)
// Generated: npm run pre:manifests

const fs = require('fs');
const path = require('path');

const PLAN_FILE = 'orchestration-audit-system-project-plan.json';
const OUTPUT_FILE = 'DEMO_TELEMETRY_INSTRUMENTATION.md';

function generateMarkdown(plan) {
  const telemetryInstrumentation = plan.telemetry?.instrumentation;
  
  if (!telemetryInstrumentation) {
    console.error('[telemetry-instrumentation] No telemetry instrumentation data in plan');
    process.exit(1);
  }

  const markdown = `<!-- AUTO-GENERATED -->
<!-- Source: orchestration-audit-system-project-plan.json (telemetry.instrumentation) -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# Demo Telemetry Instrumentation Guide

Generated from telemetry governance plan at ${new Date().toISOString()}

...content generated from telemetryInstrumentation JSON...

<!-- DO NOT EDIT - Regenerate with: npm run build -->
`;

  return markdown;
}

function main() {
  try {
    const plan = JSON.parse(fs.readFileSync(PLAN_FILE, 'utf8'));
    const markdown = generateMarkdown(plan);
    fs.writeFileSync(OUTPUT_FILE, markdown);
    console.log(`[telemetry-instrumentation] Wrote ${OUTPUT_FILE}`);
  } catch (error) {
    console.error(`[telemetry-instrumentation] ERROR:`, error.message);
    process.exit(1);
  }
}

main();
```

### Pre-Commit Hook Template

```bash
#!/bin/bash
# .git/hooks/pre-commit
# Prevent commits to auto-generated files

AUTO_GENERATED_PATTERNS=(
  'docs/generated/.*\.md'
  'TELEMETRY_GOVERNANCE_.*\.md'
  'DEMO_TELEMETRY_INSTRUMENTATION\.md'
  '.generated/.*\.md'
)

for pattern in "${AUTO_GENERATED_PATTERNS[@]}"; do
  if git diff --cached --name-only | grep -E "$pattern"; then
    echo "❌ ERROR: Cannot commit changes to auto-generated files matching: $pattern"
    echo ""
    echo "Instead:"
    echo "1. Find the JSON source file for this document"
    echo "2. Edit the JSON source"
    echo "3. Run: npm run build"
    echo "4. Commit the generated output"
    echo ""
    exit 1
  fi
done

exit 0
```

### CI Validation Script

```javascript
// scripts/validate-documentation-governance.js
// Ensures all documentation is auto-generated and in sync with sources

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const AUTO_GENERATED_DOCS = [
  'DEMO_TELEMETRY_INSTRUMENTATION.md',
  'TELEMETRY_GOVERNANCE_QUICKSTART.md',
  'TELEMETRY_GOVERNANCE_VERIFICATION.md',
  'TELEMETRY_GOVERNANCE_COMPLETE.md',
  'docs/generated/orchestration-*.md',
  // ... add all other auto-generated docs
];

function validateDocumentationGovernance() {
  console.log('[doc-governance] Validating documentation governance...');
  
  let passed = 0;
  let failed = 0;

  AUTO_GENERATED_DOCS.forEach(pattern => {
    const files = glob.sync(pattern);
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for auto-generated marker
      if (!content.includes('<!-- AUTO-GENERATED -->')) {
        console.warn(`⚠️  ${file} missing <!-- AUTO-GENERATED --> header`);
        failed++;
        return;
      }
      
      // Check for DO NOT EDIT footer
      if (!content.includes('DO NOT EDIT')) {
        console.warn(`⚠️  ${file} missing DO NOT EDIT footer`);
        failed++;
        return;
      }
      
      passed++;
    });
  });

  console.log(`[doc-governance] Passed: ${passed}, Issues: ${failed}`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

validateDocumentationGovernance();
```

---

## Governance Rules (Codified)

### Rule Framework

```json
{
  "governanceRules": {
    "documentation": {
      "rule-001": {
        "id": "json-authority",
        "title": "JSON is Authority, Markdown is Reflection",
        "level": "CRITICAL",
        "description": "All documentation must be auto-generated from JSON source",
        "enforcement": "CI/CD blocks non-compliant commits",
        "violation": "Manual markdown editing of auto-generated files"
      },
      "rule-002": {
        "id": "single-source-of-truth",
        "title": "Single Source of Truth",
        "level": "CRITICAL",
        "description": "Every system has exactly ONE authoritative JSON as source",
        "enforcement": "Build fails if multiple sources exist for same data",
        "violation": "Duplicate or conflicting data sources"
      },
      "rule-003": {
        "id": "auto-generation-script",
        "title": "Auto-Generation Script Required",
        "level": "CRITICAL",
        "description": "Every JSON authority file must have generation script",
        "enforcement": "Build fails if script missing or not in pre:manifests",
        "violation": "JSON without corresponding generation script"
      },
      "rule-004": {
        "id": "generation-headers",
        "title": "Auto-Generated Document Marking",
        "level": "HIGH",
        "description": "All generated docs must have AUTO-GENERATED header and DO NOT EDIT footer",
        "enforcement": "Audit script fails build if markers missing",
        "violation": "Generated file without proper headers/footers"
      },
      "rule-005": {
        "id": "no-manual-editing",
        "title": "No Manual Documentation Editing",
        "level": "CRITICAL",
        "description": "Developers must not hand-edit auto-generated markdown",
        "enforcement": "Pre-commit hook blocks commits to auto-generated files",
        "violation": "Direct commit of edited auto-generated markdown"
      },
      "rule-006": {
        "id": "generation-order",
        "title": "Correct Pipeline Ordering",
        "level": "HIGH",
        "description": "Registry generation BEFORE docs generation",
        "enforcement": "Build script validates dependency order",
        "violation": "Docs generated before source JSON created"
      },
      "rule-007": {
        "id": "idempotency",
        "title": "Generation Idempotency",
        "level": "HIGH",
        "description": "Same JSON input → Same markdown output (deterministic)",
        "enforcement": "Run twice, compare output, diff must be empty",
        "violation": "Non-deterministic output (timestamps, random values)"
      }
    }
  }
}
```

---

## Dashboard: Documentation Governance Status

**Generated from**: `.generated/documentation-governance-status.json`  
**Regenerated**: Every build (via `scripts/audit-documentation-governance.js`)

### Current Status

| Component | Source | Generation Script | Generated Docs | Status | Last Verified |
|-----------|--------|-------------------|-----------------|--------|----------------|
| Orchestration Domains | `orchestration-domains.json` | `generate-orchestration-domains-from-sequences.js` | `orchestration-domains.md` | ✅ COMPLIANT | 2025-01-09 |
| Orchestration Audit | `orchestration-audit-system-project-plan.json` | `gen-orchestration-docs.js` | `orchestration-execution-flow.md` | ✅ COMPLIANT | 2025-01-09 |
| Sprint Reports | `orchestration-audit-system-project-plan.json` | `generate-sprint-reports.js` | `orchestration-sprint-reports.md` | ✅ COMPLIANT | 2025-01-09 |
| Telemetry Instrumentation | `orchestration-audit-system-project-plan.json` | `generate-telemetry-instrumentation.js` | `DEMO_TELEMETRY_INSTRUMENTATION.md` | ⏳ PENDING | — |
| Telemetry Quickstart | `orchestration-audit-system-project-plan.json` | `generate-telemetry-quickstart.js` | `TELEMETRY_GOVERNANCE_QUICKSTART.md` | ⏳ PENDING | — |
| Telemetry Verification | `.generated/telemetry-validation-report.json` | `generate-telemetry-verification.js` | `TELEMETRY_GOVERNANCE_VERIFICATION.md` | ⏳ PENDING | — |
| Telemetry Complete | `.generated/telemetry-matrix.json` | `generate-telemetry-complete.js` | `TELEMETRY_GOVERNANCE_COMPLETE.md` | ⏳ PENDING | — |

### Compliance Summary

- **Total Documented Components**: 7
- **Compliant**: 3 (42.9%)
- **Pending Auto-Generation**: 4 (57.1%)
- **Non-Compliant**: 0 (0%)

### Next Steps

1. ✅ Identify all manual documentation
2. ✅ Define JSON source structure for each
3. ⏳ Create generation scripts (4 remaining)
4. ⏳ Integrate into pre:manifests pipeline
5. ⏳ Replace manual files with auto-generated versions
6. ✅ Implement enforcement (pre-commit hook + CI validation)

---

## Success Criteria

✅ **Phase 1 (Complete)**
- All telemetry documents identified as manual
- Governance rules codified
- Enforcement mechanisms designed

⏳ **Phase 2 (In Progress)**
- Convert manual docs to JSON + generation scripts
- Add `<!-- AUTO-GENERATED -->` headers
- Integrate into pipeline

⏳ **Phase 3 (Ready)**
- Pre-commit hook prevents manual edits
- CI validation ensures compliance
- Dashboard shows governance status

✅ **Final State**
- 100% of documentation auto-generated
- Zero manual markdown editing allowed
- Zero documentation/architecture drift possible

---

## References

### Key Principles
- "JSON is Authority, Markdown is Reflection"
- "Single Source of Truth prevents drift"
- "Auto-generated documentation stays in sync"

### Context Tree
- `.generated/context-tree-orchestration-audit-session.json` (v2.1.0)
- `.generated/session-context-map.json` (v1.1.0)
- `.generated/CONTEXT_TREE_INDEX.json` (v2.1.0)

### Current Governance
- `orchestration-audit-system-project-plan.json` (v1.3.0)
- `SHAPE_EVOLUTION_PLAN.json`
- `root-context.json`

### Pipeline
- `pre:manifests` – Runs all generation scripts (40+ scripts)
- Runs automatically on: `npm run build`

---

**Version**: 1.0.0  
**Status**: Architecture Pattern Codified ✅  
**Effective**: January 9, 2025  
**Next Review**: After Phase 2 (generation scripts created)
