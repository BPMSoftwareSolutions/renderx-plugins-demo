#!/usr/bin/env python3
"""
Remove ConductorLogger fallback patterns like
  ((globalThis as any).__MC_LOG || console.log)(
  ((globalThis as any).__MC_INFO || console.info)(
  ((globalThis as any).__MC_WARN || console.warn)(
  ((globalThis as any).__MC_ERROR || console.error)(

and replace them with direct shim calls:
  (globalThis as any).__MC_LOG(
  (globalThis as any).__MC_INFO(
  (globalThis as any).__MC_WARN(
  (globalThis as any).__MC_ERROR(

Scope: packages/musical-conductor/modules/**/*.ts
Skips: dist, tests, __tests__, __mocks__, tools, .git, declaration files, ConductorLogger.ts

Usage:
  python migration_tools/remove_console_fallbacks.py [--dry-run]

This script is idempotent.
"""
from __future__ import annotations
import re
import sys
from pathlib import Path
from typing import List

ROOT = Path(__file__).resolve().parents[1]
TARGET_DIR = ROOT / "packages" / "musical-conductor" / "modules"

SKIP_DIR_NAMES = {"dist", "tests", "__tests__", "__mocks__", "tools", ".git"}
SKIP_FILES = {"ConductorLogger.ts"}

# Build robust regexes that allow arbitrary whitespace
LEVELS = [
    ("LOG", "log"),
    ("INFO", "info"),
    ("WARN", "warn"),
    ("ERROR", "error"),
]

# Example pattern (with whitespace):
# \(\(globalThis\s+as\s+any\)\)\.__MC_LOG\s*\|\|\s*console\.log\s*\(

def pattern_for(level_const: str, level_console: str) -> re.Pattern:
    return re.compile(
        r"\(\(\s*globalThis\s+as\s+any\s*\)\)\.__MC_" + re.escape(level_const) +
        r"\s*\|\|\s*console\." + re.escape(level_console) + r"\s*\("
    )

# Replacement form: (globalThis as any).__MC_LOG(
# Note: We purposefully remove the extra parentheses as they are unnecessary
REPLACEMENTS = {
    pattern_for(c, j): f"(globalThis as any).__MC_{c}("
    for (c, j) in LEVELS
}

# Also catch variants that omit the outer ( ... ) around globalThis as any
ALT_REPLACEMENTS = {
    re.compile(
        r"\(\s*globalThis\s+as\s+any\s*\)\.__MC_" + re.escape(c) + r"\s*\|\|\s*console\." + re.escape(j) + r"\s*\("
    ): f"(globalThis as any).__MC_{c}("
    for (c, j) in LEVELS
}

# Master list of regexes to try
ALL_REPLACEMENTS = {**REPLACEMENTS, **ALT_REPLACEMENTS}

FALLBACK_SNIPPET = re.compile(r"__MC_(LOG|INFO|WARN|ERROR)\s*\|\|\s*console\.(log|info|warn|error)\s*\(")


def should_skip_path(p: Path) -> bool:
    for part in p.parts:
        if part in SKIP_DIR_NAMES:
            return True
    if p.suffix != ".ts":
        return True
    if p.name.endswith(".d.ts"):
        return True
    if p.name in SKIP_FILES:
        return True
    return False


def rewrite(text: str) -> tuple[str, int]:
    # Fast path: if no fallback marker present
    if "|| console." not in text:
        return text, 0

    changed = 0

    # 1) Simple exact string replacements (most common form)
    exact_map = {
        "((globalThis as any).__MC_LOG || console.log)(": "(globalThis as any).__MC_LOG(",
        "((globalThis as any).__MC_INFO || console.info)(": "(globalThis as any).__MC_INFO(",
        "((globalThis as any).__MC_WARN || console.warn)(": "(globalThis as any).__MC_WARN(",
        "((globalThis as any).__MC_ERROR || console.error)(": "(globalThis as any).__MC_ERROR(",
        "(globalThis as any).__MC_LOG || console.log)(": "(globalThis as any).__MC_LOG(",
        "(globalThis as any).__MC_INFO || console.info)(": "(globalThis as any).__MC_INFO(",
        "(globalThis as any).__MC_WARN || console.warn)(": "(globalThis as any).__MC_WARN(",
        "(globalThis as any).__MC_ERROR || console.error)(": "(globalThis as any).__MC_ERROR(",
    }
    for k, v in exact_map.items():
        if k in text:
            n = text.count(k)
            text = text.replace(k, v)
            changed += n

    # 2) Regex fallback tolerant to whitespace variations
    for rx, repl in ALL_REPLACEMENTS.items():
        new_text, n = rx.subn(repl, text)
        if n:
            changed += n
            text = new_text

    return text, changed


def process_file(path: Path, dry: bool) -> int:
    raw = path.read_text(encoding="utf-8")
    new, changed = rewrite(raw)
    if changed and not dry:
        path.write_text(new, encoding="utf-8")
    return changed


def main() -> int:
    dry = "--dry-run" in sys.argv
    targets: List[Path] = [p for p in TARGET_DIR.rglob("*.ts") if not should_skip_path(p)]
    files = 0
    lines = 0
    for p in targets:
        c = process_file(p, dry)
        if c:
            files += 1
            lines += c
            print(("DRY: " if dry else "Updated ") + str(p.relative_to(ROOT)) + f" -> {c} replacements")
    print(f"\n[{'DRY' if dry else 'LIVE'}] Files touched: {files}, replacements: {lines}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
