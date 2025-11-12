#!/usr/bin/env python3
"""
Graph Codebase - Unified Pipeline Orchestrator

Generates all artifacts for a specific codebase in an organized folder structure.

Usage:
  python graph_codebase.py --name renderx-web --roots packages src/ui --exclude robotics,ographx
  python graph_codebase.py --config codebase-config.json
"""

import sys
import os
import json
import argparse
import subprocess
from pathlib import Path
from typing import List, Optional

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.artifact_manager import ArtifactManager, ArtifactConfig, ArtifactManifest


class CodebaseGrapher:
    """Orchestrates the complete graphing pipeline for a codebase"""
    
    def __init__(self, codebase_name: str, root_dirs: List[str], 
                 exclude_dirs: List[str] = None, base_dir: str = ".ographx/artifacts"):
        self.codebase_name = codebase_name
        self.root_dirs = root_dirs
        self.exclude_dirs = exclude_dirs or []
        self.manager = ArtifactManager(base_dir)
        self.codebase_dir = None
        self.manifest = None
    
    def setup(self):
        """Setup codebase folder and configuration"""
        print(f"\n[SETUP] Creating artifact folder for '{self.codebase_name}'...")
        
        config = ArtifactConfig(
            name=self.codebase_name,
            root_dirs=self.root_dirs,
            exclude_dirs=self.exclude_dirs
        )
        
        self.codebase_dir = self.manager.create_codebase_folder(self.codebase_name, config)
        self.manifest = ArtifactManifest(self.codebase_name, config)
        
        print(f"✅ Artifact folder created: {self.codebase_dir}")
        print(f"   • IR: {self.codebase_dir}/ir/")
        print(f"   • Sequences: {self.codebase_dir}/sequences/")
        print(f"   • Visualizations: {self.codebase_dir}/visualization/")
        print(f"   • Analysis: {self.codebase_dir}/analysis/")
    
    def run_step(self, name: str, script: str, args: List[str] = None) -> bool:
        """Run a pipeline step"""
        print(f"\n[STEP] {name}")

        # Get absolute path to script relative to ographx directory
        ographx_dir = Path(__file__).parent.parent
        script_path = ographx_dir / script

        cmd = [sys.executable, str(script_path)] + (args or [])
        print(f"       Running: {' '.join(cmd)}")

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)

            if result.returncode == 0:
                print(f"✅ {name} completed")
                if result.stdout:
                    for line in result.stdout.strip().split('\n'):
                        if line.strip():
                            print(f"   {line}")
                return True
            else:
                print(f"❌ {name} failed (code {result.returncode})")
                if result.stderr:
                    print(f"   {result.stderr}")
                return False
        except subprocess.TimeoutExpired:
            print(f"❌ {name} timed out")
            return False
        except Exception as e:
            print(f"❌ {name} failed: {e}")
            return False
    
    def extract_ir(self):
        """Movement 1: Extract Intermediate Representation"""
        print("\n" + "="*70)
        print("🎵 MOVEMENT 1: CORE EXTRACTION")
        print("="*70)
        
        ir_path = self.codebase_dir / "ir" / "graph.json"
        
        # Build extraction command
        args = [
            "--name", self.codebase_name,
            "--roots", ",".join(self.root_dirs),
            "--exclude", ",".join(self.exclude_dirs),
            "--out", str(ir_path)
        ]
        
        success = self.run_step(
            "Extract IR",
            "core/extract_codebase.py",
            args
        )
        
        if success and ir_path.exists():
            with open(ir_path) as f:
                ir_data = json.load(f)
            self.manifest.statistics = {
                "files": len(ir_data.get("files", [])),
                "symbols": len(ir_data.get("symbols", [])),
                "calls": len(ir_data.get("calls", [])),
                "contracts": len(ir_data.get("contracts", []))
            }
            self.manifest.artifacts["ir"] = str(ir_path)
        
        return success
    
    def generate_sequences(self):
        """Movement 2-3: Generate Sequences"""
        print("\n" + "="*70)
        print("🎵 MOVEMENT 2-3: SEQUENCES & VALIDATION")
        print("="*70)
        
        ir_path = self.codebase_dir / "ir" / "graph.json"
        seq_path = self.codebase_dir / "sequences" / "sequences.json"
        
        args = [
            "--input", str(ir_path),
            "--output", str(seq_path)
        ]
        
        success = self.run_step(
            "Generate Sequences",
            "generators/generate_sequences.py",
            args
        )
        
        if success:
            self.manifest.artifacts["sequences"].append(str(seq_path))
        
        return success
    
    def generate_visualizations(self):
        """Movement 4: Generate Visualizations"""
        print("\n" + "="*70)
        print("🎵 MOVEMENT 4: VISUALIZATION & DIAGRAMS")
        print("="*70)

        seq_path = self.codebase_dir / "sequences" / "sequences.json"
        ir_path = self.codebase_dir / "ir" / "graph.json"
        diag_dir = self.codebase_dir / "visualization" / "diagrams"

        args = [
            "--input", str(seq_path),
            "--ir-path", str(ir_path),
            "--output-dir", str(diag_dir)
        ]

        success = self.run_step(
            "Generate Diagrams",
            "generators/generate_diagrams.py",
            args
        )

        if success:
            # Collect all generated diagrams
            for f in diag_dir.glob("*"):
                if f.is_file():
                    self.manifest.artifacts["visualizations"].append(str(f))

        return success
    
    def extract_analysis(self):
        """Movement 5: Extract Analysis"""
        print("\n" + "="*70)
        print("🎵 MOVEMENT 5: ANALYSIS & TELEMETRY")
        print("="*70)
        
        ir_path = self.codebase_dir / "ir" / "graph.json"
        analysis_path = self.codebase_dir / "analysis" / "analysis.json"
        
        args = [
            "--input", str(ir_path),
            "--output", str(analysis_path)
        ]
        
        success = self.run_step(
            "Extract Analysis",
            "analysis/analyze_graph.py",
            args
        )
        
        if success:
            self.manifest.artifacts["analysis"] = str(analysis_path)
        
        return success
    
    def finalize(self):
        """Movement 6-7: Finalization & Verification"""
        print("\n" + "="*70)
        print("MOVEMENT 6-7: FINALIZATION & VERIFICATION")
        print("="*70)

        try:
            # Save manifest
            self.manager.save_manifest(self.codebase_name, self.manifest)
            print(f"[OK] Manifest saved")

            # Print summary
            print(f"\nArtifact Summary for '{self.codebase_name}':")
            print(f"   Files: {self.manifest.statistics['files']}")
            print(f"   Symbols: {self.manifest.statistics['symbols']}")
            print(f"   Calls: {self.manifest.statistics['calls']}")
            print(f"   Contracts: {self.manifest.statistics['contracts']}")
            print(f"\nLocation: {self.codebase_dir}")

            return True
        except Exception as e:
            print(f"[ERROR] Finalization failed: {e}")
            return False
    
    def run(self):
        """Execute the complete pipeline"""
        print("\n" + "="*70)
        print("OgraphX Codebase Graphing Pipeline")
        print(f"Codebase: {self.codebase_name}")
        print("="*70)
        
        self.setup()
        
        steps = [
            ("Extract IR", self.extract_ir),
            ("Generate Sequences", self.generate_sequences),
            ("Generate Visualizations", self.generate_visualizations),
            ("Extract Analysis", self.extract_analysis),
            ("Finalize", self.finalize),
        ]
        
        results = []
        for name, step_func in steps:
            try:
                success = step_func()
                results.append((name, success))
            except Exception as e:
                print(f"❌ {name} failed: {e}")
                results.append((name, False))
        
        # Print final summary
        print("\n" + "="*70)
        print("PIPELINE SUMMARY")
        print("="*70)
        
        passed = sum(1 for _, success in results if success)
        total = len(results)
        
        for name, success in results:
            status = "✅" if success else "❌"
            print(f"{status} {name}")
        
        print(f"\nTotal: {passed}/{total} steps completed")
        
        if passed == total:
            print(f"\n✅ All artifacts generated for '{self.codebase_name}'!")
            return 0
        else:
            print(f"\n❌ {total - passed} step(s) failed")
            return 1


def main():
    parser = argparse.ArgumentParser(
        description="Graph a codebase and generate all artifacts"
    )
    parser.add_argument("--name", required=True, help="Codebase name")
    parser.add_argument("--roots", required=True, help="Root directories (comma-separated)")
    parser.add_argument("--exclude", default="", help="Directories to exclude (comma-separated)")
    parser.add_argument("--base-dir", default=".ographx/artifacts", help="Base artifacts directory")
    
    args = parser.parse_args()
    
    roots = [r.strip() for r in args.roots.split(",")]
    excludes = [e.strip() for e in args.exclude.split(",")] if args.exclude else []
    
    grapher = CodebaseGrapher(args.name, roots, excludes, args.base_dir)
    return grapher.run()


if __name__ == "__main__":
    sys.exit(main())

