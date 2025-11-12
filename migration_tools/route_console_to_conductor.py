#!/usr/bin/env python3
"""
Route console.* calls in musical-conductor TS files through ConductorLogger global shims.

Strategy:
- ConductorLogger.init now exposes global functions:
    __MC_LOG, __MC_INFO, __MC_WARN, __MC_ERROR
  that prepend ISO timestamps and route to ConductorLogger.write.
- This script rewrites occurrences of console.log/info/warn/error to use the
  corresponding global shims with a safe fallback to the original console methods
  if the shim isn't available at runtime.

Example rewrite:
  console.log("hello")
    -> ((globalThis).__MC_LOG if hasattr(globalThis, "__MC_LOG") else console.log)("hello")

But in TS/JS syntax:
  console.log("hello")
    -> ((globalThis as any).__MC_LOG || console.log)("hello")

This keeps behavior unchanged if ConductorLogger isn't initialized, and adds timestamped
centralized logging when it is.

Usage:
  python migration_tools/route_console_to_conductor.py [--dry-run]

Constraints:
- Only updates files under packages/musical-conductor/modules/**.ts
- Skips test files, docs, dist, and ConductorLogger.ts itself.
- Idempotent: won't double-rewrite if pattern already applied.
"""

from __future__ import annotations
import re
import sys
from pathlib import Path
from typing import List

ROOT = Path(__file__).resolve().parents[1]
TARGET_DIR = ROOT / "packages" / "musical-conductor" / "modules"

# File/dir filters
SKIP_DIR_NAMES = {"dist", "tests", "__tests__", "__mocks__", "tools", ".git"}
SKIP_FILES = {"ConductorLogger.ts"}

# Simple regexes to rewrite direct call sites. We keep it conservative to avoid false positives.
PATTERNS = [
    (re.compile(r"(?<![\w$])console\.log\s*\("), "((globalThis as any).__MC_LOG || console.log)("),
    (re.compile(r"(?<![\w$])console\.info\s*\("), "((globalThis as any).__MC_INFO || console.info)("),
    (re.compile(r"(?<![\w$])console\.warn\s*\("), "((globalThis as any).__MC_WARN || console.warn)("),
    (re.compile(r"(?<![\w$])console\.error\s*\("), "((globalThis as any).__MC_ERROR || console.error)("),
]

# Skip if line already uses our shim
ALREADY_SHIMMED = re.compile(r"__MC_(LOG|INFO|WARN|ERROR)\s*\|\|\s*console\.(log|info|warn|error)\s*\(")


def should_skip_path(p: Path) -> bool:
    # Skip by directory name
    for part in p.parts:
        if part in SKIP_DIR_NAMES:
            return True
    # Skip non-ts
    if p.suffix != ".ts":
        return True
    # Skip declaration files
    if p.name.endswith('.d.ts'):
        return True
    # Skip specific files
    if p.name in SKIP_FILES:
        return True
    return False


def rewrite_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")

    # Quick bail-out if no console.* present
    if "console." not in text:
        return 0

    lines = text.splitlines(True)
    changed = 0

    for i, line in enumerate(lines):
        if "console." not in line:
            continue
        if ALREADY_SHIMMED.search(line):
            continue
        original = line
        for rx, repl in PATTERNS:
            line = rx.sub(repl, line)
        if line != original:
            lines[i] = line
            changed += 1

    if changed:
        path.write_text("".join(lines), encoding="utf-8")
    return changed


def main() -> int:
    dry_run = "--dry-run" in sys.argv

    targets: List[Path] = []
    for p in TARGET_DIR.rglob("*.ts"):
        if should_skip_path(p):
            continue
        targets.append(p)

    total_changed_lines = 0
    files_touched = 0

    for file in targets:
        if dry_run:
            text = file.read_text(encoding="utf-8")
            if "console." not in text:
                continue
            # simulate
            lines = text.splitlines(True)
            changed = 0
            for i, line in enumerate(lines):
                if "console." not in line or ALREADY_SHIMMED.search(line):
                    continue
                new_line = line
                for rx, repl in PATTERNS:
                    new_line = rx.sub(repl, new_line)
                if new_line != line:
                    changed += 1
            if changed:
                files_touched += 1
                total_changed_lines += changed
                print(f"DRY: {file.relative_to(ROOT)} -> {changed} lines to update")
        else:
            changed = rewrite_file(file)
            if changed:
                files_touched += 1
                total_changed_lines += changed
                print(f"Updated {file.relative_to(ROOT)} -> {changed} lines")

    print()
    mode = "DRY RUN" if dry_run else "LIVE" 
    print(f"[{mode}] Files touched: {files_touched}, lines updated: {total_changed_lines}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
