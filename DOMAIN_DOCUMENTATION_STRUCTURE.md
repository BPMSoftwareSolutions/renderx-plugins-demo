<!-- AUTO-GENERATED -->
<!-- Source: orchestration-audit-system-project-plan.json (documentationStructure) -->
<!-- Generated: 2025-11-24T20:07:21.229Z -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# Domain Documentation Structure

**Status**: Governance Architecture Complete  
**Principle**: Domain-Aligned Documentation With Drift Governance  
**Version**: 1.0.0

---

## Overview

Each domain has its own documentation structure with explicit governance on drift-proof (auto-generated) vs drift-capable (manual) documents

This system ensures that:
- ✅ Every domain has dedicated documentation spaces
- ✅ Drift-proof (auto-generated) docs are separated from drift-capable (manual) docs
- ✅ Orphaned documents are identified for migration or archival
- ✅ Documentation governance scales across domains

---

## Governance Rules

### Domain-Scoped Documentation (CRITICAL)

Each domainSequence has dedicated documentation folders for generated and manual docs

**Enforcement**: Build fails if docs found outside designated domain paths

### Drift-Proof Vs Drift-Capable Classification (CRITICAL)

Every document classified as auto-generated (drift-proof) or manual (drift-capable)

**Enforcement**: Audit detects unclassified documents; CI reports drift risk

### No Root-Level Domain Documentation (HIGH)

No domain-specific docs in repository root; all docs live in docs/generated/{domain-id}/ or docs/manual/{domain-id}/

**Enforcement**: Root folder contains only global governance and indexing docs

### Domain Documentation Index Required (CRITICAL)

Each domain generates docs/{generated|manual}/{domain-id}/INDEX.md listing all domain docs and drift status

**Enforcement**: Build fails if domain index missing or out-of-sync

### Orphaned Document Detection (HIGH)

Documents not referenced by any domain or generation script flagged as orphaned

**Enforcement**: Audit reports orphaned docs; recommendation to archive or migrate

---

## Domain Documentation Mapping

Each domain has a dedicated documentation structure:

### Orchestration Audit System (`orchestration-audit-system`)

**Description**: Core orchestration domain and audit capabilities

**Paths**:
- Generated Docs: `docs/generated/orchestration-audit-system/`
- Manual Docs: `docs/manual/orchestration-audit-system/`

**Auto-Generated Documents** (Drift-Proof):
- `INDEX.md` (Source: Generated from domainDocumentationMapping)  
  Purpose: Domain documentation index and navigation
- `ORCHESTRATION_AUDIT_DOMAIN_OVERVIEW.md` (Source: orchestration-audit-system-project-plan.json (domainSequences[0]))  
  Purpose: Domain overview, capabilities, and architecture
- `ORCHESTRATION_AUDIT_BDD_COVERAGE.md` (Source: packages/orchestration/bdd/orchestration-audit-system.feature)  
  Purpose: BDD spec coverage and compliance

**Manual Documents** (Drift-Capable):
- `ORCHESTRATION_AUDIT_ARCHITECTURE.md`
- `ORCHESTRATION_AUDIT_IMPLEMENTATION_GUIDE.md`

**Dependencies**: self_sequences, graphing-orchestration

### Orchestration Audit Session (`orchestration-audit-session`)

**Description**: Session management and audit session orchestration

**Paths**:
- Generated Docs: `docs/generated/orchestration-audit-session/`
- Manual Docs: `docs/manual/orchestration-audit-session/`

**Auto-Generated Documents** (Drift-Proof):
- `INDEX.md` (Source: Generated from domainDocumentationMapping)  
  Purpose: Domain documentation index
- `SESSION_DOMAIN_OVERVIEW.md` (Source: orchestration-audit-system-project-plan.json (domainSequences[1]))  
  Purpose: Session domain overview

**Dependencies**: orchestration-audit-system

### CAG Agent Workflow (`cag-agent-workflow`)

**Description**: Context-aware governance and agent workflows

**Paths**:
- Generated Docs: `docs/generated/cag-agent-workflow/`
- Manual Docs: `docs/manual/cag-agent-workflow/`

**Auto-Generated Documents** (Drift-Proof):
- `INDEX.md` (Source: Generated from domainDocumentationMapping)  
  Purpose: CAG domain documentation index
- `CAG_AGENT_WORKFLOW_OVERVIEW.md` (Source: orchestration-audit-system-project-plan.json (domainSequences[2]))  
  Purpose: CAG workflow architecture

### Graphing Orchestration (`graphing-orchestration`)

**Description**: Graph-based orchestration and visualization

**Paths**:
- Generated Docs: `docs/generated/graphing-orchestration/`
- Manual Docs: `docs/manual/graphing-orchestration/`

**Auto-Generated Documents** (Drift-Proof):
- `INDEX.md` (Source: Generated from domainDocumentationMapping)  
  Purpose: Graphing domain documentation index

**Dependencies**: orchestration-audit-system

### Self Sequences (`self_sequences`)

**Description**: Self-referential sequence generation and orchestration

**Paths**:
- Generated Docs: `docs/generated/self_sequences/`
- Manual Docs: `docs/manual/self_sequences/`

**Auto-Generated Documents** (Drift-Proof):
- `INDEX.md` (Source: Generated from domainDocumentationMapping)  
  Purpose: Self Sequences documentation index

**Dependencies**: orchestration-audit-system

---

## Folder Structure

### Global Documentation (Root & .generated)

```
root/
├─ DOCUMENTATION_AUTO_GENERATION_GOVERNANCE.md       [AUTO-GENERATED]
├─ PATTERN_RECOGNITION_ACHIEVEMENT.md                [AUTO-GENERATED]
├─ DOCUMENTATION_GOVERNANCE_IMPLEMENTATION_COMPLETE.md [AUTO-GENERATED]
├─ DOCUMENTATION_GOVERNANCE_INDEX.md                 [AUTO-GENERATED]
├─ DOMAIN_DOCUMENTATION_STRUCTURE.md                 [AUTO-GENERATED]
├─ DOCUMENTATION_DRIFT_AUDIT_REPORT.md               [AUTO-GENERATED]
├─ README.md                                         [AUTO-GENERATED or MANUAL]
└─ .generated/
   ├─ document-governance-manifest.json              [Generated by audit]
   ├─ documentation-drift-audit.json                 [Generated by audit]
   ├─ domain-document-registry.json                  [Generated registry]
   └─ orphaned-documents-report.json                 [Generated by audit]
```

### Domain Documentation Structure

```
docs/
├─ generated/
│  ├─ orchestration-audit-system/
│  │  ├─ INDEX.md                                   [AUTO-GENERATED]
│  │  ├─ ORCHESTRATION_AUDIT_DOMAIN_OVERVIEW.md     [AUTO-GENERATED]
│  │  └─ ORCHESTRATION_AUDIT_BDD_COVERAGE.md        [AUTO-GENERATED]
│  ├─ orchestration-audit-session/
│  │  ├─ INDEX.md                                   [AUTO-GENERATED]
│  │  └─ SESSION_DOMAIN_OVERVIEW.md                 [AUTO-GENERATED]
│  ├─ cag-agent-workflow/
│  │  ├─ INDEX.md                                   [AUTO-GENERATED]
│  │  └─ CAG_AGENT_WORKFLOW_OVERVIEW.md             [AUTO-GENERATED]
│  ├─ graphing-orchestration/
│  │  └─ INDEX.md                                   [AUTO-GENERATED]
│  └─ self_sequences/
│     └─ INDEX.md                                   [AUTO-GENERATED]
└─ manual/
   ├─ orchestration-audit-system/
   │  ├─ ORCHESTRATION_AUDIT_ARCHITECTURE.md        [MANUALLY-MAINTAINED]
   │  └─ ORCHESTRATION_AUDIT_IMPLEMENTATION_GUIDE.md [MANUALLY-MAINTAINED]
   ├─ orchestration-audit-session/
   ├─ cag-agent-workflow/
   ├─ graphing-orchestration/
   └─ self_sequences/
```

---

## Drift Governance Model

### Drift-Proof Documents (Auto-Generated)

| Characteristic | Details |
|---|---|
| **Regeneration** | Every `npm run build` |
| **Location** | `docs/generated/{domain-id}/` |
| **Editing** | Prohibited - Pre-commit hooks block edits |
| **Marking** | `<!-- AUTO-GENERATED -->` header |
| **Risk Level** | **ZERO** - Impossible to drift |
| **Update Process** | Edit JSON source → Run build → Markdown regenerates |

**Examples**:
- Domain overview documents
- BDD coverage reports
- Auto-generated indexes
- Governance framework docs

### Drift-Capable Documents (Manually-Maintained)

| Characteristic | Details |
|---|---|
| **Regeneration** | Manual updates by developers |
| **Location** | `docs/manual/{domain-id}/` |
| **Editing** | Allowed with governance |
| **Marking** | `<!-- MANUALLY-MAINTAINED - DRIFT-CAPABLE -->` header |
| **Risk Level** | **HIGH** - Requires active maintenance |
| **Governance** | Must include creation date, maintainer, last review date |

**Examples**:
- Architecture decision records
- Implementation guides
- Troubleshooting guides
- Tutorial documents

### Orphaned Documents (Unknown Classification)

| Characteristic | Details |
|---|---|
| **Status** | Not classified, not referenced |
| **Current Count** | **960+ documents in repository** ❌ |
| **Issue** | No domain affiliation, drift status unknown |
| **Action** | Audit identifies; manual classification required |
| **Options** | Archive, migrate, convert to auto-generated, or delete |

---

## Classification Status

### Current State ⚠️

- **Auto-Generated (Drift-Proof)**: 8 documents ✅
  - 4 Governance framework documents
  - 4 Telemetry governance documents

- **Manually-Maintained (Drift-Capable)**: ~0 documents (need to be created)
  - Domain architecture documents
  - Implementation guides
  - Troubleshooting guides

- **Orphaned (Unknown/Stale)**: ~960 documents ⚠️
  - Root-level unclassified documents
  - Legacy documentation
  - Candidates for migration or archival

### Target State ✅

- **Auto-Generated**: All domain overview, index, and reference docs
- **Manually-Maintained**: Explicitly marked with governance headers
- **Orphaned**: 0 - All documents classified or archived

---

## Documentation Audit

The system automatically audits all markdown files and generates:

1. **document-governance-manifest.json** - Full registry with metadata
2. **documentation-drift-audit.json** - Drift risk summary
3. **orphaned-documents-report.json** - Unclassified documents
4. **DOCUMENTATION_DRIFT_AUDIT_REPORT.md** - Human-readable report

Run audit:
```bash
npm run audit:documentation:drift
```

---

## Migration Path

### Phase 1: Classification (Current)
✅ Identify all documents  
✅ Classify as drift-proof, drift-capable, or orphaned  
✅ Generate audit reports  

### Phase 2: Structure Creation
⏳ Create docs/generated/{domain-id}/ folders  
⏳ Create docs/manual/{domain-id}/ folders  
⏳ Create domain indexes  

### Phase 3: Document Migration
⏳ Move domain-aligned docs to docs/manual/{domain-id}/  
⏳ Archive orphaned docs  
⏳ Convert eligible docs to auto-generated  

### Phase 4: Enforcement
⏳ Add coherence validator to CI/CD  
⏳ Fail build on document mislocations  
⏳ Enforce drift governance rules  

---

## Key Principles

1. **Domain Alignment** - Documents live with their domain
2. **Drift Prevention** - Auto-generated docs guaranteed current
3. **Explicit Governance** - Drift-capable docs marked and monitored
4. **Scalability** - Extends to unlimited domains
5. **Auditability** - All documents classified and tracked

---

## Commands

### Audit Documentation
```bash
npm run audit:documentation:drift
```

### Generate Domain Indexes
```bash
npm run generate:domain:documentation
```

### Validate Document Coherence
```bash
npm run validate:document:coherence
```

### Full Build (includes all document generation)
```bash
npm run build
```

---

**This document is auto-generated from governance rules defined in orchestration-audit-system-project-plan.json**

<!-- DO NOT EDIT - Regenerate with: npm run build -->
