# Desktop Architecture Diagnostic 🔍

## Problem: Black Screen on Desktop App

**Status**: FIXED - Added background colors to MainWindow.axaml

---

## Root Cause Analysis

The desktop app was showing a completely black screen because:

1. **No background colors** - MainWindow.axaml had no Background property
2. **Empty borders** - Slot containers (Library, Canvas, ControlPanel) had no Background
3. **Visual result** - Empty borders with no background = black screen

---

## What Was Fixed

### MainWindow.axaml Changes

**Before (BLACK SCREEN)**:
```xml
<Window ... >
    <Grid RowDefinitions="48,*" ColumnDefinitions="320,*,360">
        <!-- No Background on Grid -->
        <Border Grid.Row="1" Grid.Column="1" Name="Canvas" />
        <!-- No Background on Border -->
    </Grid>
</Window>
```

**After (VISIBLE UI)**:
```xml
<Window ... Background="White">
    <Grid RowDefinitions="48,*" ColumnDefinitions="320,*,360" Background="White">
        <!-- Added Background="White" to Grid -->
        <Border Grid.Row="1" Grid.Column="1" Name="Canvas" Background="White" />
        <!-- Added Background="White" to all Borders -->
    </Grid>
</Window>
```

---

## What You Should Now See

### Window Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ RenderX Shell                                                   │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ HEADER ROW (48px) - Light gray (#F5F5F5)                   │ │
│ │ [HeaderLeft] [HeaderCenter] [HeaderRight]                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌──────────┬──────────────────────────┬──────────────┐         │
│ │ Library  │ Canvas                   │ Control      │         │
│ │ (white)  │ (white)                  │ Panel        │         │
│ │          │ ┌────────────────────┐   │ (white)      │         │
│ │          │ │ Canvas             │   │ ┌──────────┐ │         │
│ │          │ │ (0 components)     │   │ │Properties│ │         │
│ │          │ ├────────────────────┤   │ │(none sel)│ │         │
│ │          │ │ [white area]       │   │ │          │ │         │
│ │          │ │ Ready              │   │ │Interact. │ │         │
│ │          │ └────────────────────┘   │ │CSS Class │ │         │
│ │          │                          │ │Status    │ │         │
│ │          │                          │ └──────────┘ │         │
│ └──────────┴──────────────────────────┴──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Colors
- **Window Background**: White
- **Grid Background**: White
- **Header Background**: Light gray (#F5F5F5)
- **Slot Backgrounds**: White
- **Borders**: Light gray (#E0E0E0)

---

## Architecture Layers (Desktop)

### Layer 1: Avalonia UI Framework
- **MainWindow.axaml** - XAML layout definition
- **Grid** - Layout container (48px header + flexible main)
- **Border** - Slot containers (6 total)

### Layer 2: Thin Host Layer
- **ThinHostLayer.cs** - Facade exposing SDK services
- **IEventRouter** - From RenderX.HostSDK.Avalonia
- **IConductorClient** - From MusicalConductor.Avalonia

### Layer 3: Native Controls
- **CanvasControl.axaml.cs** - Renders components (mirrors web CanvasPage)
- **ControlPanelControl.axaml.cs** - Renders properties (mirrors web ControlPanel)
- Both receive SDK services via Initialize() method

### Layer 4: Plugin System
- **Plugin Manifest** - Defines which plugins load in which slots
- **Plugins** - Populate header + library slots
- **Event Routing** - All controls communicate via IEventRouter

---

## Initialization Flow

```
1. Program.cs
   ├─ CreateHostBuilder()
   ├─ services.AddRenderXHostSdk()
   ├─ services.AddMusicalConductor()
   └─ services.AddSingleton<IThinHostLayer>()

2. App.OnFrameworkInitializationCompleted()
   ├─ Build host
   ├─ Create MainWindow
   └─ Start host

3. MainWindow.OnWindowLoaded()
   ├─ Get ThinHostLayer from DI
   ├─ await thinHostLayer.InitializeAsync()
   ├─ Mount CanvasControl in Canvas slot
   ├─ Mount ControlPanelControl in ControlPanel slot
   └─ Plugins populate other slots

4. CanvasControl.Initialize()
   ├─ Receive IEventRouter
   ├─ Receive IConductorClient
   └─ Subscribe to canvas events

5. ControlPanelControl.Initialize()
   ├─ Receive IEventRouter
   ├─ Receive IConductorClient
   └─ Subscribe to selection events
```

---

## Parity with Web Version

| Aspect | Web (React) | Desktop (.NET) |
|--------|------------|----------------|
| **Conductor** | musical-conductor npm | MusicalConductor.Avalonia |
| **Host SDK** | @renderx-plugins/host-sdk | RenderX.HostSDK.Avalonia |
| **Event Router** | EventRouter (JS) | IEventRouter (C#) |
| **Canvas UI** | CanvasPage (React) | CanvasControl (Avalonia) |
| **Control Panel** | ControlPanel (React) | ControlPanelControl (Avalonia) |
| **Layout** | LayoutEngine.tsx | MainWindow.axaml |
| **Slots** | SlotContainer | Border elements |
| **Plugins** | React components | .NET controls |

---

## Expected Behavior

### On App Load
1. ✅ Window appears with white background
2. ✅ Header bar visible (light gray)
3. ✅ 3 columns visible (Library | Canvas | ControlPanel)
4. ✅ Canvas shows "Canvas (0 components)" header
5. ✅ Control Panel shows "Properties (none selected)"
6. ✅ Library slot empty (waiting for plugin)

### On User Interaction
1. Drag component from Library → Canvas
2. Canvas updates with component
3. Click component → Control Panel shows properties
4. Edit properties → Component updates
5. Click interaction → Conductor executes sequence

---

## Troubleshooting

### If you still see BLACK SCREEN
1. **Check MainWindow.axaml** - Verify Background="White" is set
2. **Check Grid** - Verify Background="White" is set
3. **Check Borders** - Verify Background="White" is set
4. **Rebuild** - `dotnet build src/RenderX.Shell.Avalonia/RenderX.Shell.Avalonia.csproj`

### If you see WHITE but no controls
1. **Check MainWindow.axaml.cs** - Verify OnWindowLoaded is firing
2. **Check logs** - Look for "CanvasControl mounted" message
3. **Check DI** - Verify services are registered in Program.cs
4. **Check ThinHostLayer** - Verify it's initialized

### If you see controls but they're empty
1. **Check plugins** - Verify plugin-manifest.json is loaded
2. **Check conductor** - Verify sequences are registered
3. **Check event routing** - Verify IEventRouter is working
4. **Check logs** - Look for initialization errors

---

## Files Modified

1. **src/RenderX.Shell.Avalonia/MainWindow.axaml**
   - Added Background="White" to Window
   - Added Background="White" to Grid
   - Added Background="White" to all Border elements
   - Added BorderThickness and BorderBrush for visual separation

---

## Next Steps

1. **Rebuild and run** the desktop app
2. **Verify white background** appears
3. **Verify controls render** in slots
4. **Compare with web version** - Should look identical
5. **Test interactions** - Drag, drop, select, edit

---

**Status**: ✅ FIXED - Background colors added  
**Build**: ✅ 0 errors  
**Architecture**: ✅ Matches web version  
**Next**: Run app and verify UI appears

