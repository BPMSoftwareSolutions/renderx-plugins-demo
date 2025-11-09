# Desktop-Web Parity Plan for RenderX.Shell.Avalonia

**Project**: Establish component and styling parity between .NET Avalonia desktop app and web version  
**Date**: November 9, 2025  
**Status**: Planning Phase  

---

## 📊 Current State Analysis

### Web Application (React/TypeScript)
- **287 components** across 11 packages
- **929 CSS classes** with detailed styling
- **41,036 lines** of UI code
- **Modern stack**: React, TypeScript, Flexbox, CSS Variables

### Desktop Application (Avalonia/.NET)
- **Status**: Partial implementation
- **Gap**: Missing most components and styling
- **Location**: `src/RenderX.Shell.Avalonia.sln`

---

## 🎯 Project Goals

1. **Component Parity**: Port all 287 web components to Avalonia XAML
2. **Style Parity**: Implement 929 CSS classes as Avalonia styles
3. **Visual Parity**: Match design system (colors, typography, spacing, animations)
4. **Functional Parity**: Replicate all UI behaviors and interactions
5. **Performance**: Ensure desktop app meets or exceeds web performance

---

## 📦 Component Inventory by Package

### Priority 1: Core UI (High Impact)

| Package | Components | CSS Classes | Lines | Priority |
|---------|-----------|-------------|-------|----------|
| **ui** | 74 | 237 | 10,425 | HIGH |
| **control-panel** | 42 | 222 | 6,418 | HIGH |
| **library** | 29 | 404 | 8,118 | HIGH |

**Key Components to Port:**
- `DiagnosticsPanel` (530 lines, complexity 84, 11 hooks)
- `PluginTreeExplorer` (967 lines, complexity 52)
- `ControlPanel` (101 lines, complexity 38, 7 hooks)
- `LibraryPanel` (263 lines, complexity 36)

### Priority 2: Canvas & Layout (Medium Impact)

| Package | Components | CSS Classes | Lines | Priority |
|---------|-----------|-------------|-------|----------|
| **canvas-component** | 73 | 0 | 6,273 | MEDIUM |
| **canvas** | 7 | 36 | 1,068 | MEDIUM |
| **header** | 11 | 30 | 432 | MEDIUM |

**Key Components:**
- `CanvasPage`, `CanvasHeader`
- `HeaderControls`, `HeaderTitle`, `HeaderThemeToggle`
- Canvas rendering and zoom controls

### Priority 3: Supporting Components (Lower Impact)

| Package | Components | CSS Classes | Lines | Priority |
|---------|-----------|-------------|-------|----------|
| **digital-assets** | 39 | 0 | 7,792 | LOW |
| **library-component** | 5 | 0 | 340 | LOW |
| **musical-conductor** | 4 | 0 | 18 | LOW |
| **manifest-tools** | 2 | 0 | 96 | LOW |
| **components** | 1 | 0 | 56 | LOW |

---

## 🎨 Style System Analysis

### Color Palette (69 unique colors)

**Primary Colors:**
- Grays: `#1f2937`, `#374151`, `#2d2d30`, `#252526`
- Blues: `#007bff`, `#2563eb`, `#0056b3`, `#1e40af`
- Greens: `#10b981`, `#059669`, `#34c759`
- Purples: `#667eea`, `#764ba2`

**RGBA Transparency:**
- 23 RGBA colors for overlays, shadows, and effects

**Action Required:**
- Create Avalonia `ResourceDictionary` with all colors
- Implement light/dark theme support (currently only 10 theme-aware classes)
- Map CSS variables to `DynamicResource`

### Typography Scale

**Font Sizes** (Top 5):
- `12px` - 62 uses (most common)
- `11px` - 28 uses
- `14px` - 28 uses
- `16px` - 19 uses
- `10px` - 16 uses

**Font Weights:**
- `600` (semi-bold) - 68 uses
- `500` (medium) - 44 uses

**Font Families:**
- 4 monospace variants for code display
- Monaco, Menlo, Consolas, SF Mono

**Action Required:**
- Create TextBlock style resources for each size/weight combination
- Map monospace fonts to Avalonia equivalents (Consolas, Courier New)

### Spacing System

**Padding Values** (Top 5):
- `16px` - 23 uses
- `4px` - 17 uses
- `1rem` - 17 uses
- `8px 12px` - 14 uses
- `12px` - 12 uses

**Gap Values** (Flexbox/Grid):
- `8px` - 50 uses (most common)
- `4px` - 29 uses
- `12px` - 21 uses

**Pattern Identified**: 4px base unit (4px, 8px, 12px, 16px, 20px, 24px)

**Action Required:**
- Create `Thickness` resources for common padding values
- Implement spacing tokens (Tight, Normal, Comfortable, Spacious)

### Layout Systems

**Flexbox**: 222 classes (23.9%)
**Grid**: 10 classes (1.1%)

**Key Patterns:**
- `display: flex` with `align-items: center`, `justify-content: space-between`
- `flex-direction: column` for vertical layouts
- `gap` for consistent spacing

**Action Required:**
- Map flexbox patterns to `StackPanel`, `WrapPanel`, `Grid`
- Implement equivalent alignment and spacing
- Port CSS Grid layouts (10 classes)

### Animations & Effects

**Transitions** (70 classes):
- `all 0.2s` - 28 uses
- `opacity 0.2s` - 11 uses
- `all 0.2s ease` - 10 uses
- `background-color 0.2s` - 7 uses

**Transforms** (38 classes):
- `translateY(-1px)` - 15 uses (hover lift)
- `translateY(0)` - 8 uses
- `rotate(180deg)` - 4 uses
- `scale(1.02)` - 4 uses

**Action Required:**
- Create Avalonia `Transitions` for property changes
- Implement hover effects using `PointerOver` pseudo-class
- Create reusable animation resources

---

## 🏗️ Implementation Strategy

### Phase 1: Foundation (Weeks 1-2)

#### Task 1.1: Style System
- [ ] Create `RenderXStyles.axaml` with base styles
- [ ] Implement color palette (69 colors + 23 RGBA)
- [ ] Define typography styles (font sizes, weights, families)
- [ ] Create spacing resources (padding, margin, gap equivalents)

#### Task 1.2: Core Components
- [ ] Port Header components (11 components, 30 CSS classes)
- [ ] Implement button styles with hover/active states
- [ ] Create theme toggle functionality

#### Task 1.3: Layout System
- [ ] Map flexbox patterns to Avalonia layouts
- [ ] Create reusable panel templates
- [ ] Implement responsive behavior

### Phase 2: Primary Components (Weeks 3-5)

#### Task 2.1: Control Panel
- [ ] Port `ControlPanel` component (42 total components)
- [ ] Implement `PropertySection`, `ClassManager`
- [ ] Create schema resolver integration
- [ ] Port 222 CSS classes

#### Task 2.2: Canvas System
- [ ] Port `CanvasPage` and `CanvasHeader`
- [ ] Implement grid rendering with dot pattern
- [ ] Create zoom controls and transformations
- [ ] Implement drag-drop indicators

#### Task 2.3: Library Components
- [ ] Port `LibraryPanel` (29 components)
- [ ] Implement `ChatWindow` and `ChatMessage`
- [ ] Create AI chat integration UI
- [ ] Port 404 CSS classes

### Phase 3: Diagnostics & Advanced UI (Weeks 6-8)

#### Task 3.1: Diagnostics Panel
- [ ] Port `DiagnosticsPanel` (530 lines, 11 hooks)
- [ ] Implement complex state management
- [ ] Create modal/overlay system
- [ ] Port 237 CSS classes from ui package

#### Task 3.2: Plugin Tree Explorer
- [ ] Port `PluginTreeExplorer` (967 lines)
- [ ] Implement tree view with search
- [ ] Create node expansion/collapse animations
- [ ] Add icon system

#### Task 3.3: Custom Controls
- [ ] Create `SearchBox` control
- [ ] Build `PropertyGrid` component
- [ ] Implement `ColorPicker`
- [ ] Create `CodeEditor` (CSS editor equivalent)

### Phase 4: Animations & Polish (Weeks 9-10)

#### Task 4.1: Animations
- [ ] Implement 70 transition effects
- [ ] Create 38 transform effects
- [ ] Add hover/active state animations
- [ ] Optimize animation performance

#### Task 4.2: Visual Effects
- [ ] Port border-radius patterns (6-12px)
- [ ] Implement box-shadows and elevation
- [ ] Create gradient backgrounds
- [ ] Add backdrop blur effects

#### Task 4.3: Theming
- [ ] Expand dark mode support (currently 10 classes)
- [ ] Create theme switching mechanism
- [ ] Ensure all colors support themes
- [ ] Test theme transitions

### Phase 5: Testing & Optimization (Weeks 11-12)

#### Task 5.1: Visual Parity Testing
- [ ] Side-by-side comparison with web app
- [ ] Verify color accuracy
- [ ] Check typography matching
- [ ] Validate spacing consistency
- [ ] Test all animations

#### Task 5.2: Performance Optimization
- [ ] Profile rendering performance
- [ ] Implement virtual scrolling
- [ ] Optimize resource dictionaries
- [ ] Enable GPU acceleration for animations

#### Task 5.3: Documentation
- [ ] Document each ported component
- [ ] Create visual style guide
- [ ] Write XAML usage examples
- [ ] Document MVVM patterns used

---

## 🔄 React to Avalonia Mapping Guide

### State Management

| React Pattern | Avalonia/C# Equivalent |
|---------------|------------------------|
| `useState` | `INotifyPropertyChanged` property |
| `useEffect` | Constructor, `Loaded` event, or lifecycle methods |
| `useCallback` | Event handler methods |
| `useMemo` | Computed properties with backing field |
| `useContext` | Dependency injection or static resources |
| `useRef` | Field with `nameof()` references |

### Custom Hooks to Services

| React Hook | Avalonia Pattern |
|------------|------------------|
| `useControlPanelState` | `ControlPanelViewModel` |
| `useSchemaResolver` | `SchemaResolverService` (DI) |
| `useConductor` | `ConductorService` (singleton) |
| `usePluginLoadingStats` | `PluginStatsService` (observable) |

### Component Patterns

| React Component | Avalonia Control |
|-----------------|------------------|
| `<div>` | `Border` or `Panel` |
| `<button>` | `Button` |
| `<input>` | `TextBox` |
| `<select>` | `ComboBox` |
| `className` | `Classes` (Avalonia 11+) or `Style` |

### CSS to XAML

| CSS Property | XAML Property |
|-------------|---------------|
| `display: flex` | `StackPanel` or custom `Panel` |
| `flex-direction: column` | `Orientation="Vertical"` |
| `align-items: center` | `HorizontalAlignment="Center"` |
| `justify-content: space-between` | `HorizontalAlignment` with margins |
| `gap: 8px` | `Spacing="8"` (StackPanel) |
| `padding: 16px` | `Padding="16"` |
| `color: #1f2937` | `Foreground="#1f2937"` |
| `background: #fff` | `Background="#fff"` |
| `border-radius: 6px` | `CornerRadius="6"` |
| `box-shadow` | `DropShadowEffect` or custom |
| `transition: all 0.2s` | `Transitions` collection |

---

## 📋 Component Checklist

### Header Package (11 components)
- [ ] HeaderControls.tsx → HeaderControls.axaml
- [ ] HeaderTitle.tsx → HeaderTitle.axaml
- [ ] HeaderThemeToggle.tsx → HeaderThemeToggle.axaml
- [ ] HeaderThemeButtonView.tsx → HeaderThemeButtonView.axaml
- [ ] (7 more header components)

### Canvas Package (7 components)
- [ ] CanvasPage.tsx → CanvasPage.axaml
- [ ] CanvasHeader.tsx → CanvasHeader.axaml
- [ ] (5 more canvas components)

### Control Panel Package (42 components)
- [ ] ControlPanel.tsx → ControlPanel.axaml
- [ ] PanelHeader → PanelHeader.axaml
- [ ] EmptyState → EmptyState.axaml
- [ ] LoadingState → LoadingState.axaml
- [ ] PropertySection → PropertySection.axaml
- [ ] ClassManager → ClassManager.axaml
- [ ] (36 more control panel components)

### Library Package (29 components)
- [ ] LibraryPanel.tsx → LibraryPanel.axaml
- [ ] ChatWindow.tsx → ChatWindow.axaml
- [ ] ChatMessage.tsx → ChatMessage.axaml
- [ ] ConfigStatusUI.tsx → ConfigStatusUI.axaml
- [ ] LibraryPreview.tsx → LibraryPreview.axaml
- [ ] CustomComponentUpload.tsx → CustomComponentUpload.axaml
- [ ] (23 more library components)

### UI/Diagnostics Package (74 components)
- [ ] DiagnosticsPanel.tsx → DiagnosticsPanel.axaml
- [ ] DiagnosticsOverlay.tsx → DiagnosticsOverlay.axaml
- [ ] PluginTreeExplorer.tsx → PluginTreeExplorer.axaml
- [ ] (71 more UI components)

---

## 🎯 Success Metrics

### Visual Parity
- [ ] 95%+ color accuracy (within 5% delta)
- [ ] 100% typography matching (all sizes/weights present)
- [ ] 100% spacing consistency (4px grid system)
- [ ] 90%+ animation equivalence

### Functional Parity
- [ ] All 287 components ported and functional
- [ ] Theme switching works correctly
- [ ] All interactions respond as expected
- [ ] State management operates correctly

### Performance
- [ ] Startup time < 3 seconds
- [ ] UI responsiveness < 16ms frame time (60fps)
- [ ] Memory usage < 500MB for typical workflow
- [ ] Animation smoothness 60fps

### Code Quality
- [ ] All components follow MVVM pattern
- [ ] Proper separation of concerns
- [ ] Reusable style resources
- [ ] Comprehensive documentation

---

## 🔧 Technical Requirements

### Avalonia Version
- **Target**: Avalonia 11.0+ (for best CSS-like styling support)
- **Features needed**:
  - Classes API for CSS-like styling
  - Transitions API for animations
  - DropShadowEffect for shadows
  - Composition API for advanced effects

### .NET Version
- **.NET 8.0** (LTS recommended)

### NuGet Packages
- `Avalonia` (core)
- `Avalonia.Themes.Fluent` (base theme)
- `Avalonia.Controls.DataGrid` (if needed)
- `Avalonia.Svg` (for icon system)
- `Avalonia.ReactiveUI` (for MVVM)

---

## 📚 Resources

### Reference Materials
- Web component inventory: `ui_component_style_report.txt` (792 lines)
- Style analysis: See sections on colors, typography, spacing, animations
- Component complexity scores: For prioritization

### Avalonia Documentation
- Official docs: https://docs.avaloniaui.net/
- Styling guide: https://docs.avaloniaui.net/docs/styling/
- Animations: https://docs.avaloniaui.net/docs/animations/

### Design System References
- Color palette: 69 hex + 23 RGBA colors
- Typography scale: 12px (primary), 11px, 14px, 16px
- Spacing tokens: 4px, 8px, 12px, 16px, 20px, 24px
- Animation timing: 0.2s standard

---

## 🚀 Getting Started

### Step 1: Environment Setup
```bash
# Ensure .NET 8.0 SDK is installed
dotnet --version

# Open solution in Visual Studio or Rider
# Path: C:\source\repos\bpm\internal\renderx-plugins-demo\src\RenderX.Shell.Avalonia.sln
```

### Step 2: Create Style Foundation
```bash
# Create Styles directory if not exists
mkdir src/RenderX.Shell.Avalonia/Styles

# Create base style file
# File: src/RenderX.Shell.Avalonia/Styles/RenderXStyles.axaml
```

### Step 3: Port First Component (Header)
- Start with simplest package: Header (11 components, 30 CSS classes)
- Validate approach before tackling complex components
- Use as reference for remaining work

---

## 📊 Project Timeline

**Total Estimated Duration**: 12 weeks (3 months)

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Foundation | 2 weeks | Style system + Header components |
| Phase 2: Primary Components | 3 weeks | Control Panel, Canvas, Library |
| Phase 3: Diagnostics & Advanced | 3 weeks | Diagnostics, Tree Explorer, Custom controls |
| Phase 4: Animations & Polish | 2 weeks | Effects, theming, visual refinement |
| Phase 5: Testing & Optimization | 2 weeks | Parity validation, performance tuning |

---

## 🎯 Next Actions

1. **Review this plan** with team/stakeholders
2. **Set up Avalonia project** structure if not already done
3. **Create `RenderXStyles.axaml`** with base color/typography resources
4. **Port Header package** (11 components) as proof of concept
5. **Validate approach** before proceeding to complex components

---

**Document Version**: 1.0  
**Last Updated**: November 9, 2025  
**Status**: Ready for Review and Implementation
