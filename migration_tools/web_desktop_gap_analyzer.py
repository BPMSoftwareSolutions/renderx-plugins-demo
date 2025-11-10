#!/usr/bin/env python3
"""
Web vs Desktop UI Gap Analyzer (Refactored Domain-Driven Version)

Domain-driven refactoring of the original monolithic web_desktop_gap_analyzer.py script.

This version organizes the code into cohesive domain modules:
- models: Core data structures
- web_parser: React/TypeScript/JSX parsing
- desktop_parser: Avalonia/C#/AXAML parsing
- css_parser: CSS analysis
- analyzer: Gap detection engine
- report_generator: Report generation
- cli: Command-line interface

For detailed architecture documentation, see:
migration_tools/gap-analysis-system/README.md
migration_tools/gap-analysis-system/ddd-map.json

Author: Refactored from monolithic script on 2025-11-09
"""

import sys
from pathlib import Path

# Add the migration_tools directory to the Python path so gap_analysis_system can be imported
script_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(script_dir))

# Now import from the gap_analysis_system package
from gap_analysis_system.cli import main

if __name__ == '__main__':
    main()
