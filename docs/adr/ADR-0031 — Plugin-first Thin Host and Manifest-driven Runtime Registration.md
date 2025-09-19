# ADR-0031 — Plugin-first Thin Host and Manifest-driven Runtime Registration

## Status
Accepted

## Context
The thin host still contained host-aware behaviors (static runtime maps, JSON catalog mounting, special-casing) that coupled it to plugin details. Issue #188 aims to make the host thinner, data-driven, and plugin-first using aggregated plugin manifests.

## Decision
- Use the aggregated plugin manifest as the single source of truth for both UI and runtime.
- At startup, discover runtimes from the manifest and call each package’s exported `register(conductor)` — no host-side JSON catalog mounting.
- Compute Vite dev prebundle hints (optimizeDeps.include) from the manifest instead of a hardcoded list.
- Share one manifest provider across UI (PanelSlot) and runtime registration.
- Remove legacy fallback paths and plugin prioritization logic.

## Consequences
- Adding/removing a plugin requires only manifest + dependency changes — no host code edits.
- Startup is simpler and faster to reason about; plugin packages own their sequence mounting.
- Dev experience remains fast by feeding Vite’s prebundle list from the manifest.
- A legacy feature flag `host.plugin-first.registration` is now obsolete and removed.

## Alternatives Considered
- Generated runtime registry module (.generated/runtime-loaders.ts) to avoid dynamic import indirection. We opted for direct dynamic imports using the manifest, which is sufficient with Vite prebundle hints. We can introduce a generated registry later if DX/perf warrants.

## Implementation Notes
- Files updated (see PR):
  - src/core/manifests/pluginManifest.ts — shared provider
  - src/core/conductor/sequence-registration.ts — plugin-first only; fallback removed
  - src/ui/shared/PanelSlot.tsx — uses shared provider
  - vite.config.js — optimizeDeps.include computed from manifest
  - __tests__/e2e/startup-logs.guardrail.spec.ts — recognizes plugin-first registration logs
- All tests pass in CI (Vitest), including E2E startup guardrails.

## References
- Issue: #188
- PR: #189
- Related ADRs: ADR-0021 (feature flags registry)

