## Changelog

All notable changes for the thin host + artifacts contract are documented here.

Versioning surfaces:

- npm package version (host demo + host-sdk workspace)
- schemaVersion inside generated artifacts (interaction/topics/layout/manifest-set)

We treat schemaVersion as a contract for external plugin repos; it only increments on breaking structural changes to artifact JSON shapes (not on added optional fields).

### Unreleased (separation readiness phase)

Added:

- Packaging script `artifacts:pack` producing versioned tarball (`dist/packages/renderx-artifacts-vX.Y.Z.tar.gz`).
- Strict validation mode via `RENDERX_VALIDATION_STRICT=1` (script alias: `artifacts:validate:strict`) escalating heuristic warnings to CI errors.
- Signature scaffold (`artifacts:build:signed` / `--sign`) emitting `artifacts.signature.json` with Ed25519 signature & verification script.

Planned (MUST before v0.2.0 split):

#### Phase 2 – Physical Move & Layered Refactor (Issue #171)

Stabilized the new layered source topology while preserving the public host + SDK surface.

Added / Changed:

- Introduced enforced directory layering: `core/`, `domain/`, `ui/`, `infrastructure/`, `vendor/` (see `docs/design-reviews/NEW_STRUCTURE.md`).
- Physically relocated CSS / sanitizer logic to `domain/css/` (`cssRegistry.facade.ts`, `sanitizeHtml.ts`).
- Moved `PanelSlot` component to `ui/shared/PanelSlot.tsx` with test override hook and legacy path vendor-fix logic.
- Consolidated layout + mapping + manifests under their respective `core/` or `domain/` folders (with temporary re-export shims for layout engine where full move deferred by custom lint rule constraints).
- Unified `EventRouter` by converting the legacy root file into a thin re-export of `core/events/EventRouter.ts` (eliminates duplicate subscriber maps and intermittent test divergence).
- Updated test imports and startup wiring to consume domain-layer facades directly.

Removed (legacy / duplicate shims):

- Root `sanitizeHtml.ts` (replaced by `domain/css/sanitizeHtml.ts`).
- Root `cssRegistry/facade.ts` (replaced by `domain/css/cssRegistry.facade.ts`).
- Duplicate `component-mapper/rule-engine.ts` (canonical now under `domain/mapping/component-mapper/`).
- Legacy `components/PanelSlot.tsx` shim after consumers migrated.

Stability / Back-Compat:

- Original import specifiers used by external code continue to resolve via re-export shims where necessary (notably layout + EventRouter) preventing breaking changes to the thin host API surface.
- All Vitest + Playwright suites pass post-move (full CI green); no public schemaVersion changes were required (purely physical / organizational refactor).

Follow Ups (tracked separately):

- Potential relocation of `sanitizeHtml.ts` further into an `infrastructure/security` boundary.
- Introduce path aliases (e.g. `@/`) to reduce deep relative imports once remaining legacy shims are removed.
- Evaluate extracting `core/` into a dedicated host SDK package after v0.2.0 artifact split.

### 0.1.0

Initial public demo seed.
