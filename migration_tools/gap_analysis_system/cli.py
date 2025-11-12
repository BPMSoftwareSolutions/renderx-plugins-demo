"""
Command-Line Interface Domain

Main entry point and CLI orchestration for the gap analysis system.
"""

import sys
import io
import argparse
from pathlib import Path

# Force UTF-8 output encoding for emoji support on Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from .analyzer import GapAnalyzer
from .report_generator import ReportGenerator


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description='Analyze gaps between web and desktop UI implementations',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Web vs Desktop UI Gap Analyzer

Compares web (React/TypeScript/CSS) UI implementations against desktop (Avalonia/C#/AXAML)
implementations to identify missing features, styling gaps, and component parity issues.

Usage:
    python web_desktop_gap_analyzer.py [options]

Examples:
    python web_desktop_gap_analyzer.py --plugin library --show-css-gap --recommendations
    python web_desktop_gap_analyzer.py --plugin canvas --quick-wins
    python web_desktop_gap_analyzer.py --format json --output gaps.json
"""
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
    parser.add_argument('--feature-map', default='migration_tools/feature_map.json', help='Path to feature map JSON file')
    
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
    
    # Configure optional resources
    try:
        GapAnalyzer.FEATURE_MAP_PATH = Path(args.feature_map) if args.feature_map else None
    except Exception:
        GapAnalyzer.FEATURE_MAP_PATH = None

    # Analyze plugin
    analysis = GapAnalyzer.analyze_plugin(args.plugin, args.web_packages, args.desktop)
    
    # Generate report
    if args.format == 'markdown':
        report = ReportGenerator.generate_markdown(
            analysis,
            show_component_gap=args.show_component_gap,
            show_feature_gap=args.show_feature_gap,
            show_css_gap=args.show_css_gap,
            quick_wins=args.quick_wins,
            recommendations=args.recommendations,
            feature_map_path=Path(args.feature_map) if args.feature_map else None
        )
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
