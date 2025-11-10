"""
Component Discovery Domain

Handles finding and discovering web and desktop components for analysis.
"""

from pathlib import Path
from typing import List

from .models import WebComponent, DesktopComponent
from .web_parser import WebComponentParser
from .desktop_parser import DesktopComponentParser


class ComponentDiscovery:
    """Discovers components in web and desktop projects."""
    
    @staticmethod
    def find_web_components(web_path: str, plugin_name: str) -> List[WebComponent]:
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
            # Check for actual UI components (not event definitions or manifest handlers)
            # Skip: *.symphony.ts (manifest definitions), handlers, index files, and event-related files
            for ts_file in related_path.rglob('*.ts'):
                # Skip barrel/index files (just exports, not UI components)
                if ts_file.name == 'index.ts':
                    continue
                # Skip symphony files (manifest/event definitions, not UI components)
                if 'symphony' in ts_file.name.lower():
                    continue
                # Skip handler files
                if 'handler' in ts_file.name.lower():
                    continue
                # Skip event definition files
                if any(x in ts_file.name.lower() for x in ['event', 'drag', 'drop']):
                    continue
                    
                component = WebComponentParser.parse_component(str(ts_file))
                if component:
                    components.append(component)
                    
        return components
    
    @staticmethod
    def find_desktop_components(desktop_path: str, plugin_name: str) -> List[DesktopComponent]:
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
