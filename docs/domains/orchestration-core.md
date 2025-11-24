<!-- AUTO-GENERATED DOMAIN DOCUMENT - DO NOT EDIT MANUALLY -->
# Domain: Orchestration Core

ID: 


`orchestration-core`
Type: orchestration

Central orchestration domain coordinating sequence graphs, plugin lifecycle, and execution routing.

---
## Lineage
1. orchestration-core

## Bounded Context
### In Scope
- Sequence graph resolution
- Plugin execution routing
- Lifecycle state transitions
- Orchestration telemetry hooks

### Out of Scope
- UI rendering
- Business rule authoring
- Data persistence schema

### Interfaces
- telemetry-pipeline
- plugin-host
- sequence-catalog

## Governance Overrides
Inherited Rules:
- JSON-first policy
- 7-layer enforcement

## Lifecycle
Stage: active
Introduced: 2025-09-01
Last Review: 2025-11-15

## Metrics
### kpis
- Avg orchestration latency < 50ms
- Plugin activation success > 99%
### leading_indicators
- Pending sequence graph mutations
- Telemetry pipeline lag
### quality_gates
- All sequence handlers registered
- No orphaned plugin lifecycle events

## Ownership
Team: Platform-Orchestration
Primary Contact: orchestration-lead@company.com

---
Integrity
Stored Integrity Checksum: 23a07136c17044d8dbb8b2997809d8084952a52da179506d74cffc0a7851ebe8
Computed Lineage Hash: d53a62a598822b6fe4e4a584587cddc05064001af3b2a928e8c8580560255cd6