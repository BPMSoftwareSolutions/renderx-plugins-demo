#!/usr/bin/env python3
"""
UI Component & Style Scanner with ASCII Sketches

A sophisticated Python script that scans UI components and their styles,
generating detailed reports with ASCII visual representations of component hierarchies,
layouts, and style relationships.

Usage:
    python ui_component_style_scanner.py [options]

Options:
    --packages PATH      : Path to packages folder (default: ./packages)
    --ui PATH            : Path to UI folder (default: ./src/ui)
    --output FILE        : Save output to file (default: ui_component_style_report.txt)
    --format FORMAT      : Output format: 'full', 'components', 'styles', 'tree' (default: full)
    --show-sketches      : Include ASCII sketches of component layouts
    --show-relationships : Show component-style relationships
    --show-dependencies  : Show import dependencies
    --min-lines N        : Only show files with at least N lines (default: 1)
    --stats              : Show detailed statistics

Examples:
    python ui_component_style_scanner.py --show-sketches --stats
    python ui_component_style_scanner.py --format components --output components_only.txt
    python ui_component_style_scanner.py --packages ./packages --ui ./src/ui
"""

import os
import re
import json
import argparse
from pathlib import Path
from typing import List, Dict, Set, Tuple, Optional
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime


# ═══════════════════════════════════════════════════════════════════════════
# Data Classes
# ═══════════════════════════════════════════════════════════════════════════

@dataclass
class StyleRule:
    """Represents a CSS style rule."""
    selector: str
    properties: Dict[str, str]
    line_number: int
    file_path: str
    
@dataclass
class CSSClass:
    """Represents a CSS class definition."""
    class_name: str
    properties: Dict[str, str]
    line_number: int
    file_path: str
    theme_variants: List[str] = field(default_factory=list)
    pseudo_states: List[str] = field(default_factory=list)

@dataclass
class Component:
    """Represents a UI component."""
    name: str
    file_path: str
    component_type: str  # 'function', 'class', 'const'
    imports: List[str] = field(default_factory=list)
    css_imports: List[str] = field(default_factory=list)
    class_names_used: Set[str] = field(default_factory=set)
    props: List[str] = field(default_factory=list)
    jsx_elements: List[str] = field(default_factory=list)
    hooks_used: List[str] = field(default_factory=list)
    line_count: int = 0
    complexity_score: int = 0
    children_components: List[str] = field(default_factory=list)

@dataclass
class Package:
    """Represents a package with UI components."""
    name: str
    path: str
    components: List[Component] = field(default_factory=list)
    styles: List[CSSClass] = field(default_factory=list)
    total_files: int = 0
    total_lines: int = 0


# ═══════════════════════════════════════════════════════════════════════════
# File Parsers
# ═══════════════════════════════════════════════════════════════════════════

class CSSParser:
    """Parses CSS files and extracts style information."""
    
    @staticmethod
    def parse_css_file(file_path: str) -> List[CSSClass]:
        """Parse a CSS file and extract all class definitions."""
        css_classes = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                
            # Remove comments
            content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
            
            # Find all CSS rules
            rule_pattern = r'([^{]+)\s*\{([^}]+)\}'
            matches = re.finditer(rule_pattern, content)
            
            for match in matches:
                selector = match.group(1).strip()
                properties_block = match.group(2).strip()
                
                # Parse properties
                properties = {}
                for prop in properties_block.split(';'):
                    if ':' in prop:
                        key, value = prop.split(':', 1)
                        properties[key.strip()] = value.strip()
                
                # Extract class names from selector
                class_names = re.findall(r'\.([a-zA-Z0-9_-]+)', selector)
                
                # Find line number
                line_num = 1
                pos = content[:match.start()].count('\n')
                line_num = pos + 1
                
                for class_name in class_names:
                    # Check for theme variants
                    theme_variants = []
                    if '[data-theme=' in selector:
                        theme_match = re.search(r'\[data-theme="([^"]+)"\]', selector)
                        if theme_match:
                            theme_variants.append(theme_match.group(1))
                    
                    # Check for pseudo states
                    pseudo_states = []
                    pseudo_matches = re.findall(r':([a-z-]+)', selector)
                    pseudo_states.extend(pseudo_matches)
                    
                    css_class = CSSClass(
                        class_name=class_name,
                        properties=properties,
                        line_number=line_num,
                        file_path=file_path,
                        theme_variants=theme_variants,
                        pseudo_states=pseudo_states
                    )
                    css_classes.append(css_class)
                    
        except Exception as e:
            print(f"Error parsing CSS file {file_path}: {e}")
            
        return css_classes


class ComponentParser:
    """Parses React/TypeScript component files."""
    
    @staticmethod
    def parse_component_file(file_path: str) -> Optional[Component]:
        """Parse a component file and extract component information."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                
            file_name = Path(file_path).stem
            
            # Determine component type and name
            component_name = file_name
            component_type = 'unknown'
            
            # Check for function component
            func_pattern = r'export\s+(?:function|const)\s+([A-Z][a-zA-Z0-9]*)'
            func_match = re.search(func_pattern, content)
            if func_match:
                component_name = func_match.group(1)
                component_type = 'function'
            
            # Check for class component
            class_pattern = r'export\s+class\s+([A-Z][a-zA-Z0-9]*)'
            class_match = re.search(class_pattern, content)
            if class_match:
                component_name = class_match.group(1)
                component_type = 'class'
                
            # Extract imports
            imports = []
            import_pattern = r'import\s+.*?\s+from\s+["\']([^"\']+)["\']'
            imports = re.findall(import_pattern, content)
            
            # Extract CSS imports
            css_imports = []
            css_pattern = r'import\s+["\']([^"\']+\.css)["\']'
            css_imports = re.findall(css_pattern, content)
            
            # Extract className usages
            class_names = set()
            # className="..."
            class_pattern1 = r'className=["\'`]([^"\'`]+)["\'`]'
            class_names.update(re.findall(class_pattern1, content))
            # className={...}
            class_pattern2 = r'className=\{["\']([^"\']+)["\']\}'
            class_names.update(re.findall(class_pattern2, content))
            
            # Flatten space-separated classes
            expanded_classes = set()
            for cls in class_names:
                expanded_classes.update(cls.split())
            
            # Extract props
            props = []
            props_pattern = r'(?:function|const)\s+[A-Z][a-zA-Z0-9]*\s*\(\s*\{([^}]+)\}'
            props_match = re.search(props_pattern, content)
            if props_match:
                props_content = props_match.group(1)
                props = [p.strip().split(':')[0].strip() for p in props_content.split(',')]
            
            # Extract JSX elements
            jsx_elements = set()
            jsx_pattern = r'<([A-Z][a-zA-Z0-9]*)'
            jsx_elements.update(re.findall(jsx_pattern, content))
            
            # Extract React hooks
            hooks = set()
            hook_pattern = r'\b(use[A-Z][a-zA-Z0-9]*)\('
            hooks.update(re.findall(hook_pattern, content))
            
            # Calculate complexity score
            complexity = len(hooks) * 2
            complexity += len(jsx_elements)
            complexity += len(re.findall(r'\bif\b|\belse\b|\bswitch\b|\bfor\b|\bwhile\b', content))
            
            component = Component(
                name=component_name,
                file_path=file_path,
                component_type=component_type,
                imports=imports,
                css_imports=css_imports,
                class_names_used=expanded_classes,
                props=props,
                jsx_elements=list(jsx_elements),
                hooks_used=list(hooks),
                line_count=len(lines),
                complexity_score=complexity,
                children_components=list(jsx_elements)
            )
            
            return component
            
        except Exception as e:
            print(f"Error parsing component file {file_path}: {e}")
            return None


# ═══════════════════════════════════════════════════════════════════════════
# Scanner
# ═══════════════════════════════════════════════════════════════════════════

class UIScanner:
    """Scans directories for UI components and styles."""
    
    def __init__(self, packages_path: str, ui_path: str):
        self.packages_path = packages_path
        self.ui_path = ui_path
        self.packages: List[Package] = []
        self.all_components: List[Component] = []
        self.all_styles: List[CSSClass] = []
        
    def scan(self) -> None:
        """Scan all specified directories."""
        print("🔍 Scanning UI components and styles...")
        
        # Scan packages
        if os.path.exists(self.packages_path):
            self._scan_packages()
        
        # Scan src/ui
        if os.path.exists(self.ui_path):
            self._scan_ui_directory()
            
        print(f"✅ Scan complete! Found {len(self.all_components)} components and {len(self.all_styles)} styles.")
    
    def _scan_packages(self) -> None:
        """Scan packages directory."""
        packages_dir = Path(self.packages_path)
        
        for package_dir in packages_dir.iterdir():
            if package_dir.is_dir() and not package_dir.name.startswith('.'):
                package = self._scan_package(package_dir)
                if package:
                    self.packages.append(package)
    
    def _scan_package(self, package_path: Path) -> Optional[Package]:
        """Scan a single package."""
        package = Package(
            name=package_path.name,
            path=str(package_path)
        )
        
        # Look for UI components in src/ui or ui directories
        ui_paths = [
            package_path / 'src' / 'ui',
            package_path / 'ui',
            package_path / 'src'
        ]
        
        for ui_path in ui_paths:
            if ui_path.exists():
                self._scan_directory(ui_path, package)
                
        if package.components or package.styles:
            return package
        return None
    
    def _scan_ui_directory(self) -> None:
        """Scan src/ui directory as a special package."""
        ui_package = Package(
            name='ui',
            path=self.ui_path
        )
        
        self._scan_directory(Path(self.ui_path), ui_package)
        
        if ui_package.components or ui_package.styles:
            self.packages.append(ui_package)
    
    def _scan_directory(self, directory: Path, package: Package) -> None:
        """Recursively scan a directory for components and styles."""
        for item in directory.rglob('*'):
            if item.is_file():
                package.total_files += 1
                
                # Parse component files
                if item.suffix in ['.tsx', '.ts', '.jsx', '.js']:
                    component = ComponentParser.parse_component_file(str(item))
                    if component:
                        package.components.append(component)
                        package.total_lines += component.line_count
                        self.all_components.append(component)
                
                # Parse style files
                elif item.suffix in ['.css', '.scss', '.less']:
                    styles = CSSParser.parse_css_file(str(item))
                    package.styles.extend(styles)
                    self.all_styles.extend(styles)
                    
                    # Count lines
                    try:
                        with open(item, 'r', encoding='utf-8') as f:
                            package.total_lines += len(f.readlines())
                    except:
                        pass


# ═══════════════════════════════════════════════════════════════════════════
# ASCII Art Generator
# ═══════════════════════════════════════════════════════════════════════════

class ASCIIArtGenerator:
    """Generates ASCII art visualizations."""
    
    @staticmethod
    def component_box(component: Component, width: int = 60) -> str:
        """Generate an ASCII box for a component."""
        lines = []
        name = component.name[:width-4]
        
        # Top border
        lines.append('╔' + '═' * (width-2) + '╗')
        
        # Component name
        lines.append(f'║ {name.center(width-4)} ║')
        lines.append('╠' + '═' * (width-2) + '╣')
        
        # Type and metrics
        type_line = f'{component.component_type.upper()} | {component.line_count} lines | Complexity: {component.complexity_score}'
        lines.append(f'║ {type_line:<{width-4}} ║')
        
        if component.props:
            lines.append('╟' + '─' * (width-2) + '╢')
            lines.append(f'║ Props: {", ".join(component.props[:3]):<{width-11}} ║')
        
        if component.hooks_used:
            lines.append('╟' + '─' * (width-2) + '╢')
            hooks_str = ", ".join(component.hooks_used[:3])
            if len(component.hooks_used) > 3:
                hooks_str += f" +{len(component.hooks_used)-3}"
            lines.append(f'║ Hooks: {hooks_str:<{width-12}} ║')
        
        if component.class_names_used:
            lines.append('╟' + '─' * (width-2) + '╢')
            classes_str = ", ".join(list(component.class_names_used)[:2])
            if len(component.class_names_used) > 2:
                classes_str += f" +{len(component.class_names_used)-2}"
            lines.append(f'║ CSS: {classes_str:<{width-10}} ║')
        
        # Bottom border
        lines.append('╚' + '═' * (width-2) + '╝')
        
        return '\n'.join(lines)
    
    @staticmethod
    def component_tree(components: List[Component], max_depth: int = 3) -> str:
        """Generate a tree view of component relationships."""
        lines = []
        lines.append('╔════════════════════════════════════════════════════════════╗')
        lines.append('║          COMPONENT HIERARCHY TREE                          ║')
        lines.append('╚════════════════════════════════════════════════════════════╝')
        lines.append('')
        
        # Build parent-child relationships
        component_map = {c.name: c for c in components}
        root_components = []
        
        for comp in components:
            is_root = True
            for other in components:
                if comp.name in other.children_components:
                    is_root = False
                    break
            if is_root:
                root_components.append(comp)
        
        def render_tree(comp: Component, prefix: str = '', is_last: bool = True):
            tree_lines = []
            connector = '└── ' if is_last else '├── '
            icon = '🔷' if comp.component_type == 'function' else '🔶'
            tree_lines.append(f'{prefix}{connector}{icon} {comp.name}')
            
            # Add children
            if comp.children_components:
                new_prefix = prefix + ('    ' if is_last else '│   ')
                for i, child_name in enumerate(comp.children_components):
                    if child_name in component_map:
                        child = component_map[child_name]
                        is_last_child = (i == len(comp.children_components) - 1)
                        tree_lines.extend(render_tree(child, new_prefix, is_last_child))
            
            return tree_lines
        
        for i, root in enumerate(root_components[:10]):  # Limit to 10 roots
            lines.extend(render_tree(root, '', i == len(root_components) - 1))
        
        if len(root_components) > 10:
            lines.append(f'... and {len(root_components) - 10} more root components')
        
        return '\n'.join(lines)
    
    @staticmethod
    def style_table(styles: List[CSSClass], max_items: int = 20) -> str:
        """Generate a table of CSS classes."""
        lines = []
        lines.append('╔════════════════════════════════════════════════════════════════════════╗')
        lines.append('║                         CSS CLASSES CATALOG                            ║')
        lines.append('╠══════════════════════════╤═════════════╤══════════════════════════════╣')
        lines.append('║ Class Name               │ Properties  │ Variants                     ║')
        lines.append('╠══════════════════════════╪═════════════╪══════════════════════════════╣')
        
        for style in styles[:max_items]:
            name = style.class_name[:24].ljust(24)
            props_count = str(len(style.properties)).ljust(11)
            
            variants = []
            if style.theme_variants:
                variants.extend([f'theme:{t}' for t in style.theme_variants])
            if style.pseudo_states:
                variants.extend([f':{p}' for p in style.pseudo_states[:2]])
            
            variants_str = ', '.join(variants[:2])[:28].ljust(28)
            
            lines.append(f'║ {name} │ {props_count} │ {variants_str} ║')
        
        if len(styles) > max_items:
            lines.append('╠══════════════════════════╧═════════════╧══════════════════════════════╣')
            lines.append(f'║ ... and {len(styles) - max_items} more classes{" " * (70 - len(str(len(styles) - max_items)) - 24)} ║')
        
        lines.append('╚════════════════════════════════════════════════════════════════════════╝')
        
        return '\n'.join(lines)
    
    @staticmethod
    def detailed_style_card(style: CSSClass, width: int = 80) -> str:
        """Generate a detailed card for a CSS class with all properties."""
        lines = []
        
        # Header
        lines.append('┏' + '━' * (width-2) + '┓')
        lines.append(f'┃ 🎨 .{style.class_name:<{width-7}}┃')
        lines.append('┣' + '━' * (width-2) + '┫')
        
        # File info
        file_name = Path(style.file_path).name
        lines.append(f'┃ 📁 {file_name:<{width-6}}┃')
        lines.append(f'┃ 📍 Line {style.line_number:<{width-10}}┃')
        
        # Variants
        if style.theme_variants or style.pseudo_states:
            lines.append('┣' + '─' * (width-2) + '┫')
            if style.theme_variants:
                themes = ', '.join(style.theme_variants)
                lines.append(f'┃ 🌓 Themes: {themes:<{width-14}}┃')
            if style.pseudo_states:
                states = ', '.join(style.pseudo_states)
                lines.append(f'┃ ⚡ States: {states:<{width-14}}┃')
        
        # Properties
        if style.properties:
            lines.append('┣' + '━' * (width-2) + '┫')
            lines.append(f'┃ {"PROPERTIES":<{width-4}}┃')
            lines.append('┣' + '─' * (width-2) + '┫')
            
            for prop, value in sorted(style.properties.items()):
                # Truncate long values
                display_value = value[:width-20] if len(value) < width-20 else value[:width-23] + '...'
                prop_line = f'{prop}: {display_value}'
                lines.append(f'┃   {prop_line:<{width-6}}┃')
        
        # Footer
        lines.append('┗' + '━' * (width-2) + '┛')
        
        return '\n'.join(lines)
    
    @staticmethod
    def color_palette(styles: List[CSSClass]) -> str:
        """Extract and display color palette used in styles."""
        lines = []
        colors = set()
        
        # Extract colors from properties
        color_props = ['color', 'background', 'background-color', 'border-color', 'fill', 'stroke']
        
        for style in styles:
            for prop, value in style.properties.items():
                if any(cp in prop.lower() for cp in color_props):
                    # Extract hex colors
                    hex_colors = re.findall(r'#[0-9a-fA-F]{3,8}', value)
                    colors.update(hex_colors)
                    # Extract rgb/rgba
                    rgb_colors = re.findall(r'rgba?\([^)]+\)', value)
                    colors.update(rgb_colors)
        
        if not colors:
            return ''
        
        lines.append('╔════════════════════════════════════════════════════════════════════════╗')
        lines.append('║                          COLOR PALETTE                                 ║')
        lines.append('╚════════════════════════════════════════════════════════════════════════╝')
        lines.append('')
        
        # Group by type
        hex_colors = sorted([c for c in colors if c.startswith('#')])
        rgb_colors = sorted([c for c in colors if c.startswith('rgb')])
        
        if hex_colors:
            lines.append('🎨 HEX COLORS:')
            for i, color in enumerate(hex_colors[:20], 1):
                lines.append(f'   {i:2}. {color}  ████')
            if len(hex_colors) > 20:
                lines.append(f'   ... and {len(hex_colors) - 20} more')
            lines.append('')
        
        if rgb_colors:
            lines.append('🎨 RGB/RGBA COLORS:')
            for i, color in enumerate(rgb_colors[:10], 1):
                lines.append(f'   {i:2}. {color}')
            if len(rgb_colors) > 10:
                lines.append(f'   ... and {len(rgb_colors) - 10} more')
            lines.append('')
        
        return '\n'.join(lines)
    
    @staticmethod
    def layout_patterns(styles: List[CSSClass]) -> str:
        """Analyze and display layout patterns."""
        lines = []
        
        # Track layout systems
        flexbox_count = 0
        grid_count = 0
        absolute_count = 0
        fixed_count = 0
        
        for style in styles:
            display = style.properties.get('display', '')
            position = style.properties.get('position', '')
            
            if 'flex' in display:
                flexbox_count += 1
            if 'grid' in display:
                grid_count += 1
            if position == 'absolute':
                absolute_count += 1
            if position == 'fixed':
                fixed_count += 1
        
        lines.append('╔════════════════════════════════════════════════════════════════════════╗')
        lines.append('║                        LAYOUT PATTERNS                                 ║')
        lines.append('╚════════════════════════════════════════════════════════════════════════╝')
        lines.append('')
        
        total = len(styles)
        if total > 0:
            lines.append(f'📐 Flexbox:        {flexbox_count:>4} classes  {"█" * min(50, flexbox_count)} ({flexbox_count/total*100:.1f}%)')
            lines.append(f'📐 Grid:           {grid_count:>4} classes  {"█" * min(50, grid_count)} ({grid_count/total*100:.1f}%)')
            lines.append(f'📐 Absolute:       {absolute_count:>4} classes  {"█" * min(50, absolute_count)} ({absolute_count/total*100:.1f}%)')
            lines.append(f'📐 Fixed:          {fixed_count:>4} classes  {"█" * min(50, fixed_count)} ({fixed_count/total*100:.1f}%)')
        
        return '\n'.join(lines)
    
    @staticmethod
    def typography_analysis(styles: List[CSSClass]) -> str:
        """Analyze typography patterns."""
        lines = []
        font_sizes = []
        font_weights = []
        font_families = set()
        
        for style in styles:
            if 'font-size' in style.properties:
                font_sizes.append(style.properties['font-size'])
            if 'font-weight' in style.properties:
                font_weights.append(style.properties['font-weight'])
            if 'font-family' in style.properties:
                font_families.add(style.properties['font-family'])
        
        lines.append('╔════════════════════════════════════════════════════════════════════════╗')
        lines.append('║                      TYPOGRAPHY ANALYSIS                               ║')
        lines.append('╚════════════════════════════════════════════════════════════════════════╝')
        lines.append('')
        
        # Font sizes
        if font_sizes:
            from collections import Counter
            size_counts = Counter(font_sizes)
            lines.append('📏 Font Sizes (Top 10):')
            for size, count in size_counts.most_common(10):
                bars = '█' * min(40, count)
                lines.append(f'   {size:>10}  {bars} ({count} uses)')
            lines.append('')
        
        # Font weights
        if font_weights:
            from collections import Counter
            weight_counts = Counter(font_weights)
            lines.append('💪 Font Weights:')
            for weight, count in sorted(weight_counts.items(), key=lambda x: x[1], reverse=True):
                bars = '█' * min(40, count)
                lines.append(f'   {weight:>10}  {bars} ({count} uses)')
            lines.append('')
        
        # Font families
        if font_families:
            lines.append('🔤 Font Families:')
            for i, family in enumerate(sorted(font_families)[:10], 1):
                family_short = family[:60] if len(family) < 60 else family[:57] + '...'
                lines.append(f'   {i:2}. {family_short}')
            if len(font_families) > 10:
                lines.append(f'   ... and {len(font_families) - 10} more')
            lines.append('')
        
        return '\n'.join(lines)
    
    @staticmethod
    def spacing_analysis(styles: List[CSSClass]) -> str:
        """Analyze spacing patterns."""
        lines = []
        paddings = []
        margins = []
        gaps = []
        
        for style in styles:
            if 'padding' in style.properties:
                paddings.append(style.properties['padding'])
            if 'margin' in style.properties:
                margins.append(style.properties['margin'])
            if 'gap' in style.properties:
                gaps.append(style.properties['gap'])
        
        lines.append('╔════════════════════════════════════════════════════════════════════════╗')
        lines.append('║                       SPACING ANALYSIS                                 ║')
        lines.append('╚════════════════════════════════════════════════════════════════════════╝')
        lines.append('')
        
        from collections import Counter
        
        # Padding values
        if paddings:
            padding_counts = Counter(paddings)
            lines.append('📦 Padding Values (Top 10):')
            for val, count in padding_counts.most_common(10):
                bars = '█' * min(40, count)
                lines.append(f'   {val:>20}  {bars} ({count} uses)')
            lines.append('')
        
        # Gap values (for flexbox/grid)
        if gaps:
            gap_counts = Counter(gaps)
            lines.append('↔️  Gap Values (Flexbox/Grid):')
            for val, count in gap_counts.most_common(10):
                bars = '█' * min(40, count)
                lines.append(f'   {val:>20}  {bars} ({count} uses)')
            lines.append('')
        
        return '\n'.join(lines)
    
    @staticmethod
    def animation_effects(styles: List[CSSClass]) -> str:
        """Analyze animation and transition effects."""
        lines = []
        transitions = []
        animations = []
        transforms = []
        
        for style in styles:
            if 'transition' in style.properties:
                transitions.append(style.properties['transition'])
            if 'animation' in style.properties:
                animations.append(style.properties['animation'])
            if 'transform' in style.properties:
                transforms.append(style.properties['transform'])
        
        if not (transitions or animations or transforms):
            return ''
        
        lines.append('╔════════════════════════════════════════════════════════════════════════╗')
        lines.append('║                    ANIMATIONS & EFFECTS                                ║')
        lines.append('╚════════════════════════════════════════════════════════════════════════╝')
        lines.append('')
        
        if transitions:
            lines.append(f'⚡ Transitions: {len(transitions)} classes')
            from collections import Counter
            trans_counts = Counter(transitions)
            for trans, count in trans_counts.most_common(5):
                trans_short = trans[:60] if len(trans) < 60 else trans[:57] + '...'
                lines.append(f'   • {trans_short} ({count}x)')
            lines.append('')
        
        if transforms:
            lines.append(f'🔄 Transforms: {len(transforms)} classes')
            from collections import Counter
            transform_counts = Counter(transforms)
            for trans, count in transform_counts.most_common(5):
                lines.append(f'   • {trans} ({count}x)')
            lines.append('')
        
        if animations:
            lines.append(f'🎬 Animations: {len(animations)} classes')
            lines.append('')
        
        return '\n'.join(lines)
    
    @staticmethod
    def package_overview(package: Package) -> str:
        """Generate an overview box for a package."""
        lines = []
        width = 70
        
        lines.append('┏' + '━' * (width-2) + '┓')
        lines.append(f'┃ 📦 {package.name.upper():<{width-7}}┃')
        lines.append('┣' + '━' * (width-2) + '┫')
        lines.append(f'┃ Components: {len(package.components):<{width-16}}┃')
        lines.append(f'┃ Style Classes: {len(package.styles):<{width-19}}┃')
        lines.append(f'┃ Total Files: {package.total_files:<{width-17}}┃')
        lines.append(f'┃ Total Lines: {package.total_lines:<{width-17}}┃')
        lines.append('┗' + '━' * (width-2) + '┛')
        
        return '\n'.join(lines)


# ═══════════════════════════════════════════════════════════════════════════
# Report Generator
# ═══════════════════════════════════════════════════════════════════════════

class ReportGenerator:
    """Generates comprehensive reports."""
    
    def __init__(self, scanner: UIScanner):
        self.scanner = scanner
        self.art = ASCIIArtGenerator()
    
    def generate_full_report(self, show_sketches: bool = True, 
                           show_relationships: bool = True,
                           show_stats: bool = True) -> str:
        """Generate a full comprehensive report."""
        lines = []
        
        # Header
        lines.append(self._generate_header())
        lines.append('')
        
        # Executive Summary
        lines.append(self._generate_summary())
        lines.append('\n')
        
        # Package Overview
        lines.append(self._generate_packages_overview())
        lines.append('\n')
        
        # Components Section
        if show_sketches:
            lines.append(self._generate_components_section())
            lines.append('\n')
        
        # Styles Section
        if show_sketches:
            lines.append(self._generate_styles_section())
            lines.append('\n')
        
        # Relationships
        if show_relationships:
            lines.append(self._generate_relationships_section())
            lines.append('\n')
        
        # Statistics
        if show_stats:
            lines.append(self._generate_statistics_section())
            lines.append('\n')
        
        # Footer
        lines.append(self._generate_footer())
        
        return '\n'.join(lines)
    
    def _generate_header(self) -> str:
        """Generate report header."""
        lines = []
        lines.append('╔═══════════════════════════════════════════════════════════════════════════════╗')
        lines.append('║                                                                               ║')
        lines.append('║              🎨 UI COMPONENT & STYLE ANALYSIS REPORT 🎨                       ║')
        lines.append('║                                                                               ║')
        lines.append('║              Sophisticated Analysis with ASCII Visualizations                 ║')
        lines.append('║                                                                               ║')
        lines.append('╚═══════════════════════════════════════════════════════════════════════════════╝')
        lines.append(f'Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
        return '\n'.join(lines)
    
    def _generate_summary(self) -> str:
        """Generate executive summary."""
        total_components = len(self.scanner.all_components)
        total_styles = len(self.scanner.all_styles)
        total_packages = len(self.scanner.packages)
        total_lines = sum(p.total_lines for p in self.scanner.packages)
        
        lines = []
        lines.append('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')
        lines.append('┃                          EXECUTIVE SUMMARY                            ┃')
        lines.append('┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫')
        lines.append(f'┃  📦 Total Packages Scanned:        {total_packages:>4}                            ┃')
        lines.append(f'┃  🔷 Total Components Found:        {total_components:>4}                            ┃')
        lines.append(f'┃  🎨 Total CSS Classes Found:       {total_styles:>4}                            ┃')
        lines.append(f'┃  📝 Total Lines of Code:           {total_lines:>6}                          ┃')
        lines.append('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')
        return '\n'.join(lines)
    
    def _generate_packages_overview(self) -> str:
        """Generate packages overview section."""
        lines = []
        lines.append('═' * 80)
        lines.append('                            PACKAGES OVERVIEW')
        lines.append('═' * 80)
        lines.append('')
        
        for package in sorted(self.scanner.packages, key=lambda p: len(p.components), reverse=True):
            lines.append(self.art.package_overview(package))
            lines.append('')
        
        return '\n'.join(lines)
    
    def _generate_components_section(self) -> str:
        """Generate components section with ASCII sketches."""
        lines = []
        lines.append('═' * 80)
        lines.append('                          COMPONENT CATALOG')
        lines.append('═' * 80)
        lines.append('')
        
        # Show top components by complexity
        top_components = sorted(self.scanner.all_components, 
                               key=lambda c: c.complexity_score, 
                               reverse=True)[:10]
        
        lines.append('╔════════════════════════════════════════════════════════════════════════╗')
        lines.append('║                    TOP 10 MOST COMPLEX COMPONENTS                      ║')
        lines.append('╚════════════════════════════════════════════════════════════════════════╝')
        lines.append('')
        
        for i, comp in enumerate(top_components, 1):
            lines.append(f'[{i}] {self.art.component_box(comp)}')
            lines.append('')
        
        # Component tree
        if self.scanner.all_components:
            lines.append('\n')
            lines.append(self.art.component_tree(self.scanner.all_components))
            lines.append('')
        
        return '\n'.join(lines)
    
    def _generate_styles_section(self) -> str:
        """Generate styles section."""
        lines = []
        lines.append('═' * 80)
        lines.append('                            STYLES CATALOG')
        lines.append('═' * 80)
        lines.append('')
        
        if self.scanner.all_styles:
            lines.append(self.art.style_table(self.scanner.all_styles))
            lines.append('')
            
            # Detailed style cards for top styles
            lines.append('\n╔════════════════════════════════════════════════════════════════════════╗')
            lines.append('║                    DETAILED STYLE DEFINITIONS                          ║')
            lines.append('╚════════════════════════════════════════════════════════════════════════╝')
            lines.append('')
            
            # Show detailed cards for styles with most properties
            top_styles = sorted(self.scanner.all_styles, 
                              key=lambda s: len(s.properties), 
                              reverse=True)[:15]
            
            for style in top_styles:
                lines.append(self.art.detailed_style_card(style))
                lines.append('')
            
            # Color palette
            lines.append('')
            color_section = self.art.color_palette(self.scanner.all_styles)
            if color_section:
                lines.append(color_section)
                lines.append('')
            
            # Layout patterns
            lines.append('')
            lines.append(self.art.layout_patterns(self.scanner.all_styles))
            lines.append('')
            
            # Typography analysis
            lines.append('')
            lines.append(self.art.typography_analysis(self.scanner.all_styles))
            lines.append('')
            
            # Spacing analysis
            lines.append('')
            lines.append(self.art.spacing_analysis(self.scanner.all_styles))
            lines.append('')
            
            # Animation effects
            animation_section = self.art.animation_effects(self.scanner.all_styles)
            if animation_section:
                lines.append('')
                lines.append(animation_section)
                lines.append('')
            
            # Group by package
            lines.append('\n╔════════════════════════════════════════════════════════════════════════╗')
            lines.append('║                      STYLES BY PACKAGE                                 ║')
            lines.append('╚════════════════════════════════════════════════════════════════════════╝')
            lines.append('')
            
            for package in self.scanner.packages:
                if package.styles:
                    lines.append(f'📦 {package.name}: {len(package.styles)} classes')
                    for style in package.styles[:5]:
                        lines.append(f'   └─ .{style.class_name} ({len(style.properties)} properties)')
                    if len(package.styles) > 5:
                        lines.append(f'   └─ ... and {len(package.styles) - 5} more')
                    lines.append('')
        
        return '\n'.join(lines)
    
    def _generate_relationships_section(self) -> str:
        """Generate component-style relationships."""
        lines = []
        lines.append('═' * 80)
        lines.append('                    COMPONENT-STYLE RELATIONSHIPS')
        lines.append('═' * 80)
        lines.append('')
        
        # Map styles to components
        style_map = {s.class_name: s for s in self.scanner.all_styles}
        
        for comp in self.scanner.all_components[:10]:
            if comp.class_names_used:
                lines.append(f'🔷 {comp.name}')
                lines.append('   │')
                for cls in comp.class_names_used:
                    if cls in style_map:
                        style = style_map[cls]
                        file_name = Path(style.file_path).name
                        lines.append(f'   ├─ .{cls} ← {file_name}')
                    else:
                        lines.append(f'   ├─ .{cls} (external)')
                lines.append('')
        
        return '\n'.join(lines)
    
    def _generate_statistics_section(self) -> str:
        """Generate detailed statistics."""
        lines = []
        lines.append('═' * 80)
        lines.append('                        DETAILED STATISTICS')
        lines.append('═' * 80)
        lines.append('')
        
        # Component statistics
        func_components = sum(1 for c in self.scanner.all_components if c.component_type == 'function')
        class_components = sum(1 for c in self.scanner.all_components if c.component_type == 'class')
        total_hooks = sum(len(c.hooks_used) for c in self.scanner.all_components)
        avg_complexity = sum(c.complexity_score for c in self.scanner.all_components) / max(len(self.scanner.all_components), 1)
        
        lines.append('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')
        lines.append('┃                  COMPONENT STATISTICS                      ┃')
        lines.append('┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫')
        lines.append(f'┃  Function Components:           {func_components:>6}                  ┃')
        lines.append(f'┃  Class Components:              {class_components:>6}                  ┃')
        lines.append(f'┃  Total React Hooks Used:        {total_hooks:>6}                  ┃')
        lines.append(f'┃  Average Complexity Score:      {avg_complexity:>6.1f}                  ┃')
        lines.append('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')
        lines.append('')
        
        # Style statistics
        total_properties = sum(len(s.properties) for s in self.scanner.all_styles)
        avg_properties = total_properties / max(len(self.scanner.all_styles), 1)
        themed_styles = sum(1 for s in self.scanner.all_styles if s.theme_variants)
        
        lines.append('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')
        lines.append('┃                    STYLE STATISTICS                        ┃')
        lines.append('┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫')
        lines.append(f'┃  Total CSS Properties:          {total_properties:>6}                  ┃')
        lines.append(f'┃  Avg Properties per Class:      {avg_properties:>6.1f}                  ┃')
        lines.append(f'┃  Theme-Aware Styles:            {themed_styles:>6}                  ┃')
        lines.append('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')
        lines.append('')
        
        # Most used hooks
        hooks_count = defaultdict(int)
        for comp in self.scanner.all_components:
            for hook in comp.hooks_used:
                hooks_count[hook] += 1
        
        if hooks_count:
            lines.append('Top 10 Most Used React Hooks:')
            for i, (hook, count) in enumerate(sorted(hooks_count.items(), key=lambda x: x[1], reverse=True)[:10], 1):
                bars = '█' * min(count, 40)
                lines.append(f'  {i:>2}. {hook:<25} {bars} ({count})')
            lines.append('')
        
        # Most common CSS properties
        prop_count = defaultdict(int)
        for style in self.scanner.all_styles:
            for prop in style.properties.keys():
                prop_count[prop] += 1
        
        if prop_count:
            lines.append('Top 10 Most Used CSS Properties:')
            for i, (prop, count) in enumerate(sorted(prop_count.items(), key=lambda x: x[1], reverse=True)[:10], 1):
                bars = '█' * min(count, 40)
                lines.append(f'  {i:>2}. {prop:<25} {bars} ({count})')
            lines.append('')
        
        return '\n'.join(lines)
    
    def _generate_footer(self) -> str:
        """Generate report footer."""
        lines = []
        lines.append('═' * 80)
        lines.append('                           END OF REPORT')
        lines.append('═' * 80)
        lines.append('')
        lines.append('Generated by UI Component & Style Scanner')
        lines.append(f'Scan completed at: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
        return '\n'.join(lines)


# ═══════════════════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description='UI Component & Style Scanner with ASCII Sketches',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument('--packages', default='./packages',
                       help='Path to packages folder (default: ./packages)')
    parser.add_argument('--ui', default='./src/ui',
                       help='Path to UI folder (default: ./src/ui)')
    parser.add_argument('--output', default='ui_component_style_report.txt',
                       help='Output file path (default: ui_component_style_report.txt)')
    parser.add_argument('--format', choices=['full', 'components', 'styles', 'tree'],
                       default='full', help='Output format (default: full)')
    parser.add_argument('--show-sketches', action='store_true',
                       help='Include ASCII sketches of component layouts')
    parser.add_argument('--show-relationships', action='store_true',
                       help='Show component-style relationships')
    parser.add_argument('--show-dependencies', action='store_true',
                       help='Show import dependencies')
    parser.add_argument('--min-lines', type=int, default=1,
                       help='Only show files with at least N lines (default: 1)')
    parser.add_argument('--stats', action='store_true',
                       help='Show detailed statistics')
    
    args = parser.parse_args()
    
    # Initialize scanner
    scanner = UIScanner(args.packages, args.ui)
    scanner.scan()
    
    # Generate report
    generator = ReportGenerator(scanner)
    report = generator.generate_full_report(
        show_sketches=args.show_sketches or args.format == 'full',
        show_relationships=args.show_relationships or args.format == 'full',
        show_stats=args.stats or args.format == 'full'
    )
    
    # Output report
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f'\n✅ Report saved to: {args.output}')
    else:
        print(report)
    
    print(f'\n📊 Summary:')
    print(f'   - Packages scanned: {len(scanner.packages)}')
    print(f'   - Components found: {len(scanner.all_components)}')
    print(f'   - CSS classes found: {len(scanner.all_styles)}')


if __name__ == '__main__':
    main()
