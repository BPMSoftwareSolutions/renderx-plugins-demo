<!-- AUTO-GENERATED DOMAIN DOCUMENT - DO NOT EDIT MANUALLY -->
# Domain: SLO Dashboard Capability Domain

ID: 


`slo-dashboard`
Type: capability

Real-time visualization and management of Service Level Objectives, Indicators, and Agreements.

---
## Lineage
1. slo-dashboard

## Bounded Context
### In Scope
- SLO/SLI/SLA visualization
- Breach threshold display
- Dashboard project planning
- Demo scenario generation

### Out of Scope
- Breach detection logic (handled by self-healing)
- External alerting integrations

### Interfaces
- self-healing
- telemetry-pipeline
- orchestration-core

## Governance Overrides
Inherited Rules:
- JSON-first authority
- Auto-generated markdown reflections

## Cross-Domain Links
- (depends_on) slo-dashboard → self-healing (strong)
- (extends) slo-dashboard → orchestration-core (moderate)

## Lifecycle
Stage: active
Introduced: 2025-10-15
Last Review: 2025-11-24

## Metrics
### kpis
- dashboard_load_time_p95
- slo_data_freshness
- visualization_accuracy
### leading_indicators
- api_call_latency
- data_sync_frequency
### quality_gates
- all_bdd_specs_passing
- no_stale_slo_data

## Ownership
Team: Platform Observability
Primary Contact: observability@example.com

---
Integrity
Stored Integrity Checksum: 7850ac2c0089fd27f115a83348d90e412aaa39d59c442d4f5758b3dd2c82a0d5
Computed Lineage Hash: f92e9bac029b314656c4dd1b6608eef9d0cb9659cc2bbd5c6f79a2386614bbd9