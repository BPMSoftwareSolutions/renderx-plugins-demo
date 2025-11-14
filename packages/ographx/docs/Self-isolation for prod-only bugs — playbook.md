# Self-isolation for prod-only bugs — playbook

## 1) Trigger

* Beat Health drops or a prod incident fires on `sequence_id/movement/beat`.
* Capture: full trace context, **input/output contracts** (batons) + fingerprints, env vars, feature flags, dependency URLs, and timing markers.

## 2) Auto-generate an Extraction Spec

Minimal recipe to rebuild the failing path in a sandbox.

```json
{
  "extractionSpec": {
    "sequence_id": "invoice-create",
    "movement_id": "persist",
    "beat": 2,
    "code_units": ["BillingSvc.createInvoice", "UpsertInvoice", "TaxClient.quote"],
    "contracts_in": ["InvoiceDraft@0.2.0"],
    "contracts_out": ["Invoice@1.0.0"],
    "dependencies": {
      "db": "stub:postgres-fixture://invoice-fixture-2025-11-13",
      "http:tax-svc": "replay:cassette://tax-quote-3e94.json",
      "cache": "noop"
    },
    "env": {"TZ":"UTC","FEATURE_X":"off"},
    "timing": {"clock":"monotonic","delays":{"tax-quote":122}},
    "seed": 874311,
    "privacy": {"mask":["email"],"hash":["userId"]}
  }
}
```

## 3) Build a Tiny Isolated Harness

* **Code slice:** only the methods named in `code_units` (copy or dynamic import).
* **Determinism:** freeze clock, seed RNG, simulate network jitter from `timing`.
* **Side-effects:** replace DB/HTTP with **fixtures or record-replay cassettes**.
* **Data:** synthesize from the **contracts_in** + the captured fingerprint’s fixture.

> In OgraphX terms: you’re loading just the **Movements/Beats** involved, wiring their **data batons**, and swapping external beats with stubs.

## 4) Reproduce & Diagnose

* Run the harness repeatedly with the same cassette → identify pure logic faults.
* If it only fails with concurrency, run **N parallel harnesses** (simulated latency + ordering) to surface races.
* Add targeted **pre-beats** (guards, validation) to narrow the failing region.

## 5) Patch & Prove

* Create a **delta sequence** (e.g., split the long beat into two; add validation).
* Run the same harness until green; collect before/after metrics (latency/error).
* Attach the proof to the incident: sequences diff + test log + ADR snippet.

## 6) Canary & Observe

* Ship as a **beat-scoped feature flag** to a small % of traffic.
* Watch Beat Health/p95 in prod; roll forward or back automatically.

---

# Patterns that make isolation work

* **Contract-first batons:** args/returns must be well-typed (Zod/Pydantic/Roslyn attributes). Easier fixture gen; safer redaction.
* **Record-replay boundaries:** HTTP, queues, and DB calls captured as cassettes (bounded size, PII-scrubbed). Great for non-deterministic/3rd-party behavior.
* **Time and randomness control:** monotonic test clock + seeded RNG; optionally **logical clocks** to step beats deterministically.
* **Idempotent beats:** designing beats to be idempotent or compensatable lets you run them safely in isolation (and in prod canaries).
* **Beat-local feature flags:** enable the patched beat only when `trace_id ∈ sample` or `tenant ∈ set` for surgical canaries.

---

# Common failure classes & isolation tactics

| Symptom                      | Likely root                 | Isolation tactic                                                 |
| ---------------------------- | --------------------------- | ---------------------------------------------------------------- |
| Works locally, fails in prod | **Timing / race**           | Simulate latency & parallelism in harness; add ordering pre-beat |
| Only fails for some tenants  | **Data shape drift**        | Generate fixtures from contract + tenant-specific transforms     |
| Unknown 3rd-party behavior   | **External nondeterminism** | Record-replay cassette; fuzz cassette timings                    |
| Intermittent timeouts        | **Backpressure**            | Add artificial queue delays; test with circuit-breaker pre-beat  |
| Serialization errors         | **Version skew**            | Lock contract versions in harness; enforce evolution gates       |

---

# What to automate (OgraphX + Valence)

* **Incident → spec**: when a beat fails, emit `extractionSpec` automatically.
* **Spec → harness**: scaffold a mini project (fixtures, stubs, deterministic clock).
* **Harness → tests**: generate a red test (ATDD) from the incident trace; keep it in repo.
* **Patch gate**: Valence checks must pass: boundary policy (PII masked), evolution rules, performance SLOs on patched beat.
* **Confidence & rollback**: canary requires Beat Health ↑ and error rate ↓ with ≥0.9 confidence; auto-rollback otherwise.

---

# How effective is it?

**Very**—when three prerequisites are true:

1. **Good contracts** (batons) so inputs/outputs are reconstructible.
2. **Clear boundaries** so side-effects can be stubbed or replayed.
3. **Traceability** down to beats (you have that via OgraphX).

Teams typically go from “can’t repro” to a **repeatable 1-file harness** that pinpoints the issue and ships a targeted fix—with artifacts (spec, fixtures, tests, ADR) you can reuse.
