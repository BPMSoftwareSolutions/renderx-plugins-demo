"""
CSS Parser Domain

Parses and analyzes CSS files for styling information.
"""

import os
import re
from pathlib import Path
from typing import List

from .models import CSSAnalysis


class CSSParser:
    """Parses CSS files and analyzes styling."""
    
    @staticmethod
    def parse_css_files(web_path: str, plugin_name: str) -> List[CSSAnalysis]:
        """Parse all CSS files for a plugin."""
        css_analyses = []
        
        plugin_ui_path = Path(web_path) / plugin_name / 'src' / 'ui'
        if plugin_ui_path.exists():
            for css_file in plugin_ui_path.glob('*.css'):
                analyses = CSSParser.parse_css_file(str(css_file))
                css_analyses.extend(analyses)
                
        return css_analyses
    
    @staticmethod
    def parse_css_file(file_path: str) -> List[CSSAnalysis]:
        """Parse CSS file and analyze classes."""
        if not os.path.exists(file_path):
            return []
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return []
            
        analyses = []
        
        # Simple CSS class extraction (not perfect but works for most cases)
        pattern = r'\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}'
        matches = re.finditer(pattern, content)
        
        for match in matches:
            class_name = match.group(1)
            properties_text = match.group(2)
            
            # Parse properties
            properties = {}
            for line in properties_text.split(';'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    properties[key.strip()] = value.strip()
                    
            # Analyze features
            props_str = str(properties)
            
            # Check for specific grid/pattern backgrounds (like canvas grid)
            has_pattern_bg = bool(re.search(r'radial-gradient|repeating-linear-gradient|url\(["\']?data:image', props_str))
            
            analysis = CSSAnalysis(
                class_name=class_name,
                properties=properties,
                file_path=file_path,
                has_hover=':hover' in content[max(0, match.start()-100):match.end()+100],
                has_animation='animation' in props_str or '@keyframes' in content,
                has_transition='transition' in props_str,
                has_transform='transform' in props_str,
                has_gradient='gradient' in props_str or has_pattern_bg,
                has_shadow='shadow' in props_str,
                complexity_score=len(properties)
            )
            
            # Add metadata for special patterns
            if has_pattern_bg:
                analysis.properties['_pattern_background'] = 'true'
            
            analyses.append(analysis)
            
        return analyses
