# External Plugin Packaging & Distribution

This guide explains how to build, validate, and package the synthesized artifact set so a thin host (in another repo) can run without plugin source code.

## Overview

Artifacts are JSON manifests + integrity metadata produced by `scripts/build-artifacts.js`. They are consumed at runtime via `HOST_ARTIFACTS_DIR` and validated by `scripts/validate-artifacts.js` (optionally strict).

## Build

```
npm run artifacts:build:integrity
```

Outputs to `dist/artifacts`:

- interaction-manifest.json
- topics-manifest.json
- layout-manifest.json (if present)
- manifest-set.json (aggregated lookups)
- plugins/plugin-manifest.json
- artifacts.integrity.json (per-file + aggregate SHA-256)

## Validate

```
npm run artifacts:validate          # normal (warnings allowed)
npm run artifacts:validate:strict   # fail on heuristic coverage warnings
```

Heuristic coverage warnings (plugin has no obvious sequence) can be suppressed for pure-UI plugins:

```
set RENDERX_SEQUENCE_COVERAGE_ALLOW=HeaderTitlePlugin,HeaderControlsPlugin
npm run artifacts:validate:strict
```

## Package

```
npm run artifacts:pack
```

Creates: `dist/packages/renderx-artifacts-v<version>.tar.gz` and a JSON descriptor with SHA-256 of the tarball.

Override the version (defaults to package.json version):

```
set PACK_VERSION=0.2.0
npm run artifacts:pack
```

## Consume in Thin Host

Copy or extract artifacts into a path and set:

```
set HOST_ARTIFACTS_DIR=..\shared-artifacts
npm run dev
```

If both `HOST_ARTIFACTS_DIR` and `ARTIFACTS_DIR` are unset, the host falls back to its bundled (public) JSON.

## CI Suggested Order

1. `npm ci`
2. `npm run artifacts:build:integrity`
3. (optional) `RENDERX_SEQUENCE_COVERAGE_ALLOW=... npm run artifacts:validate:strict`
4. `npm test`
5. `npm run artifacts:pack`

## Integrity Verification

Runtime (browser or node) recomputes SHA-256 of covered files and compares with `artifacts.integrity.json`. Disable temporarily with:

```
set RENDERX_DISABLE_INTEGRITY=1
```

## Future Enhancements

- Signature of aggregate hash
- Expanded coverage to sequences/components
- Public API surface hash gating

---
Questions? Open an issue in the repo with the label `artifacts`.