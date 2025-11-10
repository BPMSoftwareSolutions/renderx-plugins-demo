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
            imports=imports
        )
    
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
            features=features
        )
    
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
            analysis = CSSAnalysis(
                class_name=class_name,
                properties=properties,
                file_path=file_path,
                has_hover=':hover' in content[max(0, match.start()-100):match.end()+100],
                has_animation='animation' in props_str or '@keyframes' in content,
                has_transition='transition' in props_str,
                has_transform='transform' in props_str,
                has_gradient='gradient' in props_str,
                has_shadow='shadow' in props_str,
                complexity_score=len(properties)
            )
            
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
