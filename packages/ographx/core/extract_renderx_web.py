#!/usr/bin/env python3
"""
Extract Codebase - Generic wrapper for ographx_ts.py
Extracts from specified root directories with exclusions
"""
import os
import sys
import json
import argparse
from pathlib import Path
from ographx_ts import build_ir, emit_ir, emit_sequences, walk_ts_files

def filter_files_for_codebase(root: str, exclude_dirs: list = None) -> list:
    """
    Walk the root directory and collect .ts/.tsx files,
    excluding specified directories.
    """
    if exclude_dirs is None:
        exclude_dirs = ['node_modules', 'dist', '.git', '__pycache__']

    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        # Filter out excluded directories
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]

        for fn in filenames:
            if fn.endswith(('.ts', '.tsx')) and not fn.endswith('.d.ts'):
                full_path = os.path.join(dirpath, fn)
                files.append(full_path)

    return files

def build_ir_from_roots(root_dirs: list, exclude_dirs: list = None) -> dict:
    """
    Build IR from multiple root directories.
    """
    from ographx_ts import IR, extract_symbols_and_calls

    all_files = []
    all_symbols = []
    all_calls = []
    all_contracts = []

    if exclude_dirs is None:
        exclude_dirs = []

    # Extract from each root directory
    for root in root_dirs:
        if not os.path.exists(root):
            print(f"[WARN] Root directory not found: {root}")
            continue

        print(f"[*] Extracting from: {root}")
        files = filter_files_for_codebase(root, exclude_dirs)
        print(f"    Found {len(files)} TypeScript files")

        # Process each file
        for f in files:
            try:
                with open(f, 'r', encoding='utf-8', errors='ignore') as fh:
                    text = fh.read()
                syms, cs, cts = extract_symbols_and_calls(f, text, root=root)
                all_symbols.extend(syms)
                all_calls.extend(cs)
                all_contracts.extend(cts)
            except Exception as e:
                print(f"[WARN] failed to parse {f}: {e}")

        all_files.extend(files)

    # Create IR
    ir = IR(files=all_files, symbols=all_symbols, calls=all_calls, contracts=all_contracts)
    return ir

def main():
    parser = argparse.ArgumentParser(description="Extract codebase to IR")
    parser.add_argument("--name", required=True, help="Codebase name")
    parser.add_argument("--roots", required=True, help="Root directories (comma-separated)")
    parser.add_argument("--exclude", default="", help="Directories to exclude (comma-separated)")
    parser.add_argument("--out", required=True, help="Output IR file path")

    args = parser.parse_args()

    roots = [r.strip() for r in args.roots.split(",")]
    excludes = [e.strip() for e in args.exclude.split(",")] if args.exclude else []

    print("")
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║                                                                ║")
    print("║  🎵 MOVEMENT 1: CORE EXTRACTION")
    print("║                                                                ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    print("")

    # Build IR
    print(f"[*] Building Intermediate Representation for '{args.name}'...")
    ir = build_ir_from_roots(roots, excludes)

    print(f"[*] Extracted:")
    print(f"    • Files: {len(ir.files)}")
    print(f"    • Symbols: {len(ir.symbols)}")
    print(f"    • Calls: {len(ir.calls)}")
    print(f"    • Contracts: {len(ir.contracts)}")
    print("")

    # Ensure output directory exists
    os.makedirs(os.path.dirname(args.out), exist_ok=True)

    # Emit IR
    print(f"[*] Writing IR to {args.out}")
    emit_ir(ir, args.out)

    print("")
    print("✅ Movement 1 Complete: Core Extraction")
    print(f"   Output: {args.out}")
    print("")

if __name__ == "__main__":
    main()

