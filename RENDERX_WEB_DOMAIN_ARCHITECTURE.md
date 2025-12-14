# RenderX-Web Domain: Runtime Architecture & Reorganization Plan

**Version:** 1.0.0
**Generated:** 2025-12-14
**Status:** Analysis Complete - Reorganization Pending

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Runtime Dependencies](#runtime-dependencies)
4. [Current File Structure (Scattered)](#current-file-structure-scattered)
5. [Proposed Reorganized Structure](#proposed-reorganized-structure)
6. [Migration Plan](#migration-plan)
7. [Build Pipeline](#build-pipeline)
8. [Orchestration Domains](#orchestration-domains)

---

## Executive Summary

The **renderx-web domain** is a plugin-based orchestration system powered by the Musical Conductor library. The runtime architecture currently suffers from **scattered organization** where domain logic, infrastructure, and UI concerns are mixed across multiple directory structures.

### Current Problems:
- ❌ Runtime-only plugins (`canvas-component`, `library-component`) scattered in packages/
- ❌ Domain services split between `src/domain/` and `packages/`
- ❌ Infrastructure concerns (bridges, clients) in `src/infrastructure/` separate from domain
- ❌ UI components in `src/ui/` disconnected from their business logic
- ❌ Vendor loaders in `src/vendor/` as a band-aid for import resolution
- ❌ No clear "renderx-web domain" boundary in the file structure

### Proposed Solution:
- ✅ Create dedicated `domains/renderx-web/` directory
- ✅ Colocate runtime logic, UI, infrastructure, and services
- ✅ Clear separation: Core SDK, Domain, Plugins
- ✅ Domain-driven directory structure

---

## Current State Analysis

### Plugin Manifest Overview

**Total Plugins:** 8 production plugins
**Source:** `public/plugins/plugin-manifest.json`

| Plugin ID | Type | Package | Sequences | Slot |
|-----------|------|---------|-----------|------|
| **HeaderTitlePlugin** | UI + Runtime | @renderx-plugins/header | 2 | headerLeft |
| **HeaderControlsPlugin** | UI + Runtime | @renderx-plugins/header | 2 | headerCenter |
| **HeaderThemePlugin** | UI + Runtime | @renderx-plugins/header | 2 | headerRight |
| **LibraryPlugin** | UI + Runtime | @renderx-plugins/library | 1 | library |
| **CanvasPlugin** | UI + Runtime | @renderx-plugins/canvas | - | canvas |
| **ControlPanelPlugin** | UI + Runtime | @renderx-plugins/control-panel | 13 | controlPanel |
| **LibraryComponentPlugin** ⭐ | **Runtime-only** | @renderx-plugins/library-component | 3 | (none) |
| **CanvasComponentPlugin** ⭐ | **Runtime-only** | @renderx-plugins/canvas-component | 33 | (none) |

**Key Insight:** The two runtime-only plugins (`canvas-component`, `library-component`) are **core business logic** for the renderx-web domain but are buried in the `packages/` directory alongside UI plugins.

---

## Runtime Dependencies

### Package-Level Dependencies

#### **Core Infrastructure:**
- `@renderx-plugins/host-sdk` - Conductor, EventRouter, manifests, feature flags
- `musical-conductor` - Sequence execution engine (v1.5.1)
- `react` + `react-dom` (v19.1.1)

#### **UI + Runtime Plugins:**
- `@renderx-plugins/header` - Navigation UI + theme sequences
- `@renderx-plugins/library` - Component library UI + load sequence
- `@renderx-plugins/canvas` - Canvas rendering surface
- `@renderx-plugins/control-panel` - Property editor + 13 sequences

#### **Runtime-Only Plugins (Business Logic):**
- `@renderx-plugins/canvas-component` - **33 sequences** (create, select, drag, resize, export, etc.)
- `@renderx-plugins/library-component` - **3 sequences** (drag, drop, container.drop)

#### **Supporting Packages:**
- `@renderx-plugins/components` - Shared component library
- `@renderx-plugins/digital-assets` - Asset management
- `@renderx-plugins/manifest-tools` - Manifest utilities

### SRC Directory Dependencies

| Directory | Files | Purpose | Used at Runtime? |
|-----------|-------|---------|------------------|
| **src/ui/** | App.tsx, PanelSlot.tsx, wiring.ts, diagnostics/* | UI composition & rendering | ✅ Always |
| **src/domain/** | inventory.service.ts, cssRegistry.facade.ts, LayoutEngine.tsx | Business services | ✅ Always |
| **src/infrastructure/** | apiClient.ts, cli-bridge.ts, handlersPath.ts | .NET bridge, dev tools | ✅ Always |
| **src/vendor/** | vendor-symphony-loader.ts, vendor-control-panel.ts | Symphony resolution | ✅ Always |
| **src/core/** | uiEvents.json | Event wiring config | ✅ Always |

### Orchestration Domains

**Total Domains:** 78 (from `orchestration-domains.json`)
**RenderX-Web Domain Sequences:** 43

**Breakdown:**
- Canvas Component: 24 sequences
- Control Panel: 13 sequences
- Library Component: 3 sequences
- Library: 1 sequence
- Header: 2 sequences

---

## Current File Structure (Scattered)

```
renderx-plugins-demo/
│
├─ 📦 packages/                          ← SCATTERED: Domain logic mixed with UI plugins
│  │
│  ├─ canvas-component/                  ⭐ RUNTIME-ONLY (33 sequences)
│  │  ├─ src/
│  │  │  ├─ handlers/                    ← Business logic handlers
│  │  │  │  ├─ create.handler.ts
│  │  │  │  ├─ select.handler.ts
│  │  │  │  ├─ drag.handler.ts
│  │  │  │  └─ ... (30+ handlers)
│  │  │  ├─ services/
│  │  │  └─ index.ts                     ← register(conductor)
│  │  ├─ json-sequences/
│  │  │  └─ canvas-component/
│  │  │     ├─ index.json                ← Sequence catalog
│  │  │     ├─ create.json
│  │  │     ├─ select.json
│  │  │     └─ ... (33 sequences)
│  │  └─ package.json
│  │
│  ├─ library-component/                 ⭐ RUNTIME-ONLY (3 sequences)
│  │  ├─ src/
│  │  │  ├─ handlers/
│  │  │  │  ├─ drag.handler.ts
│  │  │  │  ├─ drop.handler.ts
│  │  │  │  └─ container-drop.handler.ts
│  │  │  └─ index.ts                     ← register(conductor)
│  │  ├─ json-sequences/
│  │  │  └─ library-component/
│  │  │     ├─ index.json
│  │  │     ├─ drag.json
│  │  │     ├─ drop.json
│  │  │     └─ container.drop.json
│  │  └─ package.json
│  │
│  ├─ control-panel/                     🎨 UI + RUNTIME (13 sequences)
│  │  ├─ src/
│  │  │  ├─ components/
│  │  │  │  └─ ControlPanel.tsx          ← UI Component
│  │  │  ├─ symphonies/                  ← Distributed handlers
│  │  │  │  ├─ selection/
│  │  │  │  │  └─ selection.symphony.ts
│  │  │  │  ├─ classes/
│  │  │  │  │  └─ classes.symphony.ts
│  │  │  │  ├─ css-management/
│  │  │  │  │  └─ css-management.symphony.ts
│  │  │  │  └─ ui/
│  │  │  │     └─ ui.symphony.ts
│  │  │  └─ index.ts                     ← register(conductor) + UI export
│  │  ├─ json-sequences/
│  │  └─ package.json
│  │
│  ├─ header/                            🎨 UI + RUNTIME (2 sequences)
│  │  ├─ src/
│  │  │  ├─ components/
│  │  │  │  ├─ HeaderTitle.tsx
│  │  │  │  ├─ HeaderControls.tsx
│  │  │  │  └─ HeaderThemeToggle.tsx
│  │  │  └─ index.ts
│  │  ├─ json-sequences/
│  │  └─ package.json
│  │
│  ├─ library/                           🎨 UI + RUNTIME (1 sequence)
│  │  ├─ src/
│  │  │  ├─ components/
│  │  │  │  └─ LibraryPanel.tsx
│  │  │  └─ index.ts
│  │  ├─ json-sequences/
│  │  └─ package.json
│  │
│  ├─ canvas/                            🎨 UI ONLY (no sequences)
│  │  ├─ src/
│  │  │  ├─ components/
│  │  │  │  └─ CanvasPage.tsx
│  │  │  └─ index.ts
│  │  └─ package.json
│  │
│  ├─ host-sdk/                          🔧 CORE INFRASTRUCTURE
│  │  ├─ src/
│  │  │  └─ core/
│  │  │     ├─ conductor/
│  │  │     │  ├─ conductor.ts           ← Conductor init
│  │  │     │  └─ sequence-registration.ts
│  │  │     ├─ manifests/
│  │  │     │  ├─ interactionManifest.ts
│  │  │     │  └─ topicsManifest.ts
│  │  │     ├─ events/
│  │  │     │  └─ EventRouter.ts
│  │  │     ├─ environment/
│  │  │     │  ├─ feature-flags.ts
│  │  │     │  └─ config.ts
│  │  │     └─ startup/
│  │  │        └─ startupValidation.ts
│  │  └─ package.json
│  │
│  ├─ musical-conductor/                 🔧 CORE ENGINE
│  │  └─ (Sequence orchestration engine)
│  │
│  └─ ... (other packages)
│
├─ 📂 src/                               ← SCATTERED: Domain concerns split across directories
│  │
│  ├─ ui/                                🎨 UI LAYER (React components)
│  │  ├─ App/
│  │  │  └─ App.tsx                      ← Root component
│  │  ├─ shared/
│  │  │  └─ PanelSlot.tsx                ← Plugin loader
│  │  ├─ events/
│  │  │  └─ wiring.ts                    ← Event → EventRouter bridge
│  │  └─ diagnostics/                    ← Diagnostics overlay
│  │     ├─ DiagnosticsOverlay.tsx
│  │     ├─ DiagnosticsPanel.tsx
│  │     ├─ eventTap.ts
│  │     └─ services/
│  │
│  ├─ domain/                            📊 DOMAIN SERVICES
│  │  ├─ components/
│  │  │  └─ inventory/
│  │  │     └─ inventory.service.ts      ← Component inventory API
│  │  ├─ css/
│  │  │  └─ cssRegistry.facade.ts        ← CSS management API
│  │  └─ layout/
│  │     ├─ LayoutEngine.tsx             ← Layout orchestration
│  │     └─ SlotContainer.tsx            ← Slot rendering
│  │
│  ├─ infrastructure/                    🔌 INFRASTRUCTURE LAYER
│  │  ├─ dotnet/
│  │  │  └─ apiClient.ts                 ← .NET backend bridge
│  │  ├─ cli-bridge.ts                   ← CLI WebSocket bridge
│  │  └─ handlers/
│  │     └─ handlersPath.ts              ← Module resolution
│  │
│  ├─ vendor/                            🩹 BAND-AID LAYER
│  │  ├─ vendor-symphony-loader.ts       ← Vite glob loader for symphonies
│  │  └─ vendor-control-panel.ts         ← CP CSS injector
│  │
│  ├─ core/                              ⚙️ CORE CONFIG
│  │  └─ manifests/
│  │     └─ uiEvents.json                ← Event wiring definitions
│  │
│  └─ index.tsx                          🚀 ENTRY POINT
│
├─ 📄 public/                            ← RUNTIME MANIFESTS (generated)
│  ├─ plugins/
│  │  └─ plugin-manifest.json
│  ├─ interaction-manifest.json
│  ├─ topics-manifest.json
│  ├─ layout-manifest.json
│  ├─ build-versions.json
│  └─ json-sequences/
│     ├─ canvas-component/
│     ├─ library-component/
│     ├─ control-panel/
│     ├─ header/
│     └─ library/
│
└─ 📋 orchestration-domains.json         ← DOMAIN REGISTRY (78 domains)
```

### 🔴 Problems with Current Structure

1. **Domain Boundary Confusion**
   - Runtime-only plugins (`canvas-component`, `library-component`) are in `packages/` alongside UI plugins
   - No clear "renderx-web domain" directory
   - Domain logic scattered across `src/domain/`, `packages/canvas-component/`, `packages/library-component/`

2. **Infrastructure Scattered**
   - API client in `src/infrastructure/dotnet/`
   - Symphony loader in `src/vendor/`
   - Handler path resolution in `src/infrastructure/handlers/`
   - CLI bridge in root of `src/infrastructure/`

3. **UI Separation**
   - UI components in `src/ui/` are disconnected from their business logic
   - Canvas UI in `packages/canvas/` but canvas business logic in `packages/canvas-component/`
   - Layout engine in `src/domain/layout/` but rendered by `src/ui/App/`

4. **Vendor Band-Aids**
   - `src/vendor/vendor-symphony-loader.ts` exists only to work around Vite import resolution
   - Should be part of host-sdk or domain infrastructure

5. **No Domain Cohesion**
   - Files related to "renderx-web" are spread across 4+ top-level directories
   - Impossible to understand the domain boundary by looking at file structure
   - New developers cannot identify what belongs to the renderx-web domain

---

## Proposed Reorganized Structure

```
renderx-plugins-demo/
│
├─ 📦 packages/                          ← CORE PACKAGES ONLY
│  │
│  ├─ host-sdk/                          🔧 CORE SDK
│  │  ├─ src/
│  │  │  └─ core/
│  │  │     ├─ conductor/
│  │  │     │  ├─ conductor.ts
│  │  │     │  └─ sequence-registration.ts
│  │  │     ├─ manifests/
│  │  │     │  ├─ interactionManifest.ts
│  │  │     │  ├─ topicsManifest.ts
│  │  │     │  └─ symphony-loader.ts     ← MOVED from src/vendor/
│  │  │     ├─ events/
│  │  │     │  └─ EventRouter.ts
│  │  │     ├─ environment/
│  │  │     │  ├─ feature-flags.ts
│  │  │     │  └─ config.ts
│  │  │     └─ startup/
│  │  │        └─ startupValidation.ts
│  │  └─ package.json
│  │
│  ├─ musical-conductor/                 🔧 CORE ENGINE
│  │  └─ (Orchestration engine)
│  │
│  ├─ components/                        🎨 SHARED UI LIBRARY
│  │  └─ (Reusable React components)
│  │
│  └─ manifest-tools/                    🔧 TOOLING
│     └─ (Manifest generation utilities)
│
├─ 🌐 domains/                           ← NEW: DOMAIN-DRIVEN ORGANIZATION
│  │
│  └─ renderx-web/                       🎯 RENDERX-WEB DOMAIN
│     │
│     ├─ 📋 domain.json                  ← Domain manifest
│     │   {
│     │     "id": "renderx-web-orchestration",
│     │     "name": "RenderX Web Domain",
│     │     "version": "1.0.0",
│     │     "plugins": [
│     │       "canvas-component",
│     │       "library-component",
│     │       "control-panel",
│     │       "header",
│     │       "library",
│     │       "canvas"
│     │     ],
│     │     "sequences": 43,
│     │     "entryPoint": "./src/index.tsx"
│     │   }
│     │
│     ├─ 🔧 runtime/                     ← RUNTIME PLUGINS (Business Logic)
│     │  │
│     │  ├─ canvas-component/            ⭐ MOVED from packages/
│     │  │  ├─ src/
│     │  │  │  ├─ handlers/
│     │  │  │  │  ├─ create.handler.ts
│     │  │  │  │  ├─ select.handler.ts
│     │  │  │  │  ├─ drag.handler.ts
│     │  │  │  │  ├─ resize.handler.ts
│     │  │  │  │  ├─ export.handler.ts
│     │  │  │  │  └─ ... (33 total handlers)
│     │  │  │  ├─ services/
│     │  │  │  │  ├─ canvas-state.service.ts
│     │  │  │  │  └─ component-registry.service.ts
│     │  │  │  └─ index.ts              ← register(conductor)
│     │  │  ├─ sequences/               ← RENAMED from json-sequences/
│     │  │  │  ├─ index.json            ← Catalog
│     │  │  │  ├─ create.json
│     │  │  │  ├─ select.json
│     │  │  │  └─ ... (33 sequences)
│     │  │  ├─ __tests__/
│     │  │  └─ package.json
│     │  │
│     │  └─ library-component/           ⭐ MOVED from packages/
│     │     ├─ src/
│     │     │  ├─ handlers/
│     │     │  │  ├─ drag.handler.ts
│     │     │  │  ├─ drop.handler.ts
│     │     │  │  └─ container-drop.handler.ts
│     │     │  ├─ services/
│     │     │  └─ index.ts
│     │     ├─ sequences/
│     │     │  ├─ index.json
│     │     │  ├─ drag.json
│     │     │  ├─ drop.json
│     │     │  └─ container.drop.json
│     │     ├─ __tests__/
│     │     └─ package.json
│     │
│     ├─ 🎨 ui-plugins/                  ← UI + RUNTIME PLUGINS
│     │  │
│     │  ├─ control-panel/               🔄 MOVED from packages/
│     │  │  ├─ src/
│     │  │  │  ├─ components/
│     │  │  │  │  └─ ControlPanel.tsx
│     │  │  │  ├─ symphonies/
│     │  │  │  │  ├─ selection/
│     │  │  │  │  ├─ classes/
│     │  │  │  │  ├─ css-management/
│     │  │  │  │  └─ ui/
│     │  │  │  └─ index.ts
│     │  │  ├─ sequences/
│     │  │  │  ├─ index.json
│     │  │  │  ├─ selection.show.json
│     │  │  │  └─ ... (13 sequences)
│     │  │  ├─ __tests__/
│     │  │  └─ package.json
│     │  │
│     │  ├─ header/                      🔄 MOVED from packages/
│     │  │  ├─ src/
│     │  │  │  ├─ components/
│     │  │  │  │  ├─ HeaderTitle.tsx
│     │  │  │  │  ├─ HeaderControls.tsx
│     │  │  │  │  └─ HeaderThemeToggle.tsx
│     │  │  │  └─ index.ts
│     │  │  ├─ sequences/
│     │  │  ├─ __tests__/
│     │  │  └─ package.json
│     │  │
│     │  ├─ library/                     🔄 MOVED from packages/
│     │  │  ├─ src/
│     │  │  │  ├─ components/
│     │  │  │  │  └─ LibraryPanel.tsx
│     │  │  │  └─ index.ts
│     │  │  ├─ sequences/
│     │  │  ├─ __tests__/
│     │  │  └─ package.json
│     │  │
│     │  └─ canvas/                      🔄 MOVED from packages/
│     │     ├─ src/
│     │     │  ├─ components/
│     │     │  │  └─ CanvasPage.tsx
│     │     │  └─ index.ts
│     │     ├─ __tests__/
│     │     └─ package.json
│     │
│     ├─ 📂 src/                         ← DOMAIN SOURCE
│     │  │
│     │  ├─ ui/                          🎨 UI LAYER (Host app UI)
│     │  │  ├─ App/
│     │  │  │  └─ App.tsx
│     │  │  ├─ shared/
│     │  │  │  ├─ PanelSlot.tsx
│     │  │  │  └─ SlotContainer.tsx     ← MOVED from domain/layout/
│     │  │  ├─ layout/
│     │  │  │  └─ LayoutEngine.tsx      ← MOVED from domain/layout/
│     │  │  ├─ events/
│     │  │  │  └─ wiring.ts
│     │  │  └─ diagnostics/
│     │  │     ├─ DiagnosticsOverlay.tsx
│     │  │     ├─ DiagnosticsPanel.tsx
│     │  │     └─ services/
│     │  │
│     │  ├─ services/                    📊 DOMAIN SERVICES
│     │  │  ├─ inventory/
│     │  │  │  └─ inventory.service.ts  ← MOVED from domain/components/inventory/
│     │  │  ├─ css/
│     │  │  │  └─ cssRegistry.service.ts ← MOVED from domain/css/
│     │  │  └─ layout/
│     │  │     └─ layoutManifest.service.ts
│     │  │
│     │  ├─ infrastructure/              🔌 INFRASTRUCTURE
│     │  │  ├─ dotnet/
│     │  │  │  └─ apiClient.ts          ← MOVED from src/infrastructure/
│     │  │  ├─ cli/
│     │  │  │  └─ cli-bridge.ts         ← MOVED from src/infrastructure/
│     │  │  └─ module-resolution/
│     │  │     └─ handlersPath.ts       ← MOVED from src/infrastructure/handlers/
│     │  │
│     │  ├─ config/                      ⚙️ CONFIGURATION
│     │  │  └─ uiEvents.json            ← MOVED from src/core/manifests/
│     │  │
│     │  └─ index.tsx                    🚀 ENTRY POINT
│     │
│     ├─ 📄 public/                      ← DOMAIN PUBLIC ASSETS
│     │  ├─ plugins/
│     │  │  └─ plugin-manifest.json
│     │  ├─ manifests/
│     │  │  ├─ interaction-manifest.json
│     │  │  ├─ topics-manifest.json
│     │  │  ├─ layout-manifest.json
│     │  │  └─ build-versions.json
│     │  └─ sequences/                   ← RENAMED from json-sequences/
│     │     ├─ canvas-component/
│     │     ├─ library-component/
│     │     ├─ control-panel/
│     │     ├─ header/
│     │     └─ library/
│     │
│     ├─ 📋 orchestration/               ← DOMAIN ORCHESTRATION
│     │  ├─ domains.json                 ← MOVED from root orchestration-domains.json
│     │  └─ registry/
│     │     └─ sequence-registry.json
│     │
│     ├─ 🧪 __tests__/                   ← DOMAIN TESTS
│     │  ├─ integration/
│     │  └─ e2e/
│     │
│     ├─ 📖 docs/                        ← DOMAIN DOCUMENTATION
│     │  ├─ architecture.md
│     │  ├─ sequences.md
│     │  └─ api.md
│     │
│     ├─ package.json                    ← Domain package config
│     ├─ vite.config.js                  ← Domain Vite config
│     └─ README.md                       ← Domain README
│
├─ 📂 scripts/                           ← BUILD SCRIPTS (unchanged)
│  ├─ generate-orchestration-domains-from-sequences.js
│  ├─ sync-json-sequences.js
│  └─ ... (46+ scripts)
│
├─ package.json                          ← ROOT WORKSPACE
├─ vite.config.js                        ← ROOT VITE CONFIG (if needed)
└─ README.md                             ← ROOT README
```

### ✅ Benefits of Reorganized Structure

1. **Clear Domain Boundary**
   - Everything related to renderx-web is under `domains/renderx-web/`
   - Easy to identify domain scope
   - Can extract domain to separate repo if needed

2. **Runtime vs UI Separation**
   - `runtime/` contains business logic only (no UI)
   - `ui-plugins/` contains UI + runtime combined
   - Clear distinction between orchestration and presentation

3. **Colocation of Concerns**
   - Sequences are next to their handlers (`sequences/` instead of `json-sequences/`)
   - Services are grouped under `services/`
   - Infrastructure concerns are together under `infrastructure/`

4. **No Vendor Band-Aids**
   - Symphony loader moved to host-sdk where it belongs
   - Module resolution is part of infrastructure

5. **Domain-Driven Structure**
   - Each domain is self-contained
   - Future domains (e.g., `domains/analytics/`, `domains/collaboration/`) follow same pattern
   - Supports multi-domain applications

6. **Improved Discoverability**
   - New developers can navigate to `domains/renderx-web/` and understand the entire domain
   - Tests are colocated with domain
   - Documentation is colocated with domain

---

## Migration Plan

### Phase 1: Preparation (Low Risk)

**Goal:** Set up new structure without breaking existing code

```bash
# 1. Create new domain directory structure
mkdir -p domains/renderx-web/{runtime,ui-plugins,src,public,orchestration,docs}

# 2. Create domain.json manifest
cat > domains/renderx-web/domain.json <<EOF
{
  "id": "renderx-web-orchestration",
  "name": "RenderX Web Domain",
  "version": "1.0.0",
  "description": "Core web orchestration domain for RenderX platform",
  "plugins": {
    "runtime": ["canvas-component", "library-component"],
    "ui": ["control-panel", "header", "library", "canvas"]
  },
  "sequences": 43,
  "entryPoint": "./src/index.tsx"
}
EOF

# 3. Document current state
npm run analyze:domains
```

**Deliverables:**
- [ ] `domains/renderx-web/` directory created
- [ ] `domain.json` manifest created
- [ ] Current state documented in `docs/architecture.md`

---

### Phase 2: Move Runtime Plugins (Medium Risk)

**Goal:** Relocate runtime-only plugins to domain

```bash
# Move canvas-component
mv packages/canvas-component domains/renderx-web/runtime/

# Move library-component
mv packages/library-component domains/renderx-web/runtime/

# Update package.json paths in workspace
# Edit root package.json:
# "workspaces": [
#   "packages/*",
#   "domains/renderx-web/runtime/*",
#   "domains/renderx-web/ui-plugins/*"
# ]
```

**Update imports:**
- `@renderx-plugins/canvas-component` → `@renderx-web/canvas-component`
- `@renderx-plugins/library-component` → `@renderx-web/library-component`

**Test:**
```bash
npm install
npm run build:packages
npm run dev
npm test
```

**Deliverables:**
- [ ] Runtime plugins moved to `domains/renderx-web/runtime/`
- [ ] Package names updated to `@renderx-web/*`
- [ ] All tests passing

---

### Phase 3: Move UI Plugins (Medium Risk)

**Goal:** Relocate UI plugins to domain

```bash
# Move UI plugins
mv packages/control-panel domains/renderx-web/ui-plugins/
mv packages/header domains/renderx-web/ui-plugins/
mv packages/library domains/renderx-web/ui-plugins/
mv packages/canvas domains/renderx-web/ui-plugins/
```

**Update imports:**
- `@renderx-plugins/control-panel` → `@renderx-web/control-panel`
- `@renderx-plugins/header` → `@renderx-web/header`
- `@renderx-plugins/library` → `@renderx-web/library`
- `@renderx-plugins/canvas` → `@renderx-web/canvas`

**Test:**
```bash
npm install
npm run build:packages
npm run dev
npm test
```

**Deliverables:**
- [ ] UI plugins moved to `domains/renderx-web/ui-plugins/`
- [ ] Package names updated
- [ ] All tests passing

---

### Phase 4: Consolidate SRC (Low Risk)

**Goal:** Move domain-specific src/ files to domain

```bash
# Create domain src structure
mkdir -p domains/renderx-web/src/{ui,services,infrastructure,config}

# Move UI components
mv src/ui/* domains/renderx-web/src/ui/

# Move domain services
mv src/domain/components/inventory domains/renderx-web/src/services/inventory
mv src/domain/css domains/renderx-web/src/services/css
mv src/domain/layout domains/renderx-web/src/ui/layout

# Move infrastructure
mv src/infrastructure/* domains/renderx-web/src/infrastructure/

# Move vendor (to be absorbed into host-sdk later)
mv src/vendor domains/renderx-web/src/infrastructure/vendor

# Move core config
mv src/core/manifests domains/renderx-web/src/config/

# Move entry point
mv src/index.tsx domains/renderx-web/src/index.tsx
mv src/global.css domains/renderx-web/src/global.css
```

**Update vite.config.js:**
```javascript
// Point to new entry point
export default {
  root: 'domains/renderx-web',
  // ... rest of config
}
```

**Test:**
```bash
npm run dev
npm test
```

**Deliverables:**
- [ ] All src files moved to domain
- [ ] Vite config updated
- [ ] Dev server works
- [ ] All tests passing

---

### Phase 5: Move Public Assets (Low Risk)

**Goal:** Move runtime manifests to domain

```bash
# Move public assets
mv public/* domains/renderx-web/public/

# Rename json-sequences to sequences
mv domains/renderx-web/public/json-sequences domains/renderx-web/public/sequences

# Create manifests subdirectory
mkdir -p domains/renderx-web/public/manifests
mv domains/renderx-web/public/interaction-manifest.json domains/renderx-web/public/manifests/
mv domains/renderx-web/public/topics-manifest.json domains/renderx-web/public/manifests/
mv domains/renderx-web/public/layout-manifest.json domains/renderx-web/public/manifests/
mv domains/renderx-web/public/build-versions.json domains/renderx-web/public/manifests/
```

**Update scripts:**
- Update all `sync-*.js` scripts to output to `domains/renderx-web/public/`

**Test:**
```bash
npm run pre:manifests
npm run dev
```

**Deliverables:**
- [ ] Public assets moved
- [ ] Scripts updated
- [ ] Manifests generated correctly

---

### Phase 6: Move Orchestration Registry (Low Risk)

**Goal:** Move orchestration-domains.json to domain

```bash
# Move orchestration config
mkdir -p domains/renderx-web/orchestration
mv orchestration-domains.json domains/renderx-web/orchestration/domains.json

# Update scripts that reference orchestration-domains.json
# to use domains/renderx-web/orchestration/domains.json
```

**Test:**
```bash
npm run regenerate:ographx
npm run pre:manifests
```

**Deliverables:**
- [ ] Orchestration config moved
- [ ] Scripts updated
- [ ] Orchestration generation works

---

### Phase 7: Update Host SDK (Medium Risk)

**Goal:** Move vendor-symphony-loader to host-sdk

```bash
# Move symphony loader to host-sdk
mv domains/renderx-web/src/infrastructure/vendor/vendor-symphony-loader.ts \
   packages/host-sdk/src/core/manifests/symphony-loader.ts

# Update host-sdk exports
# Edit packages/host-sdk/src/index.ts to export symphony-loader
```

**Update imports:**
- `../../vendor/vendor-symphony-loader` → `@renderx-plugins/host-sdk/core/manifests/symphony-loader`

**Test:**
```bash
npm run build -w packages/host-sdk
npm run dev
npm test
```

**Deliverables:**
- [ ] Symphony loader in host-sdk
- [ ] Vendor directory removed
- [ ] All imports updated

---

### Phase 8: Update Documentation (Low Risk)

**Goal:** Document new structure

```bash
# Create domain docs
cat > domains/renderx-web/docs/architecture.md
cat > domains/renderx-web/docs/sequences.md
cat > domains/renderx-web/docs/api.md

# Update root README
cat > domains/renderx-web/README.md
```

**Deliverables:**
- [ ] Architecture docs created
- [ ] API docs created
- [ ] Sequence catalog documented
- [ ] README updated

---

### Phase 9: Cleanup & Validation (Low Risk)

**Goal:** Remove old structure, validate everything works

```bash
# Remove old empty directories
rm -rf src/
rm -rf public/

# Validate structure
npm run validate:domains
npm run analyze:domains

# Run full test suite
npm test
npm run e2e

# Build for production
npm run build
npm run preview
```

**Deliverables:**
- [ ] Old directories removed
- [ ] All tests passing
- [ ] Production build works
- [ ] E2E tests passing

---

### Phase 10: Update CI/CD (Low Risk)

**Goal:** Update build pipelines

**Update GitHub Actions / CI scripts:**
- Update paths to point to `domains/renderx-web/`
- Update build commands
- Update deployment scripts

**Deliverables:**
- [ ] CI/CD updated
- [ ] Deployment scripts updated
- [ ] CI builds passing

---

## Build Pipeline

### Current Build Flow

```
npm run dev
  ↓
npm run pre:manifests (46 scripts)
  ↓
├─ regenerate:ographx
├─ generate-orchestration-domains-from-sequences.js
├─ sync-json-sources.js --srcRoot=catalog
├─ sync-json-components.js --srcRoot=catalog
├─ sync-json-sequences.js --srcRoot=catalog
├─ generate-interaction-manifest.js
├─ generate-topics-manifest.js
├─ generate-layout-manifest.js
├─ aggregate-plugins.js
├─ sync-plugins.js
└─ verify:process:symphonic
  ↓
vite (dev server on :5173)
```

### Proposed Build Flow

```
npm run dev
  ↓
npm run pre:manifests (simplified)
  ↓
├─ domains/renderx-web/scripts/generate-domains.js
├─ domains/renderx-web/scripts/sync-sequences.js
├─ domains/renderx-web/scripts/generate-manifests.js
└─ domains/renderx-web/scripts/verify-domain.js
  ↓
vite --config domains/renderx-web/vite.config.js
```

**Benefits:**
- Domain-specific build scripts
- Faster builds (domain-scoped)
- Parallel domain builds possible
- Clear separation of concerns

---

## Orchestration Domains

### Current Registry Structure

**Location:** `orchestration-domains.json` (root)
**Total Domains:** 78
**RenderX-Web Sequences:** 43

**Issues:**
- Mixed with other orchestration domains
- No clear domain ownership
- Single monolithic file

### Proposed Registry Structure

**Location:** `domains/renderx-web/orchestration/domains.json`
**Scope:** RenderX-Web domain only (43 sequences)

**Structure:**
```json
{
  "domain": {
    "id": "renderx-web-orchestration",
    "name": "RenderX Web Domain",
    "version": "1.0.0"
  },
  "sequences": {
    "canvas-component": 24,
    "control-panel": 13,
    "library-component": 3,
    "library": 1,
    "header": 2
  },
  "plugins": [
    {
      "id": "canvas-component",
      "type": "runtime",
      "sequences": 24,
      "catalog": "./runtime/canvas-component/sequences/index.json"
    },
    {
      "id": "library-component",
      "type": "runtime",
      "sequences": 3,
      "catalog": "./runtime/library-component/sequences/index.json"
    },
    {
      "id": "control-panel",
      "type": "ui",
      "sequences": 13,
      "catalog": "./ui-plugins/control-panel/sequences/index.json"
    },
    {
      "id": "header",
      "type": "ui",
      "sequences": 2,
      "catalog": "./ui-plugins/header/sequences/index.json"
    },
    {
      "id": "library",
      "type": "ui",
      "sequences": 1,
      "catalog": "./ui-plugins/library/sequences/index.json"
    }
  ]
}
```

---

## Summary

### Current State (Scattered)
- ❌ 8 plugins spread across `packages/`
- ❌ Domain logic in 4+ top-level directories
- ❌ No clear domain boundary
- ❌ Infrastructure concerns scattered
- ❌ Vendor band-aids for import resolution

### Future State (Organized)
- ✅ All domain code under `domains/renderx-web/`
- ✅ Clear runtime vs UI separation
- ✅ Colocation of related concerns
- ✅ Domain-driven structure
- ✅ Self-contained and extractable
- ✅ Supports multi-domain applications

### Migration Effort
- **Total Phases:** 10
- **Estimated Time:** 2-3 days (with testing)
- **Risk Level:** Medium (careful import updates required)
- **Rollback Plan:** Git revert + workspace path updates

### Success Metrics
- [ ] All code under `domains/renderx-web/`
- [ ] Zero files in old `src/` directory
- [ ] All tests passing
- [ ] Dev server works
- [ ] Production build works
- [ ] E2E tests passing
- [ ] CI/CD pipeline updated
- [ ] Documentation complete

---

**End of Document**
