#!/usr/bin/env python3
"""
Test Coverage Enforcer for OgraphX Layer 4 (Visualization & Diagrams)

This is a lightweight tool to ensure that each orchestration beat in Layer 4
has a corresponding unit test. It can also generate missing test stubs to help
contributors close gaps quickly.

Usage:
  python tests/test_coverage_enforcer.py [--fail-on-missing] [--write-stubs]
"""
from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple


LAYER4_EXPECTED = {
    "generateDiagrams": "test_beat1_generateDiagrams",
    "generateOrchestrationDiagram": "test_beat2_generateOrchestrationDiagram",
    "generateSequenceFlow": "test_beat3_generateSequenceFlow",
    "writeMermaid": "test_beat4_writeMermaid",
    "convertToSVG": "test_beat5_convertToSVG",
    "writeSVG": "test_beat6_writeSVG",
}


@dataclass
class CoverageReport:
    total_beats: int
    covered: int
    missing: List[Tuple[int, str, str]]  # (beat_no, handler, expected_test)


class TestCoverageEnforcer:
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.sequences_path = base_dir / ".ographx" / "sequences" / "graphing-orchestration.json"
        self.test_file = base_dir / "tests" / "unit" / "test_generators.py"

    def validate_beat_coverage(self) -> CoverageReport:
        if not self.sequences_path.exists():
            raise FileNotFoundError("Missing orchestration sequences JSON")
        if not self.test_file.exists():
            raise FileNotFoundError("Missing test_generators.py for coverage scan")

        with open(self.sequences_path, "r", encoding="utf-8") as f:
            orchestration = json.load(f)
        with open(self.test_file, "r", encoding="utf-8") as f:
            src = f.read()

        movements = orchestration.get("sequences", [])[0].get("movements", []) if orchestration.get("sequences") else []
        layer4 = next((m for m in movements if m.get("id") == "layer4_visualization"), None)
        beats = layer4.get("beats", []) if layer4 else []

        missing: List[Tuple[int, str, str]] = []
        for b in beats:
            handler = b.get("handler")
            beat_no = b.get("beat")
            expected = LAYER4_EXPECTED.get(handler)
            if expected and expected not in src:
                missing.append((beat_no, handler, expected))

        covered = len(beats) - len(missing)
        return CoverageReport(total_beats=len(beats), covered=covered, missing=missing)

    def generate_missing_tests(self, missing: List[Tuple[int, str, str]]) -> Path:
        stubs_path = self.base_dir / "tests" / "unit" / "test_missing_beats.py"
        stubs_path.parent.mkdir(parents=True, exist_ok=True)
        lines = [
            "import os, sys, json", 
            "from pathlib import Path",
            "sys.path.append(str((Path(__file__).parent.parent.parent / 'generators').resolve()))",
            "from generators.generate_diagrams import generate_orchestration_diagram, generate_sequence_flow_diagram, generate_svg_placeholder, generate_call_graph_diagram",
            "",
        ]
        for beat_no, handler, fn in missing:
            lines += [
                f"def {fn}_stub():",
                f"    # TODO: Implement test for beat {beat_no} handler '{handler}'",
                "    assert True",
                "",
            ]
        stubs_path.write_text("\n".join(lines), encoding="utf-8")
        return stubs_path

    def report_coverage(self, report: CoverageReport) -> str:
        out = []
        out.append(f"Layer 4 beats: {report.total_beats}")
        out.append(f"Covered: {report.covered}")
        if report.missing:
            out.append("Missing:")
            for beat_no, handler, expected in report.missing:
                out.append(f"  - Beat {beat_no}: {handler} -> {expected}")
        return "\n".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fail-on-missing", action="store_true")
    ap.add_argument("--write-stubs", action="store_true")
    args = ap.parse_args()

    base_dir = Path(__file__).resolve().parent.parent
    enforcer = TestCoverageEnforcer(base_dir)
    report = enforcer.validate_beat_coverage()
    print(enforcer.report_coverage(report))

    if report.missing and args.write_stubs:
        path = enforcer.generate_missing_tests(report.missing)
        print(f"Wrote stubs: {path}")

    if args.fail_on_missing and report.missing:
        print("\nCoverage gaps detected. Failing as requested.")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

