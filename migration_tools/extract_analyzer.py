#!/usr/bin/env python3
"""
Extract GapAnalyzer class to create analyzer.py
"""

with open('migration_tools/web_desktop_gap_analyzer.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Extract lines 971-1773 (GapAnalyzer class) - using 0-based indexing
gap_analyzer_lines = lines[970:1773]

# Create analyzer.py with proper imports
header = '''"""
Gap Analysis Engine Domain

Core gap detection and analysis logic comparing web and desktop implementations.
"""

import json
import re
from pathlib import Path
from typing import List, Dict, Set, Optional, Any

from .models import PluginAnalysis, Gap, WebComponent, DesktopComponent, CSSAnalysis
from .web_parser import WebComponentParser
from .desktop_parser import DesktopComponentParser
from .css_parser import CSSParser


'''

content = header + ''.join(gap_analyzer_lines)

with open('migration_tools/gap-analysis-system/analyzer.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ analyzer.py created successfully')
print(f'   Lines extracted: {len(gap_analyzer_lines)}')
print(f'   Total size: {len(content)} characters')
