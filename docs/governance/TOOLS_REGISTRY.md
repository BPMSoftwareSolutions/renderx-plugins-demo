<!-- GOVERNANCE: AUTO-GENERATED source=docs/governance/tools-registry.json -->
# Tools Registry
**Version:** 1.0.0  
**Generated:** 2025-12-01T02:08:35.157Z

> DO NOT EDIT. Run `node scripts/generate-tools-registry-docs.js` after updating tools-registry.json.

## Domain Overview
- **auditing** · Audit & Integrity · 9 tools
- **context_remounting** · Context Remounting · 5 tools
- **governance** · Governance & Documentation · 12 tools
- **ographx** · Ographx Graph Authority · 6 tools
- **orchestration** · Orchestration Systems · 7 tools
- **self_healing** · Self-Healing & Pipeline Controls · 6 tools
- **telemetry** · Telemetry Governance · 16 tools

---

### Audit & Integrity (`auditing`)

Hashing, provenance, and compliance tooling for build artifacts and APIs.

**Owning team:** Audit & Integrity Office

| ID | File | Role | Primary Command | Pipeline Stage | Primary Outputs |
| --- | --- | --- | --- | --- | --- |
| `audit-comprehensive` | `scripts/generate-comprehensive-audit.js` | audit-validator | npm run audit:comprehensive | governance | `docs/governance/COMPREHENSIVE_AUDIT.md` |
| `audit-external-interactions` | `scripts/generate-external-interactions-audit.js` | audit-validator | npm run audit:external | governance | `docs/governance/EXTERNAL_INTERACTIONS_AUDIT.md` |
| `artifacts-hash` | `scripts/hash-artifacts.js` | integrity-governance | npm run artifacts:hash | ci | `dist/artifacts.hash.json` |
| `artifacts-validate` | `scripts/validate-artifacts.js` | audit-validator | npm run artifacts:validate | ci | `outputs/audits/artifacts-validation.json` |
| `artifact-signature-verification` | `scripts/verify-artifact-signature.js` | integrity-governance | npm run artifacts:verify:signature | ci | `outputs/audits/signature-verification.json` |
| `public-api-hash` | `scripts/hash-public-api.js` | integrity-governance | npm run public-api:hash | ci | `outputs/audits/public-api.hash.json` |
| `public-api-validate` | `scripts/validate-public-api.js` | audit-validator | npm run validate:public-api | ci | `outputs/audits/public-api-validation.json` |
| `audit-compliance-report` | `scripts/generate-compliance-report.js` | documentation-generator | node scripts/generate-compliance-report.js | pre:manifests | `docs/governance/COMPLIANCE_REPORT.md` |
| `audit-provenance-index` | `scripts/generate-provenance-index.js` | integrity-governance | node scripts/generate-provenance-index.js | pre:manifests | `docs/governance/PROVENANCE_INDEX.md` |

---

### Context Remounting (`context_remounting`)

Maintains CAG algorithms and documentation for context remount sessions.

**Owning team:** Context Assurance Group

| ID | File | Role | Primary Command | Pipeline Stage | Primary Outputs |
| --- | --- | --- | --- | --- | --- |
| `context-session-docs` | `scripts/gen-context-session-docs.cjs` | documentation-generator | npm run generate:context:session | pre:manifests | `docs/context/CONTEXT_SESSION_DOCS.md` |
| `context-cag-engine` | `scripts/cag-context-engine.js` | context-remounting | node scripts/cag-context-engine.js | manual | `outputs/context/cag-engine-report.json` |
| `context-cag-tree-mapper` | `scripts/cag-context-tree-mapper.js` | documentation-generator | node scripts/cag-context-tree-mapper.js | manual | `docs/context/CAG_CONTEXT_TREE.md` |
| `context-integrity-audit` | `scripts/context_integrity.py` | audit-validator | python scripts/context_integrity.py | manual | `outputs/context/context-integrity-report.md` |
| `context-remount-algorithm` | `scripts/context-remount-algorithm.js` | context-remounting | node scripts/context-remount-algorithm.js | manual | `outputs/context/context-remount-plan.json` |

---

### Governance & Documentation (`governance`)

Ensures JSON-first documentation, provenance, and drift-proof governance assets.

**Owning team:** Governance Systems Guild

| ID | File | Role | Primary Command | Pipeline Stage | Primary Outputs |
| --- | --- | --- | --- | --- | --- |
| `governance-doc-drift-audit` | `scripts/generate-document-drift-audit.js` | integrity-governance | npm run audit:documentation:drift | governance | `.generated/documentation-drift-audit.json`<br>`docs/governance/DOCUMENTATION_DRIFT_AUDIT_REPORT.md` |
| `governance-doc-provenance-validator` | `scripts/verify-doc-provenance.js` | audit-validator | npm run docs:verify | governance | `.generated/doc-provenance-report.json` |
| `governance-generated-docs-validator` | `scripts/validate-generated-docs.cjs` | audit-validator | npm run validate:governance:docs | governance | `.generated/governance-docs-validation.json` |
| `governance-root-cleanliness-validator` | `scripts/verify-root-cleanliness.js` | integrity-governance | npm run verify:root-cleanliness | ci | — |
| `governance-docs-batch-generator` | `scripts/generate-governance-docs.cjs` | registry-generator | npm run generate:governance:docs | governance | `docs/governance/SLO_DASHBOARD_TRACEABILITY_PLAN.md`<br>`docs/governance/BDD_PIPELINE_ANALYSIS.md`<br>`docs/governance/BDD_PIPELINE_VISUAL_ARCHITECTURE.md` |
| `governance-tools-registry-generator` | `scripts/generate-tools-registry-docs.js` | registry-generator | npm run generate:governance:registry | governance | `docs/governance/TOOLS_REGISTRY.md` |
| `governance-tools-registry-validator` | `scripts/validate-tools-registry.js` | audit-validator | npm run validate:governance:registry | governance | — |
| `symphonia-auditing-system` | `scripts/audit-symphonia-conformity.cjs` | conformity-auditor | npm run audit:symphonia:conformity | governance | `docs/governance/symphonia-audit-report.json`<br>`docs/governance/SYMPHONIA_CONFORMITY_DASHBOARD.md`<br>`docs/governance/SYMPHONIA_REMEDIATION_PLAN.md` |
| `governance-docs-framework-generator` | `scripts/generate-documentation-governance-framework.js` | documentation-generator | npm run generate:governance:framework | pre:manifests | `docs/governance/DOCUMENTATION_AUTO_GENERATION_GOVERNANCE.md` |
| `governance-docs-index-generator` | `scripts/generate-documentation-governance-index.js` | documentation-generator | npm run generate:governance:index | pre:manifests | `docs/governance/DOCUMENTATION_GOVERNANCE_INDEX.md` |
| `governance-docs-implementation-report` | `scripts/generate-governance-implementation-report.js` | documentation-generator | npm run generate:governance:implementation | pre:manifests | `docs/governance/DOCUMENTATION_GOVERNANCE_IMPLEMENTATION_COMPLETE.md` |
| `governance-pattern-achievement` | `scripts/generate-pattern-recognition-achievement.js` | documentation-generator | npm run generate:governance:pattern | pre:manifests | `docs/governance/PATTERN_RECOGNITION_ACHIEVEMENT.md` |

---

### Ographx Graph Authority (`ographx`)

Maintains model graphs and diagrams backing orchestration reasoning.

**Owning team:** Graph Intelligence Unit

| ID | File | Role | Primary Command | Pipeline Stage | Primary Outputs |
| --- | --- | --- | --- | --- | --- |
| `ographx-regenerate-all` | `packages/ographx/generators/regenerate_all.py` | integrity-governance | npm run regenerate:ographx | pre:manifests | `outputs/ographx/graph.json` |
| `ographx-self-sequences` | `packages/ographx/generators/generate_self_sequences.py` | documentation-generator | npm run regenerate:ographx:sequences | pre:manifests | `outputs/ographx/self-sequences.json` |
| `ographx-test-graph` | `packages/ographx/generators/generate_test_graph.py` | self-healing | npm run regenerate:ographx:test-graph | pretest | `outputs/ographx/test-graph.json` |
| `ographx-orchestration-diagram` | `packages/ographx/generators/generate_orchestration_diagram.py` | documentation-generator | npm run regenerate:ographx:diagrams | pre:manifests | `docs/orchestration/OGRAPHX_ORCHESTRATION_DIAGRAM.md` |
| `ographx-sequence-flow-diagram` | `packages/ographx/generators/generate_sequence_flow.py` | documentation-generator | npm run regenerate:ographx:diagrams | pre:manifests | `docs/orchestration/OGRAPHX_SEQUENCE_FLOW.md` |
| `ographx-analyze-graph` | `packages/ographx/analysis/analyze_self_graph.py` | telemetry-analysis | npm run regenerate:ographx:analysis | ci | `outputs/ographx/graph-analysis.json` |

---

### Orchestration Systems (`orchestration`)

Transforms plugin catalogs into orchestration manifests, docs, and diagrams.

**Owning team:** Orchestration Patterns Group

| ID | File | Role | Primary Command | Pipeline Stage | Primary Outputs |
| --- | --- | --- | --- | --- | --- |
| `bdd-interactive-wizard` | `scripts/interactive-bdd-wizard.js` | specification-enricher | npm run interactive:bdd:wizard | development | `packages/*/bdd/*.feature` |
| `orchestration-domains-from-sequences` | `scripts/generate-orchestration-domains-from-sequences.js` | documentation-generator | node scripts/generate-orchestration-domains-from-sequences.js | pre:manifests | `outputs/orchestration/domains.json` |
| `orchestration-docs-generator` | `scripts/gen-orchestration-docs.js` | documentation-generator | node scripts/gen-orchestration-docs.js | pre:manifests | `docs/orchestration/ORCHESTRATION_OVERVIEW.md` |
| `orchestration-diagram-generator` | `scripts/gen-orchestration-diagram.js` | documentation-generator | node scripts/gen-orchestration-diagram.js | pre:manifests | `docs/orchestration/ORCHESTRATION_DIAGRAM.md` |
| `orchestration-diff-generator` | `scripts/gen-orchestration-diff.js` | documentation-generator | npm run generate:domains:diff | pre:manifests | `docs/orchestration/ORCHESTRATION_DIFF.md` |
| `orchestration-audit` | `scripts/audit-orchestration.js` | audit-validator | node scripts/audit-orchestration.js | governance | `docs/orchestration/ORCHESTRATION_AUDIT_REPORT.md` |
| `bdd-feature-stub-generator` | `scripts/generate-bdd-feature-stubs.js` | specification-generator | npm run generate:bdd:stubs | governance | `packages/*/bdd/*.feature` |

---

### Self-Healing & Pipeline Controls (`self_healing`)

Protects delivery readiness with automated recovery and compliance checks.

**Owning team:** Reliability Engineering

| ID | File | Role | Primary Command | Pipeline Stage | Primary Outputs |
| --- | --- | --- | --- | --- | --- |
| `self-healing-pre-build-check` | `scripts/pre-build-pipeline-check.js` | integrity-governance | npm run verify:no-drift | build | `outputs/self-healing/pre-build-report.json` |
| `self-healing-enforce-pipeline` | `scripts/enforce-delivery-pipeline.js` | integrity-governance | npm run enforce:pipeline | ci | `outputs/self-healing/pipeline-enforcement.json` |
| `self-healing-check-compliance` | `scripts/check-pipeline-compliance.js` | audit-validator | node scripts/check-pipeline-compliance.js | ci | `outputs/self-healing/compliance-report.json` |
| `self-healing-auto-recovery` | `scripts/auto-recovery.js` | self-healing | npm run recover:feature | manual | `outputs/self-healing/recovery-report.json` |
| `self-healing-pipeline-recovery` | `scripts/pipeline-recovery.js` | self-healing | node scripts/pipeline-recovery.js | manual | `outputs/self-healing/pipeline-recovery.md` |
| `self-healing-seven-layer` | `scripts/auto-recovery-7-layer.js` | self-healing | node scripts/auto-recovery-7-layer.js | manual | `outputs/self-healing/7-layer-report.json` |

---

### Telemetry Governance (`telemetry`)

Keeps telemetry instructions, verification, and analysis synchronized with JSON sources.

**Owning team:** Telemetry Strike Team

| ID | File | Role | Primary Command | Pipeline Stage | Primary Outputs |
| --- | --- | --- | --- | --- | --- |
| `telemetry-validation-report` | `scripts/generate-telemetry-validation-report.js` | audit-validator | npm run telemetry:validate | governance | `docs/governance/TELEMETRY_GOVERNANCE_VALIDATION_REPORT.md` |
| `telemetry-instrumentation-generator` | `scripts/generate-telemetry-instrumentation.js` | documentation-generator | npm run generate:telemetry:instrumentation | pre:manifests | `docs/governance/DEMO_TELEMETRY_INSTRUMENTATION.md` |
| `telemetry-quickstart-generator` | `scripts/generate-telemetry-quickstart.js` | documentation-generator | npm run generate:telemetry:quickstart | pre:manifests | `docs/governance/TELEMETRY_GOVERNANCE_QUICKSTART.md` |
| `telemetry-verification-generator` | `scripts/generate-telemetry-verification.js` | documentation-generator | npm run generate:telemetry:verification | pre:manifests | `docs/governance/TELEMETRY_GOVERNANCE_VERIFICATION.md` |
| `telemetry-complete-generator` | `scripts/generate-telemetry-complete.js` | documentation-generator | npm run generate:telemetry:complete | pre:manifests | `docs/governance/TELEMETRY_GOVERNANCE_COMPLETE.md` |
| `telemetry-matrix-generator` | `scripts/generate-telemetry-matrix.js` | telemetry-analysis | node scripts/generate-telemetry-matrix.js | pre:manifests | `docs/governance/TELEMETRY_MATRIX.md` |
| `slo-dashboard-traceability-manifest` | `scripts/generate-slo-traceability-manifest.cjs` | traceability-generator | npm run generate:slo:traceability | integration | `.generated/slo-dashboard/traceability-manifest.json` |
| `slo-evaluator` | `scripts/evaluate-slos.js` | slo-evaluator | npm run evaluate:slos | integration | `packages/self-healing/.generated/slo-breaches.json` |
| `slo-breach-fuser` | `scripts/fuse-slo-breaches.js` | slo-fuser | npm run fuse:slo:breaches | integration | `packages/self-healing/.generated/anomalies.json` |
| `renderx-web-diagnostics` | `scripts/renderx-web-diagnostics.js` | diagnostics-generator | npm run diagnose:renderx-web | integration | — |
| `topic-telemetry-signature-generator` | `scripts/generate-topic-telemetry-signatures.cjs` | telemetry-traceability | npm run generate:topics:telemetry | integration | `.generated/topics/topic-telemetry-signatures.json` |
| `topic-telemetry-signature-validator` | `scripts/validate-topic-telemetry-signatures.cjs` | audit-validator | npm run validate:topics:telemetry | integration | — |
| `log-source-lineage-tracker` | `scripts/trace-logs-to-telemetry.js` | traceability-generator | node scripts/trace-logs-to-telemetry.js | manual | `.generated/log-source-lineage/source-lineage.json`<br>`.generated/log-source-lineage/lineage-guide.md`<br>`.generated/log-source-lineage/component-lineage-breakdown.json`<br>`.generated/log-source-lineage/log-file-index.json`<br>`.generated/log-source-lineage/traceability-summary.md` |
| `renderx-web-demo-analysis` | `scripts/demo-renderx-web-analysis.js` | traceability-demo | node scripts/demo-renderx-web-analysis.js | manual | `.generated/renderx-web-demo/executive-summary.md`<br>`.generated/renderx-web-demo/detailed-analysis.md`<br>`.generated/renderx-web-demo/implementation-roadmap.md`<br>`.generated/renderx-web-demo/event-test-mapping.json`<br>`.generated/renderx-web-demo/lineage-audit.json`<br>`.generated/renderx-web-demo/traceability-index.json`<br>`.generated/renderx-web-demo/verification-report.json` |
| `telemetry-filter-audit` | `scripts/telemetry_filter_audit.py` | telemetry-analysis | python scripts/telemetry_filter_audit.py <log> | manual | `outputs/telemetry/telemetry_filter_audit.md` |
| `telemetry-rag-analyzer` | `scripts/rag-telemetry-analyzer.py` | telemetry-analysis | npm run rag:analyze-telemetry | manual | `outputs/telemetry/rag-telemetry-report.md` |
