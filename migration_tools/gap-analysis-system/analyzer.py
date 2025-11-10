"""
Gap Analysis Engine Domain

Lightweight orchestrator delegating to specialized sub-domains.
"""

from pathlib import Path
from typing import Optional

from .models import PluginAnalysis
from .component_discovery import ComponentDiscovery
from .manifest_auditor import ManifestAuditor
from .gap_detector import GapDetector
from .css_parser import CSSParser


class GapAnalyzer:
    """Orchestrates gap analysis across web and desktop implementations."""
    FEATURE_MAP_PATH: Optional[Path] = None

    @staticmethod
    def analyze_plugin(plugin_name: str, web_path: str, desktop_path: str) -> PluginAnalysis:
        """Analyze a specific plugin for gaps by delegating to sub-domains."""
        analysis = PluginAnalysis(plugin_name=plugin_name)

        # Discover components in file system
        web_components = ComponentDiscovery.find_web_components(web_path, plugin_name)
        desktop_components = ComponentDiscovery.find_desktop_components(desktop_path, plugin_name)

        analysis.web_components = web_components
        analysis.desktop_components = desktop_components

        # Analyze CSS files
        css_analyses = CSSParser.parse_css_files(web_path, plugin_name)
        analysis.css_analysis = css_analyses

        # Detect gaps between implementations
        gaps = GapDetector.detect_gaps(
            web_components,
            desktop_components,
            css_analyses,
            feature_map_path=GapAnalyzer.FEATURE_MAP_PATH
        )
        analysis.gaps = gaps

        # Audit manifests for completeness
        manifest_audit = ManifestAuditor.audit_manifests(plugin_name, desktop_components)
        analysis.manifest_audit = manifest_audit

        # Generate summary statistics
        analysis.summary = GapDetector.generate_summary(analysis)

        return analysis
