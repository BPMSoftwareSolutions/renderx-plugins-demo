# UI Component & Style Scanner

A sophisticated Python script that scans UI components and their styles from React/TypeScript projects, generating detailed reports with ASCII visual representations of component hierarchies, layouts, and style relationships.

## 🎯 Features

- **Component Analysis**: Scans React/TypeScript components to extract:
  - Component names, types (function/class), and complexity scores
  - Props, hooks, and JSX elements used
  - Import dependencies and CSS file imports
  - Class names used in components
  - Line counts and complexity metrics

- **Style Analysis**: Parses CSS/SCSS files to extract:
  - CSS class definitions and their properties
  - Theme variants (e.g., dark mode styles)
  - Pseudo-states (hover, active, etc.)
  - Property usage statistics

- **ASCII Visualizations**: Generates beautiful ASCII art including:
  - Component box diagrams with metrics
  - Component hierarchy trees
  - CSS classes catalog tables
  - Package overview boxes
  - Statistical bar charts

- **Relationship Mapping**: Shows connections between:
  - Components and their CSS classes
  - Parent-child component relationships
  - Style definitions and their usage locations

## 📋 Requirements

- Python 3.6 or higher
- No external dependencies required (uses standard library only)

## 🚀 Usage

### Basic Usage

Scan the default folders (`./packages` and `./src/ui`):

```bash
python ui_component_style_scanner.py
```

### Custom Paths

Specify custom paths to scan:

```bash
python ui_component_style_scanner.py --packages ./my-packages --ui ./my-ui-folder
```

### Output Options

Save the report to a custom file:

```bash
python ui_component_style_scanner.py --output my_report.txt
```

### Display Options

Generate a full report with all features:

```bash
python ui_component_style_scanner.py --show-sketches --show-relationships --stats
```

## 📊 Command-Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--packages PATH` | Path to packages folder | `./packages` |
| `--ui PATH` | Path to UI folder | `./src/ui` |
| `--output FILE` | Output file path | `ui_component_style_report.txt` |
| `--format FORMAT` | Output format: `full`, `components`, `styles`, `tree` | `full` |
| `--show-sketches` | Include ASCII sketches of component layouts | (flag) |
| `--show-relationships` | Show component-style relationships | (flag) |
| `--show-dependencies` | Show import dependencies | (flag) |
| `--min-lines N` | Only show files with at least N lines | `1` |
| `--stats` | Show detailed statistics | (flag) |

## 📖 Examples

### Example 1: Full Analysis with All Features

```bash
python ui_component_style_scanner.py --show-sketches --show-relationships --stats
```

This generates a comprehensive report including:
- Executive summary with total counts
- Package overviews with metrics
- Top 10 most complex components with ASCII boxes
- Component hierarchy tree
- CSS classes catalog table
- Component-style relationship mappings
- Detailed statistics with bar charts

### Example 2: Components Only

```bash
python ui_component_style_scanner.py --format components --output components_only.txt
```

Generates a report focused only on component analysis.

### Example 3: Quick Stats

```bash
python ui_component_style_scanner.py --stats --output quick_stats.txt
```

Generates a quick statistical overview.

### Example 4: Large Projects

For large projects, filter to show only significant components:

```bash
python ui_component_style_scanner.py --min-lines 50 --stats
```

## 📈 Report Contents

The generated report includes:

### 1. Executive Summary
- Total packages scanned
- Total components found
- Total CSS classes found
- Total lines of code

### 2. Package Overview
ASCII boxes for each package showing:
- Number of components
- Number of style classes
- Total files
- Total lines of code

### 3. Component Catalog
- Top 10 most complex components with:
  - Component type (function/class)
  - Line count
  - Complexity score
  - Props used
  - Hooks used
  - CSS classes used
- Component hierarchy tree showing parent-child relationships

### 4. Styles Catalog
- Table of all CSS classes with:
  - Class name
  - Number of properties
  - Theme variants and pseudo-states
- Styles grouped by package

### 5. Component-Style Relationships
- Maps each component to its CSS classes
- Shows which CSS file defines each class
- Identifies external (undefined) classes

### 6. Detailed Statistics
- Component statistics:
  - Function vs class components
  - Total React hooks used
  - Average complexity score
- Style statistics:
  - Total CSS properties
  - Average properties per class
  - Theme-aware styles count
- Top 10 most used React hooks (with bar chart)
- Top 10 most used CSS properties (with bar chart)

## 🎨 Sample Output

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║              🎨 UI COMPONENT & STYLE ANALYSIS REPORT 🎨                       ║
║                                                                               ║
║              Sophisticated Analysis with ASCII Visualizations                 ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                          EXECUTIVE SUMMARY                            ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📦 Total Packages Scanned:          11                            ┃
┃  🔷 Total Components Found:         287                            ┃
┃  🎨 Total CSS Classes Found:        929                            ┃
┃  📝 Total Lines of Code:            41036                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

## 🔍 How It Works

1. **Scanning Phase**: The scanner recursively walks through the specified directories
2. **Parsing Phase**: 
   - React/TypeScript files are parsed to extract component information
   - CSS files are parsed to extract class definitions and properties
3. **Analysis Phase**: 
   - Components are analyzed for complexity and relationships
   - Styles are grouped and categorized
4. **Report Generation**: 
   - ASCII art is generated for visualizations
   - Statistics are calculated
   - Report sections are assembled

## 🛠️ Extending the Scanner

The scanner is modular and can be extended:

- **ComponentParser**: Extend to support additional component patterns
- **CSSParser**: Extend to support SCSS/LESS specific features
- **ASCIIArtGenerator**: Add new visualization types
- **ReportGenerator**: Add new report sections

## 📝 Notes

- The scanner works best with React/TypeScript projects
- CSS, SCSS, and LESS files are supported
- Component complexity is calculated based on:
  - Number of hooks used (×2 weight)
  - Number of JSX elements
  - Number of control flow statements (if/else/switch/for/while)

## 🤝 Integration

This scanner integrates well with:
- CI/CD pipelines for code analysis
- Documentation generation workflows
- Code review processes
- Refactoring planning

## 📊 Use Cases

1. **Project Auditing**: Get a comprehensive overview of UI architecture
2. **Refactoring Planning**: Identify complex components that need attention
3. **Style Consistency**: Analyze CSS usage patterns across packages
4. **Documentation**: Generate visual documentation of component structure
5. **Code Reviews**: Provide insights into component complexity and relationships

## 🎯 Project Context

This scanner was built for the RenderX Plugins Demo project to analyze:
- `./packages/*` - Multiple UI packages (canvas, control-panel, header, library, etc.)
- `./src/ui/*` - Core UI components and diagnostics

Scan results for this project:
- **287 components** across 11 packages
- **929 CSS classes** defined
- **41,036 lines** of code
- **79 function components** and **11 class components**
- **150 React hooks** used
- **3,504 CSS properties** defined

---

**Generated by**: UI Component & Style Scanner  
**Version**: 1.0  
**Date**: November 2025
