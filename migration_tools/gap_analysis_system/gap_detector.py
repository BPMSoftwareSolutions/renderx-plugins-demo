"""
Gap Detection Domain

Core gap detection logic for finding differences between web and desktop implementations.
Performs parity checks on components, features, UI elements, layout, styling, and AI features.
"""

from pathlib import Path
from typing import List, Dict, Any

from .models import Gap, WebComponent, DesktopComponent, CSSAnalysis, PluginAnalysis
from .advanced_gap_detector import AdvancedGapDetector
from .component_mapping import COMPONENT_EQUIVALENCE


class GapDetector:
    """Detects gaps between web and desktop implementations."""

    # Element mapping between web (HTML) and desktop (Avalonia) components
    ELEMENT_MAPPING = {
        'div': {'Border', 'Panel', 'StackPanel', 'Grid'},
        'button': {'Button'},
        'input': {'TextBox', 'CheckBox', 'NumericUpDown'},
        'p': {'TextBlock'},
        'h1': {'TextBlock'},
        'h2': {'TextBlock'},
        'h3': {'TextBlock'},
        'h4': {'TextBlock'},
        'h5': {'TextBlock'},
        'h6': {'TextBlock'},
        'span': {'TextBlock', 'Run'},
        'select': {'ComboBox'},
        'textarea': {'TextBox'},
        'img': {'Image'},
        'pre': {'TextBlock', 'Border'},  # pre with monospace font
        'code': {'TextBlock', 'Run'},  # code with monospace font
        'strong': {'TextBlock', 'Run'},  # strong with bold font weight
        'em': {'TextBlock', 'Run'},  # em with italic font style
        'b': {'TextBlock', 'Run'},  # bold
        'i': {'TextBlock', 'Run'},  # italic
        'style': {'Style'},  # CSS style element maps to Avalonia Style
        'ul': {'StackPanel', 'ItemsControl'},  # unordered list
        'ol': {'StackPanel', 'ItemsControl'},  # ordered list
        'li': {'TextBlock', 'StackPanel'},  # list item
        'a': {'TextBlock', 'Button'},  # anchor/link
        'label': {'TextBlock'},  # label
        'form': {'StackPanel', 'Grid'},  # form container
    }

    @staticmethod
    def _find_desktop_equivalent(web_comp_name: str, desktop_components: List[DesktopComponent]) -> List[DesktopComponent]:
        """Find desktop equivalent component(s) for a web component.
        
        Checks both exact name match and component equivalence map.
        Returns list of matching desktop components (usually 1, but may be multiple).
        """
        matches = []
        
        # Check direct name match
        exact_matches = [c for c in desktop_components if c.name == web_comp_name]
        if exact_matches:
            matches.extend(exact_matches)
        
        # Check equivalence map
        if web_comp_name in COMPONENT_EQUIVALENCE:
            equiv_names = COMPONENT_EQUIVALENCE[web_comp_name]
            for equiv_name in equiv_names:
                if equiv_name != web_comp_name:  # Skip if already checked above
                    equiv_matches = [c for c in desktop_components if c.name == equiv_name]
                    matches.extend(equiv_matches)
        
        return matches


    @staticmethod
    def detect_gaps(web_components: List[WebComponent],
                   desktop_components: List[DesktopComponent],
                   css_analyses: List[CSSAnalysis],
                   feature_map_path: Path = None) -> List[Gap]:
        """Detect gaps between web and desktop implementations."""
        gaps = []

        # Component existence gaps
        gaps.extend(GapDetector._detect_component_gaps(web_components, desktop_components))

        # Feature and parity gaps for matching components
        gaps.extend(GapDetector._detect_feature_gaps(web_components, desktop_components))
        gaps.extend(GapDetector._detect_ui_element_gaps(web_components, desktop_components))
        gaps.extend(GapDetector._detect_text_parity_gaps(web_components, desktop_components))
        gaps.extend(GapDetector._detect_layout_gaps(web_components, desktop_components))
        gaps.extend(GapDetector._detect_conditional_ui_gaps(web_components, desktop_components))
        gaps.extend(GapDetector._detect_container_layout_gaps(web_components, desktop_components))
        gaps.extend(GapDetector._detect_content_constraint_gaps(web_components, desktop_components))
        gaps.extend(AdvancedGapDetector.detect_css_gaps(css_analyses, desktop_components))
        gaps.extend(AdvancedGapDetector.detect_plugin_level_gaps(web_components, desktop_components))

        return gaps

    @staticmethod
    def _detect_component_gaps(web_components: List[WebComponent],
                               desktop_components: List[DesktopComponent]) -> List[Gap]:
        """Detect missing components."""
        gaps = []
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
                is_quick_win=web_comp.line_count < 100,
                web_source_path=web_comp.file_path
            ))
        return gaps

    @staticmethod
    def _detect_feature_gaps(web_components: List[WebComponent],
                            desktop_components: List[DesktopComponent]) -> List[Gap]:
        """Detect missing features in matching components."""
        gaps = []
        for web_comp in web_components:
            desktop_comp = next((c for c in desktop_components if c.name == web_comp.name), None)
            if not desktop_comp:
                continue

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
                    is_quick_win=feature.implementation_type == 'style',
                    web_source_path=web_comp.file_path
                ))
        return gaps

    @staticmethod
    def _detect_ui_element_gaps(web_components: List[WebComponent],
                               desktop_components: List[DesktopComponent]) -> List[Gap]:
        """Detect missing UI elements (JSX vs AXAML parity).

        NOTE: This detector is intentionally conservative to avoid false positives.
        HTML elements like <h4>, <strong>, <pre>, <code> are semantically implemented
        in Avalonia using TextBlock with different properties (FontWeight, FontFamily, etc).
        We only flag gaps for elements that have NO reasonable desktop equivalent.
        """
        gaps = []
        for web_comp in web_components:
            desktop_comp = next((c for c in desktop_components if c.name == web_comp.name), None)
            if not desktop_comp:
                continue

            web_elements = set(web_comp.jsx_elements)
            desktop_elements = set(desktop_comp.axaml_elements)

            # Elements that are semantic/styling-only and don't need direct equivalents
            # These are implemented via properties (FontWeight, FontFamily, etc) not separate elements
            SEMANTIC_ONLY_ELEMENTS = {'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'b', 'i', 'pre', 'code', 'style'}

            missing_ui_elements = []
            for web_elem in web_elements:
                # Skip semantic-only elements - they're implemented via properties
                if web_elem in SEMANTIC_ONLY_ELEMENTS:
                    continue

                expected_desktop = GapDetector.ELEMENT_MAPPING.get(web_elem, {web_elem})
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
                    is_quick_win=False,
                    web_source_path=web_comp.file_path
                ))
        return gaps

    @staticmethod
    def _detect_text_parity_gaps(web_components: List[WebComponent],
                                desktop_components: List[DesktopComponent]) -> List[Gap]:
        """Detect missing rendered text content."""
        gaps = []
        for web_comp in web_components:
            desktop_comp = next((c for c in desktop_components if c.name == web_comp.name), None)
            if not desktop_comp:
                continue

            web_text = set(web_comp.rendered_text)
            desktop_text = set(desktop_comp.rendered_text)
            missing_text = web_text - desktop_text

            if len(missing_text) > 3:
                gaps.append(Gap(
                    gap_type='component',
                    severity='high',
                    title=f'🔴 MISSING TEXT CONTENT in {web_comp.name}',
                    description=f'Desktop missing {len(missing_text)} text labels/content that web displays',
                    web_implementation=f'Web shows: {", ".join(list(missing_text)[:5])}{"..." if len(missing_text) > 5 else ""}',
                    desktop_implementation=f'Desktop shows: {", ".join(list(desktop_text)[:5]) if desktop_text else "No text content found"}',
                    impact='Users see different labels, headings, or instructions than web version',
                    effort_estimate='quick',
                    is_quick_win=True,
                    web_source_path=web_comp.file_path
                ))
        return gaps

    @staticmethod
    def _detect_layout_gaps(web_components: List[WebComponent],
                           desktop_components: List[DesktopComponent]) -> List[Gap]:
        """Detect layout parity issues."""
        gaps = []
        for web_comp in web_components:
            # Find equivalent desktop component(s)
            desktop_comps = GapDetector._find_desktop_equivalent(web_comp.name, desktop_components)
            
            if not desktop_comps:
                continue
            
            # Use the first matching desktop component for layout analysis
            # But check if ANY equivalent has the required layout (to avoid false positives)
            desktop_comp = desktop_comps[0]
            
            if not (web_comp.layout_hints or desktop_comp.layout_hints if desktop_comp else False):
                continue

            w_layout = web_comp.layout_hints
            d_layout = desktop_comp.layout_hints
            layout_issues = []

            # Check if ANY desktop equivalent has UniformGrid/WrapPanel
            has_grid_in_any = any(c.layout_hints.get('has_uniform_grid') or c.layout_hints.get('has_wrap_panel') 
                                  for c in desktop_comps)
            
            if w_layout.get('is_grid') and not has_grid_in_any:
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
                    desktop_implementation=f'Panel hints: {d_layout} (checked {len(desktop_comps)} equivalent component(s))',
                    impact='Visual arrangement differs (card alignment/sizing/parity)',
                    effort_estimate='medium',
                    is_quick_win=False,
                    web_source_path=web_comp.file_path
                ))
        return gaps

    @staticmethod
    def _detect_conditional_ui_gaps(web_components: List[WebComponent],
                                   desktop_components: List[DesktopComponent]) -> List[Gap]:
        """Detect conditional UI parity (AI toggle, hints, etc)."""
        gaps = []
        for web_comp in web_components:
            desktop_comp = next((c for c in desktop_components if c.name == web_comp.name), None)
            if not desktop_comp:
                continue

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
                    is_quick_win=True,
                    web_source_path=web_comp.file_path
                ))
        return gaps

    @staticmethod
    def _detect_container_layout_gaps(web_components: List[WebComponent],
                                     desktop_components: List[DesktopComponent]) -> List[Gap]:
        """Detect container-level layout mismatches (grid vs list)."""
        gaps = []
        web_containers = [c for c in web_components if any(hint in c.name.lower() for hint in ['panel', 'list', 'grid', 'library'])]
        desktop_containers = [c for c in desktop_components if any(hint in c.name.lower() for hint in ['panel', 'list', 'grid', 'library', 'plugin'])]

        for web_container in web_containers:
            if web_container.layout_hints.get('is_grid'):
                desktop_has_grid = any(
                    d.layout_hints.get('has_uniform_grid') or d.layout_hints.get('has_wrap_panel')
                    for d in desktop_containers
                )

                if not desktop_has_grid:
                    problem_container = next((d for d in desktop_containers if not (d.layout_hints.get('has_uniform_grid') or d.layout_hints.get('has_wrap_panel'))), None)
                    if problem_container:
                        gaps.append(Gap(
                            gap_type='component',
                            severity='critical',
                            title=f'🔴 LAYOUT MISMATCH: Grid vs List in {web_container.name}',
                            description=f'Web component {web_container.name} uses a 2-column grid layout (grid-template-columns), but NO desktop container has UniformGrid/WrapPanel. Example: {problem_container.name} uses vertical list (StackPanel or no ItemsPanelTemplate). Cards will appear as a vertical list instead of a grid.',
                            web_implementation=f'CSS grid with 2 columns; {web_container.layout_hints}',
                            desktop_implementation=f'Vertical StackPanel (default ItemsControl); checked {len(desktop_containers)} desktop containers, none have grid layout',
                            impact='CRITICAL UX ISSUE: Layout completely different - cards stack vertically instead of side-by-side grid, wasting space and breaking visual design',
                            effort_estimate='quick',
                            recommendations=[
                                'Add <ItemsControl.ItemsPanel> with <UniformGrid Columns="2" /> to match web grid',
                                'Alternatively use <WrapPanel Orientation="Horizontal" /> for responsive grid',
                                'Update card styling to center content vertically (web cards are centered, desktop may be horizontal)'
                            ],
                            is_quick_win=True,
                            web_source_path=web_container.file_path
                        ))
        return gaps

    @staticmethod
    def _detect_content_constraint_gaps(web_components: List[WebComponent],
                                       desktop_components: List[DesktopComponent]) -> List[Gap]:
        """Detect content constraint mismatches (MaxWidth, MaxHeight, etc.) that cause text squishing.

        This detects when desktop has restrictive constraints (MaxWidth, MaxHeight) that don't exist
        in the web version, causing content to be truncated or squished.
        """
        gaps = []
        for web_comp in web_components:
            desktop_comp = next((c for c in desktop_components if c.name == web_comp.name), None)
            if not desktop_comp:
                continue

            # Check for MaxWidth/MaxHeight constraints in desktop that don't exist in web
            d_ui = desktop_comp.ui_hints
            w_ui = web_comp.ui_hints

            constraint_issues = []

            # Check for MaxWidth constraints on text elements
            if d_ui.get('has_max_width_constraint') and not w_ui.get('has_max_width_constraint'):
                constraint_issues.append('Desktop has MaxWidth constraint on text elements; web does not')

            # Check for MaxHeight constraints
            if d_ui.get('has_max_height_constraint') and not w_ui.get('has_max_height_constraint'):
                constraint_issues.append('Desktop has MaxHeight constraint; web does not')

            # Check for text truncation indicators
            if d_ui.get('has_text_truncation') and not w_ui.get('has_text_truncation'):
                constraint_issues.append('Desktop may truncate long text; web wraps text')

            if constraint_issues:
                gaps.append(Gap(
                    gap_type='component',
                    severity='medium',
                    title=f'🟡 CONTENT CONSTRAINT MISMATCH in {web_comp.name}',
                    description='; '.join(constraint_issues),
                    web_implementation=f'Web UI hints: {w_ui}',
                    desktop_implementation=f'Desktop UI hints: {d_ui}',
                    impact='Content may be squished, truncated, or wrapped differently than web version, affecting readability',
                    effort_estimate='quick',
                    recommendations=[
                        'Review MaxWidth/MaxHeight constraints in desktop AXAML',
                        'Compare with web CSS to ensure constraints match',
                        'Test with long text content to verify wrapping behavior matches web'
                    ],
                    is_quick_win=True,
                    web_source_path=web_comp.file_path
                ))
        return gaps
