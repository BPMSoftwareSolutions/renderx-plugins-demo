#!/usr/bin/env python3
"""
Manifest Flow Analyzer
Analyzes the pre:manifests build chain and generates ASCII flow diagrams
showing data sources and generated JSON files.
"""

import json
import argparse
from pathlib import Path
from typing import Dict, List, Set, Tuple
from dataclasses import dataclass, field
import re


@dataclass
class DataFlow:
    """Represents a data flow from source to generated file"""
    script_name: str
    sources: List[str] = field(default_factory=list)
    intermediate: List[str] = field(default_factory=list)
    outputs: List[str] = field(default_factory=list)
    description: str = ""


class ManifestFlowAnalyzer:
    """Analyzes the pre:manifests build chain"""
    
    def __init__(self, root_dir: Path):
        self.root_dir = root_dir
        self.scripts_dir = root_dir / "scripts"
        self.catalog_dir = root_dir / "catalog"
        self.public_dir = root_dir / "public"
        self.flows: List[DataFlow] = []
        
    def analyze_package_json(self) -> List[str]:
        """Extract the pre:manifests script chain from package.json"""
        package_json = self.root_dir / "package.json"
        if not package_json.exists():
            return []
            
        with open(package_json, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        pre_manifests = data.get('scripts', {}).get('pre:manifests', '')
        
        # Extract script names from the command chain
        script_pattern = r'node scripts/([\w-]+\.js)'
        scripts = re.findall(script_pattern, pre_manifests)
        
        return scripts
    
    def analyze_sync_json_sources(self) -> DataFlow:
        """Analyze sync-json-sources.js"""
        return DataFlow(
            script_name="sync-json-sources.js",
            sources=[
                "catalog/json-sequences/**/*.json",
                "catalog/json-components/**/*.json"
            ],
            outputs=[
                "json-sequences/**/*.json (repo root)",
                "json-components/**/*.json (repo root)"
            ],
            description="Copies JSON catalogs from catalog/ to repo root for backward compatibility"
        )
    
    def analyze_sync_json_components(self) -> DataFlow:
        """Analyze sync-json-components.js"""
        return DataFlow(
            script_name="sync-json-components.js",
            sources=[
                "node_modules/@*/*/package.json (renderx.components)",
                "catalog/json-components/*.json"
            ],
            intermediate=[
                "Discovers packages with renderx.components field",
                "Prefers package components over local catalogs"
            ],
            outputs=[
                "public/json-components/*.json"
            ],
            description="Syncs component catalogs from npm packages and local catalog to public/"
        )
    
    def analyze_sync_json_sequences(self) -> DataFlow:
        """Analyze sync-json-sequences.js"""
        return DataFlow(
            script_name="sync-json-sequences.js",
            sources=[
                "catalog/json-sequences/**/*.json",
                "node_modules/@*/*/package.json (renderx.sequences)"
            ],
            intermediate=[
                "Discovers packages with renderx.sequences field",
                "Guardrail: prevents local library-component sequences"
            ],
            outputs=[
                "public/json-sequences/**/*.json"
            ],
            description="Syncs sequence catalogs from local catalog and npm packages to public/"
        )
    
    def analyze_generate_json_interactions(self) -> DataFlow:
        """Analyze generate-json-interactions-from-plugins.js"""
        return DataFlow(
            script_name="generate-json-interactions-from-plugins.js",
            sources=[
                "public/json-sequences/**/*.json",
                "catalog/json-plugins/.generated/plugin-manifest.json"
            ],
            intermediate=[
                "Calls derive-external-topics.js",
                "Groups routes by first segment (app, canvas, control, library)",
                "Picks most frequent pluginId per group"
            ],
            outputs=[
                "catalog/json-interactions/.generated/app.json",
                "catalog/json-interactions/.generated/canvas.json",
                "catalog/json-interactions/.generated/control.json",
                "catalog/json-interactions/.generated/library.json"
            ],
            description="Auto-generates interaction catalogs from plugin sequences"
        )
    
    def analyze_generate_interaction_manifest(self) -> DataFlow:
        """Analyze generate-interaction-manifest.js"""
        return DataFlow(
            script_name="generate-interaction-manifest.js",
            sources=[
                "catalog/json-interactions/.generated/*.json",
                "catalog/json-components/*.json (routeOverrides)"
            ],
            intermediate=[
                "Uses buildInteractionManifest from manifest-tools",
                "Merges generated catalogs with component overrides"
            ],
            outputs=[
                "interaction-manifest.json (repo root)",
                "public/interaction-manifest.json"
            ],
            description="Builds unified interaction manifest from all catalogs and overrides"
        )
    
    def analyze_generate_topics_manifest(self) -> DataFlow:
        """Analyze generate-topics-manifest.js"""
        return DataFlow(
            script_name="generate-topics-manifest.js",
            sources=[
                "public/json-sequences/**/*.json (lifecycle topics)"
            ],
            intermediate=[
                "Runs sync-json-sequences first",
                "Calls generateExternalTopicsCatalog",
                "Uses buildTopicsManifest from manifest-tools"
            ],
            outputs=[
                "topics-manifest.json (repo root)",
                "public/topics-manifest.json"
            ],
            description="Auto-generates topics manifest from plugin lifecycle sequences"
        )
    
    def analyze_generate_layout_manifest(self) -> DataFlow:
        """Analyze generate-layout-manifest.js"""
        return DataFlow(
            script_name="generate-layout-manifest.js",
            sources=[
                "catalog/json-layout/layout.json"
            ],
            outputs=[
                "layout-manifest.json (repo root)",
                "public/layout-manifest.json"
            ],
            description="Copies layout configuration to manifest files"
        )
    
    def analyze_aggregate_plugins(self) -> DataFlow:
        """Analyze aggregate-plugins.js"""
        return DataFlow(
            script_name="aggregate-plugins.js",
            sources=[
                "node_modules/@*/*/package.json (keyword: renderx-plugin)",
                "node_modules/@*/*/package.json (renderx.manifest)",
                "node_modules/@*/*/package.json (renderx.plugins)",
                "catalog/json-plugins/plugin-manifest.json (existing)"
            ],
            intermediate=[
                "Discovers packages with renderx-plugin keyword",
                "Loads manifests via renderx.manifest path",
                "Loads inline plugins from renderx.plugins array",
                "Merges with existing catalog/json-plugins/plugin-manifest.json"
            ],
            outputs=[
                "catalog/json-plugins/.generated/plugin-manifest.json"
            ],
            description="Discovers and aggregates plugin manifests from npm packages"
        )
    
    def analyze_sync_plugins(self) -> DataFlow:
        """Analyze sync-plugins.js"""
        return DataFlow(
            script_name="sync-plugins.js",
            sources=[
                "catalog/json-plugins/.generated/plugin-manifest.json",
                "catalog/json-plugins/plugin-manifest.json (fallback)"
            ],
            outputs=[
                "public/plugins/plugin-manifest.json"
            ],
            description="Copies plugin manifest to public/ (prefers generated over fallback)"
        )
    
    def analyze_sync_control_panel_config(self) -> DataFlow:
        """Analyze sync-control-panel-config.js"""
        return DataFlow(
            script_name="sync-control-panel-config.js",
            sources=[
                "catalog/control-panel-config/*.json (assumed)"
            ],
            outputs=[
                "public/control-panel-config/*.json (assumed)"
            ],
            description="Syncs control panel configuration to public/"
        )
    
    def analyze_all(self) -> List[DataFlow]:
        """Analyze all scripts in the pre:manifests chain"""
        script_chain = self.analyze_package_json()
        print(f"📋 Found {len(script_chain)} scripts in pre:manifests chain\n")
        
        # Map script names to analyzer methods
        analyzers = {
            'sync-json-sources.js': self.analyze_sync_json_sources,
            'sync-json-components.js': self.analyze_sync_json_components,
            'sync-json-sequences.js': self.analyze_sync_json_sequences,
            'generate-json-interactions-from-plugins.js': self.analyze_generate_json_interactions,
            'generate-interaction-manifest.js': self.analyze_generate_interaction_manifest,
            'generate-topics-manifest.js': self.analyze_generate_topics_manifest,
            'generate-layout-manifest.js': self.analyze_generate_layout_manifest,
            'aggregate-plugins.js': self.analyze_aggregate_plugins,
            'sync-plugins.js': self.analyze_sync_plugins,
            'sync-control-panel-config.js': self.analyze_sync_control_panel_config,
        }
        
        flows = []
        for script_name in script_chain:
            if script_name in analyzers:
                flow = analyzers[script_name]()
                flows.append(flow)
        
        self.flows = flows
        return flows


class FlowVisualizer:
    """Creates ASCII visualizations of data flows"""
    
    @staticmethod
    def create_tree_view(flows: List[DataFlow]) -> str:
        """Create a tree-style ASCII view of all flows"""
        lines = []
        lines.append("=" * 80)
        lines.append("PRE:MANIFESTS BUILD CHAIN - DATA FLOW TREE")
        lines.append("=" * 80)
        lines.append("")
        
        for i, flow in enumerate(flows, 1):
            lines.append(f"{i}. {flow.script_name}")
            lines.append(f"   {flow.description}")
            lines.append("")
            
            # Sources
            if flow.sources:
                lines.append("   📥 SOURCES:")
                for src in flow.sources:
                    lines.append(f"      ├─ {src}")
                lines.append("")
            
            # Intermediate steps
            if flow.intermediate:
                lines.append("   ⚙️  PROCESSING:")
                for step in flow.intermediate:
                    lines.append(f"      ├─ {step}")
                lines.append("")
            
            # Outputs
            if flow.outputs:
                lines.append("   📤 OUTPUTS:")
                for j, out in enumerate(flow.outputs):
                    prefix = "└─" if j == len(flow.outputs) - 1 else "├─"
                    lines.append(f"      {prefix} {out}")
                lines.append("")
            
            lines.append("")
        
        return "\n".join(lines)
    
    @staticmethod
    def create_flow_diagram(flows: List[DataFlow]) -> str:
        """Create a flow-style ASCII diagram"""
        lines = []
        lines.append("=" * 100)
        lines.append("PRE:MANIFESTS BUILD CHAIN - FLOW DIAGRAM")
        lines.append("=" * 100)
        lines.append("")
        
        for i, flow in enumerate(flows, 1):
            lines.append("┌" + "─" * 96 + "┐")
            lines.append(f"│ [{i}] {flow.script_name:<90} │")
            lines.append("├" + "─" * 96 + "┤")
            
            # Description
            desc_lines = FlowVisualizer._wrap_text(flow.description, 90)
            for line in desc_lines:
                lines.append(f"│ {line:<94} │")
            lines.append("├" + "─" * 96 + "┤")
            
            # Sources
            if flow.sources:
                lines.append("│ SOURCES:" + " " * 86 + "│")
                for src in flow.sources:
                    src_lines = FlowVisualizer._wrap_text(f"  • {src}", 92)
                    for line in src_lines:
                        lines.append(f"│ {line:<94} │")
            
            # Intermediate
            if flow.intermediate:
                if flow.sources:
                    lines.append("│" + " " * 96 + "│")
                lines.append("│ PROCESSING:" + " " * 82 + "│")
                for step in flow.intermediate:
                    step_lines = FlowVisualizer._wrap_text(f"  ⇒ {step}", 92)
                    for line in step_lines:
                        lines.append(f"│ {line:<94} │")
            
            # Outputs
            if flow.outputs:
                if flow.sources or flow.intermediate:
                    lines.append("│" + " " * 96 + "│")
                lines.append("│ OUTPUTS:" + " " * 86 + "│")
                for out in flow.outputs:
                    out_lines = FlowVisualizer._wrap_text(f"  → {out}", 92)
                    for line in out_lines:
                        lines.append(f"│ {line:<94} │")
            
            lines.append("└" + "─" * 96 + "┘")
            
            # Add arrow between flows
            if i < len(flows):
                lines.append("    │")
                lines.append("    ▼")
                lines.append("")
        
        return "\n".join(lines)
    
    @staticmethod
    def create_summary(flows: List[DataFlow]) -> str:
        """Create a summary of all generated files"""
        lines = []
        lines.append("=" * 80)
        lines.append("GENERATED FILES SUMMARY")
        lines.append("=" * 80)
        lines.append("")
        
        all_outputs = []
        for flow in flows:
            for output in flow.outputs:
                all_outputs.append((flow.script_name, output))
        
        # Group by directory
        by_dir: Dict[str, List[Tuple[str, str]]] = {}
        for script, output in all_outputs:
            # Extract directory from output
            if '/' in output:
                dir_name = output.split('/')[0]
            else:
                dir_name = "repo root"
            
            if dir_name not in by_dir:
                by_dir[dir_name] = []
            by_dir[dir_name].append((script, output))
        
        for dir_name in sorted(by_dir.keys()):
            lines.append(f"📁 {dir_name}/")
            for script, output in sorted(by_dir[dir_name], key=lambda x: x[1]):
                lines.append(f"   ├─ {output:<60} ← {script}")
            lines.append("")
        
        return "\n".join(lines)
    
    @staticmethod
    def create_dependency_graph(flows: List[DataFlow]) -> str:
        """Create a dependency graph showing which scripts depend on others"""
        lines = []
        lines.append("=" * 80)
        lines.append("SCRIPT DEPENDENCY GRAPH")
        lines.append("=" * 80)
        lines.append("")
        lines.append("Shows which script outputs are used as inputs by other scripts")
        lines.append("")
        
        # Build dependency map
        deps: Dict[str, Set[str]] = {}
        
        for flow in flows:
            deps[flow.script_name] = set()
            
            # Check if this flow's sources match any other flow's outputs
            for other_flow in flows:
                if other_flow.script_name == flow.script_name:
                    continue
                
                for source in flow.sources:
                    for output in other_flow.outputs:
                        # Match patterns
                        if FlowVisualizer._paths_match(source, output):
                            deps[flow.script_name].add(other_flow.script_name)
        
        # Display
        for script in [f.script_name for f in flows]:
            if deps[script]:
                lines.append(f"📜 {script}")
                lines.append("   ↳ depends on:")
                for dep in sorted(deps[script]):
                    lines.append(f"      • {dep}")
                lines.append("")
            else:
                lines.append(f"📜 {script}")
                lines.append("   ↳ no dependencies (entry point)")
                lines.append("")
        
        return "\n".join(lines)
    
    @staticmethod
    def _wrap_text(text: str, width: int) -> List[str]:
        """Wrap text to fit within width"""
        if len(text) <= width:
            return [text]
        
        lines = []
        current = ""
        for word in text.split():
            if len(current) + len(word) + 1 <= width:
                current += (" " if current else "") + word
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
        
        return lines
    
    @staticmethod
    def _paths_match(pattern: str, path: str) -> bool:
        """Check if a path matches a pattern (simple substring matching)"""
        # Remove ** wildcards for comparison
        pattern_clean = pattern.replace("**", "").replace("*", "")
        path_clean = path.replace("**", "").replace("*", "")
        
        # Check if they share significant path components
        pattern_parts = [p for p in pattern_clean.split('/') if p]
        path_parts = [p for p in path_clean.split('/') if p]
        
        # Match if they share at least 2 directory levels
        common = set(pattern_parts) & set(path_parts)
        return len(common) >= 2


def main():
    parser = argparse.ArgumentParser(
        description="Analyze pre:manifests build chain and visualize data flows"
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=Path.cwd(),
        help="Root directory of the project (default: current directory)"
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Output file for the report (default: manifest_flow_report.txt)"
    )
    parser.add_argument(
        "--format",
        choices=["all", "tree", "flow", "summary", "deps"],
        default="all",
        help="Output format (default: all)"
    )
    
    args = parser.parse_args()
    
    # Analyze
    analyzer = ManifestFlowAnalyzer(args.root)
    flows = analyzer.analyze_all()
    
    print(f"✅ Analyzed {len(flows)} scripts\n")
    
    # Generate visualizations
    visualizer = FlowVisualizer()
    
    output_parts = []
    
    if args.format in ["all", "tree"]:
        output_parts.append(visualizer.create_tree_view(flows))
        output_parts.append("\n\n")
    
    if args.format in ["all", "flow"]:
        output_parts.append(visualizer.create_flow_diagram(flows))
        output_parts.append("\n\n")
    
    if args.format in ["all", "summary"]:
        output_parts.append(visualizer.create_summary(flows))
        output_parts.append("\n\n")
    
    if args.format in ["all", "deps"]:
        output_parts.append(visualizer.create_dependency_graph(flows))
    
    output_text = "".join(output_parts)
    
    # Write output
    if args.output:
        output_file = args.output
    else:
        output_file = args.root / "manifest_flow_report.txt"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(output_text)
    
    print(f"📄 Report written to: {output_file}")
    print(f"📊 Total flows analyzed: {len(flows)}")
    
    # Count total outputs
    total_outputs = sum(len(f.outputs) for f in flows)
    print(f"📦 Total generated files: {total_outputs}")


if __name__ == "__main__":
    main()
