# RenderX Web Domain

**Version:** 1.0.0
**Status:** Proposed (Pending Migration)
**Domain ID:** `renderx-web-orchestration`

---

## Overview

The RenderX Web Domain is a plugin-based orchestration system that provides core web UI functionality for the RenderX platform. It uses the Musical Conductor library for sequence-based orchestration and employs a slot-based UI composition pattern.

### Key Capabilities

- **Canvas Operations:** Component creation, selection, drag-and-drop, resize, import/export
- **Component Library:** Draggable component catalog with search and filtering
- **Property Editing:** Dynamic property panel with CSS management
- **Theme Management:** Light/dark mode switching
- **Event Orchestration:** 43 sequences across 6 plugins

---

## Domain Structure

This domain follows a **domain-driven directory structure** where all related code, plugins, services, and configurations are colocated under `domains/renderx-web/`.

```
domains/renderx-web/
├── runtime/              # Runtime-only plugins (business logic)
│   ├── canvas-component/
│   └── library-component/
├── ui-plugins/           # UI + Runtime plugins
│   ├── control-panel/
│   ├── header/
│   ├── library/
│   └── canvas/
├── src/                  # Domain source code
│   ├── ui/               # UI layer
│   ├── services/         # Domain services
│   ├── infrastructure/   # Infrastructure (bridges, clients)
│   ├── config/           # Configuration files
│   └── index.tsx         # Entry point
├── public/               # Public assets & manifests
├── orchestration/        # Orchestration registry
├── __tests__/           # Domain tests
├── docs/                # Documentation
├── domain-registry.json # Domain metadata registry
└── README.md            # This file
```

---

## Plugins

### Runtime-Only Plugins

These plugins provide business logic without UI components:

#### 📦 canvas-component (33 sequences)

**Package:** `@renderx-web/canvas-component`
**Location:** `./runtime/canvas-component`

Business logic for canvas operations:
- Component lifecycle (create, delete, update, augment)
- Selection management (select, deselect, multi-select)
- Drag-and-drop operations
- Resize and transformation
- Import/export (JSON, GIF, MP4)
- SVG node manipulation
- Clipboard (copy, paste)
- Line manipulation
- Rules and configuration

#### 📦 library-component (3 sequences)

**Package:** `@renderx-web/library-component`
**Location:** `./runtime/library-component`

Business logic for library operations:
- Library item drag initiation
- Canvas drop handling
- Container-specific drop logic

---

### UI Plugins

These plugins provide both UI components and runtime logic:

#### 🎨 control-panel (13 sequences)

**Package:** `@renderx-web/control-panel`
**Location:** `./ui-plugins/control-panel`
**Slot:** `controlPanel`

Property editor panel with:
- Component property editing
- CSS class management
- CSS rule creation and editing
- Field validation
- Section toggling

#### 🎨 header (2 sequences)

**Package:** `@renderx-web/header`
**Location:** `./ui-plugins/header`
**Slots:** `headerLeft`, `headerCenter`, `headerRight`

Navigation header with:
- Application title
- Header controls
- Theme toggle (light/dark mode)

#### 🎨 library (1 sequence)

**Package:** `@renderx-web/library`
**Location:** `./ui-plugins/library`
**Slot:** `library`

Component library panel with:
- Component catalog display
- Search and filtering
- Drag-and-drop initiation

#### 🎨 canvas (0 sequences)

**Package:** `@renderx-web/canvas`
**Location:** `./ui-plugins/canvas`
**Slot:** `canvas`

Canvas rendering surface:
- Workspace display
- Component rendering
- Canvas-level interactions
- Delegates business logic to `canvas-component`

---

## Domain Services

### InventoryService
**Location:** `./src/services/inventory/inventory.service.ts`
**Global API:** `window.RenderX.inventory`

Component metadata management:
- `listComponents()` - Get all components
- `getComponentById(id)` - Get component by ID
- `onInventoryChanged(callback)` - Subscribe to changes

### CssRegistryService
**Location:** `./src/services/css/cssRegistry.service.ts`
**Global API:** `window.RenderX.cssRegistry`

CSS class registry:
- `hasClass(className)` - Check class existence
- `createClass(className, rules)` - Create new class
- `updateClass(className, rules)` - Update class rules

### LayoutManifestService
**Location:** `./src/services/layout/layoutManifest.service.ts`

Layout manifest loading and validation:
- `loadLayoutManifest()` - Load layout configuration
- `validateLayoutManifest(manifest)` - Validate manifest structure

---

## Infrastructure

### Bridges

#### DotNetApiClient
**Location:** `./src/infrastructure/dotnet/apiClient.ts`
**Type:** HTTP Bridge
**Target:** ASP.NET Core Backend (localhost:5000)

Endpoints:
- `POST /api/telemetry/event` - Record telemetry event
- `POST /api/telemetry/batch` - Batch telemetry recording
- `GET /api/plugins` - List available plugins
- `POST /api/plugins/{id}/enable` - Enable plugin
- `POST /api/plugins/{id}/disable` - Disable plugin
- `POST /api/sequences/execute` - Execute sequence

#### CliBridge
**Location:** `./src/infrastructure/cli/cli-bridge.ts`
**Type:** WebSocket Bridge
**Target:** CLI Development Tools
**Active:** Dev mode only

WebSocket bridge for CLI interaction via Vite HMR.

#### DotNetMessageBridge
**Location:** `./src/index.tsx`
**Type:** Message Bridge

Bidirectional message channels:
- `window.postMessage` (source: dotnet-host)
- `chrome.webview` (WebView2 integration)

---

## Architecture

### Pattern
**Plugin-based Orchestration** with event-driven pub/sub communication

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    Entry Point                          │
│                   (src/index.tsx)                       │
└─────────────────────────────────────────────────────────┘
                         ↓
    ┌────────────────────┴────────────────────┐
    ↓                                         ↓
┌─────────────────┐                  ┌─────────────────┐
│ Conductor Init  │                  │  Manifest Load  │
│ (host-sdk)      │                  │  (manifests)    │
└─────────────────┘                  └─────────────────┘
    ↓                                         ↓
┌─────────────────────────────────────────────────────────┐
│           Plugin Registration & Sequence Mounting       │
│  • canvas-component (33 seq)  • control-panel (13 seq)  │
│  • library-component (3 seq)  • header (2 seq)          │
│  • library (1 seq)             • canvas (0 seq)         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   Global API Setup                      │
│         window.RenderX = { conductor, EventRouter,      │
│         featureFlags, inventory, cssRegistry, ... }     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   React App Mount                       │
│                    <App />                              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              Slot-Based UI Composition                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐          │
│  │ Library  │  │  Canvas  │  │ ControlPanel │          │
│  │  Slot    │  │   Slot   │  │    Slot      │          │
│  └──────────┘  └──────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│         User Interaction → Sequence Execution           │
│              Conductor.play(plugin, seq, payload)       │
└─────────────────────────────────────────────────────────┘
```

### Communication Flow

```
User Action (e.g., drag component)
        ↓
DOM Event → wireUiEvents
        ↓
EventRouter.publish(topic, payload)
        ↓
    ┌───┴───┐
    ↓       ↓
Conductor   .NET Backend (telemetry)
    ↓
Symphony Handler Execution
    ↓
EventRouter.publish(result)
    ↓
UI Update
```

---

## Sequences

**Total Sequences:** 43

### By Plugin

| Plugin | Sequences | Examples |
|--------|-----------|----------|
| canvas-component | 24 | create, select, drag, resize, export |
| control-panel | 13 | selection.show, css.create, ui.render |
| library-component | 3 | drag, drop, container.drop |
| library | 1 | library-load |
| header | 2 | ui.theme.get, ui.theme.toggle |
| canvas | 0 | (UI only) |

See [sequences.md](./docs/sequences.md) for detailed sequence documentation.

---

## Global APIs

All domain APIs are exposed under `window.RenderX`:

### Conductor
```javascript
window.RenderX.conductor.play(pluginId, sequenceId, payload)
```

### EventRouter (Bridged with Telemetry)
```javascript
window.RenderX.EventRouter.publish(topic, payload)
window.RenderX.EventRouter.subscribe(topic, handler)
```

### Feature Flags
```javascript
window.RenderX.featureFlags.isFlagEnabled('feature-name')
window.RenderX.featureFlags.getFlagMeta('feature-name')
window.RenderX.featureFlags.getAllFlags()
```

### Component Inventory
```javascript
window.RenderX.inventory.listComponents()
window.RenderX.inventory.getComponentById(id)
window.RenderX.inventory.onInventoryChanged(callback)
```

### CSS Registry
```javascript
window.RenderX.cssRegistry.hasClass(className)
window.RenderX.cssRegistry.createClass(className, rules)
window.RenderX.cssRegistry.updateClass(className, rules)
```

### Plugin Management
```javascript
window.RenderX.plugins.list()
window.RenderX.plugins.enable(pluginId)
window.RenderX.plugins.disable(pluginId)
```

### Diagnostics
```javascript
window.RenderX.diagnostics.enable()
window.RenderX.diagnostics.disable()
window.RenderX.diagnostics.isEnabled()
window.RenderX.diagnostics.emitDiagnostic(event)
window.RenderX.diagnostics.addListener(handler)
```

---

## Development

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Setup

```bash
# Install dependencies
npm install

# Build packages
npm run build:packages

# Start dev server
npm run dev
```

### Dev Server

The dev server runs on `http://localhost:5173` with:
- Hot Module Replacement (HMR)
- Source maps
- Diagnostics overlay (Ctrl+Shift+D)

### Build

```bash
# Build all packages
npm run build:packages

# Build host application
npm run build:host

# Build everything
npm run build:all
```

---

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### E2E Tests

```bash
# Run Cypress tests
npm run e2e:cypress

# Open Cypress UI
npm run cy:open
```

### Test Structure

```
__tests__/
├── unit/                # Unit tests
├── integration/         # Integration tests
└── e2e/                 # End-to-end tests
```

Plugin-specific tests are colocated:
```
runtime/canvas-component/__tests__/
ui-plugins/control-panel/__tests__/
```

---

## Manifests

Runtime manifests are generated during the build process:

### Plugin Manifest
**Location:** `./public/plugins/plugin-manifest.json`
**Generated by:** `sync-plugins.js`

Defines all plugins, their UI slots, and runtime modules.

### Interaction Manifest
**Location:** `./public/manifests/interaction-manifest.json`
**Generated by:** `generate-interaction-manifest.js`

Route definitions for interaction handling.

### Topics Manifest
**Location:** `./public/manifests/topics-manifest.json`
**Generated by:** `generate-topics-manifest.js`

Pub/sub topic definitions for EventRouter.

### Layout Manifest
**Location:** `./public/manifests/layout-manifest.json`
**Generated by:** `generate-layout-manifest.js`

UI layout configuration (responsive grid).

### Sequence Catalogs
**Location:** `./public/sequences/{plugin}/index.json`
**Generated by:** `sync-json-sequences.js`

Sequence catalogs for each plugin.

---

## Domain Registry

The domain metadata is defined in `domain-registry.json`, which includes:

- Domain metadata and version
- Plugin definitions (runtime & UI)
- Sequence counts and catalogs
- Service definitions
- Infrastructure bridges
- Global API exposures
- Build pipeline configuration
- Testing configuration
- Documentation references

See [domain-registry.json](./domain-registry.json) for the complete registry.

---

## Migration Status

**Current State:** Scattered across multiple directories
**Target State:** Domain-organized under `domains/renderx-web/`
**Phase:** Proposed

### Migration Plan

See [RENDERX_WEB_DOMAIN_ARCHITECTURE.md](../../RENDERX_WEB_DOMAIN_ARCHITECTURE.md) for the complete migration plan.

**10 Phases:**
1. ✅ Preparation - Create directory structure
2. ⏳ Move Runtime Plugins - Relocate canvas-component, library-component
3. ⏳ Move UI Plugins - Relocate control-panel, header, library, canvas
4. ⏳ Consolidate SRC - Move domain src/ files
5. ⏳ Move Public Assets - Relocate manifests
6. ⏳ Move Orchestration Registry - Relocate domains.json
7. ⏳ Update Host SDK - Move symphony loader
8. ⏳ Update Documentation - Create domain docs
9. ⏳ Cleanup & Validation - Remove old structure
10. ⏳ Update CI/CD - Update pipelines

**Readiness Checklist:**
- [x] Domain registry created
- [ ] Directory structure created
- [ ] Plugins migrated
- [ ] Sources migrated
- [ ] Manifests migrated
- [ ] Documentation migrated

---

## Documentation

- [Architecture](./docs/architecture.md) - Detailed architecture documentation
- [Sequences](./docs/sequences.md) - Sequence catalog and usage
- [API Reference](./docs/api.md) - API documentation
- [Migration Guide](../../RENDERX_WEB_DOMAIN_ARCHITECTURE.md) - Migration plan

---

## License

Copyright © 2025 RenderX Platform Team. All rights reserved.

---

## Support

For questions or issues, contact the RenderX Platform Team or create an issue in the project repository.
