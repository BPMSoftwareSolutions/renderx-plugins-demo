#!/usr/bin/env python3
"""
Extract ReportGenerator class to create report_generator.py
"""

with open('migration_tools/web_desktop_gap_analyzer.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Extract lines 1775-2153 (ReportGenerator class) - using 0-based indexing
report_generator_lines = lines[1774:2153]

# Create report_generator.py with proper imports
header = '''"""
Report Generation Domain

Generates gap analysis reports in multiple formats (Markdown, JSON, HTML).
"""

import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path

from .models import PluginAnalysis
try:
    from .analyzer import GapAnalyzer
except ImportError:
    GapAnalyzer = None  # For fallback


'''

content = header + ''.join(report_generator_lines)

with open('migration_tools/gap-analysis-system/report_generator.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ report_generator.py created successfully')
print(f'   Lines extracted: {len(report_generator_lines)}')
print(f'   Total size: {len(content)} characters')
