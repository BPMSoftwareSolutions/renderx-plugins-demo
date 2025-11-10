#!/usr/bin/env python3
"""
Web vs Desktop UI Gap Analyzer

Compares web (React/TypeScript/CSS) UI implementations against desktop (Avalonia/C#/AXAML)
implementations to identify missing features, styling gaps, and component parity issues.

Usage:
    python web_desktop_gap_analyzer.py [options]

Options:
    --web-packages PATH     : Path to web packages folder (default: ./packages)
    --web-ui PATH          : Path to web UI folder (default: ./src/ui)
    --desktop PATH         : Path to desktop source folder (default: ./src)
    --output FILE          : Save output to file (default: ./output/web_desktop_gap_report.md)
    --format FORMAT        : Output format: 'markdown', 'json', 'html' (default: markdown)
    --plugin NAME          : Analyze specific plugin (e.g., 'library', 'canvas')
    --show-css-gap         : Show detailed CSS styling gaps
    --show-component-gap   : Show component implementation gaps
    --show-feature-gap     : Show feature/functionality gaps
    --severity LEVEL       : Filter by severity: 'critical', 'high', 'medium', 'low' (default: all)
    --recommendations      : Include implementation recommendations
    --quick-wins           : Highlight quick win opportunities

Examples:
    python web_desktop_gap_analyzer.py --plugin library --show-css-gap --recommendations
    python web_desktop_gap_analyzer.py --plugin canvas --quick-wins
    python web_desktop_gap_analyzer.py --format json --output gaps.json
"""

import os
import re
import json
import argparse
from pathlib import Path
from typing import List, Dict, Set, Tuple, Optional
from collections import defaultdict
from dataclasses import dataclass, field, asdict
from datetime import datetime
import difflib


# ═══════════════════════════════════════════════════════════════════════════
# Data Classes
# ═══════════════════════════════════════════════════════════════════════════

@dataclass
class ComponentFeature:
    """Represents a feature/capability of a component."""
    name: str
    description: str
    implementation_type: str  # 'ui', 'logic', 'style', 'interaction'
    code_snippet: Optional[str] = None
    file_path: Optional[str] = None
    line_number: Optional[int] = None

@dataclass
class WebComponent:
    """Represents a web UI component (React/TypeScript)."""
    name: str
    file_path: str
    component_type: str  # 'function', 'class', 'const'
    line_count: int
    props: List[str] = field(default_factory=list)
    hooks: List[str] = field(default_factory=list)
    events: List[str] = field(default_factory=list)
    css_file: Optional[str] = None
    css_classes: Set[str] = field(default_factory=set)
    features: List[ComponentFeature] = field(default_factory=list)
    imports: List[str] = field(default_factory=list)
    jsx_elements: List[str] = field(default_factory=list)  # NEW: Actual JSX elements rendered
    rendered_text: List[str] = field(default_factory=list)  # NEW: Text content/labels
    # NEW: Heuristics for layout and conditional UI
    layout_hints: Dict[str, any] = field(default_factory=dict)
    ui_hints: Dict[str, any] = field(default_factory=dict)

@dataclass
class DesktopComponent:
    """Represents a desktop UI component (Avalonia/C#)."""
    name: str
    file_path: str
    axaml_file: Optional[str] = None
    cs_file: Optional[str] = None
    line_count: int = 0
    properties: List[str] = field(default_factory=list)
    events: List[str] = field(default_factory=list)
    styles: Set[str] = field(default_factory=set)
    controls_used: List[str] = field(default_factory=list)
    features: List[ComponentFeature] = field(default_factory=list)
    axaml_elements: List[str] = field(default_factory=list)  # NEW: Actual AXAML elements rendered
    rendered_text: List[str] = field(default_factory=list)  # NEW: Text content/labels
    # NEW: Heuristics for layout and conditional UI
    layout_hints: Dict[str, any] = field(default_factory=dict)
    ui_hints: Dict[str, any] = field(default_factory=dict)

@dataclass
class CSSAnalysis:
    """CSS styling analysis results."""
    class_name: str
    properties: Dict[str, str]
    file_path: str
    has_hover: bool = False
    has_animation: bool = False
    has_transition: bool = False
    has_transform: bool = False
    has_gradient: bool = False
    has_shadow: bool = False
    complexity_score: int = 0

@dataclass
class Gap:
    """Represents a gap between web and desktop implementations."""
    gap_type: str  # 'component', 'feature', 'style', 'interaction'
    severity: str  # 'critical', 'high', 'medium', 'low'
    title: str
    description: str
    web_implementation: Optional[str] = None
    desktop_implementation: Optional[str] = None
    web_code_sample: Optional[str] = None
    desktop_code_sample: Optional[str] = None
    impact: Optional[str] = None
    effort_estimate: Optional[str] = None  # 'quick', 'medium', 'large'
    recommendations: List[str] = field(default_factory=list)
    is_quick_win: bool = False

@dataclass
class PluginAnalysis:
    """Complete analysis for a plugin."""
    plugin_name: str
    web_components: List[WebComponent] = field(default_factory=list)
    desktop_components: List[DesktopComponent] = field(default_factory=list)
    gaps: List[Gap] = field(default_factory=list)
    css_analysis: List[CSSAnalysis] = field(default_factory=list)
    summary: Dict[str, any] = field(default_factory=dict)


# ═══════════════════════════════════════════════════════════════════════════
# File Parsers
# ═══════════════════════════════════════════════════════════════════════════

class WebComponentParser:
    """Parses React/TypeScript components."""
    
    @staticmethod
    def parse_component(file_path: str) -> Optional[WebComponent]:
        """Parse a React component file."""
        if not os.path.exists(file_path):
            return None
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return None
            
        # Extract component name
        component_name = Path(file_path).stem
        
        # Detect component type
        component_type = 'unknown'
        if re.search(r'export\s+function\s+' + component_name, content):
            component_type = 'function'
        elif re.search(r'export\s+const\s+' + component_name + r'\s*=', content):
            component_type = 'const'
        elif re.search(r'export\s+class\s+' + component_name, content):
            component_type = 'class'
            
        # Extract props
        props = []
        props_match = re.search(r'(?:function|const)\s+' + component_name + r'\s*[<(].*?\{([^}]+)\}', content, re.DOTALL)
        if props_match:
            props_text = props_match.group(1)
            props = [p.strip().split(':')[0].strip() for p in props_text.split(',') if ':' in p]
            
        # Extract hooks
        hooks = set()
        hook_patterns = [
            r'use\w+\s*\(',
            r'React\.use\w+\s*\(',
        ]
        for pattern in hook_patterns:
            hooks.update(re.findall(pattern, content))
        hooks = [h.replace('(', '').strip() for h in hooks]
        
        # Extract events
        events = []
        event_patterns = [
            r'on\w+\s*=',
            r'addEventListener\s*\(\s*[\'"](\w+)[\'"]',
        ]
        for pattern in event_patterns:
            events.extend(re.findall(pattern, content))
            
        # Find CSS file
        css_file = None
        css_import = re.search(r'import\s+[\'"](.+\.css)[\'"]', content)
        if css_import:
            css_path = Path(file_path).parent / css_import.group(1)
            if css_path.exists():
                css_file = str(css_path)
                
        # Extract CSS class names used
        css_classes = set()
        class_patterns = [
            r'className=[\'"]([^\'"]+)[\'"]',
            r'className=\{[\'"]([^\'"]+)[\'"]',
        ]
        for pattern in class_patterns:
            css_classes.update(re.findall(pattern, content))
            
        # Extract imports
        imports = re.findall(r'import\s+.*?from\s+[\'"]([^\'"]+)[\'"]', content)
        
        # Extract JSX elements (actual rendered UI structure)
        jsx_elements = WebComponentParser._extract_jsx_elements(content)
        
        # Extract rendered text (h1, h2, p, button text, labels, etc.)
        rendered_text = WebComponentParser._extract_rendered_text(content)
        
        # NEW: Extract layout and UI hints for parity checks
        layout_hints = WebComponentParser._detect_layout_hints_jsx(content)
        ui_hints = WebComponentParser._detect_ui_hints_jsx(content)
        
        # Detect features
        features = WebComponentParser._detect_features(content, file_path)
        
        return WebComponent(
            name=component_name,
            file_path=file_path,
            component_type=component_type,
            line_count=len(content.splitlines()),
            props=props,
            hooks=list(hooks),
            events=events,
            css_file=css_file,
            css_classes=css_classes,
            features=features,
            imports=imports,
            jsx_elements=jsx_elements,
            rendered_text=rendered_text,
            layout_hints=layout_hints,
            ui_hints=ui_hints
        )
    
    @staticmethod
    def _extract_jsx_elements(content: str) -> List[str]:
        """Extract JSX elements from return statement."""
        jsx_elements = []
        
        # Find return statement with JSX
        return_match = re.search(r'return\s*\(([\s\S]*?)\);', content)
        if return_match:
            jsx_content = return_match.group(1)
            
            # Extract HTML-like tags
            tag_pattern = r'<(\w+)[\s>]'
            tags = re.findall(tag_pattern, jsx_content)
            jsx_elements = list(set(tags))
        
        return sorted(jsx_elements)
    
    @staticmethod
    def _extract_rendered_text(content: str) -> List[str]:
        """Extract text content that will be rendered (headings, labels, button text)."""
        rendered_text = []
        
        # Find return statement with JSX
        return_match = re.search(r'return\s*\(([\s\S]*?)\);', content)
        if not return_match:
            return rendered_text
        
        jsx_content = return_match.group(1)
        
        # Extract text inside JSX elements (h1, h2, p, button, etc.)
        # Pattern: >text content<  (text between tags)
        text_pattern = r'>([^<>{}]+)<'
        texts = re.findall(text_pattern, jsx_content)
        
        # Clean up and filter
        for text in texts:
            text = text.strip()
            # Skip empty, variable interpolations, and short strings
            if text and not text.startswith('{') and len(text) > 2:
                # Skip if it's just whitespace or newlines
                if re.search(r'[a-zA-Z0-9]', text):
                    rendered_text.append(text)
        
        # Also extract string literals in JSX (like title="text", aria-label="text")
        attr_pattern = r'(?:title|aria-label|placeholder|alt)=["\']([^"\']+)["\']'
        attr_texts = re.findall(attr_pattern, jsx_content)
        rendered_text.extend(attr_texts)
        
        # Deduplicate while preserving order
        seen = set()
        unique_text = []
        for text in rendered_text:
            if text not in seen:
                seen.add(text)
                unique_text.append(text)
        
        return unique_text

    @staticmethod
    def _detect_layout_hints_jsx(content: str) -> Dict[str, any]:
        """Heuristics to detect grid/list layout and square cards in JSX."""
        hints: Dict[str, any] = {
            'is_grid': False,
            'has_aspect_square': False,
            'has_centering': False,
            'class_samples': []
        }
        try:
            class_patterns = [
                r'className=["\']([^"\']+)["\']',
                r'className=\{["\']([^"\']+)["\']\}',
            ]
            classes: List[str] = []
            for pat in class_patterns:
                classes.extend(re.findall(pat, content))
            joined = ' '.join(classes)
            hints['class_samples'] = classes[:3]
            lowered = joined.lower()
            hints['is_grid'] = (' grid ' in f' {lowered} ' or 'grid-cols-' in lowered or 'display: grid' in lowered)
            hints['has_aspect_square'] = ('aspect-square' in lowered or 'aspect-[1/1]' in lowered or re.search(r'aspect\s*[:=]\s*1', lowered) is not None or 'aspectratio' in lowered)
            hints['has_centering'] = any(tok in lowered for tok in ['place-items-center', 'items-center', 'justify-center', 'content-center'])
        except Exception:
            pass
        return hints

    @staticmethod
    def _detect_ui_hints_jsx(content: str) -> Dict[str, any]:
        """Detect conditional UI like AI chat toggle button and hints."""
        hints: Dict[str, any] = {
            'has_ai_toggle': False,
            'has_ai_hint': False
        }
        try:
            jsx = re.search(r'return\s*\(([\s\S]*?)\);', content)
            snippet = jsx.group(1) if jsx else ''
            search_space = snippet + "\n" + content
            # Detect via emoji, text, or known class name
            if (
                re.search(r'🤖', search_space) or
                re.search(r'<button[^>]*>[^<]*ai[^<]*<', search_space, re.IGNORECASE) or
                'ai-chat-toggle' in search_space
            ):
                hints['has_ai_toggle'] = True
            if (
                re.search(r'💡', search_space) or
                re.search(r'unavailable|ai\s*hint', search_space, re.IGNORECASE) or
                'ai-unavailable-hint' in search_space
            ):
                hints['has_ai_hint'] = True
        except Exception:
            pass
        return hints
    
    @staticmethod
    def _detect_features(content: str, file_path: str) -> List[ComponentFeature]:
        """Detect features in the component code."""
        features = []
        
        # Detect drag and drop with ghost image
        if re.search(r'setDragImage|drag.*image|ghost.*image|drag.*preview', content, re.IGNORECASE):
            features.append(ComponentFeature(
                name='Drag Ghost Image',
                description='Implements custom drag preview/ghost image during drag operations',
                implementation_type='interaction'
            ))
        
        # Detect drag and drop (general)
        if re.search(r'onDrag|useDrag|Draggable|handleDrag', content, re.IGNORECASE):
            features.append(ComponentFeature(
                name='Drag and Drop',
                description='Implements drag and drop functionality',
                implementation_type='interaction'
            ))
            
        # Detect modal/dialog
        if re.search(r'modal|dialog|backdrop', content, re.IGNORECASE):
            features.append(ComponentFeature(
                name='Modal/Dialog',
                description='Implements modal or dialog UI pattern',
                implementation_type='ui'
            ))
            
        # Detect animations
        if re.search(r'transition|animation|transform|@keyframes', content, re.IGNORECASE):
            features.append(ComponentFeature(
                name='Animations',
                description='Includes animations or transitions',
                implementation_type='style'
            ))
            
        # Detect API calls
        if re.search(r'fetch|axios|api\.|\.get\(|\.post\(', content):
            features.append(ComponentFeature(
                name='API Integration',
                description='Makes API calls or network requests',
                implementation_type='logic'
            ))
            
        # Detect form handling
        if re.search(r'onSubmit|handleSubmit|form|input.*onChange', content):
            features.append(ComponentFeature(
                name='Form Handling',
                description='Implements form input and submission',
                implementation_type='interaction'
            ))
            
        # Detect error boundaries
        if re.search(r'ErrorBoundary|componentDidCatch|getDerivedStateFromError', content):
            features.append(ComponentFeature(
                name='Error Handling',
                description='Implements error boundary or error handling',
                implementation_type='logic'
            ))
            
        # Detect file upload
        if re.search(r'FileReader|file.*upload|drop.*file|accept=', content, re.IGNORECASE):
            features.append(ComponentFeature(
                name='File Upload',
                description='Handles file uploads',
                implementation_type='interaction'
            ))
            
        # Detect search/filter
        if re.search(r'search|filter|query', content, re.IGNORECASE):
            features.append(ComponentFeature(
                name='Search/Filter',
                description='Implements search or filtering functionality',
                implementation_type='interaction'
            ))
            
        # Detect virtualization
        if re.search(r'virtual|infinite.*scroll|lazy.*load', content, re.IGNORECASE):
            features.append(ComponentFeature(
                name='Virtualization',
                description='Implements virtual scrolling or lazy loading',
                implementation_type='ui'
            ))
        
        # Detect JSON component metadata extraction
        if re.search(r'data-icon|data-description|template\.attributes|metadata\.icon|computePreviewModel|component\?\.template', content):
            features.append(ComponentFeature(
                name='JSON Metadata Extraction',
                description='Extracts metadata (icons, descriptions, attributes) from JSON component definitions',
                implementation_type='logic'
            ))
        
        # Detect dynamic CSS injection
        if re.search(r'<style>.*cssText|cssVariables|varsToStyle|style\.setProperty', content):
            features.append(ComponentFeature(
                name='Dynamic CSS Injection',
                description='Dynamically injects CSS styles and variables from component data',
                implementation_type='style'
            ))
        
        # Detect emoji/icon rendering
        if re.search(r'emoji|🧩|💡|⚠️|✅|❌|📦|icon.*emoji|component-icon.*\{', content):
            features.append(ComponentFeature(
                name='Emoji Icon Display',
                description='Displays emoji icons extracted from component metadata',
                implementation_type='ui'
            ))
        
        # Detect component card rendering
        if re.search(r'library-component-item|component-card|card.*style|preview.*model', content, re.IGNORECASE):
            features.append(ComponentFeature(
                name='Component Card Rendering',
                description='Renders component preview cards with styling from JSON data',
                implementation_type='ui'
            ))
            
        return features


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
        
        # NEW: Extract layout and UI hints for parity checks
        layout_hints = DesktopComponentParser._extract_layout_hints(axaml_content)
        ui_hints = DesktopComponentParser._extract_ui_hints(axaml_content)
        
        # Detect features
        features = DesktopComponentParser._detect_features(axaml_content, cs_content, axaml_file)
        
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
    def _extract_layout_hints(axaml_content: str) -> Dict[str, any]:
        """Heuristics to detect grid/list layout and square cards in AXAML."""
        hints: Dict[str, any] = {
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
    def _extract_ui_hints(axaml_content: str) -> Dict[str, any]:
        """Detect conditional UI like AI chat toggle button and hints in AXAML."""
        hints: Dict[str, any] = {
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
    
    @staticmethod
    def _detect_features(axaml_content: str, cs_content: str, file_path: str) -> List[ComponentFeature]:
        """Detect features in the component code."""
        features = []
        
        combined_content = axaml_content + '\n' + cs_content
        
        # Detect drag ghost image/preview
        if re.search(r'DragPreview|GhostImage|SetDragImage|Adorner.*Drag', combined_content, re.IGNORECASE):
            features.append(ComponentFeature(
                name='Drag Ghost Image',
                description='Implements custom drag preview/ghost image during drag operations',
                implementation_type='interaction'
            ))
        
        # Detect drag and drop (general)
        if re.search(r'DragDrop|AllowDrop|DragOver|Drop|DragStart', combined_content):
            features.append(ComponentFeature(
                name='Drag and Drop',
                description='Implements drag and drop functionality',
                implementation_type='interaction'
            ))
            
        # Detect modal/dialog
        if re.search(r'Window|Dialog|Popup', combined_content):
            features.append(ComponentFeature(
                name='Modal/Dialog',
                description='Implements modal or dialog UI pattern',
                implementation_type='ui'
            ))
            
        # Detect animations
        if re.search(r'Animation|Transition|Storyboard|DoubleAnimation', combined_content):
            features.append(ComponentFeature(
                name='Animations',
                description='Includes animations or transitions',
                implementation_type='style'
            ))
            
        # Detect API calls
        if re.search(r'HttpClient|WebRequest|RestClient|\.GetAsync|\.PostAsync', cs_content):
            features.append(ComponentFeature(
                name='API Integration',
                description='Makes API calls or network requests',
                implementation_type='logic'
            ))
            
        # Detect file operations
        if re.search(r'OpenFileDialog|SaveFileDialog|File\.|Directory\.', cs_content):
            features.append(ComponentFeature(
                name='File Operations',
                description='Handles file operations',
                implementation_type='interaction'
            ))
        
        # Detect JSON component metadata extraction
        if re.search(r'JObject|JsonDocument|JsonSerializer\.Deserialize|component\.Icon|component\.Metadata|ParseJson', cs_content):
            features.append(ComponentFeature(
                name='JSON Metadata Extraction',
                description='Extracts metadata (icons, descriptions, attributes) from JSON component definitions',
                implementation_type='logic'
            ))
        
        # CRITICAL: Detect stub implementations (empty methods, TODOs, not implemented)
        stub_patterns = [
            (r'//\s*(TODO|FIXME|HACK|XXX|STUB)', 'TODO/FIXME comments indicating incomplete implementation'),
            (r'throw\s+new\s+NotImplementedException', 'NotImplementedException thrown'),
            (r'\/\/.*(?:would\s+be\s+implemented|should\s+be\s+implemented|to\s+be\s+implemented)', 'Placeholder comment for future implementation'),
            (r'\/\/\s*Implementation\s+needed', 'Implementation needed comment'),
            (r'\/\/.*(?:simplified|stub|placeholder|not\s+implemented)', 'Simplified/stub implementation'),
            (r'{\s*\/\/[^\}]*\s*}\s*$', 'Empty method with only comments'),
        ]
        for pattern, desc in stub_patterns:
            matches = re.findall(pattern, cs_content, re.MULTILINE | re.IGNORECASE)
            if matches:
                features.append(ComponentFeature(
                    name='⚠️ Stub Implementation Detected',
                    description=f'Code contains stub/incomplete implementation: {desc} ({len(matches)} occurrence(s))',
                    implementation_type='logic',
                    file_path=file_path
                ))
                break  # Only report once per component
        
        # CRITICAL: Detect IsVisible="False" by default (hidden controls)
        if re.search(r'IsVisible="False"', axaml_content):
            hidden_controls = re.findall(r'<(\w+)[^>]*IsVisible="False"', axaml_content)
            if hidden_controls:
                features.append(ComponentFeature(
                    name='⚠️ Hidden Controls Detected',
                    description=f'Controls set to IsVisible="False" by default: {", ".join(set(hidden_controls))}',
                    implementation_type='ui',
                    file_path=file_path
                ))
        
        # CRITICAL: Detect empty draw/render methods
        empty_render_patterns = [
            r'private\s+void\s+Draw\w+\([^)]*\)\s*{\s*(?:canvas\.Children\.Clear\(\);)?\s*(?://[^\n]*)?\s*}',
            r'protected\s+override\s+void\s+(?:OnRender|Render)\([^)]*\)\s*{\s*(?://[^\n]*)?\s*}',
        ]
        for pattern in empty_render_patterns:
            if re.search(pattern, cs_content, re.MULTILINE):
                features.append(ComponentFeature(
                    name='⚠️ Empty Render Method',
                    description='Draw/Render method exists but has no implementation',
                    implementation_type='ui',
                    file_path=file_path
                ))
                break
        
        # CRITICAL: Detect hardcoded sample/mock data instead of loading from files
        hardcoded_data_patterns = [
            (r'LoadSample\w*\(', 'LoadSample method suggests hardcoded demo data'),
            (r'Load(?:Demo|Mock|Test)\w*\(', 'LoadDemo/LoadMock method suggests hardcoded test data'),
            (r'_components\.Add\(\s*new\s+\w+Item\s*\{[^}]*Id\s*=\s*"(?:button|textbox|panel|label)"', 'Hardcoded component items (button, textbox, etc.) instead of loading from JSON'),
            (r'new\s+(?:List|ObservableCollection)<[^>]*>\s*\{[^}]*new\s+\w+\s*\{[^}]*Name\s*=\s*"(?:Button|TextBox|Panel)', 'Hardcoded collection initialization with sample UI components'),
            (r'\/\/.*sample\s+components?\s+for\s+demonstration', 'Comment indicates sample/demo data'),
        ]
        hardcoded_matches = []
        for pattern, desc in hardcoded_data_patterns:
            if re.search(pattern, cs_content, re.IGNORECASE):
                hardcoded_matches.append(desc)
        
        if hardcoded_matches:
            # Downgrade severity if file loading & parsing also present (fallback only)
            has_file_loading = bool(re.search(r'File\.ReadAllText|Directory\.GetFiles|File\.Open|StreamReader|JsonSerializer\.Deserialize.*File', cs_content))
            has_json_parsing = bool(re.search(r'JsonDocument\.Parse|JObject\.Parse|JsonNode\.Parse.*File', cs_content))
            if has_file_loading and has_json_parsing:
                features.append(ComponentFeature(
                    name='� Fallback Sample Data Present',
                    description=f'Fallback hardcoded data exists though JSON loading implemented: {"; ".join(hardcoded_matches)}',
                    implementation_type='logic',
                    file_path=file_path
                ))
            else:
                features.append(ComponentFeature(
                    name='�🔴 HARDCODED SAMPLE DATA',
                    description=f'Using hardcoded sample data instead of loading from files: {"; ".join(hardcoded_matches)}',
                    implementation_type='logic',
                    file_path=file_path
                ))
        
        # CRITICAL: Detect missing file loading when JSON component folders exist
        # Check if json-components or catalog folders exist in workspace
        workspace_root = Path(file_path).parents[2]  # Go up to workspace root
        json_components_exists = (workspace_root / 'json-components').exists()
        catalog_exists = (workspace_root / 'catalog' / 'json-plugins').exists()
        
        if (json_components_exists or catalog_exists) and 'Library' in file_path:
            # Check if file loading is implemented
            has_file_loading = bool(re.search(r'File\.ReadAllText|Directory\.GetFiles|File\.Open|StreamReader|JsonSerializer\.Deserialize.*File', cs_content))
            has_json_parsing = bool(re.search(r'JsonDocument\.Parse|JObject\.Parse|JsonNode\.Parse.*File', cs_content))
            
            if not (has_file_loading and has_json_parsing):
                features.append(ComponentFeature(
                    name='🔴 MISSING FILE LOADING',
                    description=f'JSON component files exist in workspace (json-components: {json_components_exists}, catalog: {catalog_exists}) but component does not load them from disk',
                    implementation_type='logic',
                    file_path=file_path
                ))
        
        # CRITICAL: Detect placeholder event handlers (empty or just logging)
        placeholder_handler_patterns = [
            r'private\s+void\s+On\w+\([^)]*\)\s*{\s*(?:\/\/[^\n]*)?\s*}',  # Empty event handler
            r'private\s+void\s+On\w+\([^)]*\)\s*{\s*(?:_logger\?\.Log\w+|Console\.WriteLine)\([^)]*\);\s*}',  # Handler with only logging
        ]
        for pattern in placeholder_handler_patterns:
            matches = re.findall(pattern, cs_content, re.MULTILINE)
            if matches and len(matches) >= 2:  # Only report if multiple empty handlers
                features.append(ComponentFeature(
                    name='⚠️ Placeholder Event Handlers',
                    description=f'Found {len(matches)} event handlers that are empty or only contain logging',
                    implementation_type='logic',
                    file_path=file_path
                ))
                break
        
        # Detect dynamic style binding
        if re.search(r'DynamicResource|StaticResource|Style\.Resources|SetResourceReference|Brush\s*=', combined_content):
            features.append(ComponentFeature(
                name='Dynamic CSS Injection',
                description='Dynamically injects CSS styles and variables from component data',
                implementation_type='style'
            ))
        
        # Detect TextBlock emoji/icon rendering
        if re.search(r'TextBlock.*Text="[🧩💡⚠️✅❌📦]|emoji|icon.*glyph', combined_content, re.IGNORECASE):
            features.append(ComponentFeature(
                name='Emoji Icon Display',
                description='Displays emoji icons extracted from component metadata',
                implementation_type='ui'
            ))
        
        # Detect component card rendering
        if re.search(r'ComponentCard|LibraryCard|PreviewControl|ItemTemplate.*Component', combined_content, re.IGNORECASE):
            features.append(ComponentFeature(
                name='Component Card Rendering',
                description='Renders component preview cards with styling from JSON data',
                implementation_type='ui'
            ))
            
        return features


class CSSParser:
    """Parses CSS files and analyzes styling."""
    
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


# ═══════════════════════════════════════════════════════════════════════════
# Gap Analyzer
# ═══════════════════════════════════════════════════════════════════════════

class GapAnalyzer:
    """Analyzes gaps between web and desktop implementations."""
    
    @staticmethod
    def analyze_plugin(plugin_name: str, web_path: str, desktop_path: str) -> PluginAnalysis:
        """Analyze a specific plugin for gaps."""
        analysis = PluginAnalysis(plugin_name=plugin_name)
        
        # Find web components
        web_components = GapAnalyzer._find_web_components(web_path, plugin_name)
        analysis.web_components = web_components
        
        # Find desktop components
        desktop_components = GapAnalyzer._find_desktop_components(desktop_path, plugin_name)
        analysis.desktop_components = desktop_components
        
        # Parse CSS
        css_analyses = GapAnalyzer._analyze_css(web_path, plugin_name)
        analysis.css_analysis = css_analyses
        
        # Find gaps
        gaps = GapAnalyzer._detect_gaps(web_components, desktop_components, css_analyses)
        analysis.gaps = gaps
        
        # Generate summary
        analysis.summary = GapAnalyzer._generate_summary(analysis)
        
        return analysis
    
    @staticmethod
    def _find_web_components(web_path: str, plugin_name: str) -> List[WebComponent]:
        """Find all web components for a plugin."""
        components = []
        
        # Search in packages/<plugin>/src/ui/
        plugin_ui_path = Path(web_path) / plugin_name / 'src' / 'ui'
        if plugin_ui_path.exists():
            for tsx_file in plugin_ui_path.glob('*.tsx'):
                component = WebComponentParser.parse_component(str(tsx_file))
                if component:
                    components.append(component)
        
        # Also check for related packages (e.g., library-component for library plugin)
        related_path = Path(web_path) / f'{plugin_name}-component' / 'src'
        if related_path.exists():
            # Check symphonies and handlers for drag ghost image logic
            for ts_file in related_path.rglob('*.ts'):
                if 'drag' in ts_file.name.lower() or 'symphony' in ts_file.name.lower():
                    component = WebComponentParser.parse_component(str(ts_file))
                    if component:
                        components.append(component)
                    
        return components
    
    @staticmethod
    def _find_desktop_components(desktop_path: str, plugin_name: str) -> List[DesktopComponent]:
        """Find all desktop components for a plugin."""
        components = []
        
        # Search in src/RenderX.Plugins.<Plugin>/
        plugin_name_pascal = ''.join(word.capitalize() for word in plugin_name.split('-'))
        plugin_dir = Path(desktop_path) / f'RenderX.Plugins.{plugin_name_pascal}'
        
        if not plugin_dir.exists():
            # Try alternative naming
            for subdir in Path(desktop_path).glob('RenderX.Plugins.*'):
                if plugin_name.lower() in subdir.name.lower():
                    plugin_dir = subdir
                    break
                    
        if plugin_dir.exists():
            for axaml_file in plugin_dir.rglob('*.axaml'):
                # Skip resource dictionaries
                if 'ResourceDictionary' in axaml_file.read_text(encoding='utf-8', errors='ignore'):
                    continue
                component = DesktopComponentParser.parse_component(str(axaml_file))
                if component:
                    components.append(component)
                    
        return components
    
    @staticmethod
    def _analyze_css(web_path: str, plugin_name: str) -> List[CSSAnalysis]:
        """Analyze CSS files for a plugin."""
        css_analyses = []
        
        plugin_ui_path = Path(web_path) / plugin_name / 'src' / 'ui'
        if plugin_ui_path.exists():
            for css_file in plugin_ui_path.glob('*.css'):
                analyses = CSSParser.parse_css_file(str(css_file))
                css_analyses.extend(analyses)
                
        return css_analyses
    
    @staticmethod
    def _detect_gaps(web_components: List[WebComponent], 
                     desktop_components: List[DesktopComponent],
                     css_analyses: List[CSSAnalysis]) -> List[Gap]:
        """Detect gaps between implementations."""
        gaps = []
        
        # Component existence gaps
        web_names = {c.name for c in web_components}
        desktop_names = {c.name for c in desktop_components}
        
        missing_components = web_names - desktop_names
        for name in missing_components:
            web_comp = next(c for c in web_components if c.name == name)
            gaps.append(Gap(
                gap_type='component',
                severity='high' if web_comp.line_count > 100 else 'medium',
                title=f'Missing Component: {name}',
                description=f'Web component "{name}" ({web_comp.line_count} lines) not found in desktop implementation',
                web_implementation=f'{web_comp.file_path} ({web_comp.component_type})',
                desktop_implementation='Not implemented',
                impact='Users will not have access to this UI component',
                effort_estimate='medium' if web_comp.line_count < 200 else 'large',
                is_quick_win=web_comp.line_count < 100
            ))
            
        # Feature gaps for matching components
        for web_comp in web_components:
            desktop_comp = next((c for c in desktop_components if c.name == web_comp.name), None)
            if desktop_comp:
                # Check feature parity
                web_features = {f.name for f in web_comp.features}
                desktop_features = {f.name for f in desktop_comp.features}
                missing_features = web_features - desktop_features
                
                for feature_name in missing_features:
                    feature = next(f for f in web_comp.features if f.name == feature_name)
                    gaps.append(Gap(
                        gap_type='feature',
                        severity='medium',
                        title=f'Missing Feature in {web_comp.name}: {feature_name}',
                        description=feature.description,
                        web_implementation=f'Implemented in {web_comp.name}',
                        desktop_implementation='Not implemented',
                        impact=f'Feature "{feature_name}" not available in desktop version',
                        effort_estimate='quick' if feature.implementation_type == 'style' else 'medium',
                        is_quick_win=feature.implementation_type == 'style'
                    ))
                
                # 🔴 CRITICAL: Check UI element parity (JSX vs AXAML)
                web_elements = set(web_comp.jsx_elements)
                desktop_elements = set(desktop_comp.axaml_elements)
                
                # Map web elements to desktop equivalents
                element_mapping = {
                    'div': {'Border', 'Panel', 'StackPanel', 'Grid'},
                    'button': {'Button'},
                    'input': {'TextBox', 'CheckBox', 'NumericUpDown'},
                    'p': {'TextBlock'},
                    'h1': {'TextBlock'},
                    'h2': {'TextBlock'},
                    'h3': {'TextBlock'},
                    'span': {'TextBlock', 'Run'},
                    'select': {'ComboBox'},
                    'textarea': {'TextBox'},
                    'img': {'Image'},
                }
                
                missing_ui_elements = []
                for web_elem in web_elements:
                    expected_desktop = element_mapping.get(web_elem, {web_elem})
                    if not expected_desktop.intersection(desktop_elements):
                        missing_ui_elements.append(f'{web_elem} (expected {", ".join(expected_desktop)})')
                
                if missing_ui_elements:
                    gaps.append(Gap(
                        gap_type='component',
                        severity='high',
                        title=f'🔴 MISSING UI ELEMENTS in {web_comp.name}',
                        description=f'Desktop missing {len(missing_ui_elements)} UI elements that web renders: {", ".join(missing_ui_elements[:5])}{"..." if len(missing_ui_elements) > 5 else ""}',
                        web_implementation=f'Web renders: {", ".join(sorted(web_elements))}',
                        desktop_implementation=f'Desktop renders: {", ".join(sorted(desktop_elements)) if desktop_elements else "No elements found"}',
                        impact='Users see incomplete or different UI structure than web version',
                        effort_estimate='medium',
                        is_quick_win=False
                    ))
                
                # 🔴 CRITICAL: Check rendered text parity
                web_text = set(web_comp.rendered_text)
                desktop_text = set(desktop_comp.rendered_text)
                missing_text = web_text - desktop_text
                
                if len(missing_text) > 3:  # Only report if significant text missing
                    gaps.append(Gap(
                        gap_type='component',
                        severity='high',
                        title=f'🔴 MISSING TEXT CONTENT in {web_comp.name}',
                        description=f'Desktop missing {len(missing_text)} text labels/content that web displays',
                        web_implementation=f'Web shows: {", ".join(list(missing_text)[:5])}{"..." if len(missing_text) > 5 else ""}',
                        desktop_implementation=f'Desktop shows: {", ".join(list(desktop_text)[:5]) if desktop_text else "No text content found"}',
                        impact='Users see different labels, headings, or instructions than web version',
                        effort_estimate='quick',
                        is_quick_win=True
                    ))

                # NEW: Layout parity check (only once per component to avoid noise)
                if web_comp.layout_hints or desktop_comp.layout_hints:
                    w_layout = web_comp.layout_hints
                    d_layout = desktop_comp.layout_hints
                    layout_issues = []
                    if w_layout.get('is_grid') and not (d_layout.get('has_uniform_grid') or d_layout.get('has_wrap_panel')):
                        layout_issues.append('Web uses grid layout; desktop lacks UniformGrid/WrapPanel')
                    if w_layout.get('has_aspect_square') and not d_layout.get('has_square_card'):
                        layout_issues.append('Web cards appear square; desktop cards non-square')
                    if w_layout.get('has_centering') and d_layout.get('panel') == 'StackPanel' and d_layout.get('orientation') == 'Vertical':
                        layout_issues.append('Web centers cards; desktop vertical StackPanel may misalign')
                    if layout_issues:
                        gaps.append(Gap(
                            gap_type='component',
                            severity='medium',
                            title=f'LAYOUT PARITY ISSUES in {web_comp.name}',
                            description='; '.join(layout_issues),
                            web_implementation=f'Grid hints: {w_layout}',
                            desktop_implementation=f'Panel hints: {d_layout}',
                            impact='Visual arrangement differs (card alignment/sizing/parity)',
                            effort_estimate='medium',
                            is_quick_win=False
                        ))

                # NEW: Conditional UI parity (AI toggle & hint)
                w_ui = web_comp.ui_hints
                d_ui = desktop_comp.ui_hints
                cond_issues = []
                if w_ui.get('has_ai_toggle') and not d_ui.get('has_ai_toggle'):
                    cond_issues.append('Missing AI chat toggle button')
                if w_ui.get('has_ai_hint') and not d_ui.get('has_ai_hint'):
                    cond_issues.append('Missing AI availability hint')
                if cond_issues:
                    gaps.append(Gap(
                        gap_type='component',
                        severity='high',
                        title=f'CONDITIONAL UI PARITY in {web_comp.name}',
                        description='; '.join(cond_issues),
                        web_implementation=f'Web UI hints: {w_ui}',
                        desktop_implementation=f'Desktop UI hints: {d_ui}',
                        impact='Users cannot access AI-related interactions or contextual hints',
                        effort_estimate='quick',
                        is_quick_win=True
                    ))
                    
        # CSS/Styling gaps
        if css_analyses:
            total_css_classes = len(css_analyses)
            animated_classes = sum(1 for c in css_analyses if c.has_animation or c.has_transition)
            hover_classes = sum(1 for c in css_analyses if c.has_hover)
            gradient_classes = sum(1 for c in css_analyses if c.has_gradient)
            
            if animated_classes > 0:
                gaps.append(Gap(
                    gap_type='style',
                    severity='low',
                    title=f'Missing Animations and Transitions',
                    description=f'{animated_classes} CSS classes with animations/transitions not replicated in desktop',
                    web_implementation=f'{animated_classes}/{total_css_classes} classes have animations',
                    desktop_implementation='Minimal or no animations detected',
                    impact='Less polished UI without smooth transitions and animations',
                    effort_estimate='medium',
                    recommendations=[
                        'Add Avalonia animations for hover states',
                        'Implement transition effects using Storyboards',
                        'Use RenderTransform for smooth animations'
                    ],
                    is_quick_win=False
                ))
                
            if hover_classes > 0:
                gaps.append(Gap(
                    gap_type='style',
                    severity='low',
                    title=f'Missing Hover Effects',
                    description=f'{hover_classes} CSS classes with hover effects not replicated',
                    web_implementation=f'{hover_classes}/{total_css_classes} classes have hover states',
                    desktop_implementation='Basic or no hover effects',
                    impact='Less interactive feel without visual feedback on hover',
                    effort_estimate='quick',
                    recommendations=[
                        'Add :pointerover styles to Avalonia components',
                        'Implement hover state visual changes',
                        'Use RenderTransform for subtle hover animations'
                    ],
                    is_quick_win=True
                ))
                
            if gradient_classes > 0:
                gaps.append(Gap(
                    gap_type='style',
                    severity='low',
                    title=f'Missing Gradient Backgrounds',
                    description=f'{gradient_classes} CSS classes use gradients',
                    web_implementation=f'{gradient_classes} gradient backgrounds',
                    desktop_implementation='Solid colors used',
                    impact='Less visually appealing without gradient effects',
                    effort_estimate='quick',
                    recommendations=[
                        'Add LinearGradientBrush to DesignTokens.axaml',
                        'Replace solid colors with gradient brushes',
                        'Create reusable gradient resources'
                    ],
                    is_quick_win=True
                ))
                
        # NEW: Plugin-level conditional UI parity (aggregate)
        try:
            web_ai_any = any(c.ui_hints.get('has_ai_toggle') for c in web_components)
            desktop_ai_any = any(c.ui_hints.get('has_ai_toggle') for c in desktop_components)
            if web_ai_any and not desktop_ai_any:
                gaps.append(Gap(
                    gap_type='component',
                    severity='high',
                    title='PLUGIN-WIDE MISSING AI CHAT TOGGLE',
                    description='Web plugin exposes AI chat toggle but no desktop component includes AI toggle button (🤖 AI).',
                    web_implementation='AI toggle detected in one or more web components',
                    desktop_implementation='No desktop component contains AI toggle button or related hints',
                    impact='Desktop users cannot access AI component generation features available on web.',
                    effort_estimate='quick',
                    is_quick_win=True
                ))
            web_ai_hint_any = any(c.ui_hints.get('has_ai_hint') for c in web_components)
            desktop_ai_hint_any = any(c.ui_hints.get('has_ai_hint') for c in desktop_components)
            if web_ai_hint_any and not desktop_ai_hint_any:
                gaps.append(Gap(
                    gap_type='component',
                    severity='medium',
                    title='PLUGIN-WIDE MISSING AI AVAILABILITY HINT',
                    description='Web shows AI unavailable hint (💡) when AI is not configured; desktop lacks equivalent contextual notice.',
                    web_implementation='AI availability hint detected in web components',
                    desktop_implementation='No desktop component provides AI availability status hint',
                    impact='Desktop users receive less guidance about AI feature availability.',
                    effort_estimate='quick',
                    is_quick_win=True
                ))
        except Exception:
            pass

        return gaps
    
    @staticmethod
    def _generate_summary(analysis: PluginAnalysis) -> Dict:
        """Generate summary statistics."""
        return {
            'web_components_count': len(analysis.web_components),
            'desktop_components_count': len(analysis.desktop_components),
            'missing_components': len([g for g in analysis.gaps if g.gap_type == 'component']),
            'missing_features': len([g for g in analysis.gaps if g.gap_type == 'feature']),
            'style_gaps': len([g for g in analysis.gaps if g.gap_type == 'style']),
            'critical_gaps': len([g for g in analysis.gaps if g.severity == 'critical']),
            'high_gaps': len([g for g in analysis.gaps if g.severity == 'high']),
            'medium_gaps': len([g for g in analysis.gaps if g.severity == 'medium']),
            'low_gaps': len([g for g in analysis.gaps if g.severity == 'low']),
            'quick_wins': len([g for g in analysis.gaps if g.is_quick_win]),
            'total_gaps': len(analysis.gaps),
            'css_classes_analyzed': len(analysis.css_analysis),
            'web_total_lines': sum(c.line_count for c in analysis.web_components),
            'desktop_total_lines': sum(c.line_count for c in analysis.desktop_components),
        }


# ═══════════════════════════════════════════════════════════════════════════
# Report Generators
# ═══════════════════════════════════════════════════════════════════════════

class ReportGenerator:
    """Generates reports in various formats."""
    
    @staticmethod
    def generate_markdown(analysis: PluginAnalysis, args) -> str:
        """Generate markdown report."""
        report = []
        
        # Header
        report.append(f"# Web vs Desktop Gap Analysis: {analysis.plugin_name.title()}")
        report.append(f"\n**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        # Executive Summary
        report.append("## 📊 Executive Summary\n")
        s = analysis.summary
        report.append(f"| Metric | Count |")
        report.append(f"|--------|-------|")
        report.append(f"| Web Components | {s['web_components_count']} |")
        report.append(f"| Desktop Components | {s['desktop_components_count']} |")
        report.append(f"| Total Gaps Found | {s['total_gaps']} |")
        report.append(f"| Missing Components | {s['missing_components']} |")
        report.append(f"| Missing Features | {s['missing_features']} |")
        report.append(f"| Style Gaps | {s['style_gaps']} |")
        report.append(f"| Quick Win Opportunities | {s['quick_wins']} |")
        report.append("")
        
        # Gap breakdown by severity
        report.append("### Gap Severity Breakdown\n")
        report.append(f"- 🔴 **Critical:** {s['critical_gaps']}")
        report.append(f"- 🟠 **High:** {s['high_gaps']}")
        report.append(f"- 🟡 **Medium:** {s['medium_gaps']}")
        report.append(f"- 🟢 **Low:** {s['low_gaps']}")
        report.append("")
        
        # Code volume comparison
        report.append("### Code Volume\n")
        report.append(f"- **Web:** {s['web_total_lines']:,} lines of code")
        report.append(f"- **Desktop:** {s['desktop_total_lines']:,} lines of code")
        pct = (s['desktop_total_lines'] / s['web_total_lines'] * 100) if s['web_total_lines'] > 0 else 0
        report.append(f"- **Parity:** {pct:.1f}% of web implementation")
        report.append("")
        
        # Quick Wins section
        if args.quick_wins and s['quick_wins'] > 0:
            report.append("## 🚀 Quick Win Opportunities\n")
            quick_wins = [g for g in analysis.gaps if g.is_quick_win]
            for i, gap in enumerate(quick_wins[:10], 1):
                report.append(f"### {i}. {gap.title}\n")
                report.append(f"**Severity:** {gap.severity.upper()} | **Effort:** {gap.effort_estimate}\n")
                report.append(f"{gap.description}\n")
                if gap.recommendations:
                    report.append("**Recommendations:**")
                    for rec in gap.recommendations:
                        report.append(f"- {rec}")
                report.append("")
        
        # Component Gaps
        if args.show_component_gap:
            report.append("## 🧩 Component Implementation Gaps\n")
            component_gaps = [g for g in analysis.gaps if g.gap_type == 'component']
            if component_gaps:
                for gap in component_gaps:
                    severity_emoji = {'critical': '🔴', 'high': '🟠', 'medium': '🟡', 'low': '🟢'}
                    report.append(f"### {severity_emoji.get(gap.severity, '⚪')} {gap.title}\n")
                    report.append(f"**Severity:** {gap.severity.upper()} | **Effort:** {gap.effort_estimate}\n")
                    report.append(f"{gap.description}\n")
                    report.append(f"- **Web:** {gap.web_implementation}")
                    report.append(f"- **Desktop:** {gap.desktop_implementation}")
                    report.append(f"- **Impact:** {gap.impact}")
                    report.append("")
            else:
                report.append("✅ All web components have desktop equivalents!\n")
                
        # Feature Gaps
        if args.show_feature_gap:
            report.append("## ⚙️ Feature Implementation Gaps\n")
            feature_gaps = [g for g in analysis.gaps if g.gap_type == 'feature']
            if feature_gaps:
                # Group by component
                by_component = defaultdict(list)
                for gap in feature_gaps:
                    component_name = gap.title.split(':')[0].replace('Missing Feature in ', '')
                    by_component[component_name].append(gap)
                    
                for component, gaps in by_component.items():
                    report.append(f"### {component}\n")
                    for gap in gaps:
                        report.append(f"- **{gap.title.split(': ')[1]}** ({gap.severity})")
                        report.append(f"  - {gap.description}")
                        report.append(f"  - Effort: {gap.effort_estimate}")
                    report.append("")
            else:
                report.append("✅ Feature parity achieved!\n")
                
        # CSS/Style Gaps
        if args.show_css_gap:
            report.append("## 🎨 CSS & Styling Gaps\n")
            style_gaps = [g for g in analysis.gaps if g.gap_type == 'style']
            if style_gaps:
                for gap in style_gaps:
                    report.append(f"### {gap.title}\n")
                    report.append(f"**Severity:** {gap.severity.upper()} | **Effort:** {gap.effort_estimate}\n")
                    report.append(f"{gap.description}\n")
                    report.append(f"- **Web:** {gap.web_implementation}")
                    report.append(f"- **Desktop:** {gap.desktop_implementation}")
                    report.append(f"- **Impact:** {gap.impact}")
                    if gap.recommendations:
                        report.append("\n**Recommendations:**")
                        for rec in gap.recommendations:
                            report.append(f"- {rec}")
                    report.append("")
                    
                # CSS Statistics
                if analysis.css_analysis:
                    report.append("### CSS Analysis Statistics\n")
                    report.append(f"- **Total CSS Classes:** {len(analysis.css_analysis)}")
                    report.append(f"- **Classes with Animations:** {sum(1 for c in analysis.css_analysis if c.has_animation)}")
                    report.append(f"- **Classes with Transitions:** {sum(1 for c in analysis.css_analysis if c.has_transition)}")
                    report.append(f"- **Classes with Hover States:** {sum(1 for c in analysis.css_analysis if c.has_hover)}")
                    report.append(f"- **Classes with Transforms:** {sum(1 for c in analysis.css_analysis if c.has_transform)}")
                    report.append(f"- **Classes with Gradients:** {sum(1 for c in analysis.css_analysis if c.has_gradient)}")
                    report.append(f"- **Classes with Shadows:** {sum(1 for c in analysis.css_analysis if c.has_shadow)}")
                    report.append("")
            else:
                report.append("No significant style gaps detected.\n")
                
        # Component Details
        report.append("## 📋 Component Details\n")
        
        report.append("### Web Components\n")
        for comp in analysis.web_components:
            report.append(f"#### {comp.name}")
            report.append(f"- **Type:** {comp.component_type}")
            report.append(f"- **Lines:** {comp.line_count}")
            report.append(f"- **Props:** {', '.join(comp.props[:5]) if comp.props else 'None'}")
            report.append(f"- **Hooks:** {', '.join(comp.hooks[:5]) if comp.hooks else 'None'}")
            report.append(f"- **CSS Classes:** {len(comp.css_classes)}")
            report.append(f"- **Features:** {', '.join(f.name for f in comp.features) if comp.features else 'None'}")
            report.append("")
            
        report.append("### Desktop Components\n")
        for comp in analysis.desktop_components:
            report.append(f"#### {comp.name}")
            report.append(f"- **Lines:** {comp.line_count}")
            report.append(f"- **Properties:** {', '.join(comp.properties[:5]) if comp.properties else 'None'}")
            report.append(f"- **Events:** {', '.join(comp.events[:5]) if comp.events else 'None'}")
            report.append(f"- **Styles:** {len(comp.styles)}")
            report.append(f"- **Features:** {', '.join(f.name for f in comp.features) if comp.features else 'None'}")
            report.append("")
            
        # Recommendations
        if args.recommendations:
            report.append("## 💡 Implementation Recommendations\n")
            
            # Prioritize quick wins
            quick_wins = [g for g in analysis.gaps if g.is_quick_win]
            if quick_wins:
                report.append("### Priority 1: Quick Wins (1-2 hours each)\n")
                for gap in quick_wins[:5]:
                    report.append(f"1. **{gap.title}**")
                    if gap.recommendations:
                        for rec in gap.recommendations:
                            report.append(f"   - {rec}")
                report.append("")
                
            # High priority gaps
            high_gaps = [g for g in analysis.gaps if g.severity in ['critical', 'high'] and not g.is_quick_win]
            if high_gaps:
                report.append("### Priority 2: High Impact Items (1-3 days each)\n")
                for gap in high_gaps[:5]:
                    report.append(f"1. **{gap.title}** ({gap.effort_estimate} effort)")
                    report.append(f"   - {gap.description}")
                report.append("")
                
        return '\n'.join(report)
    
    @staticmethod
    def generate_json(analysis: PluginAnalysis) -> str:
        """Generate JSON report."""
        data = {
            'plugin_name': analysis.plugin_name,
            'generated_at': datetime.now().isoformat(),
            'summary': analysis.summary,
            'web_components': [
                {
                    'name': c.name,
                    'file_path': c.file_path,
                    'component_type': c.component_type,
                    'line_count': c.line_count,
                    'props': c.props,
                    'hooks': c.hooks,
                    'css_classes_count': len(c.css_classes),
                    'features': [f.name for f in c.features]
                }
                for c in analysis.web_components
            ],
            'desktop_components': [
                {
                    'name': c.name,
                    'file_path': c.file_path,
                    'line_count': c.line_count,
                    'properties': c.properties,
                    'events': c.events,
                    'styles_count': len(c.styles),
                    'features': [f.name for f in c.features]
                }
                for c in analysis.desktop_components
            ],
            'gaps': [
                {
                    'gap_type': g.gap_type,
                    'severity': g.severity,
                    'title': g.title,
                    'description': g.description,
                    'web_implementation': g.web_implementation,
                    'desktop_implementation': g.desktop_implementation,
                    'impact': g.impact,
                    'effort_estimate': g.effort_estimate,
                    'is_quick_win': g.is_quick_win,
                    'recommendations': g.recommendations
                }
                for g in analysis.gaps
            ]
        }
        
        return json.dumps(data, indent=2)


# ═══════════════════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description='Analyze gaps between web and desktop UI implementations',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument('--web-packages', default='./packages', help='Path to web packages folder')
    parser.add_argument('--web-ui', default='./src/ui', help='Path to web UI folder')
    parser.add_argument('--desktop', default='./src', help='Path to desktop source folder')
    parser.add_argument('--output', default='./output/web_desktop_gap_report.md', help='Output file path')
    parser.add_argument('--format', choices=['markdown', 'json', 'html'], default='markdown', help='Output format')
    parser.add_argument('--plugin', required=True, help='Plugin name to analyze')
    parser.add_argument('--show-css-gap', action='store_true', help='Show CSS styling gaps')
    parser.add_argument('--show-component-gap', action='store_true', help='Show component gaps')
    parser.add_argument('--show-feature-gap', action='store_true', help='Show feature gaps')
    parser.add_argument('--severity', choices=['critical', 'high', 'medium', 'low', 'all'], default='all', help='Filter by severity')
    parser.add_argument('--recommendations', action='store_true', help='Include recommendations')
    parser.add_argument('--quick-wins', action='store_true', help='Highlight quick wins')
    
    args = parser.parse_args()
    
    # If no specific gap type specified, show all
    if not any([args.show_css_gap, args.show_component_gap, args.show_feature_gap]):
        args.show_css_gap = True
        args.show_component_gap = True
        args.show_feature_gap = True
    
    print(f"🔍 Analyzing {args.plugin} plugin for web vs desktop gaps...")
    print(f"   Web packages: {args.web_packages}")
    print(f"   Desktop source: {args.desktop}")
    print()
    
    # Analyze plugin
    analysis = GapAnalyzer.analyze_plugin(args.plugin, args.web_packages, args.desktop)
    
    # Generate report
    if args.format == 'markdown':
        report = ReportGenerator.generate_markdown(analysis, args)
    elif args.format == 'json':
        report = ReportGenerator.generate_json(analysis)
    else:
        print("HTML format not yet implemented")
        return
    
    # Save report
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"✅ Analysis complete!")
    print(f"   Report saved to: {output_path}")
    print()
    print(f"📊 Summary:")
    print(f"   - Total gaps found: {analysis.summary['total_gaps']}")
    print(f"   - Quick win opportunities: {analysis.summary['quick_wins']}")
    print(f"   - Missing components: {analysis.summary['missing_components']}")
    print(f"   - Missing features: {analysis.summary['missing_features']}")
    print(f"   - Style gaps: {analysis.summary['style_gaps']}")


if __name__ == '__main__':
    main()
