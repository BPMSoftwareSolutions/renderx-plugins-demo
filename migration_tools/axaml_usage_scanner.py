#!/usr/bin/env python3
"""
Avalonia AXAML Component Usage Scanner

Scans .NET Avalonia AXAML files and tracks component usage across the desktop application.
Similar to the UI component scanner but for AXAML/C# files.

Usage:
    python axaml_usage_scanner.py --output axaml_usage_report.txt
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Set, Tuple
from collections import defaultdict
from dataclasses import dataclass, field

@dataclass
class AxamlComponent:
    """Represents an Avalonia AXAML component."""
    name: str
    file_path: str
    namespace: str = ""
    x_class: str = ""  # x:Class attribute
    imports: Set[str] = field(default_factory=set)  # xmlns imports
    used_components: Set[str] = field(default_factory=set)  # Child elements used
    styles_used: Set[str] = field(default_factory=set)  # Classes attribute values
    line_count: int = 0
    used_in: List[str] = field(default_factory=list)  # Files that use this component

class AxamlScanner:
    """Scans AXAML files and tracks component usage."""
    
    def __init__(self, root_path: str):
        self.root_path = root_path
        self.components: List[AxamlComponent] = []
        self.component_map: Dict[str, AxamlComponent] = {}
        
    def scan(self) -> None:
        """Scan all AXAML files."""
        print("🔍 Scanning Avalonia AXAML components...")
        
        root = Path(self.root_path)
        axaml_files = list(root.rglob("*.axaml"))
        
        # First pass: parse all components
        for axaml_file in axaml_files:
            # Skip style files
            if "Styles" in str(axaml_file):
                continue
                
            component = self._parse_axaml_file(axaml_file)
            if component:
                self.components.append(component)
                self.component_map[component.name] = component
        
        # Second pass: track usage
        self._track_usage()
        
        print(f"✅ Found {len(self.components)} AXAML components")
        
    def _parse_axaml_file(self, file_path: Path) -> AxamlComponent:
        """Parse an AXAML file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
        except:
            return None
        
        name = file_path.stem
        
        # Extract x:Class
        x_class_match = re.search(r'x:Class="([^"]+)"', content)
        x_class = x_class_match.group(1) if x_class_match else ""
        
        # Extract namespace from x:Class
        namespace = ""
        if x_class:
            parts = x_class.rsplit('.', 1)
            namespace = parts[0] if len(parts) > 1 else ""
        
        # Extract xmlns imports
        imports = set()
        xmlns_pattern = r'xmlns:([a-z]+)="([^"]+)"'
        for match in re.finditer(xmlns_pattern, content):
            prefix = match.group(1)
            uri = match.group(2)
            imports.add(f"{prefix}={uri}")
        
        # Extract used components (XML elements)
        used_components = set()
        
        # Look for custom elements (CamelCase)
        element_pattern = r'<([A-Z][a-zA-Z0-9]+)'
        for match in re.finditer(element_pattern, content):
            comp_name = match.group(1)
            # Filter out standard Avalonia controls
            if comp_name not in ['Border', 'Button', 'TextBlock', 'Grid', 'StackPanel', 
                                 'Canvas', 'ScrollViewer', 'ItemsControl', 'UserControl',
                                 'Window', 'Panel', 'Control', 'Decorator', 'Style', 'Styles',
                                 'ContentControl', 'HeaderedContentControl', 'CheckBox',
                                 'TextBox', 'ComboBox', 'ListBox', 'DataGrid', 'TabControl',
                                 'Expander', 'ProgressBar', 'Slider', 'Image', 'Path',
                                 'Rectangle', 'Ellipse', 'Line', 'Polygon', 'Polyline']:
                used_components.add(comp_name)
        
        # Extract Classes attribute (style classes)
        styles_used = set()
        classes_pattern = r'Classes="([^"]+)"'
        for match in re.finditer(classes_pattern, content):
            classes = match.group(1).split()
            styles_used.update(classes)
        
        return AxamlComponent(
            name=name,
            file_path=str(file_path),
            namespace=namespace,
            x_class=x_class,
            imports=imports,
            used_components=used_components,
            styles_used=styles_used,
            line_count=len(lines)
        )
    
    def _track_usage(self) -> None:
        """Track which components use which other components."""
        print("🔗 Tracking component usage...")
        
        for component in self.components:
            for used_comp_name in component.used_components:
                if used_comp_name in self.component_map:
                    used_comp = self.component_map[used_comp_name]
                    if component.file_path not in used_comp.used_in:
                        used_comp.used_in.append(component.file_path)
        
        usage_count = sum(1 for comp in self.components if comp.used_in)
        print(f"✅ {usage_count} components have tracked usage")
    
    def generate_report(self) -> str:
        """Generate usage report."""
        lines = []
        
        lines.append("═" * 80)
        lines.append("         AVALONIA AXAML COMPONENT USAGE REPORT")
        lines.append("═" * 80)
        lines.append("")
        lines.append(f"Total Components: {len(self.components)}")
        lines.append(f"Components with Usage: {sum(1 for c in self.components if c.used_in)}")
        lines.append("")
        
        # Group by package
        packages = defaultdict(list)
        for comp in self.components:
            if "RenderX.Plugins." in comp.namespace:
                package = comp.namespace.split("RenderX.Plugins.")[1].split('.')[0]
            elif "RenderX.Shell" in comp.namespace:
                package = "Shell"
            else:
                package = "Other"
            packages[package].append(comp)
        
        lines.append("═" * 80)
        lines.append("                    COMPONENTS BY PACKAGE")
        lines.append("═" * 80)
        lines.append("")
        
        for package_name in sorted(packages.keys()):
            comps = packages[package_name]
            used_count = sum(1 for c in comps if c.used_in)
            lines.append(f"📦 {package_name}: {len(comps)} components ({used_count} used)")
            lines.append("")
            
            for comp in sorted(comps, key=lambda c: len(c.used_in), reverse=True):
                lines.append(f"  • {comp.name}")
                lines.append(f"    Path: {Path(comp.file_path).relative_to(self.root_path)}")
                if comp.x_class:
                    lines.append(f"    Class: {comp.x_class}")
                lines.append(f"    Lines: {comp.line_count}")
                
                if comp.used_components:
                    lines.append(f"    Uses: {', '.join(sorted(comp.used_components))}")
                
                if comp.styles_used:
                    styles_str = ', '.join(sorted(comp.styles_used)[:5])
                    if len(comp.styles_used) > 5:
                        styles_str += f" +{len(comp.styles_used)-5}"
                    lines.append(f"    Styles: {styles_str}")
                
                if comp.used_in:
                    lines.append(f"    ⭐ Used in {len(comp.used_in)} file(s):")
                    for usage_file in comp.used_in:
                        usage_name = Path(usage_file).name
                        lines.append(f"       └─ {usage_name}")
                else:
                    lines.append(f"    ⚠️  Not used by other components")
                
                lines.append("")
        
        # Web vs Desktop comparison
        lines.append("═" * 80)
        lines.append("                 WEB vs DESKTOP COMPARISON")
        lines.append("═" * 80)
        lines.append("")
        lines.append("Web (React/TypeScript):")
        lines.append("  • 287 components total")
        lines.append("  • 48 components with tracked usage (16.7%)")
        lines.append("")
        lines.append(f"Desktop (Avalonia/AXAML):")
        lines.append(f"  • {len(self.components)} components total")
        used_count = sum(1 for c in self.components if c.used_in)
        pct = (used_count / len(self.components) * 100) if self.components else 0
        lines.append(f"  • {used_count} components with tracked usage ({pct:.1f}%)")
        lines.append("")
        
        # Gap analysis
        lines.append("═" * 80)
        lines.append("                      GAP ANALYSIS")
        lines.append("═" * 80)
        lines.append("")
        
        web_packages = {
            'canvas-component': 7, 'control-panel': 41, 'header': 11,
            'library': 29, 'library-component': 5, 'digital-assets': 40,
            'diagnostics': 75, 'musical-conductor': 2, 'manifest-tools': 2,
            'components': 10, 'ui': 65
        }
        
        for pkg_name, web_count in sorted(web_packages.items()):
            desktop_count = len(packages.get(pkg_name.replace('-', '').title().replace('Component', ''), []))
            gap = web_count - desktop_count
            parity = (desktop_count / web_count * 100) if web_count > 0 else 0
            
            status = "✅" if parity >= 80 else "⚠️" if parity >= 50 else "❌"
            lines.append(f"{status} {pkg_name}: {desktop_count}/{web_count} ({parity:.0f}%)")
            if gap > 0:
                lines.append(f"   Missing: {gap} components")
            lines.append("")
        
        return '\n'.join(lines)

def main():
    root_path = Path(__file__).parent / "src"
    
    scanner = AxamlScanner(str(root_path))
    scanner.scan()
    
    report = scanner.generate_report()
    
    output_file = "axaml_usage_report.txt"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n✅ Report saved to: {output_file}")
    print(report[:500] + "...\n")

if __name__ == "__main__":
    main()
