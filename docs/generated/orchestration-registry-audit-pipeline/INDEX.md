<!-- AUTO-GENERATED -->
<!-- Source: C:\source\repos\bpm\Internal\renderx-plugins-demo\packages\orchestration\json-sequences\orchestration-registry-audit-pipeline.json -->
<!-- Generated: 2025-11-27T07:40:39.373Z -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# Orchestration Registry Audit Pipeline

**Status**: active  
**Version**: 1.0.0  
**Category**: orchestration  
**Beats**: 12 | **Movements**: 4

---

## Overview

Audit orchestration to validate that all registered orchestration domains have both JSON authority files and npm scripts defined. Produces completeness reports and governance compliance verification.

**Purpose**: Ensure all orchestration domains meet the governance requirement: each domain must have a JSON authority file (sequenceFile) and a set of executable npm scripts (npmScripts).

---

## Quick Start

```bash
npm run audit:registry          # Run full audit
npm run gen:registry:audit:docs # Generate documentation
```

---

## Current Audit Status


| Metric | Value |
|--------|-------|
| Total Orchestration Domains | 13 |
| Domains with Sequence Files | 13/13 (100.0%) |
| Domains with NPM Scripts | 13/13 (100.0%) |
| Total NPM Scripts | 40 |
| Overall Compliance Score | 100.0% |


---

## Movements (4 Total)


### Movement 1: Discovery & Inventory

**Description**: Discover all registered orchestration domains and their current state

**Purpose**: Build complete inventory of orchestration domains with their linkages

**Beats**: 3


### Movement 2: Validation & Completeness Check

**Description**: Validate that all domains have both sequence files and npm scripts

**Purpose**: Identify any missing linkages or incomplete registrations

**Beats**: 3


### Movement 3: Analysis & Metrics

**Description**: Analyze completeness metrics and generate compliance report

**Purpose**: Produce actionable audit findings and statistics

**Beats**: 3


### Movement 4: Reporting & Documentation

**Description**: Generate audit report and governance compliance documentation

**Purpose**: Create traceable audit trail and compliance verification

**Beats**: 3


---

## Audit Requirements

- Each orchestration domain must have a JSON Authority File (sequenceFile)
- Each orchestration domain must have NPM Scripts defined (npmScripts field)
- All sequence file paths must point to existing JSON files
- All npm scripts must be defined in package.json
- Registry entries must conform to MusicalSequence interface

---

## Audit Checkpoints


### Sequence File Validation

**Description**: Verify all sequenceFile fields point to existing JSON files  
**Severity**: critical


### NPM Scripts Binding

**Description**: Verify all npmScripts are defined in package.json  
**Severity**: critical


### Registry Structure

**Description**: Verify registry entries conform to MusicalSequence interface  
**Severity**: major


### Traceability

**Description**: Verify clear lineage from domain → sequence → scripts  
**Severity**: major


---

## Reporting Artifacts


### Completeness Summary Table

- **Type**: markdown-table
- **Description**: Table showing each domain's sequence file and npm scripts status
- **Location**: .generated/audit/registry-completeness-summary.md


### Domain Details

- **Type**: markdown-list
- **Description**: Detailed information for each orchestration domain
- **Location**: .generated/audit/registry-domain-details.md


### Audit Report

- **Type**: markdown
- **Description**: Comprehensive audit report with findings and compliance status
- **Location**: .generated/audit/registry-audit-report.md


### Compliance Metrics

- **Type**: json
- **Description**: Structured audit metrics and compliance scores
- **Location**: .generated/audit/registry-audit-metrics.json


### Domain Details JSON

- **Type**: json
- **Description**: Structured data for all audited domains
- **Location**: .generated/audit/registry-audit-domains.json


---

## Governance Policies

- All audit reports must be auto-generated from this JSON authority
- Audit documentation must be in docs/generated/orchestration-registry-audit-pipeline/
- Registry audit must run before pre:manifests pipeline
- Audit must validate registry integrity and governance compliance
- All audit outputs must be marked as AUTO-GENERATED

---

## Implementation Details

### Beat Bindings


**Beat 1**: `loadOrchestrationRegistry`
- Script: `scripts/audit-orchestration-registry-load.js`


**Beat 2**: `enumerateOrchestratingDomains`
- Script: `scripts/audit-orchestration-registry-enumerate.js`


**Beat 3**: `collectDomainInventory`
- Script: `scripts/audit-orchestration-registry-inventory.js`


**Beat 4**: `validateSequenceFiles`
- Script: `scripts/audit-orchestration-registry-sequences.js`


**Beat 5**: `validateNpmScripts`
- Script: `scripts/audit-orchestration-registry-npm.js`


**Beat 6**: `checkCompleteness`
- Script: `scripts/audit-orchestration-registry-completeness.js`


**Beat 7**: `analyzeMetrics`
- Script: `scripts/audit-orchestration-registry-metrics.js`


**Beat 8**: `calculateCompliance`
- Script: `scripts/audit-orchestration-registry-compliance.js`


**Beat 9**: `generateSummary`
- Script: `scripts/audit-orchestration-registry-summary.js`


**Beat 10**: `generateDetailsReport`
- Script: `scripts/audit-orchestration-registry-details.js`


**Beat 11**: `generateMainReport`
- Script: `scripts/audit-orchestration-registry-report.js`


**Beat 12**: `generateAuditDocumentation`
- Script: `scripts/gen-orchestration-registry-audit-docs.js`


---

## Related Orchestrations

- build-pipeline-symphony
- symphonia-conformity-alignment-pipeline
- architecture-governance-enforcement-symphony

---

## Events

The audit pipeline emits the following orchestration events:

- `audit:registry:started`
- `audit:registry:domain-discovered`
- `audit:registry:sequence-validated`
- `audit:registry:scripts-validated`
- `audit:registry:completeness-checked`
- `audit:registry:metrics-analyzed`
- `audit:registry:compliance-calculated`
- `audit:registry:report-generated`
- `audit:registry:documentation-generated`
- `audit:registry:completed`

---

## Integration

### Run Audit

```bash
# Full audit with completeness check
npm run audit:registry

# Generate audit documentation
npm run gen:registry:audit:docs
```

### Registry Query

```bash
# List all orchestration domains
npm run query:domains -- --list orchestration

# Show specific domain
npm run query:domains -- --show build-pipeline-symphony

# Get registry statistics
npm run query:domains -- --stats
```

---

## Audit Governance Compliance

✅ JSON Authority Only (no manual documentation)  
✅ Auto-Generated Documentation (marked properly)  
✅ Domain-Scoped Docs (docs/generated/orchestration-registry-audit-pipeline/)  
✅ Registry Entry (linked in orchestration-domains.json)  
✅ Executable Bindings (npm scripts in package.json)  
✅ Type Safe (conforms to MusicalSequence interface)  

---

## Metrics Framework

### Completeness Metrics

- **Sequence File Completeness**: % of domains with valid sequenceFile
- **NPM Scripts Completeness**: % of domains with npmScripts defined
- **Overall Compliance**: Min(sequence %, scripts %) - must pass both requirements

### Governance Metrics

- **Registry Integrity**: No duplicate domain IDs
- **Linkage Validity**: All sequenceFile paths exist
- **Script Bindings**: All npmScripts reference existing scripts
- **Interface Conformance**: All entries conform to MusicalSequence

---

## Data Schema

Audit report output follows this JSON schema:

```json
{
  "timestamp": "ISO-8601",
  "auditResult": {
    "status": "pass | fail",
    "complianceScore": 0-100,
    "totalDomains": number,
    "completeness": {
      "sequenceFiles": { "count": number, "percent": number },
      "npmScripts": { "count": number, "percent": number }
    },
    "findings": [
      {
        "domain": "domain-id",
        "type": "missing-sequence | missing-scripts | invalid-path",
        "severity": "critical | major | minor",
        "message": "description"
      }
    ]
  }
}
```

---

<!-- DO NOT EDIT - Regenerate with: npm run build -->
