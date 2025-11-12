# Web vs Desktop Gap Analyzer

A Python tool that automatically compares web (React/TypeScript/CSS) UI implementations against desktop (Avalonia/C#/AXAML) implementations to identify missing features, styling gaps, and component parity issues.

## 🎯 Purpose

This analyzer helps teams maintain feature parity between web and desktop versions by:
- Detecting missing components in desktop implementations
- Identifying feature gaps (drag-drop, animations, form handling, etc.)
- Analyzing CSS styling differences (hover effects, gradients, animations)
- Highlighting quick win opportunities for improving desktop UI
- Providing actionable recommendations with effort estimates

## 📋 Features

### Component Analysis
- Parses React/TypeScript components (`.tsx` files)
- Parses Avalonia components (`.axaml` + `.cs` files)
- Compares component existence and line count
- Detects component type (function, class, const)

### Feature Detection
- **Drag and Drop** - Identifies drag/drop implementations
- **Modal/Dialog** - Detects modal and dialog patterns
- **Animations** - Finds transition and animation usage
- **API Integration** - Spots network/API calls
- **Form Handling** - Detects form inputs and submission
- **Error Handling** - Finds error boundaries and error handling
- **File Upload** - Identifies file upload functionality
- **Search/Filter** - Detects search and filtering features

### CSS/Style Analysis
- Parses CSS files and extracts class definitions
- Analyzes hover states (`:hover`)
- Detects animations and transitions
- Finds transform effects
- Identifies gradient backgrounds
- Counts box shadows
- Calculates complexity scores

### Gap Detection
- **Component Gaps** - Missing components
- **Feature Gaps** - Missing functionality within components
- **Style Gaps** - Missing CSS effects and polish
- Severity classification (Critical, High, Medium, Low)
- Effort estimation (Quick, Medium, Large)
- Quick win identification

## 🚀 Usage

### Basic Usage

```bash
# Analyze library plugin
python web_desktop_gap_analyzer.py --plugin library

# Analyze with all details
python web_desktop_gap_analyzer.py \
  --plugin library \
  --show-css-gap \
  --show-component-gap \
  --show-feature-gap \
  --quick-wins \
  --recommendations
```

### Advanced Usage

```bash
# Custom paths
python web_desktop_gap_analyzer.py \
  --plugin library \
  --web-packages ./packages \
  --desktop ./src \
  --output ./reports/library_gaps.md

# JSON output for tooling
python web_desktop_gap_analyzer.py \
  --plugin library \
  --format json \
  --output ./reports/library_gaps.json

# Filter by severity
python web_desktop_gap_analyzer.py \
  --plugin canvas \
  --severity high \
  --recommendations
```

## 📊 Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--plugin NAME` | Plugin name to analyze (required) | - |
| `--web-packages PATH` | Path to web packages folder | `./packages` |
| `--web-ui PATH` | Path to web UI folder | `./src/ui` |
| `--desktop PATH` | Path to desktop source folder | `./src` |
| `--output FILE` | Output file path | `./output/web_desktop_gap_report.md` |
| `--format FORMAT` | Output format: markdown, json, html | `markdown` |
| `--show-css-gap` | Show CSS styling gaps | false |
| `--show-component-gap` | Show component implementation gaps | false |
| `--show-feature-gap` | Show feature/functionality gaps | false |
| `--severity LEVEL` | Filter by: critical, high, medium, low, all | `all` |
| `--recommendations` | Include implementation recommendations | false |
| `--quick-wins` | Highlight quick win opportunities | false |

**Note:** If no `--show-*` flags are specified, all gap types are shown by default.

## 📈 Output Report Sections

### 1. Executive Summary
- Component counts (web vs desktop)
- Total gaps found
- Gap severity breakdown
- Code volume comparison
- Quick win count

### 2. Quick Win Opportunities
- Low-effort, high-impact improvements
- Typically 1-2 hours each
- Prioritized list with recommendations

### 3. Component Implementation Gaps
- Missing components in desktop
- Severity and effort estimates
- Impact assessment

### 4. Feature Implementation Gaps
- Grouped by component
- Feature descriptions
- Effort estimates

### 5. CSS & Styling Gaps
- Animation/transition gaps
- Hover effect gaps
- Gradient usage gaps
- Detailed CSS statistics

### 6. Component Details
- Full component inventory (web and desktop)
- Properties, hooks, events
- CSS class counts
- Feature lists

### 7. Implementation Recommendations
- Priority 1: Quick Wins
- Priority 2: High Impact Items
- Actionable steps

## 🔍 Example Output

```markdown
## 📊 Executive Summary

| Metric | Count |
|--------|-------|
| Web Components | 7 |
| Desktop Components | 29 |
| Total Gaps Found | 12 |
| Missing Components | 1 |
| Missing Features | 8 |
| Style Gaps | 3 |
| Quick Win Opportunities | 3 |

## 🚀 Quick Win Opportunities

### 1. Missing Hover Effects
**Severity:** LOW | **Effort:** quick

20 CSS classes with hover effects not replicated

**Recommendations:**
- Add :pointerover styles to Avalonia components
- Implement hover state visual changes
- Use RenderTransform for subtle hover animations
```

## 🛠️ How It Works

### 1. Web Component Parsing
- Scans `packages/<plugin>/src/ui/*.tsx` files
- Extracts component name, type, props, hooks
- Detects imports and CSS class usage
- Identifies features via pattern matching

### 2. Desktop Component Parsing
- Scans `src/RenderX.Plugins.<Plugin>/**/*.axaml` files
- Finds matching `.axaml.cs` code-behind files
- Extracts properties, events, styles
- Analyzes controls used

### 3. CSS Analysis
- Parses CSS files in web component directories
- Extracts class definitions and properties
- Detects hover states, animations, transitions
- Calculates complexity scores

### 4. Gap Detection
- Compares web vs desktop component lists
- Identifies missing components
- Checks feature parity for matching components
- Analyzes CSS styling differences
- Assigns severity and effort estimates

### 5. Report Generation
- Formats findings as markdown or JSON
- Prioritizes quick wins
- Groups related gaps
- Includes code statistics

## 📁 Project Structure

```
migration_tools/
├── web_desktop_gap_analyzer.py    # Main analyzer script
├── output/
│   ├── library_gap_analysis.md    # Generated reports
│   └── canvas_gap_analysis.md
└── README_GAP_ANALYZER.md         # This file
```

## 🎓 Use Cases

### For Development Teams
- Identify feature parity issues before release
- Prioritize desktop UI improvements
- Track progress toward web/desktop parity
- Guide sprint planning with effort estimates

### For Project Managers
- Generate gap reports for stakeholders
- Understand scope of desktop UI work
- Identify quick wins for demos
- Track parity metrics over time

### For QA Teams
- Verify feature completeness
- Create test plans based on feature lists
- Identify untested functionality
- Compare implementations systematically

## 🔧 Extending the Analyzer

### Adding New Feature Detectors

Edit `WebComponentParser._detect_features()`:

```python
# Detect new feature
if re.search(r'yourPattern', content):
    features.append(ComponentFeature(
        name='Your Feature',
        description='What it does',
        implementation_type='interaction'
    ))
```

### Adding New Gap Types

Edit `GapAnalyzer._detect_gaps()`:

```python
# Detect your gap
if some_condition:
    gaps.append(Gap(
        gap_type='your_type',
        severity='medium',
        title='Your Gap',
        description='Details',
        # ...
    ))
```

### Custom Report Formats

Extend `ReportGenerator` class:

```python
@staticmethod
def generate_html(analysis: PluginAnalysis, args) -> str:
    # Your HTML generation logic
    pass
```

## 🐛 Troubleshooting

### No components found
- Verify paths with `--web-packages` and `--desktop`
- Check plugin name matches directory structure
- Ensure files have correct extensions (`.tsx`, `.axaml`)

### Missing CSS analysis
- Verify CSS files exist in component directories
- Check CSS file naming matches component names
- Ensure CSS import statements in components

### Incorrect desktop component detection
- Check for `ResourceDictionary` in AXAML (skipped)
- Verify `.axaml.cs` files exist
- Check file encoding (should be UTF-8)

## 📚 Related Tools

- **ui_component_style_scanner.py** - Detailed UI component and style analysis
- **css_class_scanner.py** - CSS class usage scanner
- **axaml_usage_scanner.py** - AXAML usage patterns

## 🤝 Contributing

To improve the analyzer:

1. Add more feature detection patterns
2. Improve gap severity algorithms
3. Add more report formats (HTML, Excel)
4. Enhance CSS parsing accuracy
5. Add support for more frameworks

## 📝 Example Workflow

```bash
# 1. Initial analysis
python web_desktop_gap_analyzer.py --plugin library --quick-wins

# 2. Detailed report for team
python web_desktop_gap_analyzer.py \
  --plugin library \
  --show-css-gap \
  --show-component-gap \
  --show-feature-gap \
  --recommendations \
  --output ./reports/library_detailed.md

# 3. Export for tracking
python web_desktop_gap_analyzer.py \
  --plugin library \
  --format json \
  --output ./tracking/library_gaps_$(date +%Y%m%d).json

# 4. After implementing fixes, re-run to verify
python web_desktop_gap_analyzer.py --plugin library --quick-wins
```

## 🎯 Typical Results

For the **Library Plugin**:
- 7 web components, 29 desktop components
- 12 total gaps identified
- 3 quick win opportunities
- 141 CSS classes analyzed
- 20 hover effects missing
- 31 animation/transition gaps

**Quick Wins Identified:**
1. Add hover effects (~1 hour)
2. Add gradient backgrounds (~1 hour)
3. Implement basic animations (~2 hours)

## 📞 Support

For issues or questions:
- Check troubleshooting section above
- Review example output files
- Verify paths and plugin names
- Check Python version (3.7+)

---

**Last Updated:** November 9, 2025  
**Version:** 1.0.0  
**Python Version:** 3.7+
