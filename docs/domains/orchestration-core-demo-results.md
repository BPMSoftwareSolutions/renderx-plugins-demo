<!-- AUTO-GENERATED DEMO RESULTS: orchestration-core -->
# Orchestration Core Demo Run

Pipeline ID: domain-demo-1764023194127-zzfnzp
Run Timestamp: 2025-11-24T22:26:36.316Z
Domain ID: `orchestration-core`

## Integrity & Drift Verification
Stored Lineage Hash: `d53a62a598822b6fe4e4a584587cddc05064001af3b2a928e8c8580560255cd6`
Stored Integrity Checksum: `cc6785471d80179e9e78637bde4c56dc7437b1715c3fd42231c3ea425461d20d`
Recomputed Checksum (excludes self-field): `cc6785471d80179e9e78637bde4c56dc7437b1715c3fd42231c3ea425461d20d`
Deterministic Snapshot Hash (current JSON): `ff0da7f2ce063b4d48d0120304f163676c574d8d3f1eb70ea826ea0fd97ee7b6`
Drift Verified: ✅

## Metrics & Counts
- Lifecycle Stage: active
- Cross-Domain Links: 0
- KPIs: 2
- Quality Gates: 2
- Validation Rules: 2

## Ownership
Team: Platform-Orchestration

## Artifacts
Source JSON:
- docs/domains/orchestration-core.json
Generated Markdown:
- docs/domains/orchestration-core.md
Trace File: .generated\domains\orchestration-core-trace.json

## Workflow Steps Executed
- enrich-domain-authorities
- validate-domain-authorities
- generate-domain-doc (each domain)
- verify-drift (checksum parity)
- append-registry-run-metadata
- consolidate-domain-lineage

## Next Enhancement Suggestions
- Add link graph export
- Add cycle detection to validation
- Emit per-domain volatility trend
- Integrate run metadata into registry meta