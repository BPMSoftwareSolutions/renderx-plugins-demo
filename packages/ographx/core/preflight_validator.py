#!/usr/bin/env python3
"""
Pre-Flight Validation for OgraphX

Runs a set of validations before executing the graphing pipeline to prevent
self-awareness drift. Intended to be lightweight and dependency-free.

Checks:
- Self observation recency and IR completeness (no empty 'to' fields)
- Test coverage for Layer 4 (Visualization & Diagrams) beats
- Drift detection (code changed since last self-observation)
- Dependency sanity (Python version; mermaid-cli optional)

Usage:
  python core/preflight_validator.py [--strict]
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
import subprocess
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional, Dict, Tuple


@dataclass
class ValidationResult:
    passed: bool = True
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)

    def add_error(self, msg: str) -> None:
        self.passed = False
        self.errors.append(msg)

    def add_warning(self, msg: str) -> None:
        self.warnings.append(msg)

    def merge(self, other: "ValidationResult") -> "ValidationResult":
        merged = ValidationResult(
            passed=self.passed and other.passed,
            errors=[*self.errors, *other.errors],
            warnings=[*self.warnings, *other.warnings],
        )
        return merged


class PreFlightValidator:
    def __init__(self, base_dir: Optional[Path] = None):
        # packages/ographx root
        self.root = base_dir or Path(__file__).resolve().parent.parent
        self.ographx_dir = self.root
        self.artifacts_root = self.ographx_dir / ".ographx"
        self.sequences_path = self.artifacts_root / "sequences" / "graphing-orchestration.json"
        self.tests_dir = self.ographx_dir / "tests"
        self.unit_tests = self.tests_dir / "unit" / "test_generators.py"

    # ---------- helpers ----------
    def _find_self_ir(self) -> Optional[Path]:
        # Prefer self codebase ir
        candidates = list((self.artifacts_root / "artifacts" / "ographx" / "ir").glob("graph.json"))
        if candidates:
            return candidates[0]
        # Fallback to the most recent IR under any artifacts/*/ir/graph.json
        any_irs = list((self.artifacts_root / "artifacts").glob("*/ir/graph.json"))
        if not any_irs:
            return None
        any_irs.sort(key=lambda p: p.stat().st_mtime, reverse=True)
        return any_irs[0]

    # ---------- checks ----------
    def validate_self_observation(self, max_age_hours: int = 24) -> ValidationResult:
        res = ValidationResult()
        ir_path = self._find_self_ir()
        if not ir_path or not ir_path.exists():
            res.add_error("Missing IR: no .ographx/artifacts/*/ir/graph.json found. Run self-observation first.")
            return res

        age_hours = (datetime.now() - datetime.fromtimestamp(ir_path.stat().st_mtime)).total_seconds() / 3600.0
        if age_hours > max_age_hours:
            res.add_error(f"IR is stale ({age_hours:.1f}h old): {ir_path}. Regenerate before running the pipeline.")

        # Validate IR completeness (no empty 'to' fields)
        try:
            with open(ir_path, "r", encoding="utf-8") as f:
                ir = json.load(f)
            calls = ir.get("calls", [])
            empty_to = [c for c in calls if not c.get("to")]
            if empty_to:
                sample = empty_to[0]
                res.add_error(
                    f"IR has {len(empty_to)} calls with empty 'to' (e.g., frm={sample.get('frm')} name={sample.get('name')} line={sample.get('line')})."
                )
        except Exception as e:
            res.add_error(f"Failed to load IR: {e}")

        return res

    def validate_test_coverage(self) -> ValidationResult:
        res = ValidationResult()
        if not self.sequences_path.exists():
            res.add_error("Missing orchestration: .ographx/sequences/graphing-orchestration.json not found")
            return res
        if not self.unit_tests.exists():
            res.add_error("Missing unit tests: tests/unit/test_generators.py not found")
            return res

        with open(self.sequences_path, "r", encoding="utf-8") as f:
            orchestration = json.load(f)
        with open(self.unit_tests, "r", encoding="utf-8") as f:
            tests_src = f.read()

        # Locate Layer 4 movement
        movements = orchestration.get("sequences", [])[0].get("movements", []) if orchestration.get("sequences") else []
        layer4 = next((m for m in movements if m.get("id") == "layer4_visualization"), None)
        if not layer4:
            res.add_error("Orchestration missing 'layer4_visualization' movement")
            return res

        beats = layer4.get("beats", [])
        expected_map = {
            "generateDiagrams": "test_beat1_generateDiagrams",
            "generateOrchestrationDiagram": "test_beat2_generateOrchestrationDiagram",
            "generateSequenceFlow": "test_beat3_generateSequenceFlow",
            "writeMermaid": "test_beat4_writeMermaid",
            "convertToSVG": "test_beat5_convertToSVG",
            "writeSVG": "test_beat6_writeSVG",
        }

        missing = []
        for b in beats:
            handler = b.get("handler")
            if handler in expected_map:
                test_fn = expected_map[handler]
                if test_fn not in tests_src:
                    missing.append((b.get("beat"), handler, test_fn))

        if missing:
            for beat_no, handler, test_fn in missing:
                res.add_error(f"Missing test for Layer 4 beat {beat_no} ({handler}): expected function '{test_fn}*'")
        return res

    def detect_drift(self) -> ValidationResult:
        res = ValidationResult()
        ir_path = self._find_self_ir()
        if not ir_path or not ir_path.exists():
            # Already handled in self-observation; avoid duplicate error
            return res

        ir_mtime = ir_path.stat().st_mtime
        # Consider Python source updates in core/ and generators/
        newest_src_mtime = ir_mtime
        for sub in (self.ographx_dir / "core", self.ographx_dir / "generators"):
            for p in sub.rglob("*.py"):
                newest_src_mtime = max(newest_src_mtime, p.stat().st_mtime)
        if newest_src_mtime > ir_mtime + 1:  # small delta
            dt = datetime.fromtimestamp(newest_src_mtime)
            res.add_error(
                f"Code changed ({dt.isoformat()}) after last IR generation. Run self-observation again to refresh IR."
            )
        return res

    def validate_dependencies(self) -> ValidationResult:
        res = ValidationResult()
        # Python version
        if sys.version_info < (3, 10):
            res.add_error("Python >= 3.10 required for OgraphX scripts")
        # Mermaid CLI (optional in this repo because we write placeholders)
        if shutil.which("mmdc") is None:
            res.add_warning("mermaid-cli (mmdc) not found; SVGs will use placeholders. Install to enable real rendering.")
        return res

    def _compute_coverage_percent(self, generate_if_missing: bool = True) -> Optional[float]:
        cov_xml = self.ographx_dir / "coverage.xml"

        # Generate coverage.xml if missing
        if not cov_xml.exists() and generate_if_missing:
            # First try pytest-cov
            try:
                __import__("pytest_cov")
                has_pytest_cov = True
            except Exception:
                has_pytest_cov = False

            if has_pytest_cov:
                proc = subprocess.run(
                    [sys.executable, "-m", "pytest", "tests", "-q", "--maxfail=1", "--cov=.", "--cov-report=xml"],
                    cwd=str(self.ographx_dir),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                )
                if proc.returncode != 0:
                    # fall through to try coverage module
                    pass

            # If still missing, try coverage.py directly
            if not cov_xml.exists():
                try:
                    __import__("coverage")
                    have_cov = True
                except Exception:
                    have_cov = False
                if have_cov:
                    r1 = subprocess.run(
                        [sys.executable, "-m", "coverage", "run", "-m", "pytest", "tests", "-q", "--maxfail=1"],
                        cwd=str(self.ographx_dir),
                        stdout=subprocess.PIPE,
                        stderr=subprocess.STDOUT,
                        text=True,
                    )
                    if r1.returncode == 0:
                        subprocess.run(
                            [sys.executable, "-m", "coverage", "xml"],
                            cwd=str(self.ographx_dir),
                            stdout=subprocess.PIPE,
                            stderr=subprocess.STDOUT,
                            text=True,
                        )

        if not cov_xml.exists():
            return None

        try:
            tree = ET.parse(cov_xml)
            root = tree.getroot()
            if "line-rate" in root.attrib:
                return float(root.attrib["line-rate"]) * 100.0
            lines_valid = root.attrib.get("lines-valid")
            lines_covered = root.attrib.get("lines-covered")
            if lines_valid and lines_covered and float(lines_valid) > 0:
                return (float(lines_covered) / float(lines_valid)) * 100.0
            return None
        except Exception:
            return None

    def validate_unit_test_coverage(self, threshold: Optional[float] = None, generate_if_missing: bool = True) -> ValidationResult:
        """
        Enforce unit test coverage using coverage.py XML report. If threshold is None,
        this check is skipped (no-op). Accepts threshold as percent (e.g., 85) or
        fraction (e.g., 0.85).
        """
        res = ValidationResult()
        if threshold is None:
            return res

        # Normalize threshold to percent float [0..100]
        try:
            thr = float(threshold)
            if thr <= 1.0:
                thr *= 100.0
        except Exception:
            res.add_warning("Invalid coverage threshold; skipping coverage enforcement")
            return res

        cov_percent = self._compute_coverage_percent(generate_if_missing=generate_if_missing)
        if cov_percent is None:
            res.add_warning("coverage.xml not found or unreadable; skipping coverage enforcement")
            return res

        if cov_percent + 1e-6 < thr:
            res.add_error(f"Coverage {cov_percent:.1f}% is below threshold {thr:.1f}%")
        return res

    def validate_criticality_coverage(self, generate_if_missing: bool = True) -> ValidationResult:
        """
        Validate coverage against criticality tiers (@critical, @important, @optional).
        Requires criticality_coverage.py module.

        Tiers:
          @critical  → 100% required
          @important → 90%+ required
          @optional  → 70%+ required
        """
        res = ValidationResult()

        # Try to import criticality_coverage module
        try:
            from criticality_coverage import validate_criticality_coverage as validate_crit
        except ImportError:
            res.add_warning("criticality_coverage module not found; skipping criticality-aware validation")
            return res

        cov_xml = self.ographx_dir / "coverage.xml"
        if not cov_xml.exists() and generate_if_missing:
            self._compute_coverage_percent(generate_if_missing=True)

        if not cov_xml.exists():
            res.add_warning("coverage.xml not found; skipping criticality-aware validation")
            return res

        try:
            passed, report = validate_crit(str(cov_xml), str(self.ographx_dir), strict=True)
            if not passed:
                res.add_error(f"Criticality coverage validation failed:\n{report}")
            else:
                res.add_warning(f"Criticality coverage validation passed:\n{report}")
        except Exception as e:
            res.add_warning(f"Criticality coverage validation error: {e}")

        return res

    def regenerate_test_graph(self) -> ValidationResult:
        """Regenerate test structure graph to keep it in sync with actual tests"""
        res = ValidationResult()
        try:
            gen_script = self.ographx_dir / "generators" / "generate_test_graph.py"
            if not gen_script.exists():
                res.add_warning(f"Test graph generator not found: {gen_script}")
                return res

            import subprocess
            result = subprocess.run(
                ["python", str(gen_script)],
                cwd=str(self.ographx_dir),
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode != 0:
                res.add_warning(f"Test graph regeneration had issues: {result.stderr}")
        except Exception as e:
            res.add_warning(f"Failed to regenerate test graph: {e}")

        return res

    def run_all_checks(self, strict: bool = False, coverage_threshold: Optional[float] = None, skip_generate_coverage: bool = False, use_criticality: bool = True, regenerate_test_graph: bool = True) -> ValidationResult:
        result = ValidationResult()

        # Regenerate test graph to keep it in sync (self-aware system)
        if regenerate_test_graph:
            result = result.merge(self.regenerate_test_graph())

        for check in (self.validate_self_observation, self.validate_test_coverage, self.detect_drift, self.validate_dependencies):
            part = check() if check != self.validate_self_observation else check()
            result = result.merge(part)

        # Optional: enforce criticality-aware coverage (preferred)
        if use_criticality:
            crit_part = self.validate_criticality_coverage(generate_if_missing=not skip_generate_coverage)
            result = result.merge(crit_part)
        # Fallback: enforce flat unit test coverage if threshold provided
        elif coverage_threshold is not None:
            cov_part = self.validate_unit_test_coverage(threshold=coverage_threshold, generate_if_missing=not skip_generate_coverage)
            result = result.merge(cov_part)

        # In strict mode, treat warnings as errors
        if strict and result.warnings:
            for w in result.warnings:
                result.add_error(f"(strict) {w}")
            result.warnings.clear()
        return result


def main():
    ap = argparse.ArgumentParser(description="Run OgraphX pre-flight validation")
    ap.add_argument("--strict", action="store_true", help="Treat warnings as errors")
    ap.add_argument("--coverage-threshold", type=float, default=None, help="Enforce unit test coverage threshold (accepts 0..1 or 0..100)")
    ap.add_argument("--skip-generate-coverage", action="store_true", help="Do not run pytest to generate coverage.xml if missing")
    ap.add_argument("--print-coverage", action="store_true", help="Print current coverage percentage and exit")
    args = ap.parse_args()

    # Fast path: just print coverage and exit
    if args.print_coverage:
        pct = PreFlightValidator()._compute_coverage_percent(generate_if_missing=not args.skip_generate_coverage)
        if pct is None:
            # Diagnose missing tools and provide exact fix commands
            missing = []
            try:
                __import__("pytest_cov")
            except Exception:
                missing.append("pytest-cov")
            try:
                __import__("coverage")
            except Exception:
                missing.append("coverage")

            if missing:
                print(
                    "Coverage unavailable: missing dependencies (" + ", ".join(missing) + ").\n"
                    "Install test deps and retry:\n"
                    "  pip install -r packages/ographx/requirements-test.txt\n"
                    "Or manually:\n"
                    "  python -m pip install coverage pytest-cov\n"
                    "Then re-run:\n"
                    "  python packages/ographx/core/preflight_validator.py --print-coverage"
                )
            else:
                print(
                    "Coverage unavailable: could not generate coverage.xml. Try:\n"
                    "  cd packages/ographx\n"
                    "  python -m coverage run -m pytest -q\n"
                    "  python -m coverage xml\n"
                    "Then re-run preflight with --print-coverage."
                )
            return 1
        print(f"{pct:.1f}%")
        return 0

    # Allow env override if not provided via CLI
    cov_thr = args.coverage_threshold
    if cov_thr is None:
        env_thr = os.environ.get("OGRAPHX_COVERAGE_THRESHOLD")
        if env_thr:
            try:
                cov_thr = float(env_thr)
            except Exception:
                cov_thr = None

    validator = PreFlightValidator()
    vr = validator.run_all_checks(strict=args.strict, coverage_threshold=cov_thr, skip_generate_coverage=args.skip_generate_coverage)

    print("\n" + "=" * 70)
    print("OgraphX Pre-Flight Validation Report")
    print("=" * 70)
    if vr.passed:
        print("✅ All checks passed")
    else:
        print("❌ Validation failed")
    if vr.errors:
        print("\nErrors:")
        for e in vr.errors:
            print(f"  • {e}")
    if vr.warnings:
        print("\nWarnings:")
        for w in vr.warnings:
            print(f"  • {w}")

    return 0 if vr.passed else 1


if __name__ == "__main__":
    sys.exit(main())

