<!-- AUTO-GENERATED -->
<!-- Source: C:\source\repos\bpm\internal\renderx-plugins-demo\packages\orchestration\json-sequences\orchestration-registry-audit-pipeline.json -->
<!-- Generated: 2025-12-01T02:54:25.381Z -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# Orchestration Registry Audit Pipeline

**Status**: active  
**Version**: 0.1.0  
**Category**: audit-pipeline  
**Beats**: 6 | **Movements**: 3

---

## Overview

Audit the orchestration registry for sequence file completeness, npm script bindings, linkage validity, and governance compliance.

**Purpose**: Ensure every orchestration domain has valid sequence files and executable npm script bindings with zero masking of missing data.

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
| Total Orchestration Domains | 19 |
| Domains with Sequence Files | 19/19 (100.0%) |
| Domains with NPM Scripts | 0/19 (0.0%) |
| Total NPM Scripts | 0 |
| Overall Compliance Score | 0.0% |


---

## Movements (3 Total)


### Movement 1: Registry Discovery

**Description**: Scan orchestration registry and collect domain entries

**Purpose**: Establish audit inputs

**Beats**: [object Object]


### Movement 2: Validation

**Description**: Validate completeness and linkage for registry entries

**Purpose**: Identify missing or invalid bindings

**Beats**: [object Object],[object Object],[object Object]


### Movement 3: Reporting

**Description**: Generate audit documentation and JSON artifacts

**Purpose**: Publish audit results

**Beats**: [object Object]


---

## Audit Requirements

- Every orchestration domain must declare a valid sequenceFile
- Every orchestration domain must declare npmScripts that resolve
- All paths must exist and be readable
- Generated documentation must be auto-marked and domain-scoped

---

## Audit Checkpoints


### Sequence Completeness

**Description**: sequenceFile present and valid  
**Severity**: major


### Script Bindings

**Description**: npmScripts resolve to existing scripts  
**Severity**: major


### Linkage Validity

**Description**: Paths exist and are accessible  
**Severity**: minor


---

## Reporting Artifacts


### Registry Audit Report

- **Type**: markdown
- **Description**: Human-readable audit documentation
- **Location**: docs/generated/orchestration-registry-audit-pipeline/INDEX.md


### Registry Audit JSON

- **Type**: json
- **Description**: Machine-readable audit results
- **Location**: .generated/audit/orchestration-registry-audit.json


---

## Governance Policies

- No masking of missing data
- Publish audit artifacts
- Validate registry integrity

---

## Implementation Details

### Beat Bindings


**Beat 1**: `analysis.discovery#scanOrchestrationFiles`
- Script: `scripts/audit-orchestration-registry.js`


**Beat 2**: `analysis.conformity#validateHandlerMapping`
- Script: `scripts/audit-orchestration-registry.js`


**Beat 3**: `analysis.conformity#validateHandlerMapping`
- Script: `scripts/audit-orchestration-registry.js`


**Beat 4**: `analysis.conformity#calculateConformityScore`
- Script: `scripts/audit-orchestration-registry.js`


**Beat 5**: `analysis.conformity#generateAnalysisReport`
- Script: `scripts/audit-orchestration-registry.js`


**Beat 6**: `analysis.conformity#generateAnalysisReport`
- Script: `scripts/gen-orchestration-registry-audit-docs.js`


---

## Related Orchestrations

- build-pipeline-symphony
- symphonia-conformity-alignment-pipeline
- safe-continuous-delivery-pipeline
- orchestration-core

---

## Events

The audit pipeline emits the following orchestration events:

- `audit.registry.discovery.completed`
- `audit.registry.validation.completed`
- `audit.registry.reporting.completed`

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
