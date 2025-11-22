# System Architecture

**Generated**: 2025-11-22T16:04:17.780Z

## Architecture Overview

RenderX is a plugin-based system with orchestrated sequences and event-driven communication.

### Core Components

#### 1. Plugin System
- **Slot-based architecture**: Plugins mount to predefined slots
- **UI Plugins**: React components for user interface
- **Runtime Plugins**: Handlers for business logic
- **Manifest-driven**: All plugins defined in `plugin-manifest.json`

#### 2. Orchestration Layer
- **Sequences**: Define workflows as movements with beats
- **Handlers**: Pure functions, I/O operations, or DOM manipulation
- **Topics**: Event channels for inter-plugin communication

#### 3. Event System
- **Topic-based**: Decoupled communication via topics
- **Public Topics**: 8 documented topics
- **Plugin-scoped**: Topics organized by plugin

## Plugin Slots

| Slot | Purpose | Plugins |
|------|---------|---------|
| headerLeft | UI Component | HeaderTitlePlugin |
| headerCenter | UI Component | HeaderControlsPlugin |
| headerRight | UI Component | HeaderThemePlugin |
| library | UI Component | LibraryPlugin |
| canvas | UI Component | CanvasPlugin |
| controlPanel | UI Component | ControlPanelPlugin |
| library | UI Component | RealEstateAnalyzerPlugin |

## Sequence Architecture

- **Total Sequences**: 54
- **Total Handlers**: 87
- **Handler Types**: pure, io, stage-crew
- **Timing**: immediate, deferred, async

## Data Flow

```
User Action → Event → Topic → Sequence → Handlers → UI Update
```

## See Also

- [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md) - Plugin system details
- [ORCHESTRATION_GUIDE.md](./ORCHESTRATION_GUIDE.md) - Sequence documentation
