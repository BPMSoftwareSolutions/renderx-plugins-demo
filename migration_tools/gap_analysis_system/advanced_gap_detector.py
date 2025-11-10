"""
Advanced Gap Detection Domain

Specialized gap detection for CSS/styling and plugin-level features.
Extracted from gap_detector.py to enforce 400-line module limit.
"""

from typing import List, Any, Dict

from .models import Gap, WebComponent, DesktopComponent, CSSAnalysis, PluginAnalysis


class AdvancedGapDetector:
    """Detects advanced gaps: CSS styling and plugin-level feature parity."""
    
    @staticmethod
    def detect_css_gaps(css_analyses: List[CSSAnalysis]) -> List[Gap]:
        """Detect CSS/styling gaps."""
        gaps = []
        if not css_analyses:
            return gaps
        
        total_css_classes = len(css_analyses)
        animated_classes = sum(1 for c in css_analyses if c.has_animation or c.has_transition)
        hover_classes = sum(1 for c in css_analyses if c.has_hover)
        gradient_classes = sum(1 for c in css_analyses if c.has_gradient)
        
        if animated_classes > 0:
            gaps.append(Gap(
                gap_type='style',
                severity='low',
                title='Missing Animations and Transitions',
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
                title='Missing Hover Effects',
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
                title='Missing Gradient Backgrounds',
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
    def detect_plugin_level_gaps(web_components: List[WebComponent],
                                 desktop_components: List[DesktopComponent]) -> List[Gap]:
        """Detect plugin-level gaps (aggregate AI features, etc)."""
        gaps = []
        
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
        
        return gaps
    
    @staticmethod
    def generate_summary(analysis: PluginAnalysis) -> Dict[str, Any]:
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
