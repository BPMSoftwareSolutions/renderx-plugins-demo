# Expected UI Layout When App Loads 🎨

## Overall Window Structure

When you launch the RenderX Shell application, you should see a window with this layout:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RenderX Shell                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ HEADER ROW (48px) - Light gray background (#F5F5F5)               │   │
│  │ ┌──────────────┬──────────────────────────────────┬──────────────┐ │   │
│  │ │ HeaderLeft   │ HeaderCenter                     │ HeaderRight  │ │   │
│  │ │ (320px)      │ (flexible)                       │ (360px)      │ │   │
│  │ │ [empty]      │ [empty - plugin provided]        │ [empty]      │ │   │
│  │ └──────────────┴──────────────────────────────────┴──────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────┬──────────────────────────────────┬──────────────┐        │
│  │              │                                  │              │        │
│  │   LIBRARY    │         CANVAS                   │  CONTROL     │        │
│  │   SLOT       │         SLOT                     │  PANEL       │        │
│  │              │                                  │  SLOT        │        │
│  │  (320px)     │         (flexible)               │  (360px)     │        │
│  │              │                                  │              │        │
│  │  [empty]     │  ┌──────────────────────────┐   │  ┌────────┐  │        │
│  │              │  │ Canvas                   │   │  │Propert │  │        │
│  │              │  │ (0 components)           │   │  │ies     │  │        │
│  │              │  ├──────────────────────────┤   │  ├────────┤  │        │
│  │              │  │                          │   │  │(none   │  │        │
│  │              │  │ [white canvas area]      │   │  │selected)  │        │
│  │              │  │ Ready                    │   │  │        │  │        │
│  │              │  └──────────────────────────┘   │  │Interact│  │        │
│  │              │                                  │  │ions    │  │        │
│  │              │                                  │  │        │  │        │
│  │              │                                  │  │CSS     │  │        │
│  │              │                                  │  │Classes │  │        │
│  │              │                                  │  │        │  │        │
│  │              │                                  │  │Status  │  │        │
│  │              │                                  │  └────────┘  │        │
│  │              │                                  │              │        │
│  └──────────────┴──────────────────────────────────┴──────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed View of Each Section

### 1. Header Row (48px)
- **Background**: Light gray (#F5F5F5)
- **Border**: Bottom border (#E0E0E0)
- **Content**: 3 empty slots (320px | flexible | 360px)
- **Status**: Empty - waiting for plugins to populate

### 2. Library Slot (Left, 320px)
- **Background**: Empty (no content)
- **Status**: Waiting for plugin to mount LibraryPanel
- **Expected**: Will show component library when plugin loads

### 3. Canvas Slot (Center, flexible)
- **Header**: "Canvas (0 components)"
- **Content Area**: White canvas with border
- **Status Bar**: "Ready"
- **Current State**: Empty - no components loaded yet
- **Expected**: Will show draggable component boxes when components are added

### 4. Control Panel Slot (Right, 360px)
- **Header**: "Properties (none selected)"
- **Sections**:
  1. **Component Properties** - Property grid (empty until component selected)
  2. **Interactions** - Interaction buttons (empty until component selected)
  3. **CSS Classes** - Input field + "Apply CSS Classes" button
  4. **Status** - "No component selected"

---

## Colors and Styling

| Element | Color | Hex |
|---------|-------|-----|
| Header Background | Light Gray | #F5F5F5 |
| Borders | Light Gray | #E0E0E0 |
| Canvas Background | White | #FFFFFF |
| Component Borders | Blue | #2196F3 |
| Interaction Buttons | Blue | #2196F3 |
| Apply CSS Button | Green | #4CAF50 |
| Text (Primary) | Dark Gray | #333333 |
| Text (Secondary) | Gray | #666666 |
| Text (Tertiary) | Light Gray | Gray |

---

## Initial State

When the app first loads, you should see:

✅ **Window Title**: "RenderX Shell"  
✅ **Window Size**: 1200x800 (default, resizable)  
✅ **Header Row**: Light gray bar with 3 empty slots  
✅ **Library Slot**: Empty (waiting for plugin)  
✅ **Canvas Slot**: White area with "Canvas (0 components)" header  
✅ **Control Panel**: "Properties (none selected)" with empty sections  

---

## What Happens Next

### When Plugins Load
1. **Library Slot** → LibraryPanel appears (component library)
2. **Header Slots** → Plugin-provided header components appear
3. **Canvas** → Components can be dragged onto canvas
4. **Control Panel** → Properties appear when component selected

### User Interactions
1. **Drag component** from Library → Canvas
2. **Click component** on Canvas → Properties appear in Control Panel
3. **Edit properties** → Component updates
4. **Click interaction button** → Conductor executes sequence

---

## Architecture Notes

### Thin-Host Pattern
- **MainWindow**: Just defines 6 empty slots
- **CanvasControl**: Native Avalonia control (now mounted in Canvas slot)
- **ControlPanelControl**: Native Avalonia control (now mounted in ControlPanel slot)
- **Library Slot**: Populated by plugin (not by shell)
- **Header Slots**: Populated by plugins (not by shell)

### SDK Services
- **IEventRouter**: Handles pub/sub messaging between components
- **IConductorClient**: Executes interaction sequences
- **Both injected into CanvasControl and ControlPanelControl**

---

## Troubleshooting

### If You See...

**❌ WebViewHost instead of CanvasControl**
- This means the old code is still running
- The fix (commit ac00129) should have replaced it
- Rebuild the project

**❌ Empty slots with no controls**
- This is expected initially
- Plugins populate the slots when they load
- Check plugin loading in the logs

**❌ Build errors**
- Run: `dotnet build src/RenderX.Shell.Avalonia/RenderX.Shell.Avalonia.csproj`
- Should show 0 errors, 6 warnings (package version mismatches only)

**✅ Canvas and Control Panel visible**
- This means the fix is working correctly
- Architecture is restored to thin-host pattern

---

**Status**: ✅ Ready to load  
**Last Updated**: 2025-11-08  
**Architecture**: Thin-host with native Avalonia controls

