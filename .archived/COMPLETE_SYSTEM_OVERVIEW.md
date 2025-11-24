# RenderX Complete System Overview

## Project Structure

```
renderx-plugins-demo/
├── catalog/                          ← SOURCE OF TRUTH
│   ├── json-sequences/               ← Symphonies (orchestrated sequences)
│   ├── json-topics/                  ← Topic definitions
│   ├── json-plugins/
│   │   └── plugin-manifest.json      ← Master plugin registry
│   └── json-interactions/
│       └── interaction-manifest.json ← Event-to-sequence mappings
│
├── packages/                         ← PLUGINS & LIBRARIES
│   ├── musical-conductor/            ← Orchestration engine
│   │   ├── modules/
│   │   │   ├── communication/        ← EventBus, sequences, topics
│   │   │   ├── execution/            ← Sequence executor
│   │   │   └── monitoring/           ← Statistics, metrics
│   │   └── tools/cli/                ← Conductor CLI tools
│   │
│   ├── canvas-component/             ← Canvas plugin
│   │   ├── src/symphonies/           ← Stage-crew handlers
│   │   └── __tests__/                ← Tests
│   │
│   ├── control-panel/                ← Control panel plugin
│   │   ├── src/components/           ← React components
│   │   ├── src/symphonies/           ← Stage-crew handlers
│   │   └── __tests__/                ← Tests
│   │
│   ├── library/                      ← Library plugin
│   │   ├── src/components/           ← React components
│   │   └── src/symphonies/           ← Stage-crew handlers
│   │
│   ├── real-estate-analyzer/         ← Real estate plugin
│   │   ├── src/services/             ← Business logic
│   │   ├── src/ui/                   ← React UI
│   │   └── __tests__/                ← Tests
│   │
│   ├── ographx/                      ← Build pipeline
│   │   ├── generators/               ← Python generators
│   │   └── .ographx/artifacts/       ← Generated artifacts
│   │
│   └── ...other packages...
│
├── src/                              ← DESKTOP (Avalonia)
│   ├── MusicalConductor.Avalonia/    ← Desktop shell
│   ├── RenderX.Plugins.*/            ← Desktop plugins
│   └── ...
│
├── public/                           ← RUNTIME ARTIFACTS
│   └── artifacts/                    ← Copied from .ographx/artifacts/
│       ├── plugin-manifest.json
│       ├── interaction-manifest.json
│       ├── topics.json
│       ├── sequences/
│       ├── diagrams/
│       └── analysis/
│
├── docs/                             ← DOCUMENTATION
│   ├── adr/                          ← Architecture Decision Records
│   ├── issues/                       ← Issue documentation
│   └── prototypes/                   ← Prototypes & experiments
│
├── .github/workflows/                ← CI/CD
│   └── ci.yml                        ← Build & test pipeline
│
└── package.json                      ← Workspace configuration
```

## Core Technologies

### Web Stack
- **React 19** - UI framework
- **Vite** - Build tool
- **TypeScript** - Language
- **Vitest** - Testing framework
- **ESLint** - Code quality

### Desktop Stack
- **Avalonia** - Cross-platform UI framework
- **C#** - Language
- **MusicalConductor.Avalonia** - Orchestration engine
- **RenderX.HostSDK.Avalonia** - Host integration

### Build & Orchestration
- **Musical Conductor** - Sequence orchestration engine
- **OgraphX** - Self-graphing code analysis
- **Python** - Build pipeline scripts

## Key Concepts

### 1. Musical Conductor
Event-based orchestration engine that plays "symphonies" (sequences of beats).

**Components**:
- **EventBus** - Pub/sub event routing
- **SequenceOrchestrator** - Plays symphonies
- **SequenceExecutor** - Executes individual beats
- **StatisticsManager** - Tracks metrics

### 2. Symphonies & Beats
- **Symphony** - Orchestrated sequence of movements
- **Movement** - Logical grouping of beats
- **Beat** - Individual execution step with event, handler, timing

### 3. Plugins
Self-contained packages that extend functionality.

**Structure**:
- Handlers (TypeScript/C#) - Business logic
- UI Components (React/Avalonia) - User interface
- Sequences (JSON) - Orchestration definitions
- Topics (JSON) - Event definitions

### 4. Catalog
Single source of truth for all runtime behavior.

**Contents**:
- `json-sequences/` - Symphony definitions
- `json-topics/` - Topic definitions
- `json-plugins/plugin-manifest.json` - Plugin registry
- `json-interactions/interaction-manifest.json` - Event mappings

### 5. Build Pipeline
12-step process that transforms source into runtime artifacts.

**Output**:
- `graph.json` - Symbol extraction
- `sequences.json` - Actual beats from code
- `enhanced.sequences.json` - Sequences with metadata
- `plugin-manifest.json` - Merged plugin registry
- `interaction-manifest.json` - Event mappings
- `topics.json` - Topic registry
- Diagrams and analysis reports

## Runtime Flow

```
User Action
    ↓
Event Emitted (e.g., canvas.component.create)
    ↓
EventBus routes to SequenceOrchestrator
    ↓
Lookup sequence in interaction-manifest.json
    ↓
Load symphony from catalog/json-sequences/
    ↓
SequenceOrchestrator plays symphony
    ↓
For each beat:
  - SequenceExecutor calls handler
  - Handler publishes events to topics
  - Other plugins subscribe and react
    ↓
Sequence completes
    ↓
UI updates reflect changes
```

## Key Files

| File | Purpose |
|------|---------|
| `catalog/json-plugins/plugin-manifest.json` | Master plugin registry |
| `catalog/json-interactions/interaction-manifest.json` | Event-to-sequence mappings |
| `catalog/json-sequences/` | Symphony definitions |
| `catalog/json-topics/` | Topic definitions |
| `packages/musical-conductor/` | Orchestration engine |
| `packages/*/src/symphonies/` | Plugin handlers |
| `public/artifacts/` | Runtime artifacts |
| `.ographx/artifacts/` | Generated artifacts |

## Build Commands

```bash
npm run build              # Build all packages
npm run pre:manifests      # Run 12-step build pipeline
npm run dev                # Start dev server with artifacts
npm run test               # Run all tests
npm run lint               # Run ESLint
```

## Architecture Principles

1. **Manifest-Driven** - All behavior defined in JSON
2. **Single Source of Truth** - Catalog is authoritative
3. **Auto-Generated** - Artifacts derived from source
4. **Decoupled Plugins** - Communicate via pub/sub
5. **Orchestrated Execution** - Musical Conductor plays symphonies
6. **Build-Time Validation** - Errors caught before runtime

## Performance Targets

- **Startup**: <1 second
- **Event Routing**: <1ms
- **Sequence Execution**: 10-100ms (handler dependent)
- **Build Time**: 30-45 seconds

## Testing Strategy

- **Unit Tests** - Individual handlers and components
- **Integration Tests** - Plugin interactions
- **E2E Tests** - Full user workflows
- **Manifest Tests** - Schema validation

## Deployment

### Web
1. Run `npm run build`
2. Run `npm run pre:manifests`
3. Deploy `dist/` and `public/artifacts/`

### Desktop
1. Build Avalonia project
2. Embed manifests and sequences
3. Deploy executable

## Key Metrics

- **Plugins**: 5+ (Canvas, Control Panel, Library, Real Estate, etc.)
- **Sequences**: 50+ symphonies
- **Topics**: 30+ event topics
- **Handlers**: 100+ stage-crew handlers
- **Test Coverage**: 80%+

