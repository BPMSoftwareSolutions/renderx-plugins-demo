# RenderX System Overview

**Generated**: 2025-11-22T16:04:17.785Z

## Quick Stats

| Metric | Value |
|--------|-------|
| **Plugins** | 9 |
| **UI Plugins** | 7 |
| **Runtime Plugins** | 6 |
| **Slots** | 6 |
| **Sequences** | 54 |
| **Handlers** | 87 |
| **Topics** | 97 |
| **Test Files** | 184 |
| **Total Tests** | 1412 |
| **Test Coverage** | 64% |

## Architecture Layers

### 1. Plugin System
- **9 Plugins** providing UI and runtime functionality
- **7 UI Plugins** mounted in 6 slots
- **6 Runtime Plugins** for orchestration

### 2. Orchestration Layer
- **54 Sequences** defining system behavior
- **87 Handlers** implementing business logic
- **97 Topics** for event-driven communication

### 3. Test Coverage
- **Public API**: 72% coverage (63/87 handlers)
- **Internal**: 58% coverage (78/135 handlers)

## Key Plugins

- **HeaderTitlePlugin**: 🎨 UI 
- **HeaderControlsPlugin**: 🎨 UI 
- **HeaderThemePlugin**: 🎨 UI 
- **LibraryPlugin**: 🎨 UI ⚙️ Runtime
- **CanvasPlugin**: 🎨 UI ⚙️ Runtime

## Next Steps

1. **Architecture**: See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
2. **Plugins**: See [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md)
3. **Orchestration**: See [ORCHESTRATION_GUIDE.md](./ORCHESTRATION_GUIDE.md)
4. **Handlers**: See [HANDLER_REFERENCE.md](./HANDLER_REFERENCE.md)
5. **Testing**: See [TEST_COVERAGE_GUIDE.md](./TEST_COVERAGE_GUIDE.md)
