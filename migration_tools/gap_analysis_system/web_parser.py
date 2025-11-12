"""
Web Component Parser Domain

Parses and analyzes React/TypeScript/JSX component files.
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Optional, Any

from .models import WebComponent, ComponentFeature


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
        
        # Extract layout and UI hints for parity checks
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
    def _detect_layout_hints_jsx(content: str) -> Dict[str, Any]:
        """Heuristics to detect grid/list layout and square cards in JSX."""
        hints: Dict[str, Any] = {
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
            # Detect grid: check for 'grid' class name, grid-cols-, or display: grid in inline styles
            hints['is_grid'] = ('grid' in lowered and ('grid' in lowered.split() or '-grid' in lowered or 'grid-' in lowered)) or 'grid-cols-' in lowered or 'display: grid' in lowered
            hints['has_aspect_square'] = ('aspect-square' in lowered or 'aspect-[1/1]' in lowered or re.search(r'aspect\s*[:=]\s*1', lowered) is not None or 'aspectratio' in lowered)
            hints['has_centering'] = any(tok in lowered for tok in ['place-items-center', 'items-center', 'justify-center', 'content-center'])
        except Exception:
            pass
        return hints

    @staticmethod
    def _detect_ui_hints_jsx(content: str) -> Dict[str, Any]:
        """Detect conditional UI like AI chat toggle button and hints."""
        hints: Dict[str, Any] = {
            'has_ai_toggle': False,
            'has_ai_hint': False,
            'has_max_width_constraint': False,
            'has_max_height_constraint': False,
            'has_text_truncation': False
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

            # Detect content constraints
            # Look for max-width in CSS classes or inline styles
            if re.search(r'max-w-|maxWidth|style=.*max-width', search_space):
                hints['has_max_width_constraint'] = True

            # Look for max-height in CSS classes or inline styles
            if re.search(r'max-h-|maxHeight|style=.*max-height', search_space):
                hints['has_max_height_constraint'] = True

            # Look for text truncation (ellipsis, line-clamp, etc.)
            if re.search(r'truncate|line-clamp|text-overflow|ellipsis|overflow.*hidden', search_space):
                hints['has_text_truncation'] = True
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
