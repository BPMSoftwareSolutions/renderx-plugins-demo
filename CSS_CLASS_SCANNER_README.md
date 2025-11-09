# CSS Class Scanner - Quick Reference

A Python script that scans source code and CSS files to extract and visualize all CSS classes with sophisticated ASCII reports and statistics.

## Features

✅ **Comprehensive Pattern Detection**
- CSS/SCSS/LESS definitions (`.className { }`)
- React className props
- classList methods (add/remove/toggle)
- querySelector/querySelectorAll
- CSS Modules (styles.className)
- Template literals
- HTML class attributes
- Utility classes (Tailwind-style)

✅ **Multiple Report Formats**
- Tree view (hierarchical, grouped)
- Flat list (simple, grep-friendly)
- JSON (machine-readable)

✅ **Flexible Grouping**
- By file (see all classes in each file)
- By class name (see where each class is used)
- By package (package-level statistics)

✅ **Rich Statistics**
- Usage type breakdown
- Most used classes
- Orphaned classes (defined but never used)
- Package distribution
- Definition vs usage counts

## Usage

### Basic Scan
```bash
python css_class_scanner.py packages
```

### With Statistics
```bash
python css_class_scanner.py packages --stats
```

### Group by Class Name
```bash
python css_class_scanner.py packages --group-by class --show-usage
```

### Filter by Minimum Usage
```bash
# Only show classes used 10+ times
python css_class_scanner.py packages --min-usage 10 --stats
```

### Different Output Formats
```bash
# Tree format (default)
python css_class_scanner.py packages --format tree

# Flat list
python css_class_scanner.py packages --format flat

# JSON for further processing
python css_class_scanner.py packages --format json --output css_data.json
```

### Custom File Extensions
```bash
python css_class_scanner.py packages --include-ext .css,.scss,.tsx
```

### Save to File
```bash
python css_class_scanner.py packages --stats --output css_report.txt
```

## Example Results (from packages/)

### Overall Statistics
- **2,824 total occurrences**
- **877 unique class names**
- **493 definitions** (in CSS files)
- **2,331 usages** (in code)
- **289 files scanned**

### Usage Type Distribution
1. **template-literal** (57.4%) - Most common, used in logging/strings
2. **css-definition** (17.5%) - Actual CSS file definitions
3. **className-prop** (11.5%) - React JSX className attributes
4. **class-attr** (8.3%) - HTML class attributes
5. **utility-classes** (2.3%) - Multi-class strings
6. **querySelector** (1.7%) - DOM queries
7. **Others** (classList, css-module, data-attr)

### Top Packages
1. **digital-assets** - 956 occurrences
2. **musical-conductor** - 607 occurrences
3. **library** - 414 occurrences
4. **control-panel** - 405 occurrences
5. **canvas-component** - 316 occurrences

### Most Used Classes
- `.rx-button` - 39 occurrences
- `.rx-comp` - 33 occurrences
- `.test-class` - 18 occurrences
- `.rx-container` - 14 occurrences

### Orphaned Classes (Defined but Not Used)
The scanner identifies CSS classes that are defined but never used:
- `.scene-2-enter`
- `.class-pill`
- `.action-buttons`
- `.rx-card`
- `.custom-highlight`
- And more...

## Report Examples

### Tree View (Grouped by File)
```
├── packages\control-panel\src\ControlPanel.css (15 classes)
│   ├── 🎨 DEFINITIONS
│   │   ├── .control-panel
│   │   ├── .property-row
│   │   └── .button-group
│   └── 🔧 USAGES
│       ├── .rx-button (className-prop)
│       └── .field (template-literal)
```

### By Class Name (with usage locations)
```
├── .rx-button (39 occurrences)
│   ├── 🎨 DEFINED IN:
│   │   ├── packages\control-panel\src\state\css-registry.store.ts:48
│   │   └── packages\canvas-component\__tests__\create.dom.spec.ts:10
│   └── 🔧 USED IN:
│       ├── packages\library\src\LibraryPanel.tsx:45 (className-prop)
│       ├── packages\canvas\src\CanvasPage.tsx:78 (className-prop)
│       └── ... and 35 more
```

### By Package
```
├── 📦 control-panel (405 occurrences, 151 unique)
│   ├── className-prop: 117
│   ├── css-definition: 116
│   ├── template-literal: 143
│   └── utility-classes: 24
```

## Use Cases

### 1. Style Audit
Find all CSS classes in your codebase:
```bash
python css_class_scanner.py packages --stats
```

### 2. Find Unused Styles
Identify orphaned CSS classes:
```bash
python css_class_scanner.py packages --stats | Select-String -Pattern "Orphaned"
```

### 3. Track Class Usage
See where a specific class is used:
```bash
python css_class_scanner.py packages --group-by class --show-usage | Select-String -Pattern "rx-button" -Context 0,10
```

### 4. Package-Level Analysis
Compare CSS usage across packages:
```bash
python css_class_scanner.py packages --group-by package --stats
```

### 5. Find Heavy CSS Files
Identify files with many classes:
```bash
python css_class_scanner.py packages --format flat | Select-String -Pattern "\.css"
```

### 6. Validate Naming Conventions
Export to JSON and analyze programmatically:
```bash
python css_class_scanner.py packages --format json --output css_data.json
```

## Pattern Detection Details

### CSS Definitions
Finds class definitions in CSS/SCSS/LESS files:
```css
.my-class { /* detected */ }
.another-class { /* detected */ }
```

### React/JSX Usage
Detects various React patterns:
```jsx
<div className="my-class" />              {/* detected */}
<div className={"my-class"} />            {/* detected */}
<div className="class1 class2" />         {/* both detected */}
```

### JavaScript Usage
Finds classes in JavaScript code:
```javascript
element.classList.add('my-class');        // detected
document.querySelector('.my-class');      // detected
styles.myClass;                           // detected (CSS Modules)
```

### Template Literals
Detects classes in template strings:
```javascript
const msg = `Class: ${className}`;        // detected
console.log(`Found .my-class`);           // detected
```

## Performance

- **Fast**: Scans 289 files in ~2 seconds
- **Memory efficient**: Streams files, doesn't load entire codebase
- **Accurate**: Regex patterns validated against real codebases

## Integration

### CI/CD Pipeline
```bash
# Fail if orphaned classes exceed threshold
python css_class_scanner.py src --stats --format json | jq '.statistics.orphaned_classes | length'
```

### Pre-commit Hook
```bash
# Check for new orphaned classes
python css_class_scanner.py src --stats > /tmp/css_report.txt
grep "Orphaned" /tmp/css_report.txt
```

### Documentation Generation
```bash
# Generate CSS documentation
python css_class_scanner.py src --group-by class --show-usage --output docs/css_classes.md
```

## Related Tools

Part of the Python analysis tools suite:
- **log_message_scanner.py** - Log statement analysis
- **event_sequence_scanner.py** - Event flow tracking
- **folder_tree_scanner.py** - Directory structure visualization
- **manifest_flow_analyzer.py** - Build chain analysis

## File Sizes

Generated reports from packages/ scan:
- `css_classes_report.txt` - 117 KB (full tree view)
- `css_by_class.txt` - 38 KB (grouped by class)
- `css_by_package.txt` - 5 KB (package summary)

## Tips

1. **Start with statistics**: Use `--stats` to get an overview
2. **Filter noise**: Use `--min-usage 5` to focus on commonly used classes
3. **Find specific usage**: Use `--group-by class --show-usage` to trace class usage
4. **Export for analysis**: Use `--format json` for programmatic processing
5. **Check orphans regularly**: Identify unused CSS to clean up

---

**Created**: November 9, 2025  
**Version**: 1.0.0  
**Python**: 3.7+
