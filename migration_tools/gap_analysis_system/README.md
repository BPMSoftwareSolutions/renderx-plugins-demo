# Gap Analysis System - Refactoring Status

## Overview
This directory contains the refactored domain-driven version of the monolithic `web_desktop_gap_analyzer.py` script (2227 lines).

## Refactoring Status

### ✅ Completed Modules

1. **`__init__.py`** - Package initialization
2. **`models.py`** - Core domain models (6 dataclasses)
   - ComponentFeature
   - WebComponent
   - DesktopComponent
   - CSSAnalysis
   - Gap
   - PluginAnalysis

3. **`web_parser.py`** - Web component parser domain
   - WebComponentParser class with 6 methods
   - Parses React/TypeScript/JSX files
   - Extracts JSX elements, rendered text, layout hints, UI hints, and features

4. **`desktop_parser.py`** - Desktop component parser domain
   - DesktopComponentParser class with 6 methods
   - Parses Avalonia/C#/AXAML files
   - Extracts AXAML elements, rendered text, layout hints, UI hints, and features
   - Includes critical gap detection for stubs, hidden controls, hardcoded data

5. **`css_parser.py`** - CSS parser domain
   - CSSParser class with 1 method
   - Analyzes CSS files for styling features

6. **`ddd-map.json`** - Complete domain-driven design map
   - Maps all 971 lines of GapAnalyzer (the largest class)
   - Maps all 380 lines of ReportGenerator
   - Documents all cross-domain dependencies
   - Tracks refactoring status for each element

### 🚧 In Progress

7. **`analyzer.py`** - Gap analysis engine (**NEEDS MANUAL EXTRACTION**)
   - GapAnalyzer class (lines 971-1773 in original file = ~800 lines)
   - 7 static methods:
     - `analyze_plugin()` - Main orchestration
     - `_manifest_audit()` - Manifest comparison logic
     - `_find_web_components()` - Web component discovery
     - `_find_desktop_components()` - Desktop component discovery
     - `_analyze_css()` - CSS analysis
     - `_detect_gaps()` - Core gap detection (largest method ~330 lines)
     - `_generate_summary()` - Summary statistics
   - **STATUS**: Partially read, needs file creation with complete code

### ⏳ Remaining Tasks

8. **`report_generator.py`** - Report generation (lines 1775-2153 in original = ~380 lines)
   - ReportGenerator class with 2 methods:
     - `generate_markdown()` - Markdown report generation
     - `generate_json()` - JSON report generation

9. **`cli.py`** - Command-line interface (lines 2155-2227 in original = ~70 lines)
   - `main()` function
   - Argument parsing
   - Orchestration of all domains

10. **Update `ddd-map.json`** with refactoring_status="completed" for all elements

## Next Steps

### Step 1: Complete analyzer.py

```bash
# Manually copy lines 971-1773 from web_desktop_gap_analyzer.py
# Add proper imports at top:
from pathlib import Path
from typing import List, Dict, Set, Optional, Any
import json
import re

from .models import PluginAnalysis, Gap, WebComponent, DesktopComponent, CSSAnalysis
from .web_parser import WebComponentParser
from .desktop_parser import DesktopComponentParser
from .css_parser import CSSParser
```

### Step 2: Create report_generator.py

```bash
# Copy lines 1775-2153 from original file
# Add imports:
from datetime import datetime
import json
from dataclasses import asdict

from .models import PluginAnalysis
```

### Step 3: Create cli.py

```bash
# Copy lines 2155-2227 from original file  
# Add imports:
import argparse
from pathlib import Path

from .analyzer import GapAnalyzer
from .report_generator import ReportGenerator
```

### Step 4: Create New Main Entry Point

Create `gap_analyzer_v2.py` in `migration_tools/`:

```python
#!/usr/bin/env python3
"""
Web vs Desktop UI Gap Analyzer (Refactored Version)

Domain-driven architecture with separated concerns.
"""

from gap_analysis_system.cli import main

if __name__ == '__main__':
    main()
```

### Step 5: Update DDD Map

Update all `refactoring_status` fields in `ddd-map.json` from "not_started" to "completed".

### Step 6: Test

```bash
python migration_tools/gap_analyzer_v2.py --plugin library --output output/test_refactored.md --show-css-gap --show-component-gap --show-feature-gap --quick-wins --feature-map migration_tools/feature_map.json
```

### Step 7: Compare Outputs

```bash
# Run original
python migration_tools/web_desktop_gap_analyzer.py --plugin library --output output/test_original.md --show-css-gap --show-component-gap --show-feature-gap --quick-wins --feature-map migration_tools/feature_map.json

# Compare
diff output/test_original.md output/test_refactored.md
```

## Architecture Benefits

### Before (Monolithic)
- Single 2227-line file
- All concerns mixed
- Hard to test individual components
- Difficult to extend

### After (Domain-Driven)
- 10 focused modules
- Clear separation of concerns
- Each domain independently testable
- Easy to extend with new parsers or analyzers
- Reusable components across projects

## Domain Map

```
gap-analysis-system/
├── __init__.py           # Package exports
├── models.py             # Core domain models (106 lines)
├── web_parser.py         # Web parsing domain (340 lines)
├── desktop_parser.py     # Desktop parsing domain (465 lines)
├── css_parser.py         # CSS parsing domain (74 lines)
├── analyzer.py           # Analysis engine (~800 lines) [IN PROGRESS]
├── report_generator.py   # Report generation (~380 lines) [TODO]
├── cli.py                # CLI orchestration (~70 lines) [TODO]
└── ddd-map.json          # Architecture documentation
```

## Cross-Domain Dependencies

```
models → (web_parser, desktop_parser, css_parser)
(parsers) → analyzer
(models + parsers) → analyzer  
analyzer → report_generator
(analyzer + report_generator) → cli
```

## Files Created

- ✅ `gap-analysis-system/__init__.py`
- ✅ `gap-analysis-system/models.py`
- ✅ `gap-analysis-system/web_parser.py`
- ✅ `gap-analysis-system/desktop_parser.py`
- ✅ `gap-analysis-system/css_parser.py`
- ✅ `gap-analysis-system/ddd-map.json`
- 🚧 `gap-analysis-system/analyzer.py` (needs manual extraction)
- ⏳ `gap-analysis-system/report_generator.py`
- ⏳ `gap-analysis-system/cli.py`
- ⏳ `migration_tools/gap_analyzer_v2.py` (new entry point)

## Total Progress: 60% Complete

- Domain Models: ✅ 100%
- Parsers: ✅ 100%
- Analyzer: 🚧 50% (code identified, needs file creation)
- Report Generator: ⏳ 0%
- CLI: ⏳ 0%
- Documentation: ✅ 100%
