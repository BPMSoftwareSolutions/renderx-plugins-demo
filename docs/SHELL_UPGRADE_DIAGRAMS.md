# RenderX.Shell.Avalonia Upgrade - Architecture Diagrams

## Current Architecture (WebView2)

```
┌─────────────────────────────────────────────────────────────┐
│                    Avalonia Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Avalonia Main Window                    │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                                                      │   │
│  │  ┌────────────────────────────────────────────────┐ │   │
│  │  │         WebViewHost (WebView2 Control)        │ │   │
│  │  ├────────────────────────────────────────────────┤ │   │
│  │  │                                                │ │   │
│  │  │  ┌──────────────────────────────────────────┐ │ │   │
│  │  │  │   TypeScript Frontend (React)            │ │ │   │
│  │  │  │   - Canvas Component                     │ │ │   │
│  │  │  │   - Control Panel                        │ │ │   │
│  │  │  │   - Event Routing                        │ │ │   │
│  │  │  └──────────────────────────────────────────┘ │ │   │
│  │  │                                                │ │   │
│  │  │  IPC Bridge (5-10ms latency)                  │ │   │
│  │  │                                                │ │   │
│  │  └────────────────────────────────────────────────┘ │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         ASP.NET Core API (localhost:5000)           │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  - WebView2 Bridge Endpoints                        │   │
│  │  - Conductor Integration                           │   │
│  │  - Event Routing                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Shell Services (.NET)                    │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  - AvaloniaMusicalConductor                         │   │
│  │  - AvaloniaEventRouter                             │   │
│  │  - Custom Implementations                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘

Problems:
❌ WebView2 runtime dependency (150MB+)
❌ IPC overhead (5-10ms latency)
❌ Complex deployment
❌ Separate logging streams
❌ Difficult to maintain
```

## Target Architecture (Thin Host)

```
┌─────────────────────────────────────────────────────────────┐
│                    Avalonia Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Avalonia Main Window                    │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                                                      │   │
│  │  ┌────────────────────────────────────────────────┐ │   │
│  │  │      Native Avalonia Controls                 │ │   │
│  │  ├────────────────────────────────────────────────┤ │   │
│  │  │                                                │ │   │
│  │  │  ┌──────────────────────────────────────────┐ │ │   │
│  │  │  │  CanvasControl                           │ │ │   │
│  │  │  │  - Component Rendering                   │ │ │   │
│  │  │  │  - Selection Handling                    │ │ │   │
│  │  │  └──────────────────────────────────────────┘ │ │   │
│  │  │                                                │ │   │
│  │  │  ┌──────────────────────────────────────────┐ │ │   │
│  │  │  │  ControlPanelControl                     │ │ │   │
│  │  │  │  - Property Editing                      │ │ │   │
│  │  │  │  - Interaction Execution                 │ │ │   │
│  │  │  └──────────────────────────────────────────┘ │ │   │
│  │  │                                                │ │   │
│  │  │  Direct Method Calls (0.5-2ms latency)        │ │   │
│  │  │                                                │ │   │
│  │  └────────────────────────────────────────────────┘ │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           ThinHostLayer (DI Service)               │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  - Unified SDK Access                              │   │
│  │  - Service Wrapping                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      RenderX.HostSDK.Avalonia + Conductor          │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  - IEventRouter                                     │   │
│  │  - IInventoryAPI                                    │   │
│  │  - ICssRegistryAPI                                  │   │
│  │  - IConductorClient                                │   │
│  │  - Jint JavaScript Engine                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘

Benefits:
✅ No external runtime
✅ Direct method calls (75% faster)
✅ Smaller deployment (60% reduction)
✅ Unified codebase
✅ Easier maintenance
```

## Event Flow Diagram

```
User Interaction
    │
    ├─→ Canvas Click
    │       │
    │       ├─→ CanvasControl.OnComponentClicked()
    │       │
    │       ├─→ IEventRouter.PublishAsync(
    │       │       "canvas.component.selection.changed",
    │       │       { componentId, properties }
    │       │   )
    │       │
    │       ├─→ ControlPanelControl subscribes
    │       │
    │       └─→ ControlPanelControl.DisplayProperties()
    │               │
    │               └─→ UI Updates
    │
    └─→ Property Edit
            │
            ├─→ ControlPanelControl.OnPropertyChanged()
            │
            ├─→ IEventRouter.PublishAsync(
            │       "control.panel.property.changed",
            │       { componentId, propertyName, value }
            │   )
            │
            ├─→ CanvasControl subscribes
            │
            └─→ CanvasControl.UpdateComponent()
                    │
                    └─→ Canvas Re-renders
```

## Conductor Execution Flow

```
User Clicks Interaction Button
    │
    ├─→ ControlPanelControl.OnInteractionClicked()
    │
    ├─→ IInteractionManifestService.ResolveInteraction(id)
    │
    ├─→ IConductorClient.Play(pluginId, sequenceId, context)
    │
    ├─→ Jint Engine Executes Sequence
    │       │
    │       ├─→ Beat 1: Validate Input
    │       ├─→ Beat 2: Process Data
    │       ├─→ Beat 3: Update State
    │       └─→ Beat 4: Notify UI
    │
    ├─→ IEventRouter.PublishAsync("sequence:completed", result)
    │
    ├─→ ControlPanelControl subscribes
    │
    └─→ Update UI with Result
```

## Dependency Injection Graph

```
Program.cs
    │
    ├─→ AddRenderXHostSdk()
    │       │
    │       ├─→ IEventRouter
    │       ├─→ IInventoryAPI
    │       ├─→ ICssRegistryAPI
    │       ├─→ IConfigService
    │       ├─→ IFeatureFlagsService
    │       ├─→ IPluginManifestService
    │       ├─→ IInteractionManifestService
    │       └─→ ITopicsManifestService
    │
    ├─→ AddMusicalConductor()
    │       │
    │       └─→ IConductorClient
    │
    ├─→ AddSingleton<IThinHostLayer, ThinHostLayer>()
    │       │
    │       ├─→ Depends on: IEventRouter
    │       ├─→ Depends on: IInventoryAPI
    │       ├─→ Depends on: ICssRegistryAPI
    │       ├─→ Depends on: IConductorClient
    │       └─→ Depends on: ILogger<ThinHostLayer>
    │
    ├─→ AddSingleton<CanvasControl>()
    │       │
    │       ├─→ Depends on: IInventoryAPI
    │       ├─→ Depends on: IEventRouter
    │       ├─→ Depends on: ICssRegistryAPI
    │       └─→ Depends on: ILogger<CanvasControl>
    │
    ├─→ AddSingleton<ControlPanelControl>()
    │       │
    │       ├─→ Depends on: IEventRouter
    │       ├─→ Depends on: IConductorClient
    │       ├─→ Depends on: IInteractionManifestService
    │       └─→ Depends on: ILogger<ControlPanelControl>
    │
    └─→ AddSingleton<MainWindowViewModel>()
            │
            ├─→ Depends on: IThinHostLayer
            └─→ Depends on: ILogger<MainWindowViewModel>
```

## Phase Timeline

```
Week 1: Phase 1 (Foundation)
├─ Add SDKs
├─ Create ThinHostLayer
├─ Update DI
└─ Verify Build

Week 2-3: Phase 2 (UI Components)
├─ Create CanvasControl
├─ Create ControlPanelControl
├─ Update MainWindow
└─ Wire Events

Week 4: Phase 3 (Integration)
├─ Update PluginManager
├─ Implement Rendering
├─ Wire Event Routing
└─ Test Execution

Week 5: Phase 4 (Cleanup)
├─ Remove WebView2
├─ Remove Legacy Code
├─ Optimize Performance
└─ Update Documentation

✅ Complete: Production-Ready Thin Host
```

---

**Version:** 1.0  
**Date:** 2025-11-08

