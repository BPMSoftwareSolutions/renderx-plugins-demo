# CSS-to-Avalonia Parity Documentation

## Overview

This document explains how the CSS Registry system works in the RenderX Avalonia (desktop) application and how it achieves parity with the web version's CSS styling system.

## Architecture

### CSS Registry Service

The `CssRegistryService` in `RenderX.HostSDK.Avalonia` bridges the web's CSS API to Avalonia's styling system:

1. **JavaScript Bridge**: Maintains compatibility with the web's `cssRegistry.createClass()` API via Jint
2. **Style Conversion**: Uses `AvaloniaStyleConverter` to convert CSS properties to Avalonia `Setter` objects
3. **Dynamic Injection**: Injects converted styles into `Application.Current.Styles` at runtime
4. **Thread Safety**: All style injection happens on the UI thread via `Dispatcher.UIThread`

### Style Converter

The `AvaloniaStyleConverter` handles CSS-to-XAML translation:

```csharp
// Example usage:
var converter = new AvaloniaStyleConverter();
var style = converter.ConvertToStyle("my-button", ".my-button { color: #FF0000; background: blue; }");
// Returns: Style with selector "Control.my-button" and appropriate Setters
```

## Supported CSS Properties

### Color Properties
- `color` → `TemplatedControl.ForegroundProperty`
- `background-color`, `background` → `TemplatedControl.BackgroundProperty`
- `border-color` → `Border.BorderBrushProperty`

**Supported Formats:**
- Hex: `#RGB`, `#RRGGBB`, `#RRGGBBAA`
- RGB/RGBA: `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)`
- Named colors: `transparent`, `white`, `black`, etc.

### Size Properties
- `width` → `Layoutable.WidthProperty`
- `height` → `Layoutable.HeightProperty`
- `min-width`, `min-height`, `max-width`, `max-height` → Corresponding `Layoutable` properties

**Supported Units:**
- `px` (pixels): `100px`
- `rem` (relative): `1.5rem` (multiplied by 16)
- `em` (relative): `2em` (multiplied by 16)

### Spacing Properties
- `margin` → `Layoutable.MarginProperty`
- `padding` → `Decorator.PaddingProperty`
- `border-width` → `Border.BorderThicknessProperty`

**Supported Formats:**
- Single value: `10px` → `Thickness(10)`
- Two values: `10px 20px` → `Thickness(20, 10, 20, 10)` (horizontal, vertical)
- Four values: `10px 20px 30px 40px` → `Thickness(40, 10, 20, 30)` (left, top, right, bottom)

### Font Properties
- `font-size` → `TemplatedControl.FontSizeProperty`
- `font-weight` → `TemplatedControl.FontWeightProperty`
  - Named: `normal`, `bold`, `lighter`, `bolder`
  - Numeric: `100`-`900` (e.g., `400` = Normal, `700` = Bold)
- `font-family` → `TemplatedControl.FontFamilyProperty`

### Other Properties
- `opacity` → `Visual.OpacityProperty` (0.0 to 1.0)

## Static Styles

Pre-defined styles are loaded from XAML files at application startup:

### Component Styles (`Styles/Components/ComponentStyles.axaml`)

**Button Styles:**
- `.rx-button` - Primary button with blue background, hover/pressed states
- `.header-button` - Header action button with light background
- `.header-theme-button` - Dark theme toggle button
- `.canvas-control` - Canvas toolbar button with active state

**Container Styles:**
- `.rx-container` - Generic container with border and padding
- `.rx-canvas` - Canvas area background
- `.rx-comp` - Component wrapper with hover effect
- `.rx-line` - Visual separator line

**Layout Styles:**
- `.canvas-area` - Main canvas container
- `.canvas-header` - Canvas header bar
- `.canvas-title` - Canvas title text

### Diagnostics Styles (`Styles/Diagnostics/DiagnosticsStyles.axaml`)

**Button Variants:**
- `.btn` - Standard button
- `.btn-sm` - Small button variant

**Panel Styles:**
- `.panel-header` - Panel header container (dark theme)
- `.panel-title` - Panel title text (blue accent)
- `.panel-content` - Panel content area
- `.stat-badge` - Statistics badge

**UI Elements:**
- `.detail-row` - Detail information row
- `.detail-label` - Detail label text
- `.code` - Inline code style (monospace font)
- `.plugin-item` - Plugin list item with hover
- `.inspection-panel-content` - Inspection panel content area
- `.diagnostics-modal` - Diagnostics modal container

### Utility Classes (`Styles/RenderXStyles.axaml`)

**Text Utilities:**
- `.text-primary` (TextBlock) - Primary text color
- `.text-secondary` (TextBlock) - Secondary/muted text

**Background Utilities:**
- `.bg-white` (Border) - White background
- `.bg-gray-50` (Border) - Light gray background
- `.bg-gray-100` (Border) - Medium gray background

**Border Utilities:**
- `.border` (Border) - 1px border with gray color
- `.rounded` (Border) - 4px corner radius
- `.rounded-lg` (Border) - 8px corner radius

**Spacing Utilities:**
- `.p-2` (Border) - 8px padding
- `.p-4` (Border) - 16px padding

## Using Styles in Avalonia Controls

### Static Classes (Preferred)

Use the `Classes` property to apply pre-defined styles:

```xml
<!-- In AXAML -->
<Button Classes="rx-button">Click Me</Button>
<Border Classes="rx-container rounded">
    <TextBlock Classes="text-primary">Content</TextBlock>
</Border>
```

```csharp
// In C# code
var button = new Button();
button.Classes.Add("rx-button");

var container = new Border();
container.Classes.Add("rx-container");
container.Classes.Add("rounded");
```

### Dynamic Classes (Advanced)

Create CSS classes at runtime via the CSS Registry:

```csharp
// From JavaScript (via Jint)
await cssRegistry.createClass({
    name: "custom-button",
    rules: ".custom-button { background-color: #FF5733; padding: 12px; }"
});

// From C#
await cssRegistry.CreateClassAsync(new CssClassDef
{
    Name = "custom-button",
    Rules = ".custom-button { background-color: #FF5733; padding: 12px; }"
});

// Apply to control
button.Classes.Add("custom-button");
```

## Limitations and Differences

### Not Supported

1. **Pseudo-classes**: `:hover`, `:focus`, `:active` (use Avalonia's `:pointerover`, `:focus`, `:pressed` selectors in AXAML)
2. **Pseudo-elements**: `::before`, `::after`
3. **CSS Selectors**: Descendant selectors (`.parent .child`), combinators (`>`, `+`, `~`)
4. **Media Queries**: `@media` (use Avalonia's responsive design patterns)
5. **Animations**: `@keyframes`, `transition` (use Avalonia Animations)
6. **CSS Variables**: `var(--color)` (use Avalonia's `{StaticResource}` or `{DynamicResource}`)
7. **Flexbox/Grid**: `display: flex`, `display: grid` (use Avalonia's `StackPanel`, `Grid`, `DockPanel`)

### Key Differences

| Web (CSS) | Avalonia (XAML) | Notes |
|-----------|-----------------|-------|
| `.my-class` | `Control.my-class` | Avalonia requires control type in selector |
| `background` | `Background` | Property names are PascalCase |
| `padding: 10px` | `Padding="10"` | No units in Avalonia (always device-independent pixels) |
| `:hover` | `:pointerover` | Different pseudo-class names |
| `transition` | `<Style.Animations>` | Use Avalonia Animation system |
| `#id` | `x:Name` | ID selectors not supported in styles |

### Control Type Requirements

Avalonia properties are specific to control types:

- **Background, Foreground, Padding** require `TemplatedControl` or `Border`
- **BorderBrush, BorderThickness, CornerRadius** require `Border`
- **FontSize, FontWeight, FontFamily** require `TemplatedControl`
- **Margin, Width, Height** are available on all `Layoutable` controls

**Example:**
```csharp
// ❌ Won't compile - Control doesn't have Background
<Style Selector="Control.my-class">
    <Setter Property="Background" Value="Blue" />
</Style>

// ✅ Correct - Border has Background
<Style Selector="Border.my-class">
    <Setter Property="Background" Value="Blue" />
</Style>
```

## Best Practices

1. **Use Static Styles When Possible**: Pre-defined XAML styles are faster and type-safe
2. **Specific Control Types**: Use `Button.my-class` instead of `Control.my-class` for better property support
3. **Classes Over IDs**: Avalonia doesn't support ID selectors; use classes instead
4. **Multiple Classes**: Apply multiple utility classes for composition:
   ```csharp
   border.Classes.Add("rx-container");
   border.Classes.Add("rounded");
   border.Classes.Add("bg-white");
   ```
5. **Theme Resources**: For colors/brushes that change with theme, use `{DynamicResource}`:
   ```xml
   <Setter Property="Background" Value="{DynamicResource RxPrimaryColor}" />
   ```

## Examples

### Creating a Custom Button Style

**Web (CSS):**
```css
.my-button {
    background-color: #3b82f6;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
}
```

**Avalonia (Static XAML):**
```xml
<Style Selector="Button.my-button">
    <Setter Property="Background" Value="#3b82f6" />
    <Setter Property="Foreground" Value="White" />
    <Setter Property="Padding" Value="16,8" />
    <Setter Property="CornerRadius" Value="6" />
    <Setter Property="FontSize" Value="14" />
    <Setter Property="FontWeight" Value="Medium" />
</Style>
```

**Avalonia (Dynamic via CSS Registry):**
```csharp
await cssRegistry.CreateClassAsync(new CssClassDef
{
    Name = "my-button",
    Rules = @".my-button { 
        background-color: #3b82f6; 
        color: white; 
        padding: 8px 16px; 
        font-size: 14px; 
        font-weight: 500; 
    }"
});
```

### Combining Multiple Classes

```csharp
var container = new Border();
container.Classes.Add("rx-container");  // Base container style
container.Classes.Add("rounded-lg");    // Large rounded corners
container.Classes.Add("bg-gray-50");    // Light gray background
container.Classes.Add("p-4");           // 16px padding
```

## Troubleshooting

### Style Not Applying

1. **Check Control Type**: Ensure the control type matches the selector
   ```xml
   <!-- Wrong -->
   <TextBlock Classes="rx-button" />
   
   <!-- Correct -->
   <Button Classes="rx-button" />
   ```

2. **Verify Property Support**: Not all properties work on all controls
   ```csharp
   // ❌ TextBlock doesn't have Background
   textBlock.Classes.Add("bg-white");
   
   // ✅ Wrap in Border
   <Border Classes="bg-white">
       <TextBlock />
   </Border>
   ```

3. **Check Style is Loaded**: Ensure XAML files are included in `App.axaml`
   ```xml
   <StyleInclude Source="/Styles/RenderXStyles.axaml"/>
   ```

4. **Dynamic Styles**: Verify style was injected successfully
   ```csharp
   // Check if style exists
   var hasStyle = Application.Current.Styles
       .OfType<Style>()
       .Any(s => s.Selector?.ToString().Contains("my-class") == true);
   ```

### Build Errors

1. **AVLN2000**: "Unable to resolve suitable property"
   - Control type doesn't support the property
   - Change selector to appropriate control type (e.g., `Border` instead of `Control`)

2. **CS0411**: "The type arguments for method cannot be inferred"
   - AvaloniaStyleConverter issue
   - Ensure `CreateSetter` uses non-generic `AvaloniaProperty`

## Performance Considerations

- **Static vs Dynamic**: Static XAML styles are compiled and faster than dynamic CSS conversion
- **Style Count**: Too many dynamic styles can slow down application startup
- **Caching**: Converted styles are cached in `_injectedStyles` dictionary
- **UI Thread**: All style injection happens on UI thread; batch updates when possible

## Summary

The RenderX Avalonia application achieves CSS parity through:

1. **Static Styles**: Comprehensive XAML styles matching web CSS classes
2. **Dynamic Conversion**: Runtime CSS-to-XAML conversion via `AvaloniaStyleConverter`
3. **API Compatibility**: CSS Registry service compatible with web version
4. **Best Practices**: Type-safe, performant styling patterns for desktop

For plugin developers, use pre-defined classes from `ComponentStyles.axaml` and `DiagnosticsStyles.axaml` whenever possible, and only use dynamic CSS creation for truly runtime-generated styles.
