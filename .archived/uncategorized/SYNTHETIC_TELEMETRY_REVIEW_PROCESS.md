## Synthetic / Artificial Telemetry Review & Approval Process

Goal: Provide a controlled, transparent, and reversible pathway for introducing ANY synthetic or manipulated telemetry used strictly for demos, testing, or scenario exploration without contaminating production data quality or misleading stakeholders.

Scope Covers Three Techniques:
1. Baseline Manipulation (adjusting baseline metrics to force anomalies).
2. Synthetic Anomaly Log Injection (adding fabricated .log files with crafted patterns).
3. Demo Mode Direct In-Memory Anomaly Injection (bypassing raw telemetry).

### Core Principles
- Provenance: Every synthetic artifact must be clearly labeled, isolated, and auditable.
- Non-Persistence: Synthetic data must never overwrite or live in the same directory as authoritative production telemetry.
- Opt-In: Synthetic paths only processed when explicit environment flags are set.
- Reversibility: One command to purge all synthetic artifacts.
- Non-Interference: Detection / diagnosis logic MUST NOT treat synthetic data as baseline input for future slices (e.g. SLO learning) unless explicitly flagged for simulation.

### Directory & Filename Conventions
| Type | Allowed Path | Required Name Pattern | Forbidden Locations |
| ---- | ------------ | --------------------- | ------------------- |
| Synthetic Logs | `.logs/demo/` | `demo-synthetic-*.log` | `.logs/` root (unless sample) |
| Sample Demo Logs (auto-generated) | `.logs/` | `self-healing-demo-sample.log` | Any path under `dist/` |
| Baseline Overrides | `.logs/baseline-demo/` | `baseline-override-*.json` | `.generated/` baseline metrics file |

### Environment Flags
| Flag | Purpose | Default |
| ---- | ------- | ------- |
| `ALLOW_DEMO_SYNTHETIC=1` | Permit reading synthetic logs (demo only). | unset (disallowed) |
| `STRICT_SYNTHETIC_BLOCK=1` | Fail build if synthetic artifacts detected outside allowed paths. | unset |
| `SYNTHETIC_IN_MEMORY=1` | Enable in-memory anomaly injection (demo mode). | unset |

### Review Workflow (Pull Request Checklist)
1. Proposal: Author adds section in PR description identifying technique (baseline manipulation, synthetic logs, in-memory injection) + rationale + expected duration.
2. Isolation Verification: Confirm artifacts confined to allowed paths and names.
3. Flag Gating: Ensure script usage instructs running with `ALLOW_DEMO_SYNTHETIC=1` locally; CI stays clean.
4. Drift Scan: Run `node scripts/verify-synthetic-telemetry.js` (outputs PASS/WARN/FAIL). Attach output to PR.
5. Stakeholder Sign-Off: Product Owner + Reliability Engineer sign off in PR comments.
6. Merge & Demo: Use synthetic data only for scheduled demo window.
7. Purge: Execute `npm run purge:synthetic` (to be added) or manual deletion; re-run verification script (PASS expected).

### Risk Classification & Controls
| Risk | Technique | Control | Escalation Trigger |
| ---- | --------- | ------- | ------------------ |
| Data Falsehood | In-memory injection | Mandatory provenance flag & summary labeling | Missing demo label in output |
| Contamination | Baseline manipulation | Prohibit writing modified baseline to canonical baseline file | Modified canonical baseline hash mismatch |
| Leakage | Synthetic logs outside demo path | STRICT_SYNTHETIC_BLOCK fails pretest | Unexpected file discovery |

### Script-Based Enforcement
`scripts/verify-synthetic-telemetry.js` performs:
1. Scan `.logs/` recursively.
2. Identify synthetic pattern matches.
3. Validate path compliance.
4. In strict mode (`STRICT_SYNTHETIC_BLOCK=1`) fail on violations; otherwise warn.
5. Respect `ALLOW_DEMO_SYNTHETIC` for allowed demo usage.

### Andon Triggers
| Trigger | Action |
| ------- | ------ |
| Synthetic artifact detected in forbidden directory | Immediate failure (strict) or yellow warning (non-strict). |
| Missing provenance flag but synthetic artifacts present | Abort demo; require re-run with flag. |
| Purge command leaves residual synthetic artifacts | Block releasing / final recording until clean. |

### Acceptance Criteria for Each Technique
Baseline Manipulation:
- Modified values applied only to in-memory struct (not persisted).
- Diff log printed showing original vs modified ranges.
Synthetic Anomaly Logs:
- Each file begins with banner comment `# SYNTHETIC DEMO ARTIFACT` or JSON metadata block.
- File count threshold configurable (default <= 5 synthetic). Exceeding => warning.
In-Memory Injection:
- Injection summary enumerates anomaly IDs + reasons + synthetic flag.
- Disabled automatically if production mode flag (`PRODUCTION=1`) detected.

### Purge Procedure
Manual: Delete `.logs/demo/*` and `.logs/self-healing-demo-sample.log` then run `node scripts/verify-synthetic-telemetry.js` => PASS.
Future Task: Implement `npm run purge:synthetic` command.

### Backlog Enhancements
- Automatic purge task + CI safeguard.
- Synthetic artifact metadata ledger (.generated/synthetic-telemetry-ledger.json).
- Hash-based integrity to ensure no synthetic file renamed to mimic production.

### Status (Initial Version)
Process defined; verification script stub added; enforcement integrated via optional env flags. Pending: purge command, ledger, CI strict preset.

---
Generated: