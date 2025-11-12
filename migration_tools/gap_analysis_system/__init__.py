"""
Gap Analysis System

A domain-driven refactoring of the web_desktop_gap_analyzer.py script.

This package organizes the gap analysis functionality into cohesive domain modules:
- models: Core data structures and domain models
- web_parser: React/TypeScript/JSX component parsing
- desktop_parser: Avalonia/C#/AXAML component parsing
- css_parser: CSS file parsing and analysis
- analyzer: Gap detection and analysis logic
- report_generator: Report generation in multiple formats
- cli: Command-line interface and orchestration

Author: Refactored from monolithic script
Date: 2025-11-09
"""

__version__ = "1.0.0"
__all__ = [
    "models",
    "web_parser",
    "desktop_parser",
    "css_parser",
    "analyzer",
    "report_generator",
    "cli"
]
