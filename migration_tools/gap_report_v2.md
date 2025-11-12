# Web vs Desktop Gap Analysis: Library

**Generated:** 2025-11-10 00:48:36

## 📊 Executive Summary

| Metric | Count |
|--------|-------|
| Web Components | 8 |
| Desktop Components | 30 |
| Total Gaps Found | 17 |
| Missing Components | 2 |
| Missing Features | 12 |
| Style Gaps | 3 |
| Quick Win Opportunities | 3 |

### Gap Severity Breakdown

- 🔴 **Critical:** 0
- 🟠 **High:** 0
- 🟡 **Medium:** 14
- 🟢 **Low:** 3

### Code Volume

- **Web:** 1,385 lines of code
- **Desktop:** 4,422 lines of code
- **Parity:** 319.3% of web implementation

## 🚀 Quick Win Opportunities

### 1. Missing Component: index

**Severity:** MEDIUM | **Effort:** medium

Web component "index" (79 lines) not found in desktop implementation


### 2. Missing Hover Effects

**Severity:** LOW | **Effort:** quick

20 CSS classes with hover effects not replicated

**Recommendations:**
- Add :pointerover styles to Avalonia components
- Implement hover state visual changes
- Use RenderTransform for subtle hover animations

### 3. Missing Gradient Backgrounds

**Severity:** LOW | **Effort:** quick

2 CSS classes use gradients

**Recommendations:**
- Add LinearGradientBrush to DesignTokens.axaml
- Replace solid colors with gradient brushes
- Create reusable gradient resources

## 🧩 Component Implementation Gaps

### 🟡 Missing Component: index

**Severity:** MEDIUM | **Effort:** medium

Web component "index" (79 lines) not found in desktop implementation

- **Web:** packages\library-component\src\index.ts (unknown)
- **Desktop:** Not implemented
- **Web Source:** [packages/library-component/src/index.ts](packages/library-component/src/index.ts)
- **Impact:** Users will not have access to this UI component

### 🟡 LAYOUT PARITY ISSUES in LibraryPanel

**Severity:** MEDIUM | **Effort:** medium

Web uses grid layout; desktop lacks UniformGrid/WrapPanel

- **Web:** Grid hints: {'is_grid': True, 'has_aspect_square': False, 'has_centering': False, 'class_samples': ['custom-component-error', 'error-icon', 'error-text']}
- **Desktop:** Panel hints: {'panel': None, 'orientation': None, 'has_uniform_grid': False, 'has_wrap_panel': False, 'has_stack_panel': True, 'has_square_card': False}
- **Web Source:** [packages/library/src/ui/LibraryPanel.tsx](packages/library/src/ui/LibraryPanel.tsx)
- **Impact:** Visual arrangement differs (card alignment/sizing/parity)

## ⚙️ Feature Implementation Gaps

### ChatMessage

- **Form Handling** (medium)
  - Implements form input and submission
  - Effort: medium
  - Web Source: [packages/library/src/ui/ChatMessage.tsx](packages/library/src/ui/ChatMessage.tsx)
- **Emoji Icon Display** (medium)
  - Displays emoji icons extracted from component metadata
  - Effort: medium
  - Web Source: [packages/library/src/ui/ChatMessage.tsx](packages/library/src/ui/ChatMessage.tsx)

### ConfigStatusUI

- **Form Handling** (medium)
  - Implements form input and submission
  - Effort: medium
  - Web Source: [packages/library/src/ui/ConfigStatusUI.tsx](packages/library/src/ui/ConfigStatusUI.tsx)
- **Emoji Icon Display** (medium)
  - Displays emoji icons extracted from component metadata
  - Effort: medium
  - Web Source: [packages/library/src/ui/ConfigStatusUI.tsx](packages/library/src/ui/ConfigStatusUI.tsx)

### CustomComponentList

- **Form Handling** (medium)
  - Implements form input and submission
  - Effort: medium
  - Web Source: [packages/library/src/ui/CustomComponentList.tsx](packages/library/src/ui/CustomComponentList.tsx)

### CustomComponentUpload

- **Form Handling** (medium)
  - Implements form input and submission
  - Effort: medium
  - Web Source: [packages/library/src/ui/CustomComponentUpload.tsx](packages/library/src/ui/CustomComponentUpload.tsx)
- **Emoji Icon Display** (medium)
  - Displays emoji icons extracted from component metadata
  - Effort: medium
  - Web Source: [packages/library/src/ui/CustomComponentUpload.tsx](packages/library/src/ui/CustomComponentUpload.tsx)
- **File Upload** (medium)
  - Handles file uploads
  - Effort: medium
  - Web Source: [packages/library/src/ui/CustomComponentUpload.tsx](packages/library/src/ui/CustomComponentUpload.tsx)

### LibraryPanel

- **Error Handling** (medium)
  - Implements error boundary or error handling
  - Effort: medium
  - Web Source: [packages/library/src/ui/LibraryPanel.tsx](packages/library/src/ui/LibraryPanel.tsx)

### LibraryPreview

- **Emoji Icon Display** (medium)
  - Displays emoji icons extracted from component metadata
  - Effort: medium
  - Web Source: [packages/library/src/ui/LibraryPreview.tsx](packages/library/src/ui/LibraryPreview.tsx)
- **JSON Metadata Extraction** (medium)
  - Extracts metadata (icons, descriptions, attributes) from JSON component definitions
  - Effort: medium
  - Web Source: [packages/library/src/ui/LibraryPreview.tsx](packages/library/src/ui/LibraryPreview.tsx)
- **Component Card Rendering** (medium)
  - Renders component preview cards with styling from JSON data
  - Effort: medium
  - Web Source: [packages/library/src/ui/LibraryPreview.tsx](packages/library/src/ui/LibraryPreview.tsx)

## 🧾 Manifest Audit (Declared vs Desktop)

### Routes / Interactions (4 present / 0 missing)

- ✅ library.container.drop → LibraryComponentPlugin (sequence library-component-container-drop-symphony) — present
- ✅ library.drag.move → LibraryComponentPlugin (sequence library-component-drag-symphony) — present
- ✅ library.drop → LibraryComponentPlugin (sequence library-component-drop-symphony) — present
- ✅ library.load → LibraryPlugin (sequence library-load-symphony) — present

### Topics (7 present / 0 missing)

- ✅ library.load.requested → LibraryPlugin (sequence library-load-symphony) — present
- ✅ library.components.load → LibraryPlugin (sequence library-load-symphony) — present
- ✅ library.components.notify-ui → LibraryPlugin (sequence library-load-symphony) — present
- ✅ library.container.drop.requested → LibraryComponentPlugin (sequence library-component-container-drop-symphony) — present
- ✅ library.component.drag.start.requested → LibraryComponentPlugin (sequence library-component-drag-symphony) — present
- ✅ library.component.drop.requested → LibraryComponentPlugin (sequence library-component-drop-symphony) — present
- ✅ library.drop → LibraryPlugin (sequence library-load-symphony) — present

### Layout Slots

canvas, controlPanel, headerCenter, headerLeft, headerRight, library

### Runtime Plugins (2 present / 0 missing)

- ✅ RenderX.Plugins.Library.LibraryPlugin (pluginId: LibraryPlugin, class: LibraryPlugin)
- ✅ RenderX.Plugins.LibraryComponent.LibraryComponentPlugin (pluginId: LibraryComponentPlugin, class: LibraryComponentPlugin)

## 📋 Component Details

### Web Components

#### ChatMessage
- **Type:** function
- **Lines:** 176
- **Props:** None
- **Hooks:** useState
- **CSS Classes:** 22
- **Features:** Form Handling, Emoji Icon Display

#### ChatWindow
- **Type:** function
- **Lines:** 311
- **Props:** None
- **Hooks:** useState, useEffect
- **CSS Classes:** 23
- **Features:** Modal/Dialog, Animations, Emoji Icon Display

#### ConfigStatusUI
- **Type:** function
- **Lines:** 126
- **Props:** None
- **Hooks:** None
- **CSS Classes:** 22
- **Features:** Form Handling, Emoji Icon Display

#### CustomComponentList
- **Type:** function
- **Lines:** 168
- **Props:** None
- **Hooks:** None
- **CSS Classes:** 25
- **Features:** Form Handling, Emoji Icon Display

#### CustomComponentUpload
- **Type:** function
- **Lines:** 215
- **Props:** None
- **Hooks:** useState
- **CSS Classes:** 10
- **Features:** Drag and Drop, Form Handling, File Upload, Emoji Icon Display

#### LibraryPanel
- **Type:** function
- **Lines:** 249
- **Props:** setShowAIChat] = React.useState(false);
  const safeItems = Array.isArray(items) ? items, {
          onComponentsLoaded
- **Hooks:** useState, React.useEffect, React.useCallback, useConductor, useEffect
- **CSS Classes:** 18
- **Features:** Error Handling, Emoji Icon Display

#### LibraryPreview
- **Type:** function
- **Lines:** 61
- **Props:** None
- **Hooks:** None
- **CSS Classes:** 4
- **Features:** Drag and Drop, JSON Metadata Extraction, Dynamic CSS Injection, Emoji Icon Display, Component Card Rendering

#### index
- **Type:** unknown
- **Lines:** 79
- **Props:** None
- **Hooks:** None
- **CSS Classes:** 0
- **Features:** Drag and Drop

### Desktop Components

#### ChatMessage
- **Lines:** 385
- **Properties:** AuthorProperty, ContentProperty, IsUserMessageProperty, TimestampProperty, ComponentTagsProperty
- **Events:** Author, Content, IsUserMessage, Timestamp, ComponentTags
- **Styles:** 10
- **Features:** ⚠️ Hidden Controls Detected, 🔴 MISSING FILE LOADING, Dynamic CSS Injection

#### ChatWindow
- **Lines:** 445
- **Properties:** None
- **Events:** MessageSentEvent, MessageSent
- **Styles:** 7
- **Features:** Modal/Dialog, Animations, File Operations, JSON Metadata Extraction, ⚠️ Hidden Controls Detected, 🔴 MISSING FILE LOADING, Dynamic CSS Injection, Emoji Icon Display

#### ConfigStatusUI
- **Lines:** 238
- **Properties:** StatusProperty, DetailProperty, StatusColorProperty, Status, Detail
- **Events:** Status, Detail, StatusColor
- **Styles:** 5
- **Features:** ⚠️ Hidden Controls Detected, 🔴 MISSING FILE LOADING, Dynamic CSS Injection

#### CustomComponentList
- **Lines:** 338
- **Properties:** Id, Name, Description, UploadDate, FileSize
- **Events:** None
- **Styles:** 7
- **Features:** Modal/Dialog, Animations, ⚠️ Stub Implementation Detected, ⚠️ Hidden Controls Detected, 🔴 MISSING FILE LOADING, Dynamic CSS Injection, Emoji Icon Display

#### CustomComponentUpload
- **Lines:** 402
- **Properties:** None
- **Events:** ComponentUploadedEvent, ComponentUploaded
- **Styles:** 4
- **Features:** Drag and Drop, Modal/Dialog, Animations, File Operations, JSON Metadata Extraction, ⚠️ Stub Implementation Detected, ⚠️ Hidden Controls Detected, Dynamic CSS Injection

#### LibraryPanel
- **Lines:** 403
- **Properties:** None
- **Events:** ComponentSelectedEvent, ComponentSelected
- **Styles:** 8
- **Features:** Drag Ghost Image, Drag and Drop, Animations, ⚠️ Stub Implementation Detected, ⚠️ Hidden Controls Detected, 🔴 MISSING FILE LOADING, Dynamic CSS Injection, Emoji Icon Display

#### LibraryPlugin
- **Lines:** 465
- **Properties:** Id, Name, Category, Description, Icon
- **Events:** None
- **Styles:** 6
- **Features:** Drag and Drop, Animations, File Operations, JSON Metadata Extraction, ⚠️ Hidden Controls Detected, ⚠️🔴 HARDCODED SAMPLE DATA, 🔴 MISSING FILE LOADING, Dynamic CSS Injection, Emoji Icon Display

#### LibraryPreview
- **Lines:** 515
- **Properties:** ComponentNameProperty, ComponentDescriptionProperty, ComponentIconProperty, ComponentJsonProperty, ComponentName
- **Events:** InsertRequestedEvent, InsertRequested, ComponentName, ComponentDescription, ComponentIcon
- **Styles:** 5
- **Features:** Drag Ghost Image, Drag and Drop, Animations, ⚠️ Stub Implementation Detected, ⚠️ Hidden Controls Detected, 🔴 MISSING FILE LOADING, Dynamic CSS Injection

#### ComponentCard
- **Lines:** 55
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection, Component Card Rendering

#### ComponentLibrary
- **Lines:** 58
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### ComponentPreview
- **Lines:** 55
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### LibraryBrowser
- **Lines:** 55
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### LibraryCard
- **Lines:** 58
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection, Component Card Rendering

#### LibraryCategory
- **Lines:** 55
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### LibraryFilter
- **Lines:** 58
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### LibraryGrid
- **Lines:** 58
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### LibraryList
- **Lines:** 58
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### LibrarySearch
- **Lines:** 58
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### LibrarySort
- **Lines:** 55
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### LibraryTag
- **Lines:** 55
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### PatternCard
- **Lines:** 55
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### PatternLibrary
- **Lines:** 55
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### PatternPreview
- **Lines:** 55
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### ResourceManager
- **Lines:** 55
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### StyleCard
- **Lines:** 55
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### StyleLibrary
- **Lines:** 55
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### StylePreview
- **Lines:** 55
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### TemplateCard
- **Lines:** 55
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### TemplateGallery
- **Lines:** 58
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

#### TemplatePreview
- **Lines:** 55
- **Properties:** None
- **Events:** None
- **Styles:** 8
- **Features:** ⚠️ Stub Implementation Detected, Dynamic CSS Injection

## 🔁 Reproduce and Verify (TDD loop)

### Steps

1. Open a PowerShell in the repo root.

2. Activate the Python env and run the analyzer:


```powershell

./.venv/Scripts/python.exe migration_tools/web_desktop_gap_analyzer.py

```


### Success criteria

- Executive Summary → Total Gaps decreases vs last run (ideally 0).

- Feature Map Audit → no entries with `missing` or `unmapped`.

- Manifest Audit → `missing` counts for Routes/Topics are 0.

- No MISPLACED AI CHAT TOGGLE / AI AVAILABILITY HINT gaps remain.
