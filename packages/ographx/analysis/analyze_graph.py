#!/usr/bin/env python3
"""
Analyze Graph - Extracts metrics and telemetry from IR
"""
import os
import sys
import json
import argparse
from pathlib import Path
from collections import defaultdict

def analyze_ir(ir_path: str) -> dict:
    """
    Analyze IR and extract metrics.
    """
    # Load IR
    with open(ir_path, 'r') as f:
        ir = json.load(f)
    
    files = ir.get("files", [])
    symbols = ir.get("symbols", [])
    calls = ir.get("calls", [])
    contracts = ir.get("contracts", [])
    
    # Calculate metrics
    analysis = {
        "version": "0.1.0",
        "generated_at": "",
        "statistics": {
            "files": len(files),
            "symbols": len(symbols),
            "calls": len(calls),
            "contracts": len(contracts)
        },
        "symbol_types": defaultdict(int),
        "call_distribution": defaultdict(int),
        "complexity": {
            "average_calls_per_symbol": 0,
            "max_calls_per_symbol": 0,
            "min_calls_per_symbol": 0
        },
        "coverage": {
            "symbols_with_calls": 0,
            "symbols_without_calls": 0
        }
    }
    
    # Analyze symbol types
    for symbol in symbols:
        sym_type = symbol.get("type", "unknown")
        analysis["symbol_types"][sym_type] += 1
    
    # Analyze call distribution
    calls_per_symbol = defaultdict(int)
    for call in calls:
        caller = call.get("caller", "unknown")
        calls_per_symbol[caller] += 1
        analysis["call_distribution"][caller] += 1
    
    # Calculate complexity metrics
    if calls_per_symbol:
        call_counts = list(calls_per_symbol.values())
        analysis["complexity"]["average_calls_per_symbol"] = sum(call_counts) / len(call_counts)
        analysis["complexity"]["max_calls_per_symbol"] = max(call_counts)
        analysis["complexity"]["min_calls_per_symbol"] = min(call_counts)
    
    # Calculate coverage
    symbols_with_calls = len(calls_per_symbol)
    symbols_without_calls = len(symbols) - symbols_with_calls
    analysis["coverage"]["symbols_with_calls"] = symbols_with_calls
    analysis["coverage"]["symbols_without_calls"] = symbols_without_calls
    
    # Convert defaultdicts to regular dicts
    analysis["symbol_types"] = dict(analysis["symbol_types"])
    analysis["call_distribution"] = dict(analysis["call_distribution"])
    
    return analysis

def main():
    parser = argparse.ArgumentParser(description="Analyze IR and extract metrics")
    parser.add_argument("--input", required=True, help="Input IR file path")
    parser.add_argument("--output", required=True, help="Output analysis file path")
    
    args = parser.parse_args()
    
    print("")
    print("=" * 70)
    print("MOVEMENT 5: ANALYSIS & TELEMETRY")
    print("=" * 70)
    print("")
    
    # Analyze IR
    print(f"[*] Analyzing IR from {args.input}")
    analysis = analyze_ir(args.input)

    print(f"[*] Analysis Results:")
    print(f"    - Files: {analysis['statistics']['files']}")
    print(f"    - Symbols: {analysis['statistics']['symbols']}")
    print(f"    - Calls: {analysis['statistics']['calls']}")
    print(f"    - Contracts: {analysis['statistics']['contracts']}")
    print("")

    # Ensure output directory exists
    os.makedirs(os.path.dirname(args.output), exist_ok=True)

    # Write analysis
    print(f"[*] Writing analysis to {args.output}")
    with open(args.output, 'w') as f:
        json.dump(analysis, f, indent=2)

    print("")
    print("[OK] Movement 5 Complete: Analysis & Telemetry")
    print(f"   Output: {args.output}")
    print("")

if __name__ == "__main__":
    main()

