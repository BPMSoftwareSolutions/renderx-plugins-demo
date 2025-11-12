#!/usr/bin/env python3
"""
Extract RenderX Web Variant - Wrapper for ographx_ts.py
Extracts from /packages/* (excluding robotics, ographx) and /src/ui
"""
import os
import sys
import json
import shutil
from pathlib import Path
from ographx_ts import build_ir, emit_ir, emit_sequences, walk_ts_files

def filter_files_for_renderx_web(root: str, exclude_dirs: list = None) -> list:
    """
    Walk the root directory and collect .ts/.tsx files,
    excluding specified directories.
    """
    if exclude_dirs is None:
        exclude_dirs = ['robotics', 'ographx', 'node_modules', 'dist', '.git']
    
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        # Filter out excluded directories
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
        
        for fn in filenames:
            if fn.endswith(('.ts', '.tsx')) and not fn.endswith('.d.ts'):
                full_path = os.path.join(dirpath, fn)
                files.append(full_path)
    
    return files

def build_ir_renderx_web(packages_root: str, ui_root: str = None) -> dict:
    """
    Build IR for RenderX web variant from packages and ui directories.
    """
    from ographx_ts import IR, Symbol, CallEdge, Contract
    
    all_files = []
    all_symbols = []
    all_calls = []
    all_contracts = []
    
    # Extract from packages (excluding robotics, ographx)
    print(f"[*] Extracting from packages: {packages_root}")
    packages_files = filter_files_for_renderx_web(packages_root)
    print(f"    Found {len(packages_files)} TypeScript files in packages")
    
    # Extract from ui if provided
    if ui_root and os.path.exists(ui_root):
        print(f"[*] Extracting from ui: {ui_root}")
        ui_files = filter_files_for_renderx_web(ui_root)
        print(f"    Found {len(ui_files)} TypeScript files in ui")
        packages_files.extend(ui_files)
    
    all_files = packages_files
    
    # Process each file
    from ographx_ts import extract_symbols_and_calls
    for f in all_files:
        try:
            with open(f, 'r', encoding='utf-8', errors='ignore') as fh:
                text = fh.read()
            syms, cs, cts = extract_symbols_and_calls(f, text, root=packages_root)
            all_symbols.extend(syms)
            all_calls.extend(cs)
            all_contracts.extend(cts)
        except Exception as e:
            print(f"[WARN] failed to parse {f}: {e}")
    
    # Create IR
    ir = IR(files=all_files, symbols=all_symbols, calls=all_calls, contracts=all_contracts)
    return ir

def main():
    # Paths
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
    packages_root = os.path.join(repo_root, 'packages')
    ui_root = os.path.join(repo_root, 'src', 'ui')
    
    # Output paths
    ographx_dir = os.path.join(os.path.dirname(__file__), '..', '.ographx')
    os.makedirs(ographx_dir, exist_ok=True)
    
    ir_out = os.path.join(ographx_dir, 'renderx_web_graph.json')
    
    print("")
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║                                                                ║")
    print("║  🎵 MOVEMENT 1: CORE EXTRACTION - RenderX Web Variant        ║")
    print("║                                                                ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    print("")
    
    # Build IR
    print(f"[*] Building Intermediate Representation...")
    ir = build_ir_renderx_web(packages_root, ui_root)
    
    print(f"[*] Extracted:")
    print(f"    • Files: {len(ir.files)}")
    print(f"    • Symbols: {len(ir.symbols)}")
    print(f"    • Calls: {len(ir.calls)}")
    print(f"    • Contracts: {len(ir.contracts)}")
    print("")
    
    # Emit IR
    print(f"[*] Writing IR to {ir_out}")
    emit_ir(ir, ir_out)
    
    print("")
    print("✅ Movement 1 Complete: Core Extraction")
    print(f"   Output: {ir_out}")
    print("")

if __name__ == "__main__":
    main()

