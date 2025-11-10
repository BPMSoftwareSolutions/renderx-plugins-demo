# Ghost Image Detection Results

**Date:** November 9, 2025  
**Question:** Does the feature gap analyzer detect ghost imaging with drag from library-component to canvas?  
**Answer:** ✅ **YES** - After enhancement, it now detects this feature!

---

## 🔍 What Was Detected

### Web Implementation - **Drag Ghost Image Feature Found**

The analyzer successfully detected the drag ghost image functionality in the following components:

#### 1. `drag.symphony.ts` (43 lines)
- **Features Detected:** ✅ Drag Ghost Image, ✅ Drag and Drop
- **Location:** `packages/library-component/src/symphonies/drag.symphony.ts`
- **Key Implementation:**
  ```typescript
  if (dt?.setDragImage) {
    const { width, height, targetEl } = computeGhostSize(e, data?.component);
    const ghost = createGhostContainer(width, height);
    renderTemplatePreview(ghost, data?.component?.template, width, height);
    applyTemplateStyles(ghost, data?.component?.template);
    const { offsetX, offsetY } = computeCursorOffsets(e, targetEl, width, height);
    installDragImage(dt, ghost, offsetX, offsetY);
  }
  ```

#### 2. `drag.preview.stage-crew.ts` (151 lines)
- **Features Detected:** ✅ Drag Ghost Image, ✅ Animations, ✅ Search/Filter
- **Location:** `packages/library-component/src/symphonies/drag/drag.preview.stage-crew.ts`
- **Key Functions:**
  - `createGhostContainer()` - Creates the ghost element
  - `renderTemplatePreview()` - Renders component preview
  - `applyTemplateStyles()` - Applies CSS styles to ghost
  - `computeCursorOffsets()` - Calculates cursor position
  - `installDragImage()` - Sets the ghost using `dt.setDragImage()`

#### 3. `LibraryPreview.tsx` (61 lines)
- **Features Detected:** ✅ Drag and Drop
- **Location:** `packages/library/src/ui/LibraryPreview.tsx`
- **Triggers the drag operation:**
  ```tsx
  const handleDragStart = (e: React.DragEvent) => {
    EventRouter.publish("library.component.drag.start.requested", {
      event: "library:component:drag:start",
      domEvent: e,
      component,
    }, conductor);
  };
  ```

---

## 🎯 Desktop Implementation - **Missing Ghost Image**

### What Was Checked

The analyzer scanned all desktop Avalonia components in:
- `src/RenderX.Plugins.Library/`
- All `.axaml` and `.cs` files

### Detection Patterns Used

The analyzer looks for these patterns in desktop code:
- `DragPreview`
- `GhostImage`
- `SetDragImage`
- `Adorner.*Drag`
- `DragDrop`, `AllowDrop`, `DragOver`, `Drop`, `DragStart`

### Result: ❌ **Not Found**

**No Avalonia drag ghost image implementation detected** in the desktop Library plugin.

---

## 📊 Gap Summary

| Feature | Web | Desktop | Gap |
|---------|-----|---------|-----|
| **Drag and Drop** | ✅ Implemented | ⚠️ Basic | Partial |
| **Drag Ghost Image** | ✅ Implemented (2 files) | ❌ Missing | **100%** |
| **Custom Drag Preview** | ✅ Yes (renders component) | ❌ No | **100%** |
| **Cursor Offset Calculation** | ✅ Yes | ❌ No | **100%** |
| **Style Application to Ghost** | ✅ Yes (CSS variables) | ❌ No | **100%** |

---

## 🔧 How the Web Implementation Works

### Complete Flow

1. **User starts dragging** a component from library
   - `LibraryPreview.tsx` handles `onDragStart` event

2. **Event published** to symphony system
   - `EventRouter.publish("library.component.drag.start.requested")`

3. **Symphony creates ghost image**
   - `drag.symphony.ts` receives event
   - Calls `computeGhostSize()` to determine dimensions
   - Creates invisible DOM element via `createGhostContainer()`

4. **Ghost is populated**
   - `renderTemplatePreview()` renders component HTML
   - `applyTemplateStyles()` applies CSS and variables
   - Ghost matches the actual component appearance

5. **Browser sets custom drag image**
   - `dt.setDragImage(ghost, offsetX, offsetY)` tells browser to use ghost
   - Ghost is temporarily appended to body
   - Removed via `requestAnimationFrame()` after drag starts

6. **User sees custom preview** while dragging
   - Instead of default browser drag image
   - Shows actual component with proper styling
   - Cursor positioned relative to where user clicked

---

## 🎨 Visual Difference

### Web (Current)
```
User drags component → Custom ghost image appears
┌──────────────────────┐
│  🧩                  │
│  Button Component    │  ← Styled preview
│  A reusable button   │     with CSS
└──────────────────────┘
      ↓ (follows cursor)
```

### Desktop (Missing)
```
User drags component → Default system cursor
      🖱️  ← Just cursor or generic icon
      ↓ (no preview)
```

---

## 💡 Why This Matters

### User Experience Impact

**Without Ghost Image:**
- User doesn't see what they're dragging
- No visual confirmation of drag operation
- Harder to precisely place components
- Less professional feel

**With Ghost Image:**
- Clear visual feedback
- User sees exactly what they're placing
- Better accuracy in positioning
- Professional, polished UX

### Technical Complexity

**Web:** Medium complexity
- Requires DOM manipulation
- DataTransfer API support
- CSS variable injection
- Timing/cleanup management

**Avalonia:** Higher complexity
- No direct `setDragImage()` equivalent
- Need to use Adorners or custom rendering
- Different drag/drop architecture
- May require render transforms

---

## 🚀 Recommendation: Implement in Desktop

### Priority: **HIGH**
This significantly improves UX and is a visible differentiator.

### Estimated Effort: **5-7 days**

### Implementation Approach for Avalonia

#### Option 1: Adorner Layer (Recommended)
```csharp
// Create adorner layer during drag
var adorner = new DragAdorner(component) {
    Width = ghostWidth,
    Height = ghostHeight
};
AdornerLayer.GetAdornerLayer(dragSource).Add(adorner);

// Update position during drag
adorner.LeftOffset = e.GetPosition(canvas).X;
adorner.TopOffset = e.GetPosition(canvas).Y;

// Remove on drop
AdornerLayer.GetAdornerLayer(dragSource).Remove(adorner);
```

#### Option 2: Render to Bitmap
```csharp
// Render component to bitmap
var renderBitmap = new RenderTargetBitmap(
    new PixelSize(width, height),
    new Vector(96, 96)
);
await renderBitmap.RenderAsync(componentControl);

// Use as cursor during drag
DragDrop.DoDragDrop(
    dragSource,
    new DataObject(DataFormats.Serializable, component),
    DragDropEffects.Copy,
    cursor: new Cursor(renderBitmap)
);
```

#### Option 3: Popup Overlay
```csharp
// Create popup with component preview
var popup = new Popup {
    Child = componentPreview,
    IsOpen = true,
    Placement = PlacementMode.Pointer
};

// Update position during drag
popup.HorizontalOffset = e.GetPosition(null).X;
popup.VerticalOffset = e.GetPosition(null).Y;
```

---

## 📈 Analyzer Enhancement Made

### What Changed

**Before:**
- Only detected generic "Drag and Drop" feature
- Missed specific ghost image implementation
- Didn't scan symphony/handler files

**After:**
- ✅ Detects "Drag Ghost Image" as separate feature
- ✅ Looks for `setDragImage`, `ghost`, `drag.*preview` patterns
- ✅ Scans related package folders (e.g., `library-component`)
- ✅ Analyzes symphony and stage-crew files

### Detection Patterns Added

**Web (TypeScript/JavaScript):**
```python
if re.search(r'setDragImage|drag.*image|ghost.*image|drag.*preview', content, re.IGNORECASE):
    features.append(ComponentFeature(
        name='Drag Ghost Image',
        description='Implements custom drag preview/ghost image during drag operations',
        implementation_type='interaction'
    ))
```

**Desktop (C#/AXAML):**
```python
if re.search(r'DragPreview|GhostImage|SetDragImage|Adorner.*Drag', combined_content, re.IGNORECASE):
    features.append(ComponentFeature(
        name='Drag Ghost Image',
        description='Implements custom drag preview/ghost image during drag operations',
        implementation_type='interaction'
    ))
```

---

## 📚 Related Files

### Web Implementation Files
1. `packages/library-component/src/symphonies/drag.symphony.ts`
2. `packages/library-component/src/symphonies/drag/drag.preview.stage-crew.ts`
3. `packages/library/src/ui/LibraryPreview.tsx`
4. `packages/library/src/ui/LibraryPanel.css` (cursor: grab styling)

### Desktop Files to Enhance
1. `src/RenderX.Plugins.Library/LibraryPreview.axaml.cs`
2. `src/RenderX.Plugins.Library/LibraryPanel.axaml.cs`
3. Create: `DragAdorner.cs` (new file)
4. Create: `DragGhostHelper.cs` (new file)

### Test Files
1. `packages/library-component/__tests__/handlers.drag.nodragimage.spec.ts`
2. Create: `src/RenderX.Plugins.Library.Tests/DragGhostTests.cs`

---

## ✅ Conclusion

**Yes**, the enhanced gap analyzer successfully detects the drag ghost image feature!

**Key Findings:**
- ✅ Web has sophisticated ghost image implementation (194 lines across 2 files)
- ❌ Desktop completely lacks this feature
- 🎯 This is a **HIGH priority gap** for UX parity
- 📊 Estimated effort: 5-7 days to implement in Avalonia
- 🚀 Recommended approach: Adorner Layer pattern

**Next Steps:**
1. Review Avalonia drag/drop documentation
2. Create spike/prototype for Adorner approach
3. Implement `DragAdorner` class
4. Integrate with existing drag handlers
5. Test across platforms (Windows, macOS, Linux)

---

**Tool Used:** `web_desktop_gap_analyzer.py` (Enhanced version)  
**Command:** `python web_desktop_gap_analyzer.py --plugin library --show-feature-gap`  
**Report:** `migration_tools/output/library_gap_enhanced.md`
