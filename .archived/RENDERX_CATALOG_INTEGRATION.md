# RenderX Catalog Integration at Runtime

## Overview
The RenderX Catalog is the **single source of truth** for all runtime behavior. It's loaded at startup and drives the entire application through JSON-defined sequences and manifests.

## Build-Time Analysis: Catalog-First Approach

### Why Catalog-First?
The catalog (JSON files) is the **single source of truth** for RenderX behavior. OgraphX should analyze the catalog FIRST to understand the intended behavior, then validate that source code implements it correctly.

**Catalog is authoritative because**:
- Defines what SHOULD happen (intended sequences)
- Defines what SHOULD be published (topics)
- Defines what plugins SHOULD exist (manifests)
- Is human-readable and maintainable
- Is the contract between architecture and implementation

**Source code is secondary because**:
- Implements the catalog's intent
- Can have bugs or missing implementations
- Should be validated against catalog
- Is the "how" not the "what"

### Analysis Order
1. **First**: Analyze catalog (json-sequences, json-topics, plugin-manifest)
2. **Second**: Analyze source code (handlers, exports, implementations)
3. **Third**: Compare catalog vs source to find gaps
4. **Fourth**: Generate reports and enhanced artifacts

## 3-Phase Runtime Integration

### Phase 1: Startup & Initialization
**What Happens**:
1. Application starts (React app or Avalonia desktop)
2. Loads `plugin-manifest.json` from `public/artifacts/` (derived from catalog)
3. Discovers all registered plugins
4. Initializes Musical Conductor with manifests

**Key Files Loaded**:
- `plugin-manifest.json` - Plugin registry (from catalog)
- `interaction-manifest.json` - User interaction mappings (from catalog)
- `topics.json` - Pub/sub topic definitions (from catalog)
- `layout.json` - UI layout structure (from catalog)

**Result**: Application knows about all plugins and their capabilities

### Phase 2: User Interaction
**What Happens**:
1. User performs action (click, drag, type, etc.)
2. UI emits event (e.g., `canvas.component.create`)
3. Event router looks up sequence in `interaction-manifest.json`
4. Finds corresponding symphony in `catalog/json-sequences/`
5. Musical Conductor loads and plays the symphony

**Example Flow**:
```
User clicks "Add Component"
    ↓
UI emits: canvas.component.create
    ↓
interaction-manifest.json maps to: CanvasComponentPlugin.createComponent
    ↓
Loads symphony: catalog/json-sequences/canvas-component/create.json
    ↓
Musical Conductor executes beats in sequence
    ↓
Component appears on canvas
```

**Key Files Used**:
- `interaction-manifest.json` - Maps events to sequences
- `catalog/json-sequences/` - Actual symphony definitions
- `plugin-manifest.json` - Handler implementations

**Result**: User action triggers orchestrated sequence

### Phase 3: Sequence Execution
**What Happens**:
1. Symphony is loaded from catalog
2. Each beat is executed in order
3. Handlers are called from plugin implementations
4. Events are published to topics
5. Other plugins subscribe and react
6. Sequence completes

**Example Symphony Structure**:
```json
{
  "name": "create-component",
  "movements": [
    {
      "name": "validation",
      "beats": [
        {
          "event": "canvas:component:validate",
          "handler": "validateComponentData",
          "kind": "stage-crew"
        }
      ]
    },
    {
      "name": "creation",
      "beats": [
        {
          "event": "canvas:component:create",
          "handler": "createComponent",
          "kind": "stage-crew"
        },
        {
          "event": "canvas:component:created",
          "kind": "publish"
        }
      ]
    }
  ]
}
```

**Key Files Used**:
- `catalog/json-sequences/` - Symphony definitions
- `catalog/json-topics/` - Topic definitions
- Plugin handlers (TypeScript/C#)

**Result**: Orchestrated behavior executed

## Catalog Directory Structure

```
catalog/
├── json-sequences/          # Symphonies (orchestrated sequences)
│   ├── canvas-component/
│   ├── control-panel/
│   ├── library/
│   └── ...
├── json-topics/             # Topic definitions
│   ├── canvas.json
│   ├── control-panel.json
│   └── ...
├── json-plugins/
│   └── plugin-manifest.json # Master plugin registry
└── json-interactions/       # User interaction mappings
    └── interaction-manifest.json
```

## Runtime Data Flow

```
User Action
    ↓
Event Emitted (e.g., canvas.component.create)
    ↓
interaction-manifest.json lookup
    ↓
Find sequence: CanvasComponentPlugin.createComponent
    ↓
Load symphony: catalog/json-sequences/canvas-component/create.json
    ↓
Musical Conductor plays symphony
    ↓
For each beat:
  - Call handler from plugin
  - Publish events to topics
  - Other plugins subscribe and react
    ↓
Sequence completes
    ↓
UI updates reflect changes
```

## Key Principles

### 1. Manifest-Driven
- All plugins registered in `plugin-manifest.json`
- All interactions mapped in `interaction-manifest.json`
- No hardcoded plugin loading or routing

### 2. JSON-Centric
- Sequences defined in JSON (not code)
- Topics defined in JSON
- Interactions defined in JSON
- Configuration is data, not code

### 3. Single Source of Truth
- `catalog/` is authoritative
- Generated artifacts are derived from catalog
- Changes to catalog flow through build pipeline

### 4. Decoupled Plugins
- Plugins communicate via topics (pub/sub)
- No direct plugin-to-plugin dependencies
- New plugins can be added without modifying existing code

### 5. Orchestrated Execution
- Musical Conductor plays symphonies
- Beats execute in defined order
- Timing and sequencing guaranteed

## Integration Points

### Web Application (React)
- Loads manifests from `public/artifacts/`
- Uses EventBus for pub/sub
- Calls plugin handlers via HostSDK
- Updates UI based on sequence results

### Desktop Application (Avalonia)
- Loads manifests from embedded resources
- Uses MusicalConductor for orchestration
- Calls plugin handlers via native DLLs
- Updates UI via Avalonia controls

## Build Pipeline Integration

```
Source Code (catalog/)
    ↓
Build Pipeline (npm run pre:manifests)
    ↓
Generated Artifacts (.ographx/artifacts/)
    ↓
Copied to Public (public/artifacts/)
    ↓
Loaded at Runtime
    ↓
Application Behavior
```

## Validation & Guardrails

**Build-Time**:
- Manifest schema validation
- Handler existence checks
- Topic definition validation
- Sequence syntax validation

**Runtime**:
- Handler not found → Error logged
- Topic not found → Warning logged
- Sequence execution failure → Caught and reported
- Event routing failure → Fallback behavior

## Performance Characteristics

- **Startup**: ~500ms to load all manifests
- **Event Routing**: <1ms to lookup sequence
- **Sequence Execution**: Depends on handlers (typically 10-100ms)
- **Memory**: ~2-5MB for all manifests and sequences

## Extensibility

**Adding New Plugin**:
1. Create plugin package
2. Add to `plugin-manifest.json`
3. Define sequences in `catalog/json-sequences/`
4. Define topics in `catalog/json-topics/`
5. Map interactions in `interaction-manifest.json`
6. Run build pipeline
7. Plugin automatically loaded at runtime

**No code changes needed in host application!**

