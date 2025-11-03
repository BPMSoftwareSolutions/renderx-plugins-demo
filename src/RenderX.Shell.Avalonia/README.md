# RenderX Shell - Avalonia Implementation

A C#/Avalonia .NET implementation of the RenderX thin-client host, maintaining architectural parity with the TypeScript/React version while leveraging .NET's strengths in type safety, performance, and enterprise deployment.

## Overview

This project implements the core RenderX architecture in C# using Avalonia UI:

- **Musical Conductor**: Orchestration engine managing plugin sequences
- **Event Router**: Pub/sub system with topic replay cache and throttling
- **Plugin Management**: Dynamic loading with AssemblyLoadContext and hot-reload support
- **Manifest System**: JSON-driven configuration for plugins, layouts, and interactions
- **Slot-based Layout**: Three-panel system (Library, Canvas, Control Panel)

## Architecture

### Core Components

```
RenderX.Shell.Avalonia/
├── Core/
│   ├── Conductor/           # Musical Conductor orchestration
│   ├── Events/              # Event Router pub/sub system
│   ├── Manifests/           # Manifest loading and validation
│   └── Plugins/             # Plugin management and loading
├── UI/
│   ├── ViewModels/          # MVVM ViewModels
│   ├── Views/               # Avalonia Views/Windows
│   └── Controls/            # Custom UI controls
└── Infrastructure/
    ├── Configuration/       # App configuration
    └── Validation/          # FluentValidation rules
```

### Technology Stack

- **Avalonia UI 11.x**: Cross-platform .NET UI framework
- **.NET 8**: Latest LTS version for best performance
- **Microsoft.Extensions.Hosting**: Application lifetime management
- **ReactiveUI**: Reactive MVVM framework
- **System.Reactive**: Reactive extensions for .NET
- **FluentValidation**: Manifest and data validation
- **System.Runtime.Loader**: Dynamic assembly loading with unloading support

## Getting Started

### Prerequisites

- .NET 8 SDK
- Visual Studio 2022 or JetBrains Rider (recommended)

### Building

```bash
cd src/RenderX.Shell.Avalonia
dotnet restore
dotnet build
```

### Running

```bash
dotnet run
```

### Configuration

The application uses `appsettings.json` for configuration:

```json
{
  "RenderX": {
    "Plugins": {
      "PluginsDirectory": "plugins",
      "ManifestPath": "plugins/plugin-manifest.json",
      "EnableHotReload": true
    },
    "Layout": {
      "ManifestPath": "layout-manifest.json",
      "DefaultTheme": "Light",
      "UseLayoutManifest": true
    },
    "FeatureFlags": {
      "DiagnosticsEnabled": true,
      "PerformanceMonitoringEnabled": false
    }
  }
}
```

## Development Status

This is the initial project setup for **Phase 1: Core Infrastructure Foundation**. 

### ✅ Completed (Task 1.1)
- [x] Project structure with .NET 8 and Avalonia UI
- [x] Dependency injection with Microsoft.Extensions.Hosting
- [x] ReactiveUI and System.Reactive configuration
- [x] FluentValidation setup for manifest validation
- [x] Core interfaces and models defined
- [x] Basic placeholder implementations
- [x] Main window with MVVM pattern
- [x] Configuration system

### 🚧 In Progress
- [ ] Task 1.2: Conductor System Implementation
- [ ] Task 1.3: Event Router with Replay Cache
- [ ] Task 1.4: Plugin Management System
- [ ] Task 1.5: Manifest System Implementation
- [ ] Task 1.6: Core Infrastructure Testing

### 📋 Upcoming Phases
- **Phase 2**: UI Framework Implementation
- **Phase 3**: Plugin Architecture System
- **Phase 4**: Advanced Features & Diagnostics
- **Phase 5**: Plugin Migration & Testing

## Key Features

### Musical Conductor
- Priority-based sequence execution
- Async orchestration with cancellation support
- Plugin registration and lifecycle management
- Observable sequence events for monitoring

### Event Router
- Pub/sub messaging with type safety
- Topic replay cache for late subscribers
- Throttling and debouncing support
- Conductor integration for interaction routing

### Plugin System
- Dynamic assembly loading with hot-reload
- AssemblyLoadContext for proper isolation
- Plugin discovery and validation
- Sequence handler framework

### Manifest System
- JSON-driven configuration
- FluentValidation for comprehensive validation
- Caching for performance
- Support for layout, interaction, and topic manifests

## Diagnostics

Press `Ctrl+Shift+D` to open the diagnostics overlay (when implemented in Phase 4).

## Contributing

This project follows the established RenderX architecture patterns. See the main repository documentation for contribution guidelines.

## License

This project is part of the RenderX ecosystem. See the main repository for license information.
