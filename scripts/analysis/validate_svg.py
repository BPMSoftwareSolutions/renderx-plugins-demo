#!/usr/bin/env python3
"""
SVG Validation Utility
----------------------
Validates XML well-formedness of large single-line SVGs and reports specific issues:
 1. Unclosed <br> tags (i.e. '<br>' not '<br/>' or '<br />').
 2. General XML parse errors with surrounding context snippet.
Usage:
  python validate_svg.py Complete-RenderX-Build-Pipeline.svg [--fix-br --output fixed.svg]
If --fix-br is provided, will create a copy (or write to --output) with all raw <br> converted to <br/>.
Exit codes:
 0 success (parsed OK)  |  1 parse error  |  2 IO error | 3 fix mode but parse still fails
"""
from __future__ import annotations
import sys, re, pathlib, textwrap
import xml.etree.ElementTree as ET
from dataclasses import dataclass

BR_PATTERN = re.compile(r"<br(?!\s*/)>")  # matches <br> or <br> followed by > directly

@dataclass
class ValidationResult:
    path: pathlib.Path
    unclosed_br: int
    parse_ok: bool
    error: str | None = None
    error_index: int | None = None
    context: str | None = None

def read_file(path: pathlib.Path) -> str:
    try:
        return path.read_text(encoding='utf-8')
    except Exception as e:
        print(f"IO ERROR: {e}", file=sys.stderr)
        sys.exit(2)

def find_unclosed_br(data: str) -> list[re.Match]:
    return list(BR_PATTERN.finditer(data))

def xml_parse(data: str, path: pathlib.Path) -> tuple[bool, str | None, int | None]:
    try:
        ET.fromstring(data)
        return True, None, None
    except ET.ParseError as e:
        # e.position gives (line, column)
        msg = str(e)
        try:
            _, col = e.position
        except Exception:
            col = None
        return False, msg, col

def extract_context(data: str, col: int, radius: int = 120) -> str:
    if col is None:
        return None
    start = max(col - radius, 0)
    end = min(col + radius, len(data))
    snippet = data[start:end]
    return snippet

def validate(path: pathlib.Path) -> ValidationResult:
    data = read_file(path)
    unclosed = find_unclosed_br(data)
    parse_ok, err, col = xml_parse(data, path)
    ctx = extract_context(data, col) if not parse_ok else None
    return ValidationResult(path, len(unclosed), parse_ok, err, col, ctx)

def fix_br(data: str) -> str:
    # Replace only raw <br> occurrences not already self-closed.
    return BR_PATTERN.sub("<br/>", data)

def main(argv: list[str]) -> int:
    import argparse
    ap = argparse.ArgumentParser(description="Validate (and optionally fix) SVG well-formedness")
    ap.add_argument('svg', help='Path to SVG file')
    ap.add_argument('--fix-br', action='store_true', help='Auto-convert raw <br> to <br/>')
    ap.add_argument('--output', '-o', help='Output path for fixed copy')
    ap.add_argument('--show-context', action='store_true', help='Print parse error context snippet if any')
    args = ap.parse_args(argv)

    path = pathlib.Path(args.svg)
    if not path.is_file():
        print(f"ERROR: File not found: {path}", file=sys.stderr)
        return 2
    original_data = read_file(path)
    out_path = None

    if args.fix_br:
        fixed_data = fix_br(original_data)
        out_path = pathlib.Path(args.output) if args.output else path.with_suffix('.fixed.svg')
        out_path.write_text(fixed_data, encoding='utf-8')
        print(f"[fix-br] Wrote fixed copy: {out_path}")
        result = validate(out_path)
    else:
        result = validate(path)

    print(f"File: {result.path.name}")
    print(f"Unclosed <br> count: {result.unclosed_br}")
    print(f"XML Parse: {'OK' if result.parse_ok else 'FAIL'}")
    if not result.parse_ok:
        print(f"Error: {result.error}")
        if args.show_context and result.context:
            print("Context (±120 chars):")
            print(textwrap.indent(result.context, '  '))
    return 0 if result.parse_ok else (3 if args.fix_br else 1)

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
