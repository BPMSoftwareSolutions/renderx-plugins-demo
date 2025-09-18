# RenderX Plugins Demo

A **thin-client host application** showcasing the RenderX plugin architecture. This demo provides a lightweight shell with manifest-driven plugin loading and orchestrated via the MusicalConductor engine.

## Overview

This repository contains:

- A minimal host app that initializes the RenderX plugin system.
- Example plugins serving as a sandbox for testing orchestration flows, UI extension, and manifest-driven panel slots.

## Related Resources

Check out these supporting projects for more detail on the underlying architecture:

- **MusicalConductor** — the orchestration engine powering plugin coordination (symphonies, movements, beats):
  https://github.com/BPMSoftwareSolutions/MusicalConductor/blob/main/README.md

- **renderx-plugins** — core utilities, base interfaces, and manifest schema for RenderX-compatible plugins:
  https://github.com/BPMSoftwareSolutions/renderx-plugins/blob/main/README.md

## Getting Started

1. Clone this repository:

   ```bash
   git clone https://github.com/BPMSoftwareSolutions/renderx-plugins-demo.git
   cd renderx-plugins-demo
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Launch the host application:

   ```bash
   npm start
   ```

4. Interact with the example plugins via the UI or white-box exploring the code.

## Example Plugins

| Plugin Name      | Purpose                                           |
| ---------------- | ------------------------------------------------- |
| **SamplePanel**  | Adds a plugin UI panel via a manifest-driven slot |
| **CanvasWidget** | Demonstrates a rendering component plugin         |

## Development Workflow

- To add a new plugin:
### Artifact Mode (External Plugins Repo)

Phase 1 introduces an artifact consumption mode so the thin host can run without plugin source code present.

Artifacts directory expected structure:

```
interaction-manifest.json
topics-manifest.json
layout-manifest.json (optional)
plugin-manifest.json (inside plugins/)
json-components/*
json-sequences/*
json-interactions/* (optional if already merged)
json-topics/*
plugins/plugin-manifest.json
```

Generate locally:
```
node scripts/build-artifacts.js --srcRoot=. --outDir=dist/artifacts
```

Run host pointing at artifacts:
```
set ARTIFACTS_DIR=dist\artifacts
npm run dev:artifacts
```

Or (PowerShell inline):
```
$env:ARTIFACTS_DIR="dist/artifacts"; npm run dev:artifacts
```

Script / CLI flags (all accept `--srcRoot` and `--outPublic` where applicable):

| Script | Purpose | Key Flags |
|--------|---------|----------|
| `scripts/generate-interaction-manifest.js` | Builds interaction-manifest.json | `--srcRoot`, `--outPublic` |
| `scripts/generate-topics-manifest.js` | Builds topics-manifest.json | `--srcRoot`, `--outPublic` |
| `scripts/generate-layout-manifest.js` | Copies layout manifest | `--srcRoot`, `--outPublic` |
| `scripts/sync-json-components.js` | Copies component JSON | `--srcRoot`, `--outPublic` |
| `scripts/sync-json-sequences.js` | Copies sequence catalogs | `--srcRoot`, `--outPublic` |
| `scripts/sync-plugins.js` | Copies plugin manifest(s) | `--srcRoot`, `--outPublic` |
| `scripts/build-artifacts.js` | Full artifact bundle | `--srcRoot`, `--outDir` |
| `scripts/copy-artifacts-to-public.js` | Consume existing artifacts | `ARTIFACTS_DIR` env or first arg path |

On startup the host logs a summary like:
```
🧪 Startup validation: { routes: 35, topics: 36, plugins: 6 }
```

Disable this validation (e.g. noisy integration tests) with:
```
set RENDERX_DISABLE_STARTUP_VALIDATION=1
```
or PowerShell:
```
$env:RENDERX_DISABLE_STARTUP_VALIDATION="1"; npm start
```

### Host SDK Surface (additions)

New helper exports (stable path `@renderx/host-sdk`):

| Export | Purpose |
|--------|---------|
| `getPluginManifest()` | Async fetch + cache plugin manifest for discovery tooling |
| `getCachedPluginManifest()` | Returns last fetched manifest or null |
| `getAllFlags()` | Snapshot of all feature flags |
| `getUsageLog()` | In-memory usage log (dev/test diagnostics) |
| `setFlagOverride(id, enabled)` | Test-only override (do not use in prod code paths) |
| `clearFlagOverrides()` | Clear all overrides |

These complement existing exports like `useConductor`, `resolveInteraction`, and mapping helpers.


## Artifact Integrity (Phase 2)

Phase 2 adds cryptographic integrity coverage for the synthesized artifact set so the thin host (or any consuming service) can detect tampering, drift, or partial deployments.

### What Gets Hashed

The integrity file (`artifacts.integrity.json`) contains a SHA-256 hash per core artifact plus an aggregate hash:

```
{
  "files": {
    "interaction-manifest.json": "<sha256>",
    "topics-manifest.json": "<sha256>",
    "layout-manifest.json": "<sha256|omitted if absent>",
    "manifest-set.json": "<sha256>"
  },
  "aggregate": "<sha256 of the sorted 'fileName:hash' lines>"
}
```

Only files that directly influence routing / orchestration are covered right now; sequence & component JSON can be added later once the surface stabilizes.

### Generating Integrity Data

Integrated build (preferred):
```
npm run artifacts:build:integrity
```
Equivalent manual invocation:
```
node scripts/build-artifacts.js --srcRoot=. --outDir=dist/artifacts --integrity
```

Legacy / standalone hash script (will produce a similar structure if artifacts already exist):
```
npm run artifacts:hash
```

### Runtime Verification

On host startup, if `ARTIFACTS_DIR` is set and `artifacts.integrity.json` is present, the host recomputes SHA-256 digests in the browser (using `crypto.subtle`) and compares them. A mismatch logs an error with the first differing file and aborts early in dev (subject to future policy decisions for production).

Disable integrity verification (e.g. for experimentation) with:
```
set RENDERX_DISABLE_INTEGRITY=1
```
PowerShell:
```
$env:RENDERX_DISABLE_INTEGRITY="1"; npm start
```

### CI Hook

CI invokes the integrity build to ensure the hashing path stays green. A failure surfaces as a normal test failure.

### Planned Extensions

| Planned | Description |
|---------|-------------|
| Signature layer | Aggregate hash signed with private key for provenance |
| Expanded coverage | Include sequence & component JSON catalogs in integrity file |
| Public API hash | Detect accidental breaking changes to `@renderx/host-sdk` |
| External lint roots | Use `RENDERX_PLUGINS_SRC` so ESLint rules work with detached plugin repo |
| Strict validator mode | CI flag to treat heuristic plugin coverage warnings as errors |
| Artifact packaging | Tarball bundling of artifacts for external distribution (`artifacts:pack`) |

## Environment Variables (Quick Reference)

| Variable | Purpose | Typical Usage |
|----------|---------|---------------|
| `HOST_ARTIFACTS_DIR` | (Preferred) Points host at pre-built artifacts directory (supersedes ARTIFACTS_DIR) | `set HOST_ARTIFACTS_DIR=..\\renderx-artifacts` then `npm run dev` |
| `ARTIFACTS_DIR` | Legacy alias for HOST_ARTIFACTS_DIR | `set ARTIFACTS_DIR=dist\\artifacts` then `npm run dev:artifacts` |
| `RENDERX_DISABLE_STARTUP_VALIDATION` | Skip plugin & manifest count summary | Silence noisy CI / perf runs |
| `RENDERX_DISABLE_INTEGRITY` | Skip integrity verification even if file present | Local debugging of partially edited artifacts |
| `RENDERX_PLUGINS_SRC` (planned) | External plugins source root for lint rules | Future Phase 2+ feature |
| `RENDERX_VALIDATION_STRICT` | Escalate artifact validator warnings to errors | `set RENDERX_VALIDATION_STRICT=1 && npm run artifacts:validate` |
| `RENDERX_SEQUENCE_COVERAGE_ALLOW` | Comma list of plugin IDs allowed to lack sequences (heuristic suppression) | `set RENDERX_SEQUENCE_COVERAGE_ALLOW=HeaderTitlePlugin,HeaderControlsPlugin` |
| `PACK_VERSION` | Override version used by pack-artifacts | `set PACK_VERSION=0.2.0 && npm run artifacts:pack` |
| `RENDERX_REQUIRE_SIGNATURE` | Enforce signature presence & verification | `set RENDERX_REQUIRE_SIGNATURE=1` |


  - Create a plugin folder under `plugins/`
  - Update the host manifest to include your plugin’s metadata and entry point
  - Restart the host to see it in action

- To test orchestration:

  - Create a plugin that registers into the conductor’s flow
  - Use `conductor.play()` to orchestrate actions across plugins

## Layout and Slots

- To add a new slot using the layout-manifest path, see:
  - docs/layout/ADD-A-SLOT.md

## Host SDK Migration (for external plugin authors)

See the canonical checklist and guidance here:

- docs/host-sdk/USING_HOST_SDK.md
- docs/host-sdk/EXTERNAL_PLUGIN_MIGRATION_CHECKLIST.md

## License

Specify your preferred license here (e.g., MIT).

---
### Source Layout Refactor (#171)
The codebase was reorganized into layered folders (`core/`, `domain/`, `ui/`, `infrastructure/`, `vendor/`). See `NEW_STRUCTURE.md` for mapping and migration notes.
