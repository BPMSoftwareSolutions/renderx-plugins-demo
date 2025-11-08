# Desktop vs Web Architecture Parity 🔄

## Critical Clarification

**This is NOT just a thin host upgrade!**

We are mirroring the ENTIRE architecture from the web version:
- ✅ **Conductor** (orchestration engine)
- ✅ **Host SDK** (core services)
- ✅ **Plugins** (UI + runtime)
- ✅ **Slot system** (layout)
- ✅ **Event routing** (pub/sub)

---

## Architecture Comparison

### WEB VERSION (React/Vite - Production)
```
package.json
├── Dependencies:
│   ├── @renderx-plugins/host-sdk (conductor, EventRouter, manifests)
│   ├── @renderx-plugins/canvas (UI plugin)
│   ├── @renderx-plugins/control-panel (UI plugin)
│   ├── @renderx-plugins/library (UI plugin)
│   ├── @renderx-plugins/header (UI plugin)
│   ├── @renderx-plugins/library-component (runtime plugin)
│   ├── @renderx-plugins/canvas-component (runtime plugin)
│   ├── musical-conductor (orchestration)
│   └── react, react-dom (UI framework)
│
├── src/index.tsx
│   ├── initConductor() → MusicalConductor instance
│   ├── registerAllSequences() → Load all plugin sequences
│   ├── initInteractionManifest() → Load interaction routes
│   ├── initTopicsManifest() → Load event topics
│   ├── Expose window.RenderX.conductor
│   ├── Expose window.RenderX.EventRouter
│   └── Render <App />
│
├── src/ui/App/App.tsx
│   ├── LayoutEngine (loads layout-manifest.json)
│   └── SlotContainer (renders plugins in slots)
│       ├── library slot → LibraryPanel (from @renderx-plugins/library)
│       ├── canvas slot → CanvasPage (from @renderx-plugins/canvas)
│       ├── controlPanel slot → ControlPanel (from @renderx-plugins/control-panel)
│       ├── headerLeft slot → HeaderTitle (from @renderx-plugins/header)
│       ├── headerCenter slot → HeaderControls (from @renderx-plugins/header)
│       └── headerRight slot → HeaderThemeToggle (from @renderx-plugins/header)
│
├── public/plugins/plugin-manifest.json
│   └── Maps plugin IDs → UI exports + runtime handlers
│
└── public/layout-manifest.json
    └── Defines grid layout, slots, responsive behavior
```

---

### DESKTOP VERSION (.NET/Avalonia - Being Built)
```
RenderX.Shell.Avalonia.csproj
├── Dependencies:
│   ├── RenderX.HostSDK.Avalonia (conductor, IEventRouter, manifests)
│   ├── MusicalConductor.Avalonia (orchestration)
│   ├── Avalonia (UI framework)
│   └── Microsoft.Extensions.DependencyInjection (DI container)
│
├── Program.cs
│   ├── services.AddRenderXHostSdk() → Register SDK services
│   ├── services.AddMusicalConductor() → Register conductor
│   ├── services.AddSingleton<IThinHostLayer>() → Facade
│   └── Build and run Avalonia app
│
├── MainWindow.axaml.cs
│   ├── Get ThinHostLayer from DI
│   ├── await thinHostLayer.InitializeAsync()
│   ├── Mount CanvasControl in Canvas slot
│   ├── Mount ControlPanelControl in ControlPanel slot
│   └── Plugins populate header + library slots
│
├── Core/ThinHostLayer.cs
│   ├── Injects IEventRouter (from SDK)
│   ├── Injects IConductorClient (from SDK)
│   └── Exposes both via properties
│
├── UI/Views/CanvasControl.axaml.cs
│   ├── Receives IEventRouter + IConductorClient
│   ├── Subscribes to canvas events
│   └── Renders components (mirrors web CanvasPage)
│
├── UI/Views/ControlPanelControl.axaml.cs
│   ├── Receives IEventRouter + IConductorClient
│   ├── Subscribes to selection events
│   └── Renders properties (mirrors web ControlPanel)
│
├── wwwroot/plugins/plugin-manifest.json
│   └── Maps plugin IDs → .NET types + handlers
│
└── layout-manifest.json
    └── Defines grid layout, slots, responsive behavior
```

---

## Core Components Mapping

| Component | Web Version | Desktop Version | Purpose |
|-----------|------------|-----------------|---------|
| **Conductor** | `musical-conductor` npm | `MusicalConductor.Avalonia` .NET | Orchestrates sequence execution |
| **Host SDK** | `@renderx-plugins/host-sdk` npm | `RenderX.HostSDK.Avalonia` .NET | Core services (EventRouter, manifests) |
| **Event Router** | `EventRouter` (JS) | `IEventRouter` (C#) | Pub/sub messaging with replay cache |
| **Manifests** | JSON files in public/ | JSON files in wwwroot/ | Plugin registry, layout, interactions, topics |
| **Plugins** | React components | .NET controls | UI + runtime behavior |
| **Slots** | `<SlotContainer>` | `<Border>` elements | Container for plugin UI |
| **Layout** | `LayoutEngine.tsx` | `MainWindow.axaml` | Grid-based layout system |

---

## Plugin Architecture Parity

### WEB: Plugin Manifest
```json
{
  "plugins": [
    {
      "id": "CanvasPlugin",
      "ui": {
        "slot": "canvas",
        "module": "@renderx-plugins/canvas",
        "export": "CanvasPage"
      },
      "runtime": {
        "module": "@renderx-plugins/canvas",
        "export": "register"
      }
    }
  ]
}
```

### DESKTOP: Plugin Manifest (Same Structure!)
```json
{
  "plugins": [
    {
      "id": "CanvasPlugin",
      "ui": {
        "slot": "canvas",
        "module": "@renderx-plugins/canvas",
        "export": "CanvasPage"
      },
      "runtime": {
        "module": "@renderx-plugins/canvas",
        "export": "register"
      }
    }
  ]
}
```

**Key Point**: The manifest structure is IDENTICAL. Only the runtime loading mechanism differs (JS vs .NET).

---

## Slot System Parity

### WEB: 6 Slots
```
┌─────────────────────────────────────────┐
│ headerLeft | headerCenter | headerRight │ (48px)
├─────────────────────────────────────────┤
│ library   │ canvas       │ controlPanel │
└─────────────────────────────────────────┘
```

### DESKTOP: 6 Slots (IDENTICAL)
```
┌─────────────────────────────────────────┐
│ HeaderLeft | HeaderCenter | HeaderRight │ (48px)
├─────────────────────────────────────────┤
│ Library    │ Canvas       │ ControlPanel │
└─────────────────────────────────────────┘
```

---

## Event Flow Parity

### WEB: Event Publishing
```
User clicks component on canvas
  ↓
CanvasPage publishes "canvas.component.selection.changed"
  ↓
EventRouter routes to all subscribers
  ↓
ControlPanel receives event
  ↓
ControlPanel updates properties display
```

### DESKTOP: Event Publishing (IDENTICAL)
```
User clicks component on canvas
  ↓
CanvasControl publishes "canvas.component.selection.changed"
  ↓
IEventRouter routes to all subscribers
  ↓
ControlPanelControl receives event
  ↓
ControlPanelControl updates properties display
```

---

## Conductor Sequence Execution Parity

### WEB: Sequence Execution
```
User clicks interaction button
  ↓
ControlPanel calls conductor.play(pluginId, sequenceId, payload)
  ↓
Conductor loads sequence from plugin
  ↓
Conductor executes sequence (Jint JavaScript engine)
  ↓
Sequence publishes events via EventRouter
  ↓
Other plugins receive events and update
```

### DESKTOP: Sequence Execution (IDENTICAL)
```
User clicks interaction button
  ↓
ControlPanelControl calls conductor.Play(pluginId, sequenceId, payload)
  ↓
Conductor loads sequence from plugin
  ↓
Conductor executes sequence (Jint JavaScript engine)
  ↓
Sequence publishes events via IEventRouter
  ↓
Other controls receive events and update
```

---

## What Should Be Visible When App Loads

### WEB VERSION
- Header bar with 3 slots (title, controls, theme toggle)
- Library panel (left) - shows draggable components
- Canvas (center) - white area for dropping components
- Control panel (right) - properties + interactions

### DESKTOP VERSION (SHOULD BE IDENTICAL)
- Header bar with 3 slots (title, controls, theme toggle)
- Library panel (left) - shows draggable components
- Canvas (center) - white area for dropping components
- Control panel (right) - properties + interactions

**If they don't look the same, something is wrong!**

---

## Current Status

❌ **Desktop version is showing BLACK SCREEN**

This means:
1. ✅ Conductor is initialized (no errors in logs)
2. ✅ Host SDK is registered (no errors in logs)
3. ❌ **Plugins are NOT rendering in slots**

**Likely causes**:
- Plugins not loading from manifest
- Slot containers not populated
- Plugin UI not being mounted
- Missing plugin dependencies

---

## Next Steps for Agents

1. **Verify plugin manifest is loaded** - Check if plugin-manifest.json is being read
2. **Verify plugins are discovered** - Check if conductor has mounted plugins
3. **Verify slot containers exist** - Check if MainWindow has all 6 Border elements
4. **Verify plugins are mounted in slots** - Check if plugin UI is being rendered
5. **Compare with web version** - If web works, desktop should work identically

---

**Key Principle**: The desktop version should be a 1:1 mirror of the web version, just using Avalonia instead of React.

If something works in the web version, it MUST work in the desktop version.

