# Traceability Governance Rules

*Generated from: `.generated/global-traceability-map.json`*
*Last Updated: 2025-11-23T21:09:45.437Z*

## Traceability Requirements

All artifacts and transformations must satisfy:

- Every .generated/*.json file must have a 'checksum' field
- Every script must log which JSON it consumes and produces
- Every component must be mapped in this global-traceability-map.json
- Every data transformation must be documented in pipelines section

## Deprecation Handling

- Deprecated packages marked with status: 'deprecated'
- Deprecated packages excluded from downstream systems (dashboard, SLO/SLA)
- Deprecation reason documented for future removal

## Self-Healing Triggers

- Phase 5 (SLA Compliance) monitors for SLO breaches
- On breach detection, automatically invoke packages/self-healing sequences
- Self-healing reads traceability data for precision
- Results feed back to Phase 2 for recalculation
