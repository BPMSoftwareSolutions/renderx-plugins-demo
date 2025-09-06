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
