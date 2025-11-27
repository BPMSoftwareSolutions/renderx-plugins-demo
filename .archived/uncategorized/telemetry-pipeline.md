<!-- AUTO-GENERATED DOMAIN DOCUMENT - DO NOT EDIT MANUALLY -->
# Domain: Telemetry Pipeline

ID: 


`telemetry-pipeline`
Type: workflow

Workflow domain ingesting, normalizing, and forwarding orchestration + plugin telemetry to storage and analytics subsystems.

---
## Lineage
1. telemetry-pipeline

## Bounded Context
### In Scope
- Telemetry event ingestion
- Event normalization
- Pipeline buffering
- Dispatch to sinks

### Out of Scope
- Analytics aggregation logic
- User-facing dashboards
- Historical archiving policy

### Interfaces
- orchestration-core
- storage-adapter
- analytics-engine

## Governance Overrides
Inherited Rules:
- JSON-first policy
- 7-layer enforcement

Overrides:
- {"key":"buffer_flush_interval_ms","value":5000}

## Cross-Domain Links
- (depends_on) telemetry-pipeline → orchestration-core (strong)

## Lifecycle
Stage: active
Introduced: 2025-10-10
Last Review: 2025-11-20

## Metrics
### kpis
- End-to-end pipeline latency < 200ms
- Event loss < 0.01%
### leading_indicators
- Queue depth
- Retry backlog
### quality_gates
- Schema version compatibility verified
- No dropped high-priority events

## Ownership
Team: Platform-Telemetry
Primary Contact: telemetry-owner@company.com

---
Integrity
Stored Integrity Checksum: e6a0255eed67f47a0cc0ab0abe28f4518a7b976960b29a04feca67158051d0fe
Computed Lineage Hash: d8382c7bb67c8bb8b2e393b4738304ebc5ae253adf2652f38335dcaedc794eb0