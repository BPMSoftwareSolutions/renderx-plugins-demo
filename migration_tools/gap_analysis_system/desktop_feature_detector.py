"""
Desktop Feature Detector Sub-Domain

Specialized feature detection for Avalonia/C# components.
Extracted from DesktopComponentParser to enforce 400-line module limit.
"""

import re
from pathlib import Path
from typing import List

from .models import ComponentFeature


class DesktopFeatureDetector:
    """Detects features in Avalonia components."""

    @staticmethod
    def detect_features(axaml_content: str, cs_content: str, file_path: str) -> List[ComponentFeature]:
        """Detect all features in the component code."""
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
                    name='ℹ️ Fallback Sample Data Present',
                    description=f'Fallback hardcoded data exists though JSON loading implemented: {"; ".join(hardcoded_matches)}',
                    implementation_type='logic',
                    file_path=file_path
                ))
            else:
                features.append(ComponentFeature(
                    name='⚠️🔴 HARDCODED SAMPLE DATA',
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
