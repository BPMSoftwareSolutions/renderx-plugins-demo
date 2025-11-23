# RenderX Plugins Demo

A **thin-client host application** showcasing the RenderX plugin architecture. This demo provides a lightweight shell with manifest-driven plugin loading and orchestrated via the MusicalConductor engine.

## Overview

This repository is organized as a **monorepo** that consolidates all RenderX architecture components and dependencies. This structure:

- **Simplifies Development**: All code in one place, easier to make cross-cutting changes
- **Unifies Versioning**: Coordinate releases across all packages
- **Shares Tooling**: Single ESLint, TypeScript, and test configuration
- **Accelerates CI/CD**: Build and test all packages together

### Repository Contents

- **Host Application**: A minimal host app that initializes the RenderX plugin system
- **Packages**: Core infrastructure and plugins (see `packages/` directory)
- **Example Plugins**: Sandbox for testing orchestration flows, UI extension, and manifest-driven panel slots

For detailed monorepo development guidelines, see [MONOREPO.md](./MONOREPO.md).

## Related Resources

Check out these supporting projects for more detail on the underlying architecture:

- **MusicalConductor** — the orchestration engine powering plugin coordination (symphonies, movements, beats):
  https://github.com/BPMSoftwareSolutions/MusicalConductor/blob/main/README.md

- **renderx-plugins** — core utilities, base interfaces, and manifest schema for RenderX-compatible plugins:
  https://github.com/BPMSoftwareSolutions/renderx-plugins/blob/main/README.md

## � Telemetry Governance & Traceability System

This repository includes a comprehensive **5-layer telemetry governance and traceability system** that provides complete visibility into component health, data transformations, and system architecture.

### Quick Start for Agents & Developers

**Find any project or workflow instantly:**
```bash
node scripts/query-project-knowledge.js "self-healing"
node scripts/query-project-knowledge.js "sprint workflow"
node scripts/query-project-knowledge.js "reusable patterns"
```

**Check component health status:**
```bash
jq '.components[]' .generated/sli-metrics.json
```

**Understand system architecture:**
- Read: `COMPLETE_KNOWLEDGE_SYSTEM_INDEX.md` (master index)
- Read: `KNOWLEDGE_LAYERS_ARCHITECTURE.md` (5-layer integration)
- Read: `PROJECT_KNOWLEDGE_QUERY_GUIDE.md` (how to query)

### System Architecture (5 Layers)

| Layer | File | Purpose | Status |
|-------|------|---------|--------|
| **1** | `global-traceability-map.json` | Architecture, components, pipelines | ✅ Complete |
| **2** | `project-knowledge-map.json` | File locations, workflows, patterns | ✅ Complete |
| **3** | `sli-metrics.json` | Real-time health, anomalies, metrics | ✅ Complete (Phase 2) |
| **4** | `slo-targets.json`, `error-budgets.json` | SLO targets, error budgets | 🟡 Phase 3-4 Ready |
| **5** | `sla-compliance-report.json` | Compliance monitoring, self-healing trigger | 🟡 Phase 5 Ready |

### Key Features

**Layer 1: Global Traceability Map**
- 17 packages classified and mapped
- 11-stage data transformation pipeline documented
- Component health scores and anomaly tracking
- Robotics deprecation plan
- Dashboard architecture specification
- Governance rules and best practices

**Layer 2: Project Knowledge Map**
- Intelligent query tool for discovering projects, workflows, and patterns
- Self-healing project: 7 sequences, 67 handlers, reusable sprint workflow
- OGraphX analysis tool integration
- SLO dashboard package design
- 4 reusable patterns for cross-project use

**Layer 3: Telemetry & Health Status**
- 5 components monitored with real SLI metrics
- Canvas component: CRITICAL (health: 49.31, availability: 99.71%)
- Host SDK: BEST (health: 56.08, availability: 99.90%)
- 30 anomalies detected with 100% traceability to source code (exact line numbers)
- Latency tracking (P50/P95/P99), error rates, availability percentages

**Layer 4: SLO/SLI Targets & Budgets (Ready for Implementation)**
- Phase 3: Define realistic SLO targets based on real production metrics
- Phase 4: Calculate error budgets and track consumption

**Layer 5: SLA Compliance & Self-Healing Trigger (Ready for Implementation)**
- Phase 5: Real-time SLO adherence monitoring
- Automatic triggering of self-healing on breach
- Feedback loop: fixes → recalculated metrics → improvement visualization

### For AI Agents & Automated Tools

When working on this codebase, **always use the traceability system** to:

1. **Understand the architecture** → Read `KNOWLEDGE_LAYERS_ARCHITECTURE.md`
2. **Find project files** → Use `node scripts/query-project-knowledge.js "keyword"`
3. **Check component health** → Query `.generated/sli-metrics.json`
4. **Understand data flows** → Review `GLOBAL_DATA_PIPELINES.md`
5. **Reference workflows** → Use sprint workflow from `IMPLEMENTATION_ROADMAP.md`
6. **Apply patterns** → Discover patterns with query tool

### Common Queries

```bash
# Find the self-healing system
node scripts/query-project-knowledge.js "self-healing"
# Returns: Location, file structure, 7 sequences, 67 handlers

# Locate sprint workflow for implementing phases
node scripts/query-project-knowledge.js "sprint workflow"
# Returns: 7 phases, 14 weeks, handler distribution, reusable pattern

# Discover reusable patterns
node scripts/query-project-knowledge.js "reusable patterns"
# Returns: Handler organization, JSON-first design, test parity, progressive phases

# Find all project documentation
node scripts/query-project-knowledge.js "ographx"
node scripts/query-project-knowledge.js "dashboard"
```

### System Statistics

- **17 packages** in active development
- **30 anomalies** detected and tracked
- **87 log files** analyzed (120,994 lines)
- **82,366 events** traced with 100% lineage
- **5 components** with continuous health monitoring
- **25 SLI metrics** defined across components
- **7 sequences** in self-healing system (67 handlers)
- **8 phases** planned for SLO/SLI system (2 complete, 6 ready)

### Implementation Status

✅ **Complete:**
- Phase 1: SLI Framework (25 metrics defined)
- Phase 2: SLI Metrics (real production data)
- Phase 3a: Global Architecture Mapping
- Phase 3b: Project Knowledge Indexing

🟡 **Ready to Implement:**
- Phase 3c: SLO Definition Engine (Phase 3 script)
- Phase 4: Error Budget Calculator (Phase 4 script)
- Phase 5: SLA Compliance Tracker (Phase 5 script)
- Phase 6: SLO/SLI Dashboard (React package)
- Phase 7: Workflow Engine (state machine orchestration)
- Phase 8: Documentation (comprehensive guides)

### Essential Documentation

For complete context, see:
- `COMPLETE_KNOWLEDGE_SYSTEM_INDEX.md` — Master index and quick reference
- `KNOWLEDGE_LAYERS_ARCHITECTURE.md` — How all 5 layers integrate
- `PROJECT_KNOWLEDGE_QUERY_GUIDE.md` — How to use the query system
- `GLOBAL_COMPONENT_TOPOLOGY.md` — Package details and health
- `GLOBAL_DATA_PIPELINES.md` — Data transformation flows
- `.generated/project-knowledge-map.json` — Source JSON (queryable)
- `.generated/global-traceability-map.json` — Source JSON (queryable)

---

## �🚧 Active Refactoring Zones

Some parts of the codebase are under active refactoring for improved modularity, scalability, and maintainability. These zones have special markers and guidance for contributors.

### Diagnostics Module (Issue #297)

**Status**: Phase 4 Complete ✅ | Phases 5-6 Pending ⏳

**Files Under Refactoring**:
- `src/ui/diagnostics/DiagnosticsPanel.tsx` (383 lines → target: <200 lines)
- `src/ui/PluginTreeExplorer.tsx` (810 lines → target: <200 lines)

**What's Complete**:
- ✅ Phase 1: Type system centralized in `src/ui/diagnostics/types/`
- ✅ Phase 2: Business logic extracted to `src/ui/diagnostics/services/`
- ✅ Phase 3: Custom hooks extracted to `src/ui/diagnostics/hooks/`
- ✅ Phase 4: Components extracted to `src/ui/diagnostics/components/`

**What's Coming**:
- ⏳ Phase 5: Tree explorer modularization (extract to `src/ui/diagnostics/tree/`)
- ⏳ Phase 6: Testing & documentation

**For Contributors & AI Agents**:

When working in these refactoring zones:

1. **Read First**: `src/ui/diagnostics/REFACTORING.md` - Contains detailed guidance
2. **Use Existing Structure**:
   - ✅ Import types from `src/ui/diagnostics/types/`
   - ✅ Use services from `src/ui/diagnostics/services/`
   - ✅ Use hooks from `src/ui/diagnostics/hooks/`
   - ✅ Use components from `src/ui/diagnostics/components/`
3. **Avoid Anti-Patterns**:
   - ❌ Don't add inline type definitions
   - ❌ Don't add data fetching logic to components
   - ❌ Don't add new useState hooks (use existing custom hooks)
   - ❌ Don't add complex nested components (extract to components/)
   - ❌ Don't modify tree structure yet (Phase 5 will handle tree refactoring)

**Reference Documents**:
- [Refactoring Strategy](docs/refactoring/diagnostics-modularity-strategy.md)
- [Progress Summary](docs/refactoring/PROGRESS-SUMMARY.md)
- [Before & After Comparison](docs/refactoring/diagnostics-before-after.md)
- [Module-Specific Guidance](src/ui/diagnostics/REFACTORING.md)

**Related Issues**:
- [#297 - Refactor Diagnostics Panel](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues/297)
- [#302 - Add Refactoring Zone Markers](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues/302)
- [#283 - Deep Hierarchical Navigation](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues/283)

---

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

| Script                                     | Purpose                          | Key Flags                             |
| ------------------------------------------ | -------------------------------- | ------------------------------------- |
| `scripts/generate-interaction-manifest.js` | Builds interaction-manifest.json | `--srcRoot`, `--outPublic`            |
| `scripts/generate-topics-manifest.js`      | Builds topics-manifest.json      | `--srcRoot`, `--outPublic`            |
| `scripts/generate-layout-manifest.js`      | Copies layout manifest           | `--srcRoot`, `--outPublic`            |
| `scripts/sync-json-components.js`          | Copies component JSON; discovers node_modules packages declaring `renderx.components` (prefers package over local) | `--srcRoot`, `--outPublic`            |
| `scripts/sync-json-sequences.js`           | Copies sequence catalogs         | `--srcRoot`, `--outPublic`            |
| `scripts/sync-plugins.js`                  | Copies plugin manifest(s)        | `--srcRoot`, `--outPublic`            |
| `scripts/build-artifacts.js`               | Full artifact bundle             | `--srcRoot`, `--outDir`               |
| `scripts/copy-artifacts-to-public.js`      | Consume existing artifacts       | `ARTIFACTS_DIR` env or first arg path |


> Note: The host now consumes component catalogs from external packages. Any package in node_modules with a package.json field `renderx.components: ["<dir>"]` will be discovered and copied into `public/json-components/`. If the same file exists both in a package and in the local `catalog/json-components/`, the package version wins to avoid duplication.

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

| Export                         | Purpose                                                   |
| ------------------------------ | --------------------------------------------------------- |
| `getPluginManifest()`          | Async fetch + cache plugin manifest for discovery tooling |
| `getCachedPluginManifest()`    | Returns last fetched manifest or null                     |
| `getAllFlags()`                | Snapshot of all feature flags                             |
| `getUsageLog()`                | In-memory usage log (dev/test diagnostics)                |
| `setFlagOverride(id, enabled)` | Test-only override (do not use in prod code paths)        |
| `clearFlagOverrides()`         | Clear all overrides                                       |

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

| Planned               | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| Signature layer       | Aggregate hash signed with private key for provenance                      |
| Expanded coverage     | Include sequence & component JSON catalogs in integrity file               |
| Public API hash       | Detect accidental breaking changes to `@renderx/host-sdk`                  |
| External lint roots   | Use `RENDERX_PLUGINS_SRC` so ESLint rules work with detached plugin repo   |
| Strict validator mode | CI flag to treat heuristic plugin coverage warnings as errors              |
| Artifact packaging    | Tarball bundling of artifacts for external distribution (`artifacts:pack`) |

## Environment Variables (Quick Reference)

| Variable                             | Purpose                                                                             | Typical Usage                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `HOST_ARTIFACTS_DIR`                 | (Preferred) Points host at pre-built artifacts directory (supersedes ARTIFACTS_DIR) | `set HOST_ARTIFACTS_DIR=..\\renderx-artifacts` then `npm run dev`            |
| `ARTIFACTS_DIR`                      | Legacy alias for HOST_ARTIFACTS_DIR                                                 | `set ARTIFACTS_DIR=dist\\artifacts` then `npm run dev:artifacts`             |
| `RENDERX_DISABLE_STARTUP_VALIDATION` | Skip plugin & manifest count summary                                                | Silence noisy CI / perf runs                                                 |
| `RENDERX_DISABLE_INTEGRITY`          | Skip integrity verification even if file present                                    | Local debugging of partially edited artifacts                                |
| `RENDERX_PLUGINS_SRC` (planned)      | External plugins source root for lint rules                                         | Future Phase 2+ feature                                                      |
| `RENDERX_VALIDATION_STRICT`          | Escalate artifact validator warnings to errors                                      | `set RENDERX_VALIDATION_STRICT=1 && npm run artifacts:validate`              |
| `RENDERX_SEQUENCE_COVERAGE_ALLOW`    | Comma list of plugin IDs allowed to lack sequences (heuristic suppression)          | `set RENDERX_SEQUENCE_COVERAGE_ALLOW=HeaderTitlePlugin,HeaderControlsPlugin` |
| `PACK_VERSION`                       | Override version used by pack-artifacts                                             | `set PACK_VERSION=0.2.0 && npm run artifacts:pack`                           |
| `RENDERX_REQUIRE_SIGNATURE`          | Enforce signature presence & verification                                           | `set RENDERX_REQUIRE_SIGNATURE=1`                                            |

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

The codebase was reorganized into layered folders (`core/`, `domain/`, `ui/`, `infrastructure/`, `vendor/`). See `docs/design-reviews/NEW_STRUCTURE.md` for mapping and migration notes.
