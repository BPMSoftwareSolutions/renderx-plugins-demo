# Web vs Desktop Gap Analysis: Library

**Generated:** 2025-11-09 22:40:12

## 📊 Executive Summary

| Metric | Count |
|--------|-------|
| Web Components | 11 |
| Desktop Components | 30 |
| Total Gaps Found | 46 |
| Missing Components | 7 |
| Missing Features | 36 |
| Style Gaps | 3 |
| Quick Win Opportunities | 8 |

### Gap Severity Breakdown

- 🔴 **Critical:** 0
- 🟠 **High:** 4
- 🟡 **Medium:** 36
- 🟢 **Low:** 6

### Code Volume

- **Web:** 1,562 lines of code
- **Desktop:** 4,395 lines of code
- **Parity:** 281.4% of web implementation

## 🚀 Quick Win Opportunities

### 1. Missing Component: drag.symphony

**Severity:** MEDIUM | **Effort:** medium

Web component "drag.symphony" (43 lines) not found in desktop implementation


### 2. Missing Component: drop.container.symphony

**Severity:** MEDIUM | **Effort:** medium

Web component "drop.container.symphony" (31 lines) not found in desktop implementation


### 3. Missing Component: drop.symphony

**Severity:** MEDIUM | **Effort:** medium

Web component "drop.symphony" (31 lines) not found in desktop implementation


### 4. Missing Hover Effects

**Severity:** LOW | **Effort:** quick

20 CSS classes with hover effects not replicated

**Recommendations:**
- Add :pointerover styles to Avalonia components
- Implement hover state visual changes
- Use RenderTransform for subtle hover animations

### 5. Missing Gradient Backgrounds

**Severity:** LOW | **Effort:** quick

2 CSS classes use gradients

**Recommendations:**
- Add LinearGradientBrush to DesignTokens.axaml
- Replace solid colors with gradient brushes
- Create reusable gradient resources

### 6. Manifest Topic Route Missing: library.container.drop.requested

**Severity:** LOW | **Effort:** quick

Topic 'library.container.drop.requested' references plugin 'LibraryComponentPlugin' but corresponding desktop component wasn't found.


### 7. Manifest Topic Route Missing: library.component.drag.start.requested

**Severity:** LOW | **Effort:** quick

Topic 'library.component.drag.start.requested' references plugin 'LibraryComponentPlugin' but corresponding desktop component wasn't found.


### 8. Manifest Topic Route Missing: library.component.drop.requested

**Severity:** LOW | **Effort:** quick

Topic 'library.component.drop.requested' references plugin 'LibraryComponentPlugin' but corresponding desktop component wasn't found.


## 🧩 Component Implementation Gaps

### 🟡 Missing Component: drag.symphony

**Severity:** MEDIUM | **Effort:** medium

Web component "drag.symphony" (43 lines) not found in desktop implementation

- **Web:** packages\library-component\src\symphonies\drag.symphony.ts (unknown)
- **Desktop:** Not implemented
- **Web Source:** [packages/library-component/src/symphonies/drag.symphony.ts](packages/library-component/src/symphonies/drag.symphony.ts)
- **Impact:** Users will not have access to this UI component

### 🟡 Missing Component: drop.container.symphony

**Severity:** MEDIUM | **Effort:** medium

Web component "drop.container.symphony" (31 lines) not found in desktop implementation

- **Web:** packages\library-component\src\symphonies\drop.container.symphony.ts (unknown)
- **Desktop:** Not implemented
- **Web Source:** [packages/library-component/src/symphonies/drop.container.symphony.ts](packages/library-component/src/symphonies/drop.container.symphony.ts)
- **Impact:** Users will not have access to this UI component

### 🟡 Missing Component: drop.symphony

**Severity:** MEDIUM | **Effort:** medium

Web component "drop.symphony" (31 lines) not found in desktop implementation

- **Web:** packages\library-component\src\symphonies\drop.symphony.ts (unknown)
- **Desktop:** Not implemented
- **Web Source:** [packages/library-component/src/symphonies/drop.symphony.ts](packages/library-component/src/symphonies/drop.symphony.ts)
- **Impact:** Users will not have access to this UI component

### 🟠 Missing Component: drag.preview.stage-crew

**Severity:** HIGH | **Effort:** medium

Web component "drag.preview.stage-crew" (151 lines) not found in desktop implementation

- **Web:** packages\library-component\src\symphonies\drag\drag.preview.stage-crew.ts (unknown)
- **Desktop:** Not implemented
- **Web Source:** [packages/library-component/src/symphonies/drag/drag.preview.stage-crew.ts](packages/library-component/src/symphonies/drag/drag.preview.stage-crew.ts)
- **Impact:** Users will not have access to this UI component

### 🟠 🔴 MISSING UI ELEMENTS in ChatMessage

**Severity:** HIGH | **Effort:** medium

Desktop missing 3 UI elements that web renders: code (expected code), pre (expected pre), h4 (expected h4)

- **Web:** Web renders: button, code, div, h4, p, pre, span
- **Desktop:** Desktop renders: Border, Button, Grid, StackPanel, TextBlock, UserControl
- **Web Source:** [packages/library/src/ui/ChatMessage.tsx](packages/library/src/ui/ChatMessage.tsx)
- **Impact:** Users see incomplete or different UI structure than web version

### 🟠 🔴 MISSING UI ELEMENTS in ConfigStatusUI

**Severity:** HIGH | **Effort:** medium

Desktop missing 2 UI elements that web renders: strong (expected strong), h4 (expected h4)

- **Web:** Web renders: div, h4, p, strong
- **Desktop:** Desktop renders: Border, Ellipse, LineBreak, Run, ScrollViewer, StackPanel, TextBlock, UserControl
- **Web Source:** [packages/library/src/ui/ConfigStatusUI.tsx](packages/library/src/ui/ConfigStatusUI.tsx)
- **Impact:** Users see incomplete or different UI structure than web version

### 🟠 🔴 MISSING UI ELEMENTS in LibraryPreview

**Severity:** HIGH | **Effort:** medium

Desktop missing 1 UI elements that web renders: style (expected style)

- **Web:** Web renders: div, span, style
- **Desktop:** Desktop renders: Border, BrushTransition, Button, Setter, StackPanel, Style, TextBlock, TransformGroup, TransformOperationsTransition, Transitions, TranslateTransform, UserControl
- **Web Source:** [packages/library/src/ui/LibraryPreview.tsx](packages/library/src/ui/LibraryPreview.tsx)
- **Impact:** Users see incomplete or different UI structure than web version

## ⚙️ Feature Implementation Gaps

### ChatMessage

- **Emoji Icon Display** (medium)
  - Displays emoji icons extracted from component metadata
  - Effort: medium
  - Web Source: [packages/library/src/ui/ChatMessage.tsx](packages/library/src/ui/ChatMessage.tsx)
- **Form Handling** (medium)
  - Implements form input and submission
  - Effort: medium
  - Web Source: [packages/library/src/ui/ChatMessage.tsx](packages/library/src/ui/ChatMessage.tsx)

### ConfigStatusUI

- **Emoji Icon Display** (medium)
  - Displays emoji icons extracted from component metadata
  - Effort: medium
  - Web Source: [packages/library/src/ui/ConfigStatusUI.tsx](packages/library/src/ui/ConfigStatusUI.tsx)
- **Form Handling** (medium)
  - Implements form input and submission
  - Effort: medium
  - Web Source: [packages/library/src/ui/ConfigStatusUI.tsx](packages/library/src/ui/ConfigStatusUI.tsx)

### CustomComponentList

- **Form Handling** (medium)
  - Implements form input and submission
  - Effort: medium
  - Web Source: [packages/library/src/ui/CustomComponentList.tsx](packages/library/src/ui/CustomComponentList.tsx)

### CustomComponentUpload

- **File Upload** (medium)
  - Handles file uploads
  - Effort: medium
  - Web Source: [packages/library/src/ui/CustomComponentUpload.tsx](packages/library/src/ui/CustomComponentUpload.tsx)
- **Emoji Icon Display** (medium)
  - Displays emoji icons extracted from component metadata
  - Effort: medium
  - Web Source: [packages/library/src/ui/CustomComponentUpload.tsx](packages/library/src/ui/CustomComponentUpload.tsx)
- **Form Handling** (medium)
  - Implements form input and submission
  - Effort: medium
  - Web Source: [packages/library/src/ui/CustomComponentUpload.tsx](packages/library/src/ui/CustomComponentUpload.tsx)

### LibraryPanel

- **Error Handling** (medium)
  - Implements error boundary or error handling
  - Effort: medium
  - Web Source: [packages/library/src/ui/LibraryPanel.tsx](packages/library/src/ui/LibraryPanel.tsx)

### LibraryPreview

- **Component Card Rendering** (medium)
  - Renders component preview cards with styling from JSON data
  - Effort: medium
  - Web Source: [packages/library/src/ui/LibraryPreview.tsx](packages/library/src/ui/LibraryPreview.tsx)
- **JSON Metadata Extraction** (medium)
  - Extracts metadata (icons, descriptions, attributes) from JSON component definitions
  - Effort: medium
  - Web Source: [packages/library/src/ui/LibraryPreview.tsx](packages/library/src/ui/LibraryPreview.tsx)
- **Emoji Icon Display** (medium)
  - Displays emoji icons extracted from component metadata
  - Effort: medium
  - Web Source: [packages/library/src/ui/LibraryPreview.tsx](packages/library/src/ui/LibraryPreview.tsx)

### Mapped Feature Missing in ChatMessage

- **Emoji Icon Display** (medium)
  - Web feature "Emoji Icon Display" not satisfied by any mapped desktop feature ['Emoji Icon Display']
  - Effort: medium
  - Web Source: [packages/library/src/ui/ChatMessage.tsx](packages/library/src/ui/ChatMessage.tsx)
- **Form Handling** (medium)
  - Web feature "Form Handling" not satisfied by any mapped desktop feature ['Form Handling']
  - Effort: medium
  - Web Source: [packages/library/src/ui/ChatMessage.tsx](packages/library/src/ui/ChatMessage.tsx)

### Mapped Feature Missing in ConfigStatusUI

- **Emoji Icon Display** (medium)
  - Web feature "Emoji Icon Display" not satisfied by any mapped desktop feature ['Emoji Icon Display']
  - Effort: medium
  - Web Source: [packages/library/src/ui/ConfigStatusUI.tsx](packages/library/src/ui/ConfigStatusUI.tsx)
- **Form Handling** (medium)
  - Web feature "Form Handling" not satisfied by any mapped desktop feature ['Form Handling']
  - Effort: medium
  - Web Source: [packages/library/src/ui/ConfigStatusUI.tsx](packages/library/src/ui/ConfigStatusUI.tsx)

### Mapped Feature Missing in CustomComponentList

- **Form Handling** (medium)
  - Web feature "Form Handling" not satisfied by any mapped desktop feature ['Form Handling']
  - Effort: medium
  - Web Source: [packages/library/src/ui/CustomComponentList.tsx](packages/library/src/ui/CustomComponentList.tsx)

### Mapped Feature Missing in CustomComponentUpload

- **Emoji Icon Display** (medium)
  - Web feature "Emoji Icon Display" not satisfied by any mapped desktop feature ['Emoji Icon Display']
  - Effort: medium
  - Web Source: [packages/library/src/ui/CustomComponentUpload.tsx](packages/library/src/ui/CustomComponentUpload.tsx)
- **Form Handling** (medium)
  - Web feature "Form Handling" not satisfied by any mapped desktop feature ['Form Handling']
  - Effort: medium
  - Web Source: [packages/library/src/ui/CustomComponentUpload.tsx](packages/library/src/ui/CustomComponentUpload.tsx)

### Mapped Feature Missing in LibraryPanel

- **Error Handling** (medium)
  - Web feature "Error Handling" not satisfied by any mapped desktop feature ['Error Handling']
  - Effort: medium
  - Web Source: [packages/library/src/ui/LibraryPanel.tsx](packages/library/src/ui/LibraryPanel.tsx)

### Mapped Feature Missing in LibraryPreview

- **Component Card Rendering** (medium)
  - Web feature "Component Card Rendering" not satisfied by any mapped desktop feature ['Component Card Rendering']
  - Effort: medium
  - Web Source: [packages/library/src/ui/LibraryPreview.tsx](packages/library/src/ui/LibraryPreview.tsx)
- **Emoji Icon Display** (medium)
  - Web feature "Emoji Icon Display" not satisfied by any mapped desktop feature ['Emoji Icon Display']
  - Effort: medium
  - Web Source: [packages/library/src/ui/LibraryPreview.tsx](packages/library/src/ui/LibraryPreview.tsx)
- **JSON Metadata Extraction** (medium)
  - Web feature "JSON Metadata Extraction" not satisfied by any mapped desktop feature ['JSON Metadata Extraction']
  - Effort: medium
  - Web Source: [packages/library/src/ui/LibraryPreview.tsx](packages/library/src/ui/LibraryPreview.tsx)

### Mapped Feature Missing in drag.symphony

- **Drag Ghost Image** (medium)
  - Web feature "Drag Ghost Image" not satisfied by any mapped desktop feature ['Drag Ghost Image']
  - Effort: medium
  - Web Source: [packages/library-component/src/symphonies/drag.symphony.ts](packages/library-component/src/symphonies/drag.symphony.ts)
- **Drag and Drop** (medium)
  - Web feature "Drag and Drop" not satisfied by any mapped desktop feature ['Drag and Drop']
  - Effort: medium
  - Web Source: [packages/library-component/src/symphonies/drag.symphony.ts](packages/library-component/src/symphonies/drag.symphony.ts)
- **JSON Metadata Extraction** (medium)
  - Web feature "JSON Metadata Extraction" not satisfied by any mapped desktop feature ['JSON Metadata Extraction']
  - Effort: medium
  - Web Source: [packages/library-component/src/symphonies/drag.symphony.ts](packages/library-component/src/symphonies/drag.symphony.ts)

### Mapped Feature Missing in drag.preview.stage-crew

- **Animations** (medium)
  - Web feature "Animations" not satisfied by any mapped desktop feature ['Animations', 'Transitions']
  - Effort: medium
  - Web Source: [packages/library-component/src/symphonies/drag/drag.preview.stage-crew.ts](packages/library-component/src/symphonies/drag/drag.preview.stage-crew.ts)
- **Drag Ghost Image** (medium)
  - Web feature "Drag Ghost Image" not satisfied by any mapped desktop feature ['Drag Ghost Image']
  - Effort: medium
  - Web Source: [packages/library-component/src/symphonies/drag/drag.preview.stage-crew.ts](packages/library-component/src/symphonies/drag/drag.preview.stage-crew.ts)
- **Dynamic CSS Injection** (medium)
  - Web feature "Dynamic CSS Injection" not satisfied by any mapped desktop feature ['Dynamic CSS Injection', 'Dynamic Resource Binding']
  - Effort: medium
  - Web Source: [packages/library-component/src/symphonies/drag/drag.preview.stage-crew.ts](packages/library-component/src/symphonies/drag/drag.preview.stage-crew.ts)
- **Search/Filter** (medium)
  - Web feature "Search/Filter" not satisfied by any mapped desktop feature ['Search/Filter']
  - Effort: medium
  - Web Source: [packages/library-component/src/symphonies/drag/drag.preview.stage-crew.ts](packages/library-component/src/symphonies/drag/drag.preview.stage-crew.ts)

### Manifest Interaction Missing

- **library.container.drop** (medium)
  - Web manifest routes 'library.container.drop' to plugin 'LibraryComponentPlugin' but corresponding desktop component wasn't found.
  - Effort: medium
- **library.drag.move** (medium)
  - Web manifest routes 'library.drag.move' to plugin 'LibraryComponentPlugin' but corresponding desktop component wasn't found.
  - Effort: medium
- **library.drop** (medium)
  - Web manifest routes 'library.drop' to plugin 'LibraryComponentPlugin' but corresponding desktop component wasn't found.
  - Effort: medium

### Manifest Topic Route Missing

- **library.container.drop.requested** (low)
  - Topic 'library.container.drop.requested' references plugin 'LibraryComponentPlugin' but corresponding desktop component wasn't found.
  - Effort: quick
- **library.component.drag.start.requested** (low)
  - Topic 'library.component.drag.start.requested' references plugin 'LibraryComponentPlugin' but corresponding desktop component wasn't found.
  - Effort: quick
- **library.component.drop.requested** (low)
  - Topic 'library.component.drop.requested' references plugin 'LibraryComponentPlugin' but corresponding desktop component wasn't found.
  - Effort: quick

## 🎨 CSS & Styling Gaps

### Missing Animations and Transitions

**Severity:** LOW | **Effort:** medium

31 CSS classes with animations/transitions not replicated in desktop

- **Web:** 31/141 classes have animations
- **Desktop:** Minimal or no animations detected
- **Impact:** Less polished UI without smooth transitions and animations

**Recommendations:**
- Add Avalonia animations for hover states
- Implement transition effects using Storyboards
- Use RenderTransform for smooth animations

### Missing Hover Effects

**Severity:** LOW | **Effort:** quick

20 CSS classes with hover effects not replicated

- **Web:** 20/141 classes have hover states
- **Desktop:** Basic or no hover effects
- **Impact:** Less interactive feel without visual feedback on hover

**Recommendations:**
- Add :pointerover styles to Avalonia components
- Implement hover state visual changes
- Use RenderTransform for subtle hover animations

### Missing Gradient Backgrounds

**Severity:** LOW | **Effort:** quick

2 CSS classes use gradients

- **Web:** 2 gradient backgrounds
- **Desktop:** Solid colors used
- **Impact:** Less visually appealing without gradient effects

**Recommendations:**
- Add LinearGradientBrush to DesignTokens.axaml
- Replace solid colors with gradient brushes
- Create reusable gradient resources

### CSS Analysis Statistics

- **Total CSS Classes:** 141
- **Classes with Animations:** 24
- **Classes with Transitions:** 12
- **Classes with Hover States:** 20
- **Classes with Transforms:** 5
- **Classes with Gradients:** 2
- **Classes with Shadows:** 3

## 🗺️ Feature Map Audit (Web → Desktop)

### ChatMessage
- 🟠 Emoji Icon Display → Emoji Icon Display — missing
- 🟠 Form Handling → Form Handling — missing

### ChatWindow
- ✅ Animations → Animations, Transitions — present
- ✅ Emoji Icon Display → Emoji Icon Display — present
- ✅ Modal/Dialog → Modal/Dialog, Window, Dialog — present

### ConfigStatusUI
- 🟠 Emoji Icon Display → Emoji Icon Display — missing
- 🟠 Form Handling → Form Handling — missing

### CustomComponentList
- ✅ Emoji Icon Display → Emoji Icon Display — present
- 🟠 Form Handling → Form Handling — missing

### CustomComponentUpload
- ✅ Drag and Drop → Drag and Drop — present
- 🟠 Emoji Icon Display → Emoji Icon Display — missing
- ✅ File Upload → File Operations, File Upload — present
- 🟠 Form Handling → Form Handling — missing

### LibraryPanel
- ✅ Emoji Icon Display → Emoji Icon Display — present
- 🟠 Error Handling → Error Handling — missing

### LibraryPreview
- 🟠 Component Card Rendering → Component Card Rendering — missing
- ✅ Drag and Drop → Drag and Drop — present
- ✅ Dynamic CSS Injection → Dynamic CSS Injection, Dynamic Resource Binding — present
- 🟠 Emoji Icon Display → Emoji Icon Display — missing
- 🟠 JSON Metadata Extraction → JSON Metadata Extraction — missing

### drag.symphony
- 🟠 Drag Ghost Image → Drag Ghost Image — missing
- 🟠 Drag and Drop → Drag and Drop — missing
- 🟠 JSON Metadata Extraction → JSON Metadata Extraction — missing

### drop.container.symphony

### drop.symphony

### drag.preview.stage-crew
- 🟠 Animations → Animations, Transitions — missing
- 🟠 Drag Ghost Image → Drag Ghost Image — missing
- 🟠 Dynamic CSS Injection → Dynamic CSS Injection, Dynamic Resource Binding — missing
- 🟠 Search/Filter → Search/Filter — missing

## 🧾 Manifest Audit (Declared vs Desktop)

### Routes / Interactions (1 present / 3 missing)

- 🟠 library.container.drop → LibraryComponentPlugin (sequence library-component-container-drop-symphony) — missing
- 🟠 library.drag.move → LibraryComponentPlugin (sequence library-component-drag-symphony) — missing
- 🟠 library.drop → LibraryComponentPlugin (sequence library-component-drop-symphony) — missing
- ✅ library.load → LibraryPlugin (sequence library-load-symphony) — present

### Topics (4 present / 3 missing)

- ✅ library.load.requested → LibraryPlugin (sequence library-load-symphony) — present
- ✅ library.components.load → LibraryPlugin (sequence library-load-symphony) — present
- ✅ library.components.notify-ui → LibraryPlugin (sequence library-load-symphony) — present
- 🟡 library.container.drop.requested → LibraryComponentPlugin (sequence library-component-container-drop-symphony) — missing
- 🟡 library.component.drag.start.requested → LibraryComponentPlugin (sequence library-component-drag-symphony) — missing
- 🟡 library.component.drop.requested → LibraryComponentPlugin (sequence library-component-drop-symphony) — missing
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
- **Hooks:** useEffect, useState
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
- **Hooks:** React.useEffect, useState, useConductor, useEffect, React.useState
- **CSS Classes:** 18
- **Features:** Error Handling, Emoji Icon Display

#### LibraryPreview
- **Type:** function
- **Lines:** 61
- **Props:** None
- **Hooks:** None
- **CSS Classes:** 4
- **Features:** Drag and Drop, JSON Metadata Extraction, Dynamic CSS Injection, Emoji Icon Display, Component Card Rendering

#### drag.symphony
- **Type:** unknown
- **Lines:** 43
- **Props:** None
- **Hooks:** None
- **CSS Classes:** 0
- **Features:** Drag Ghost Image, Drag and Drop, JSON Metadata Extraction

#### drop.container.symphony
- **Type:** unknown
- **Lines:** 31
- **Props:** None
- **Hooks:** None
- **CSS Classes:** 0
- **Features:** None

#### drop.symphony
- **Type:** unknown
- **Lines:** 31
- **Props:** None
- **Hooks:** None
- **CSS Classes:** 0
- **Features:** None

#### drag.preview.stage-crew
- **Type:** unknown
- **Lines:** 151
- **Props:** None
- **Hooks:** None
- **CSS Classes:** 0
- **Features:** Drag Ghost Image, Animations, Search/Filter, Dynamic CSS Injection

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
- **Lines:** 437
- **Properties:** Id, Name, Category, Description, Icon
- **Events:** None
- **Styles:** 7
- **Features:** Drag and Drop, File Operations, JSON Metadata Extraction, ⚠️ Hidden Controls Detected, �🔴 HARDCODED SAMPLE DATA, 🔴 MISSING FILE LOADING, Dynamic CSS Injection, Emoji Icon Display

#### LibraryPreview
- **Lines:** 516
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
& ./.venv/Scripts/Activate.ps1; ./.venv/Scripts/python.exe migration_tools/web_desktop_gap_analyzer.py --plugin library --output migration_tools/output/gap_analysis_library_feature_links.md --show-css-gap --show-component-gap --show-feature-gap --quick-wins --feature-map migration_tools/feature_map.json
```

3. Open the regenerated report:
   - `migration_tools/output/gap_analysis_library_feature_links.md`

### Success criteria
- Executive Summary → Total Gaps decreases vs last run (ideally 0).
- Feature Map Audit → no entries with `missing` or `unmapped`.
- Manifest Audit → `missing` counts for Routes/Topics are 0.
- No MISPLACED AI CHAT TOGGLE / AI AVAILABILITY HINT gaps remain.

### Optional pre-checks
- Rebuild desktop to ensure XAML compiles:
```powershell
dotnet build src/RenderX.Shell.Avalonia.sln -c Release
```
- Rebuild web packages as needed:
```powershell
npm run build
```
