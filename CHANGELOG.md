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

### 0.1.0
Initial public demo seed.