#!/usr/bin/env python3
"""
Master regeneration script for OgraphX SAS

Orchestrates all generation steps:
1. Extract self-graph (IR)
2. Generate sequences
3. Generate diagrams
4. Convert to SVG
5. Generate test graph
6. Extract analysis

This is the single source of truth for the regeneration pipeline.
"""

import sys
import subprocess
from pathlib import Path


def run_step(name: str, script: str, cwd: Path) -> bool:
    """Run a generation step and report status"""
    print(f"\n[STEP] {name}")
    print(f"       Running: {script}")
    
    try:
        result = subprocess.run(
            [sys.executable, script],
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            print(f"[OK]   {name} completed successfully")
            if result.stdout:
                for line in result.stdout.strip().split('\n'):
                    if line.strip():
                        print(f"       {line}")
            return True
        else:
            print(f"[ERROR] {name} failed with code {result.returncode}")
            if result.stderr:
                print(f"        {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print(f"[ERROR] {name} timed out")
        return False
    except Exception as e:
        print(f"[ERROR] {name} failed: {e}")
        return False


def main():
    """Run complete regeneration pipeline"""
    generators_dir = Path(__file__).parent
    ographx_dir = generators_dir.parent
    
    print("=" * 70)
    print("OgraphX Self-Aware System - Regeneration Pipeline")
    print("=" * 70)
    
    steps = [
        ("Extract Self-Graph (IR)", "core/ographx_ts.py", ographx_dir),
        ("Generate Sequences", "generators/generate_self_sequences.py", ographx_dir),
        ("Generate Orchestration Diagram", "generators/generate_orchestration_diagram.py", ographx_dir),
        ("Generate Sequence Flow", "generators/generate_sequence_flow.py", ographx_dir),
        ("Convert Diagrams to SVG", "generators/convert_to_svg.py", ographx_dir),
        ("Generate Test Graph", "generators/generate_test_graph.py", ographx_dir),
        ("Extract Analysis", "analysis/analyze_self_graph.py", ographx_dir),
    ]
    
    results = []
    for name, script, cwd in steps:
        success = run_step(name, script, cwd)
        results.append((name, success))
    
    # Print summary
    print("\n" + "=" * 70)
    print("REGENERATION SUMMARY")
    print("=" * 70)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for name, success in results:
        status = "[OK]" if success else "[FAIL]"
        print(f"{status} {name}")
    
    print(f"\nTotal: {passed}/{total} steps completed")
    
    if passed == total:
        print("\n[SUCCESS] All regeneration steps completed!")
        return 0
    else:
        print(f"\n[ERROR] {total - passed} step(s) failed")
        return 1


if __name__ == '__main__':
    sys.exit(main())

