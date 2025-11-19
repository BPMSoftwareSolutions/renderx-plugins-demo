#!/usr/bin/env python3
"""
Generate Sequences - Converts IR to Conductor sequences
"""
import os
import sys
import json
import argparse
from pathlib import Path

def generate_sequences_from_ir(ir_path: str) -> dict:
    """
    Generate Conductor sequences from IR.

    CRITICAL: Deduplicates symbols by ID before generating sequences.
    The IR may contain duplicate symbol entries (e.g., multiple .if statements
    with the same ID), which would create duplicate sequences. This deduplication
    ensures each unique symbol ID generates exactly one sequence.

    SEQUENCE STRUCTURE:
    - Each symbol gets a sequence with Initialization and Completion movements
    - For each call made by the symbol, a beat is added to the Execution movement
    - If a symbol makes no calls, it only has Initialization and Completion
    """
    # Load IR
    with open(ir_path, 'r') as f:
        ir = json.load(f)

    # Create sequences structure
    sequences = {
        "version": "0.1.0",
        "sequences": []
    }

    # Deduplicate symbols by ID (IR may contain duplicate entries)
    # This fixes the issue where control flow keywords like .if are duplicated
    seen_ids = set()
    unique_symbols = []
    for symbol in ir.get("symbols", []):
        sid = symbol.get("id")
        if sid and sid not in seen_ids:
            unique_symbols.append(symbol)
            seen_ids.add(sid)

    # Build a map of symbol_id -> calls made by that symbol
    symbol_calls = {}
    for call in ir.get("calls", []):
        caller = call.get("frm")
        if caller:
            if caller not in symbol_calls:
                symbol_calls[caller] = []
            symbol_calls[caller].append(call)

    # Create a sequence for each unique symbol
    for symbol in unique_symbols:
        symbol_id = symbol['id']

        # Extract source location info
        file_path = symbol.get('file', '')
        range_info = symbol.get('range', [])
        start_line = range_info[0] if len(range_info) > 0 else None
        end_line = range_info[1] if len(range_info) > 1 else None

        # Build source reference
        source_ref = {}
        if file_path:
            source_ref['file'] = file_path
        if start_line is not None:
            source_ref['startLine'] = start_line
        if end_line is not None:
            source_ref['endLine'] = end_line

        # Get calls made by this symbol
        calls = symbol_calls.get(symbol_id, [])

        # Build execution beats from calls
        execution_beats = []
        for beat_num, call in enumerate(calls, start=1):
            call_name = call.get('name', 'unknown')
            call_line = call.get('line', '?')
            to_symbol = call.get('to', '')

            beat = {
                "id": f"beat_{beat_num}_{symbol_id}",
                "event": f"call:{call_name}",
                "timing": "immediate",
                "line": call_line
            }
            if to_symbol:
                beat["target"] = to_symbol
            execution_beats.append(beat)

        # Build movements
        movements = [
            {
                "id": f"mov_1_{symbol_id}",
                "name": "Initialization",
                "beats": [
                    {
                        "id": f"beat_init_{symbol_id}",
                        "event": f"start:{symbol['name']}",
                        "timing": "immediate"
                    }
                ]
            }
        ]

        # Add Execution movement only if there are calls
        if execution_beats:
            movements.append({
                "id": f"mov_2_{symbol_id}",
                "name": "Execution",
                "beats": execution_beats
            })

        # Add Completion movement
        movements.append({
            "id": f"mov_3_{symbol_id}",
            "name": "Completion",
            "beats": [
                {
                    "id": f"beat_complete_{symbol_id}",
                    "event": f"end:{symbol['name']}",
                    "timing": "immediate"
                }
            ]
        })

        seq = {
            "id": f"seq_{symbol_id}",
            "name": f"Sequence: {symbol['name']}",
            "type": "sequence",
            "source": source_ref if source_ref else None,
            "callCount": len(calls),
            "movements": movements
        }
        sequences["sequences"].append(seq)

    return sequences

def main():
    parser = argparse.ArgumentParser(description="Generate sequences from IR")
    parser.add_argument("--input", required=True, help="Input IR file path")
    parser.add_argument("--output", required=True, help="Output sequences file path")

    args = parser.parse_args()

    print("")
    print("=" * 70)
    print("MOVEMENT 2-3: SEQUENCES & VALIDATION")
    print("=" * 70)
    print("")

    # Load IR to get deduplication stats
    with open(args.input, 'r') as f:
        ir = json.load(f)

    total_symbols = len(ir.get("symbols", []))

    # Generate sequences
    print(f"[*] Generating sequences from IR...")
    sequences = generate_sequences_from_ir(args.input)

    unique_sequences = len(sequences['sequences'])
    duplicates = total_symbols - unique_sequences

    print(f"[*] Generated:")
    print(f"    - Total symbol entries: {total_symbols}")
    print(f"    - Unique sequences: {unique_sequences}")
    if duplicates > 0:
        print(f"    - Deduplicated: {duplicates} duplicate entries removed")
        print(f"    - Deduplication ratio: {duplicates / total_symbols * 100:.1f}%")
    print("")

    # Ensure output directory exists
    os.makedirs(os.path.dirname(args.output), exist_ok=True)

    # Write sequences
    print(f"[*] Writing sequences to {args.output}")
    with open(args.output, 'w') as f:
        json.dump(sequences, f, indent=2)

    print("")
    print("[OK] Movement 2-3 Complete: Sequences & Validation")
    print(f"   Output: {args.output}")
    print("")

if __name__ == "__main__":
    main()

