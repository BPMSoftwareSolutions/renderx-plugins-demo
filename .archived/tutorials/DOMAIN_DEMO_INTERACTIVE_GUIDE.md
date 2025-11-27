# 🧪 DOMAIN AUTHORITY DEMO INTERACTIVE GUIDE

**Purpose:** Unified, reproducible, zero-drift demonstration of domain authority governance (JSON-first, lineage, checksum integrity, drift verification, registry history).
**Date:** 2025-11-24
**Pipeline Type:** Domain Demo

---
## 🚀 Quick Start (30 Seconds)
```bash
node scripts/demo-orchestration-domain-workflow.cjs
```
**Outputs:**
- Per-domain markdown reflections (docs/domains/*.md)
- Trace artifacts (.generated/domains/*-trace.json)
- Consolidated lineage (.generated/domains/domain-demo-lineage.json)
- Telemetry summary (.generated/domains/orchestration-core-demo-telemetry.json)
- Registry run metadata appended (DOMAIN_REGISTRY.json > meta.demo_runs[])
- Demo results markdown (docs/domains/orchestration-core-demo-results.md)

---
## 🔄 Demo Phases & What They Prove
| Phase | Script Action | Proof of Standard |
|-------|---------------|-------------------|
| Enrich | lineage_hash + integrity_checksum | Deterministic provenance added |
| Validate | schema + hash + checksum | Structural + integrity correctness |
| Generate | domain docs + trace | JSON-first reflection guarantee |
| Verify Drift | recomputed checksum parity | No silent divergence |
| Append Registry | meta.demo_runs[] entry | Historical audit trail |
| Consolidate Lineage | single JSON of all domains | Cross-domain snapshot integrity |

---
## 📁 Key Artifacts
| Artifact | Path | Description |
|----------|------|-------------|
| Reflection Markdown | docs/domains/<domain>.md | Human-readable domain summary |
| Trace JSON | .generated/domains/<domain>-trace.json | Lineage + integrity snapshot |
| Demo Telemetry | .generated/domains/orchestration-core-demo-telemetry.json | Run metrics (single domain example) |
| Consolidated Lineage | .generated/domains/domain-demo-lineage.json | Multi-domain run dataset |
| Demo Results Markdown | docs/domains/orchestration-core-demo-results.md | Integrity + drift report |
| Registry Run History | DOMAIN_REGISTRY.json (meta.demo_runs[]) | Accumulated executions |

---
## ✅ Drift Verification Logic
Checksum recomputation excludes the `integrity_checksum` field itself:
```text
stored_checksum == sha256(deterministicSerialize(domainMinusIntegrityChecksum))
```
If equal → Drift Verified ✅; else ❌ (investigate manual edits or ordering changes).

---
## 🔍 Inspecting a Run
### 1. View Consolidated Lineage
```bash
cat .generated/domains/domain-demo-lineage.json | jq '.domains[0]'
```
### 2. Check Registry History
```bash
cat DOMAIN_REGISTRY.json | jq '.meta.demo_runs[-1]'
```
### 3. Confirm Drift Verification
```bash
cat docs/domains/orchestration-core-demo-results.md | grep 'Drift Verified'
```
### 4. Inspect a Trace Artifact
```bash
cat .generated/domains/orchestration-core-trace.json | jq '.lineage'
```

---
## 🧪 Re-Running Safely
Re-run demo after any domain JSON change to recompute provenance:
```bash
node scripts/enrich-domain-authorities.cjs
node scripts/validate-domain-authorities.cjs
node scripts/demo-orchestration-domain-workflow.cjs
```
Each run appends to `meta.demo_runs[]` enabling longitudinal integrity tracking.

---
## 📊 Extending the Demo
| Enhancement | Benefit |
|-------------|---------|
| Link Graph Export | Visual cross-domain dependency auditing |
| Cycle Detection | Prevent invalid lineage loops |
| Volatility Trend | Long-term stability analysis |
| Registry Run Diff | Highlights changes between runs |
| Domain Risk Score | Aggregates volatility + link criticality |

---
## 🧬 Canonical Algorithms
| Item | Algorithm |
|------|-----------|
| Lineage Hash | `(root_context_ref||'') + '|' + context_lineage.join('>') + '|' + domain_id` (sha256) |
| Integrity Checksum | sha256(deterministicSerialize(domain minus integrity_checksum)) |
| Deterministic Serialize | Sort object keys + preserve array order |

---
## 🛡 Guardrails
- Never manually edit generated markdown.
- Always enrich before validate if provenance fields might be stale.
- Registry run entries are append-only (immutable historical audit).
- Drift failures must block downstream reporting until resolved.

---
## 🤖 Automation Hooks (Recommended)
| Hook | Action |
|------|--------|
| pre-commit | Run enrich + validate (fail fast) |
| CI build | Validate + generate + drift verify |
| nightly job | Append run metadata + volatility trend calculation |

---
## 🧾 Sample meta.demo_runs[] Entry
```json
{
  "pipeline_id": "domain-demo-1732470000000-abc123",
  "run_at": "2025-11-24T22:22:37.047Z",
  "domains": [
    {
      "domain_id": "orchestration-core",
      "lineage_hash": "d53a62a5...",
      "integrity_checksum": "cc678547...",
      "drift_verified": true
    }
  ]
}
```

---
## ❓ Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| Drift Verified ❌ | Manual JSON edit post-enrichment | Re-run enrich/validate |
| Missing demo run in registry | Registry absent or write blocked | Ensure write permissions; rerun script |
| Trace file missing | Generation step skipped | Re-run generator or full demo |
| Duplicate pipeline_id | Extremely unlikely (timestamp + random) | Re-run; uniqueness not critical |

---
## 🏁 Summary
This guide standardizes domain authority demo flow with governance system conventions—ensuring deterministic provenance, auditability, drift control, and historical lineage aggregation.

Run → Verify → Audit → Extend.

Enjoy exploring the domain integrity pipeline.
