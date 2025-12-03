# AC Alignment Status: Canvas Component Select Symphony

**Domain:** `canvas-component-select-symphony`
**Generated:** 2025-12-03
**Symphony:** Select

## 📋 Symphony Overview

The select symphony orchestrates component selection through 3 beats:
1. **showSelectionOverlay** - Render selection UI with ID derivation
2. **notifyUi** - Publish selection to control panel
3. **publishSelectionChanged** - Broadcast selection change event

## ✅ Refinements Completed

### 1. Fixed Test File Paths (Anti-Pattern Eliminated)

Updated all test file references to point to **package-internal tests**:

| Beat | Handler | Old Path | New Path |
|------|---------|----------|----------|
| 1.1 | showSelectionOverlay | `node_modules\@renderx-plugins\canvas-component\__tests__\...` | `__tests__\selection-id-derivation.spec.ts` |
| 1.2 | notifyUi | `node_modules\@renderx-plugins\canvas\__tests__\ui.export.spec.ts` | `__tests__\selection-id-derivation.spec.ts` |
| 1.3 | publishSelectionChanged | `node_modules\@renderx-plugins\canvas-component\__tests__\...` | `__tests__\selection-topic-publishing.spec.ts` |

### 2. Enhanced Acceptance Criteria

Transformed **vague, generic ACs** into **specific, testable requirements** with detailed Given/When/Then/And clauses:

#### Beat 1.1 - showSelectionOverlay (5 ACs)

**AC 1.1:1 - Primary ID Derivation**
- **Given:** selection event contains data.id
- **When:** showSelectionOverlay executes
- **Then:**
  - Element ID is derived from data.id
  - Overlay container is created or reused with id='rx-overlay'
  - Overlay rect is positioned to match selected element bounds
  - Resize handles (8 corners/edges) are attached to overlay
  - Selection interactions (drag, resize) are registered
- **And:**
  - Operation completes within 100ms P95
  - selection.shown event is emitted with element ID
  - Overlay is visible and positioned correctly

**AC 1.1:2 - Fallback to elementId**
- **Given:** data.id is missing but data.elementId is provided
- **When:** showSelectionOverlay derives ID
- **Then:** Element ID is derived from data.elementId as fallback
- **And:** Overlay rendering proceeds normally

**AC 1.1:3 - DOM Target Derivation**
- **Given:** both data.id and data.elementId are missing
- **When:** showSelectionOverlay derives ID from DOM target
- **Then:**
  - Element ID is derived from event target's id attribute
  - If target has no id, closest('.rx-comp') ancestor is used
- **And:** Nested element clicks are handled correctly

**AC 1.1:4 - Baton Fallback**
- **Given:** all ID sources are exhausted and baton contains ID
- **When:** showSelectionOverlay uses baton fallback
- **Then:** Element ID is derived from ctx.baton.id or ctx.baton.elementId
- **And:** Baton provides last-resort ID for legacy flows

**AC 1.1:5 - No ID Available**
- **Given:** no valid ID can be derived from any source
- **When:** showSelectionOverlay validates ID
- **Then:**
  - Handler returns early without rendering overlay
  - Warning is logged with context
- **And:** System remains stable without errors

#### Beat 1.2 - notifyUi (3 ACs)

**AC 1.2:1 - Primary Notification**
- **Given:** element is selected and data.id is present
- **When:** notifyUi executes
- **Then:**
  - canvas.component.selected event is published via EventRouter
  - Event payload includes element ID from data.id
  - Event is published with conductor context
- **And:**
  - Delivery completes within 20ms end-to-end
  - Events are ordered FIFO
  - Subscribers receive notification consistently

**AC 1.2:2 - Baton Fallback**
- **Given:** data.id is missing but ctx.baton.id is available
- **When:** notifyUi derives ID
- **Then:**
  - Element ID is derived from ctx.baton.id as fallback
  - canvas.component.selected event is published with baton ID
- **And:** Legacy flows with baton-based ID propagation are supported

**AC 1.2:3 - Missing ID Handling**
- **Given:** both data.id and baton.id are missing
- **When:** notifyUi validates ID
- **Then:**
  - Event publication is skipped
  - Warning is logged with context
- **And:** System remains stable without errors

#### Beat 1.3 - publishSelectionChanged (3 ACs)

**AC 1.3:1 - Primary Event Publication**
- **Given:** selection change occurs with element ID
- **When:** publishSelectionChanged executes
- **Then:**
  - canvas.component.selection.changed event is published via EventRouter
  - Event payload includes element ID
  - Event payload includes optional metadata (type, classes, dimensions)
  - Event is published with conductor context
- **And:**
  - Operation completes within 50ms P95
  - Event delivery is guaranteed FIFO
  - Dependent systems can synchronize state

**AC 1.3:2 - Missing ID Validation**
- **Given:** element ID is missing
- **When:** publishSelectionChanged validates input
- **Then:**
  - Event publication is skipped
  - Warning is logged with context
- **And:** System remains stable without errors

**AC 1.3:3 - Missing Conductor Handling**
- **Given:** conductor is not available in context
- **When:** publishSelectionChanged attempts to publish
- **Then:**
  - Event is published with undefined conductor
  - EventRouter handles missing conductor gracefully
- **And:** Legacy flows without conductor are supported

## 📊 AC Coverage Summary

| Beat | Handler | Total ACs | Test File | Coverage Target |
|------|---------|-----------|-----------|-----------------|
| 1.1 | showSelectionOverlay | 5 | selection-id-derivation.spec.ts | 100% |
| 1.2 | notifyUi | 3 | selection-id-derivation.spec.ts | 100% |
| 1.3 | publishSelectionChanged | 3 | selection-topic-publishing.spec.ts | 100% |
| **Total** | **3 handlers** | **11 ACs** | **2 test files** | **100%** |

## ✅ Test File Updates

### selection-id-derivation.spec.ts (Partially Tagged)

**Beat 1.1 - showSelectionOverlay Tests:**
- ✅ AC 1.1:1 - `[AC:canvas-component-select-symphony:select:1.1:1]` derives ID from data.id
- ✅ AC 1.1:2 - `[AC:canvas-component-select-symphony:select:1.1:2]` derives ID from data.elementId
- ✅ AC 1.1:3 - `[AC:canvas-component-select-symphony:select:1.1:3]` derives ID from DOM target
- ⚠️ AC 1.1:4 - NEEDS TAG - baton fallback test exists but not tagged
- ⚠️ AC 1.1:5 - NEEDS TAG - returns empty object test exists but not tagged

**Beat 1.2 - notifyUi Tests:**
- ⚠️ AC 1.2:1 - NEEDS TAG - uses data.id test exists
- ⚠️ AC 1.2:2 - NEEDS TAG - falls back to ctx.baton.id test exists
- ⚠️ AC 1.2:3 - NEEDS TAG - missing ID handling (needs new test)

### selection-topic-publishing.spec.ts (Not Yet Tagged)

**Beat 1.3 - publishSelectionChanged Tests:**
- ⚠️ AC 1.3:1 - NEEDS TAG - publishes canvas.component.selection.changed
- ⚠️ AC 1.3:2 - NEEDS TAG - missing ID validation (needs new test)
- ⚠️ AC 1.3:3 - NEEDS TAG - missing conductor handling (test may exist)

## 🎯 Next Steps to Achieve 100% Coverage

### Step 1: Complete AC Tagging in selection-id-derivation.spec.ts

Add AC tags to remaining tests:
- Line ~121: `returns empty object when no ID can be derived` → Add `[AC:canvas-component-select-symphony:select:1.1:5]`
- Line ~130: `returns empty object when element doesn't exist` → Add `[AC:canvas-component-select-symphony:select:1.1:5]`
- Line ~141: `uses data.id when present` → Add `[AC:canvas-component-select-symphony:select:1.2:1]`
- Line ~154: `falls back to ctx.baton.id` → Add `[AC:canvas-component-select-symphony:select:1.2:2]`
- Line ~170: `falls back to ctx.baton.elementId` → Add `[AC:canvas-component-select-symphony:select:1.2:2]`

### Step 2: Add Missing Tests in selection-id-derivation.spec.ts

Create new test for AC 1.2:3:
```typescript
it("[AC:canvas-component-select-symphony:select:1.2:3] skips event publication when both data.id and baton.id are missing", () => {
  const data = {};
  const ctx = { conductor: mockConductor, baton: {} };

  selectHandlers.notifyUi(data, ctx);

  // Then: event publication is skipped
  expect(mockConductor.play).not.toHaveBeenCalled();
  // And: warning is logged (check logger.warn if available)
});
```

### Step 3: Tag Tests in selection-topic-publishing.spec.ts

Update selection-topic-publishing.spec.ts with AC tags for Beat 1.3

### Step 4: Run AC Alignment Validation

```bash
ANALYSIS_DOMAIN_ID="canvas-component-select-symphony" npm run validate:ac-alignment
```

## 📈 Benefits of Refinement

### Before:
- ❌ Vague ACs: "performs expected orchestration logic"
- ❌ External test references: `node_modules\@renderx-plugins\...`
- ❌ No traceability: Can't map ACs to tests
- ❌ Generic user stories: "execute reliably with latency < 1 minute"

### After:
- ✅ **Specific ACs:** Clear Given/When/Then/And clauses
- ✅ **Package-internal tests:** `__tests__\selection-id-derivation.spec.ts`
- ✅ **Traceability:** AC tags link tests to requirements
- ✅ **Realistic SLAs:** <100ms P95, <20ms delivery, <50ms publication
- ✅ **Edge cases covered:** Missing IDs, baton fallbacks, error handling
- ✅ **Business value clear:** Responsive UI, consistent analytics, state synchronization

## 🎉 Symphony Refinement Complete

The select symphony now has:
- ✅ 11 detailed ACs across 3 beats
- ✅ Clear test file mappings
- ✅ Realistic performance targets
- ✅ Comprehensive error handling specifications
- ✅ Legacy compatibility documented

Ready for 100% AC-to-test alignment! 🚀
