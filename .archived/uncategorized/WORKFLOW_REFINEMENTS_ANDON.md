## Workflow Refinements & Andon Cord Triggers (Diagnosis Slice)

Purpose: Prevent silent divergence between spec, handler implementation, and Business BDD tests (as occurred with `aggregateDiagnosis`). Introduces explicit Andon cord triggers—automatic hard stops—plus soft warnings for out‑of‑scope handlers.

### Core Triad Integrity
Every in-scope handler must simultaneously satisfy:
1. Spec entry (`comprehensive-business-bdd-specifications.json` contains `"name": "<handlerName>"`).
2. Source implementation (handler file exporting an event envelope with `handler: '<handlerName>'`).
3. Active Business BDD test (non-skipped `describe('Business BDD: <handlerName>' ...)`).

### Enforcement Scope (Current Sprint)
Strict enforcement applies only to diagnosis handlers matching pattern: `analyze*`, `aggregateDiagnosis`, `assess*`, `recommend*`.
Other sequences (telemetry, anomaly, baseline, future SLO) produce warnings tracked for later sprints but do not fail the build yet.

### Andon Cord Triggers (Hard Fail)
Build/test pipeline stops when:
- Spec freshness > 24h.
- Spec JSON parse error.
- Declared handler count < discovered handler implementations.
- In-scope handler missing Business BDD test file.
- In-scope handler test skipped.

### Soft Warning Conditions (Logged, Non-Fatal)
- Out-of-scope handler lacks Business BDD test.
- Test exists but currently skipped for out-of-scope handler.
- Handler implemented but no spec entry (suggests undocumented capability).

### Remediation Workflow When Triggered
1. Stop pipeline (automatic).
2. Identify gap category (missing spec vs missing test vs missing implementation).
3. Apply minimal patch (create handler/test or remove spec entry) within one commit.
4. Re-run `node scripts/verify-bdd-spec.js` locally (green) before pushing.
5. If recurring, add improvement backlog item with root cause classification (process, naming, sequencing).

### Preventive Practices
- Add handler stub + empty passing Business BDD test FIRST (spec + test scaffold) before implementation.
- Disallow `describe.skip` in committed code for in-scope handlers—use temporary local change only.
- Pair spec updates with immediate enforcement script run pre-commit.

### Future Enhancements (Backlog Suggestions)
- Parameterized max age per sequence (e.g., diagnosis < 12h).
- Reverse mapping: tests -> spec to catch orphan tests.
- Auto-generation of missing test stubs when a new handler is added.
- Drift report summarizing triad mismatches as a markdown artifact.
- SLO sequence onboarding into enforcement scope once initial SLO handlers land.
- Demo spec enforcement: require `DEMO_PROCESS_SPEC.json` early (exploration) with objectives, resources, Andon triggers.

### Status (After Refinement)
`aggregateDiagnosis` triad restored (spec + handler + active test). Enforcement script updated to scope strict rules.
Demo process spec added (`DEMO_PROCESS_SPEC.json`) and verification integrated into `pretest` via `verify-demo-spec.js`.

---
Document generated: ${new Date().toISOString()}