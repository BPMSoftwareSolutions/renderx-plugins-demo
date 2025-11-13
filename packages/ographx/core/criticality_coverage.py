#!/usr/bin/env python3
"""
Criticality-Aware Coverage Validator
-------------------------------------
Parses @critical, @important, @optional markers from docstrings and enforces
per-tier coverage thresholds instead of a flat percentage.

Tiers:
  @critical  → 100% coverage required (core IR extraction, call graph resolution)
  @important → 90%+ coverage required (scope-aware resolution, edge cases)
  @optional  → 70%+ coverage acceptable (error handling, file discovery)

Usage:
  python criticality_coverage.py --coverage-xml coverage.xml --source-dir . --strict
"""
import argparse
import os
import re
import sys
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple


@dataclass
class FunctionCoverage:
    """Coverage info for a single function."""
    name: str
    file: str
    criticality: str  # "critical", "important", "optional"
    lines_valid: int
    lines_covered: int
    coverage_pct: float

    @property
    def is_covered(self) -> bool:
        """True if function has any coverage."""
        return self.lines_covered > 0


def extract_criticality_from_docstring(docstring: str) -> str:
    """Extract @critical, @important, or @optional from docstring.
    
    Returns: "critical", "important", "optional", or "unknown"
    """
    if not docstring:
        return "unknown"
    
    # Look for @critical, @important, @optional markers
    if "@critical" in docstring:
        return "critical"
    if "@important" in docstring:
        return "important"
    if "@optional" in docstring:
        return "optional"
    
    return "unknown"


def parse_python_file(file_path: str) -> Dict[str, str]:
    """Parse Python file and extract function criticality markers.
    
    Returns: dict of function_name -> criticality_tier
    """
    criticalities = {}
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return criticalities
    
    # Find all function definitions with their docstrings
    # Pattern: def func_name(...): followed by optional docstring
    func_pattern = r'def\s+([A-Za-z_]\w*)\s*\([^)]*\)\s*(?:->.*?)?\s*:\s*(?:"""(.*?)"""|\'\'\'(.*?)\'\'\')?'
    
    for match in re.finditer(func_pattern, content, re.DOTALL):
        func_name = match.group(1)
        docstring = match.group(2) or match.group(3) or ""
        criticality = extract_criticality_from_docstring(docstring)
        if criticality != "unknown":
            criticalities[func_name] = criticality
    
    return criticalities


def parse_coverage_xml(xml_path: str) -> Dict[str, Tuple[int, int]]:
    """Parse coverage.xml and extract per-file coverage.

    Returns: dict of file_path -> (lines_valid, lines_covered)
    """
    coverage = {}

    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        # Iterate through all classes (which represent files in coverage.py)
        for cls_elem in root.findall(".//class"):
            filename = cls_elem.get("filename", "")
            if not filename:
                continue

            # Count lines from <lines> child
            lines_elem = cls_elem.find("lines")
            if lines_elem is not None:
                line_elems = lines_elem.findall("line")
                lines_valid = len(line_elems)
                lines_covered = sum(1 for line in line_elems if int(line.get("hits", 0)) > 0)
                coverage[filename] = (lines_valid, lines_covered)

    except Exception as e:
        print(f"[ERROR] Failed to parse coverage.xml: {e}", file=sys.stderr)

    return coverage


def validate_criticality_coverage(
    coverage_xml: str,
    source_dir: str,
    strict: bool = False
) -> Tuple[bool, str]:
    """Validate coverage against criticality tiers.

    Maps functions to files and evaluates file-level coverage.
    Returns: (passed, report_text)
    """
    if not os.path.exists(coverage_xml):
        return False, f"Coverage XML not found: {coverage_xml}"

    # Parse coverage data (file-level)
    coverage_data = parse_coverage_xml(coverage_xml)

    # Scan source files for criticality markers and map to files
    file_to_functions: Dict[str, List[Tuple[str, str]]] = {}  # file -> [(func_name, criticality)]

    for root, _, files in os.walk(source_dir):
        for fname in files:
            if fname.endswith(".py") and not fname.startswith("test_"):
                fpath = os.path.join(root, fname)
                file_criticalities = parse_python_file(fpath)
                if file_criticalities:
                    file_to_functions[fpath] = [(name, crit) for name, crit in file_criticalities.items()]

    # Evaluate coverage by tier
    tiers = {
        "critical": {"threshold": 100.0, "functions": []},
        "important": {"threshold": 90.0, "functions": []},
        "optional": {"threshold": 70.0, "functions": []},
    }

    for fpath, functions in file_to_functions.items():
        # Normalize path for lookup in coverage_data
        norm_path = os.path.normpath(fpath).replace("\\", "/")
        lines_valid, lines_covered = coverage_data.get(norm_path, (0, 0))

        if lines_valid == 0:
            coverage_pct = 0.0
        else:
            coverage_pct = (lines_covered / lines_valid) * 100.0

        for func_name, criticality in functions:
            if criticality not in tiers:
                continue

            func_cov = FunctionCoverage(
                name=func_name,
                file=fpath,
                criticality=criticality,
                lines_valid=lines_valid,
                lines_covered=lines_covered,
                coverage_pct=coverage_pct
            )
            tiers[criticality]["functions"].append(func_cov)

    # Check thresholds
    report_lines = ["Criticality-Aware Coverage Report", "=" * 60]
    all_passed = True

    for tier_name in ["critical", "important", "optional"]:
        tier = tiers[tier_name]
        threshold = tier["threshold"]
        functions = tier["functions"]

        if not functions:
            report_lines.append(f"\n{tier_name.upper()} ({threshold:.0f}% required): No functions marked")
            continue

        failed = [f for f in functions if f.coverage_pct < threshold]
        passed = [f for f in functions if f.coverage_pct >= threshold]

        status = "✅ PASS" if not failed else "❌ FAIL"
        report_lines.append(f"\n{tier_name.upper()} ({threshold:.0f}% required): {status}")
        report_lines.append(f"  {len(passed)}/{len(functions)} functions meet threshold")

        if failed:
            all_passed = False
            for f in failed:
                report_lines.append(f"    ❌ {f.name}: {f.coverage_pct:.1f}% ({f.lines_covered}/{f.lines_valid} lines)")

        if passed and len(passed) <= 3:
            for f in passed:
                report_lines.append(f"    ✅ {f.name}: {f.coverage_pct:.1f}%")

    report = "\n".join(report_lines)

    if strict and not all_passed:
        return False, report

    return True, report


def main():
    ap = argparse.ArgumentParser(description="Validate coverage against criticality tiers")
    ap.add_argument("--coverage-xml", required=True, help="Path to coverage.xml")
    ap.add_argument("--source-dir", default=".", help="Source directory to scan for markers")
    ap.add_argument("--strict", action="store_true", help="Fail if any tier is below threshold")
    args = ap.parse_args()
    
    passed, report = validate_criticality_coverage(
        args.coverage_xml,
        args.source_dir,
        strict=args.strict
    )
    
    print(report)
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())

