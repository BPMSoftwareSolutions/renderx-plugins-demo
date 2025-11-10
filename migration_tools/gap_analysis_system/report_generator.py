"""
Report Generation Domain

Generates gap analysis reports in multiple formats (Markdown, JSON, HTML).
"""

import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path

from .models import PluginAnalysis
try:
    from .analyzer import GapAnalyzer
except ImportError:
    GapAnalyzer = None  # For fallback


class ReportGenerator:
    """Generates reports in various formats."""
    
    @staticmethod
    def generate_markdown(analysis: PluginAnalysis, show_component_gap: bool = True,
                         show_feature_gap: bool = True, show_css_gap: bool = True,
                         quick_wins: bool = True, recommendations: bool = True,
                         feature_map_path: Path = None) -> str:
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
        if quick_wins and s['quick_wins'] > 0:
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
        if show_component_gap:
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
                    if gap.web_source_path:
                        # Provide relative path and a clickable markdown link
                        rel_path = gap.web_source_path.replace('\\', '/')
                        report.append(f"- **Web Source:** [{rel_path}]({rel_path})")
                    report.append(f"- **Impact:** {gap.impact}")
                    # Placement-aware guidance from feature_map if relevant
                    try:
                        fmap_path = GapAnalyzer.FEATURE_MAP_PATH or Path('migration_tools/feature_map.json')
                        if fmap_path.exists():
                            fmap = json.loads(Path(fmap_path).read_text(encoding='utf-8'))
                            placement = fmap.get('placement', {})
                            # Detect AI toggle/hint by title keywords
                            if 'AI CHAT TOGGLE' in gap.title.upper():
                                meta = placement.get('AI Chat Toggle')
                            elif 'AI AVAILABILITY HINT' in gap.title.upper():
                                meta = placement.get('AI Availability Hint')
                            else:
                                meta = None
                            if meta:
                                target_file = meta.get('desktop_target_file') or meta.get('desktop_target_component')
                                notes = meta.get('notes')
                                wiring = meta.get('wiring_note')
                                report.append("")
                                report.append("**Placement Recommendation:**")
                                if target_file:
                                    report.append(f"- Add/Edit File: `{target_file}` (header area)")
                                if notes:
                                    report.append(f"- Notes: {notes}")
                                if wiring:
                                    report.append(f"- Wiring: {wiring}")
                                report.append("")
                    except Exception:
                        pass
                    report.append("")
            else:
                report.append("✅ All web components have desktop equivalents!\n")
                
        # Feature Gaps
        if show_feature_gap:
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
                        if gap.web_source_path:
                            rel_path = gap.web_source_path.replace('\\', '/')
                            report.append(f"  - Web Source: [{rel_path}]({rel_path})")
                    report.append("")
            else:
                report.append("✅ Feature parity achieved!\n")
                
        # CSS/Style Gaps
        if show_css_gap:
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
        
        # Feature Map Audit
        if analysis.feature_audit:
            report.append("## 🗺️ Feature Map Audit (Web → Desktop)\n")
            for comp, entries in analysis.feature_audit.items():
                report.append(f"### {comp}")
                for e in entries:
                    status = e.get('status')
                    emoji = '✅' if status == 'present' else ('🟡' if status == 'unmapped' else '🟠')
                    mapped = e.get('mapped_desktop_features') or []
                    mapped_str = ', '.join(mapped) if mapped else '—'
                    report.append(f"- {emoji} {e['web_feature']} → {mapped_str} — {status}")
                report.append("")

        # Manifest Audit
        if analysis.manifest_audit:
            ma = analysis.manifest_audit
            report.append("## 🧾 Manifest Audit (Declared vs Desktop)\n")
            interactions = ma.get('interactions', [])
            topics = ma.get('topics', [])
            layout_slots = ma.get('layout', [])
            if interactions:
                present_i = sum(1 for i in interactions if i.get('status') == 'present')
                missing_i = sum(1 for i in interactions if i.get('status') == 'missing')
                report.append(f"### Routes / Interactions ({present_i} present / {missing_i} missing)\n")
                for i in interactions:
                    emoji = '✅' if i.get('status') == 'present' else '🟠'
                    seq = f" (sequence {i.get('sequenceId')})" if i.get('sequenceId') else ''
                    report.append(f"- {emoji} {i['route']} → {i.get('pluginId')}{seq} — {i.get('status')}")
                report.append("")
            if topics:
                present_t = sum(1 for t in topics if t.get('status') == 'present')
                missing_t = sum(1 for t in topics if t.get('status') == 'missing')
                report.append(f"### Topics ({present_t} present / {missing_t} missing)\n")
                for t in topics[:150]:  # avoid overly long list
                    emoji = '✅' if t.get('status') == 'present' else '🟡'
                    seq = f" (sequence {t.get('sequenceId')})" if t.get('sequenceId') else ''
                    report.append(f"- {emoji} {t['topic']} → {t.get('pluginId')}{seq} — {t.get('status')}")
                if len(topics) > 150:
                    report.append(f"… (truncated {len(topics)-150} additional topics)")
                report.append("")
            if layout_slots:
                report.append("### Layout Slots\n")
                report.append(', '.join(sorted({s.get('slot') for s in layout_slots if s.get('slot')})))
                report.append("")
            
            # Runtime plugins audit
            runtime_plugins = ma.get('runtime_plugins', [])
            if runtime_plugins:
                present_rp = [rp for rp in runtime_plugins if rp.get('status') == 'present']
                missing_rp = [rp for rp in runtime_plugins if rp.get('status') == 'missing']
                report.append(f"### Runtime Plugins ({len(present_rp)} present / {len(missing_rp)} missing)\n")
                for rp in runtime_plugins:
                    emoji = '✅' if rp.get('status') == 'present' else '🔴'
                    reason_str = f" — {rp.get('reason')}" if rp.get('reason') else ''
                    report.append(f"- {emoji} {rp.get('export')} (pluginId: {rp.get('pluginId')}, class: {rp.get('class')}){reason_str}")
                if missing_rp:
                    report.append("\n**Remediation:**")
                    report.append("- Ensure `PluginLoader.LoadRuntimePluginsAsync` exists and is invoked during startup")
                    report.append("- Verify the plugin class is defined in the codebase")
                    report.append("- Confirm manifest entry includes `runtime.module` and `runtime.export` properties")
                report.append("")
                
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
        if recommendations:
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
                
        # How to reproduce / verify section (TDD-style loop)
        report.append("## 🔁 Reproduce and Verify (TDD loop)\n")
        report.append("### Steps\n")
        report.append("1. Open a PowerShell in the repo root.\n")
        report.append("2. Activate the Python env and run the analyzer:\n\n")
        report.append("```powershell\n")
        report.append("./.venv/Scripts/python.exe migration_tools/web_desktop_gap_analyzer.py\n")
        report.append("```\n\n")
        report.append("### Success criteria\n")
        report.append("- Executive Summary → Total Gaps decreases vs last run (ideally 0).\n")
        report.append("- Feature Map Audit → no entries with `missing` or `unmapped`.\n")
        report.append("- Manifest Audit → `missing` counts for Routes/Topics are 0.\n")
        report.append("- No MISPLACED AI CHAT TOGGLE / AI AVAILABILITY HINT gaps remain.\n")

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
