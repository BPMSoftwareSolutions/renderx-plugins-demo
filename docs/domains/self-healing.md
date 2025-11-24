<!-- AUTO-GENERATED DOMAIN DOCUMENT - DO NOT EDIT MANUALLY -->
# Domain: Self-Healing Capability Domain

ID: 


`self-healing`
Type: capability

Automated anomaly detection, SLO breach identification, and recovery orchestration for system resilience.

---
## Lineage
1. self-healing

## Bounded Context
### In Scope
- Anomaly detection handlers
- SLO breach detection
- Recovery action orchestration
- Agent handler implementation workflow

### Out of Scope
- Manual incident response
- External monitoring integration

### Interfaces
- slo-dashboard
- orchestration-core
- telemetry-pipeline

## Governance Overrides
Inherited Rules:
- JSON-first authority
- Auto-generated markdown reflections

## Cross-Domain Links
- (provides) self-healing → slo-dashboard (strong)
- (extends) self-healing → orchestration-core (strong)

## Lifecycle
Stage: active
Introduced: 2025-10-01
Last Review: 2025-11-24

## Metrics
### kpis
- mean_time_to_recovery
- breach_detection_latency
- auto_recovery_success_rate
### leading_indicators
- anomaly_alert_volume
- handler_execution_count
### quality_gates
- all_bdd_handlers_passing
- no_unhandled_breaches

## Ownership
Team: Platform Reliability
Primary Contact: platform-reliability@example.com

---
Integrity
Stored Integrity Checksum: dcdfd92f0d8e1c4d4d0f450f7b645320064b72ae642d5591ad00ab40651d3f4a
Computed Lineage Hash: b72935b7ada7d1a9bb3d58914de28619ea3a40987b7d699be2b5e0b5c9f658a9