"""
Desktop Component Parser Domain

Parses and analyzes Avalonia/C#/AXAML component files.
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Optional, Any

from .models import DesktopComponent, ComponentFeature
from .desktop_feature_detector import DesktopFeatureDetector


class DesktopComponentParser:
    """Parses Avalonia/C# components."""
    
    @staticmethod
    def parse_component(axaml_file: str, cs_file: Optional[str] = None) -> Optional[DesktopComponent]:
        """Parse an Avalonia component."""
        if not os.path.exists(axaml_file):
            return None
            
        # Extract component name
        component_name = Path(axaml_file).stem
        
        # Parse AXAML
        axaml_content = ''
        try:
            with open(axaml_file, 'r', encoding='utf-8') as f:
                axaml_content = f.read()
        except Exception as e:
            print(f"Error reading {axaml_file}: {e}")
            return None
            
        # Parse C# code-behind if exists
        cs_content = ''
        if cs_file and os.path.exists(cs_file):
            try:
                with open(cs_file, 'r', encoding='utf-8') as f:
                    cs_content = f.read()
            except Exception as e:
                print(f"Error reading {cs_file}: {e}")
        elif not cs_file:
            # Try to find .axaml.cs file
            potential_cs = axaml_file + '.cs'
            if os.path.exists(potential_cs):
                cs_file = potential_cs
                try:
                    with open(cs_file, 'r', encoding='utf-8') as f:
                        cs_content = f.read()
                except Exception as e:
                    print(f"Error reading {cs_file}: {e}")
                    
        # Extract properties
        properties = []
        prop_patterns = [
            r'public\s+(?:static\s+)?(?:readonly\s+)?(?:StyledProperty|DirectProperty)<[^>]+>\s+(\w+)',
            r'public\s+\w+\s+(\w+)\s*\{\s*get',
        ]
        for pattern in prop_patterns:
            properties.extend(re.findall(pattern, cs_content))
            
        # Extract events
        events = []
        event_patterns = [
            r'public\s+(?:static\s+)?(?:readonly\s+)?RoutedEvent<[^>]+>\s+(\w+)',
            r'\.Register<\w+,\s*\w+>\s*\(\s*nameof\((\w+)\)',
        ]
        for pattern in event_patterns:
            events.extend(re.findall(pattern, cs_content))
            
        # Extract styles used
        styles = set()
        style_patterns = [
            r'Classes="([^"]+)"',
            r'x:Key="([^"]+)"',
            r'Background="\{DynamicResource\s+([^}]+)\}"',
            r'Foreground="\{DynamicResource\s+([^}]+)\}"',
        ]
        for pattern in style_patterns:
            matches = re.findall(pattern, axaml_content)
            for match in matches:
                if ' ' in match:
                    styles.update(match.split())
                else:
                    styles.add(match)
                    
        # Extract controls used
        controls_used = []
        control_pattern = r'<(\w+)\s+'
        controls_used = list(set(re.findall(control_pattern, axaml_content)))
        
        # Extract AXAML elements (actual rendered UI structure)
        axaml_elements = DesktopComponentParser._extract_axaml_elements(axaml_content)
        
        # Extract rendered text (TextBlock, Button content, labels, etc.)
        rendered_text = DesktopComponentParser._extract_rendered_text(axaml_content)
        
        # Extract layout and UI hints for parity checks
        layout_hints = DesktopComponentParser._extract_layout_hints(axaml_content)
        ui_hints = DesktopComponentParser._extract_ui_hints(axaml_content)
        
        # Detect features using specialized feature detector
        features = DesktopFeatureDetector.detect_features(axaml_content, cs_content, axaml_file)
        
        line_count = len(axaml_content.splitlines()) + len(cs_content.splitlines())
        
        return DesktopComponent(
            name=component_name,
            file_path=axaml_file,
            axaml_file=axaml_file,
            cs_file=cs_file,
            line_count=line_count,
            properties=properties,
            events=events,
            styles=styles,
            controls_used=controls_used,
            features=features,
            axaml_elements=axaml_elements,
            rendered_text=rendered_text,
            layout_hints=layout_hints,
            ui_hints=ui_hints
        )
    
    @staticmethod
    def _extract_axaml_elements(axaml_content: str) -> List[str]:
        """Extract AXAML control elements."""
        axaml_elements = []
        
        # Extract XML-like tags
        tag_pattern = r'<(\w+)[\s>]'
        tags = re.findall(tag_pattern, axaml_content)
        axaml_elements = list(set(tags))
        
        return sorted(axaml_elements)
    
    @staticmethod
    def _extract_rendered_text(axaml_content: str) -> List[str]:
        """Extract text content that will be rendered (TextBlock content, Button content, etc.)."""
        rendered_text = []
        
        # Extract text between XML tags
        text_pattern = r'>([^<>{}]+)<'
        texts = re.findall(text_pattern, axaml_content)
        
        # Clean up and filter
        for text in texts:
            text = text.strip()
            # Skip empty, bindings, and short strings
            if text and not text.startswith('{') and len(text) > 2:
                # Skip if it's just whitespace or newlines
                if re.search(r'[a-zA-Z0-9]', text):
                    rendered_text.append(text)
        
        # Also extract string literals in attributes (like Content="text", Header="text")
        attr_pattern = r'(?:Content|Header|Text|Title|ToolTip\.Tip)="([^"]+)"'
        attr_texts = re.findall(attr_pattern, axaml_content)
        for text in attr_texts:
            if not text.startswith('{'):  # Skip bindings
                rendered_text.append(text)
        
        # Deduplicate while preserving order
        seen = set()
        unique_text = []
        for text in rendered_text:
            if text not in seen:
                seen.add(text)
                unique_text.append(text)
        
        return unique_text

    @staticmethod
    def _extract_layout_hints(axaml_content: str) -> Dict[str, Any]:
        """Heuristics to detect grid/list layout and square cards in AXAML."""
        hints: Dict[str, Any] = {
            'panel': None,
            'orientation': None,
            'has_uniform_grid': False,
            'has_wrap_panel': False,
            'has_stack_panel': False,
            'has_square_card': False
        }
        try:
            # ItemsPanelTemplate detection
            ip_match = re.search(r'<ItemsPanelTemplate>[\s\S]*?<(?P<panel>WrapPanel|UniformGrid|Grid|StackPanel)([^>]*)>', axaml_content)
            if ip_match:
                panel = ip_match.group('panel')
                hints['panel'] = panel
                attrs = ip_match.group(2)
                ori = re.search(r'Orientation="(Vertical|Horizontal)"', attrs or '')
                if ori:
                    hints['orientation'] = ori.group(1)
                hints['has_uniform_grid'] = panel == 'UniformGrid'
                hints['has_wrap_panel'] = panel == 'WrapPanel'
                hints['has_stack_panel'] = panel == 'StackPanel'
            else:
                # Fallback: any occurrence of these panels
                hints['has_uniform_grid'] = 'UniformGrid' in axaml_content
                hints['has_wrap_panel'] = 'WrapPanel' in axaml_content
                hints['has_stack_panel'] = 'StackPanel' in axaml_content
            
            # Square card heuristic within DataTemplate/Border
            # Look for Border with equal Width/Height (literal or same binding)
            border_block = re.search(r'<DataTemplate[\s\S]*?<Border([\s\S]*?)>', axaml_content)
            if border_block:
                border_attrs = border_block.group(1)
                # Literal equality
                m1 = re.search(r'Width="([0-9.]+)"[^"]*Height="\1"', border_attrs)
                m2 = re.search(r'Height="([0-9.]+)"[^"]*Width="\1"', border_attrs)
                # Binding to same property
                mb1 = re.search(r'Width="\{Binding\s+([\w.]+)\}"[^"]*Height="\{Binding\s+\1\}"', border_attrs)
                mb2 = re.search(r'Height="\{Binding\s+([\w.]+)\}"[^"]*Width="\{Binding\s+\1\}"', border_attrs)
                hints['has_square_card'] = bool(m1 or m2 or mb1 or mb2)
        except Exception:
            pass
        return hints

    @staticmethod
    def _extract_ui_hints(axaml_content: str) -> Dict[str, Any]:
        """Detect conditional UI like AI chat toggle button and hints in AXAML."""
        hints: Dict[str, Any] = {
            'has_ai_toggle': False,
            'has_ai_hint': False
        }
        try:
            if re.search(r'🤖', axaml_content) or re.search(r'<Button[^>]*(?:Content|Header)="[^"]*AI[^"]*"', axaml_content, re.IGNORECASE) or re.search(r'<Button[^>]*>[^<]*AI[^<]*<', axaml_content, re.IGNORECASE):
                hints['has_ai_toggle'] = True
            if re.search(r'💡', axaml_content) or re.search(r'AI\s*unavailable', axaml_content, re.IGNORECASE):
                hints['has_ai_hint'] = True
        except Exception:
            pass
        return hints
