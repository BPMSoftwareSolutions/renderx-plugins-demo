#!/usr/bin/env python3
"""
Generate Diagrams - Generate Mermaid diagrams from IR data
"""
import os
import sys
import json
import argparse
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Set, Tuple

def load_ir(ir_path: str) -> dict:
    """Load the IR (Intermediate Representation) from graph.json"""
    with open(ir_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_call_graph_diagram(ir: dict, max_nodes: int = 50) -> str:
    """
    Generate a call graph diagram showing function call relationships.
    Shows which functions call which other functions.
    """
    symbols = ir.get('symbols', [])
    calls = ir.get('calls', [])

    # Build a map of symbol IDs to symbol info
    symbol_map = {s['id']: s for s in symbols}

    # Build call relationships (only include calls where 'to' is not empty)
    call_edges = defaultdict(set)
    for call in calls:
        frm = call.get('frm', '')
        to = call.get('to', '')
        if frm and to and frm in symbol_map and to in symbol_map:
            call_edges[frm].add(to)

    # Find the most connected functions (limit to max_nodes)
    node_importance = defaultdict(int)
    for frm, targets in call_edges.items():
        node_importance[frm] += len(targets)
        for to in targets:
            node_importance[to] += 1

    top_nodes = sorted(node_importance.items(), key=lambda x: x[1], reverse=True)[:max_nodes]
    top_node_ids = {node_id for node_id, _ in top_nodes}

    # Generate Mermaid diagram
    mmd = "graph LR\n"
    mmd += '    Root["Call Graph"]\n\n'

    # Add nodes
    added_nodes = set()
    for node_id in top_node_ids:
        if node_id in symbol_map:
            symbol = symbol_map[node_id]
            name = symbol.get('name', 'unknown')
            kind = symbol.get('kind', 'function')
            icon = "Function" if kind == "function" else "Class"
            safe_id = node_id.replace('::', '_').replace('.', '_').replace('-', '_')
            mmd += f'    {safe_id}["{icon}: {name}"]\n'
            added_nodes.add(node_id)

    mmd += "\n"

    # Add edges (only between top nodes)
    edge_count = 0
    for frm in top_node_ids:
        if frm in call_edges:
            for to in call_edges[frm]:
                if to in top_node_ids and edge_count < 100:
                    safe_frm = frm.replace('::', '_').replace('.', '_').replace('-', '_')
                    safe_to = to.replace('::', '_').replace('.', '_').replace('-', '_')
                    to_name = symbol_map[to].get('name', 'unknown')
                    mmd += f'    {safe_frm} -->|{to_name}| {safe_to}\n'
                    edge_count += 1

    mmd += '\n    style Root fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold\n'

    return mmd

def generate_orchestration_diagram(ir: dict, sequences: dict, max_sequences: int = 10) -> str:
    """
    Generate an orchestration diagram showing how sequences are organized.
    Groups sequences by category and shows their structure.
    """
    sequences_list = sequences.get('sequences', [])

    # Group sequences by category
    categories = defaultdict(list)
    for seq in sequences_list:
        category = seq.get('category', 'UNCATEGORIZED')
        categories[category].append(seq)

    # Generate Mermaid diagram
    mmd = "graph TD\n"
    mmd += '    Root["Orchestration"]\n\n'

    cat_idx = 0
    for category, seqs in list(categories.items())[:5]:  # Limit to 5 categories
        cat_id = f"Cat{cat_idx}"
        mmd += f'    {cat_id}["{category}<br/>{len(seqs)} sequences"]\n'
        mmd += f'    Root --> {cat_id}\n\n'

        # Show first few sequences in each category
        for seq_idx, seq in enumerate(seqs[:max_sequences]):
            seq_id = f"Seq{cat_idx}_{seq_idx}"
            seq_name = seq.get('name', 'unknown')
            tempo = seq.get('tempo', 100)
            mmd += f'    {seq_id}["{seq_name}<br/>Flow<br/>Tempo: {tempo}"]\n'
            mmd += f'    {cat_id} --> {seq_id}\n'

            # Show first movement
            movements = seq.get('movements', [])
            if movements:
                mov = movements[0]
                mov_id = f"Mov{cat_idx}_{seq_idx}_0"
                mov_name = mov.get('name', 'calls')
                beat_count = len(mov.get('beats', []))
                mmd += f'    {mov_id}["Movement: {mov_name}<br/>{beat_count} beats"]\n'
                mmd += f'    {seq_id} --> {mov_id}\n'

        if len(seqs) > max_sequences:
            note_id = f"NoteCat{cat_idx}"
            mmd += f'    {note_id}["... +{len(seqs) - max_sequences} more sequences"]\n'
            mmd += f'    {cat_id} --> {note_id}\n'

        mmd += '\n'
        cat_idx += 1

    mmd += '    style Root fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold\n'
    mmd += '    classDef category fill:#2196F3,stroke:#1565C0,color:#fff\n'
    mmd += '    classDef sequence fill:#9C27B0,stroke:#6A1B9A,color:#fff\n'

    return mmd

def generate_sequence_flow_diagram(ir: dict, sequences: dict, max_sequences: int = 3) -> str:
    """
    Generate a sequence flow diagram showing execution flow through sequences.
    Shows sequences with their movements and beats.
    """
    sequences_list = sequences.get('sequences', [])[:max_sequences]

    # Generate Mermaid diagram
    mmd = "graph TD\n"
    mmd += '    Root["Sequence Flows"]\n\n'

    for seq_idx, seq in enumerate(sequences_list):
        seq_id = f"Seq{seq_idx}"
        seq_name = seq.get('name', 'unknown')
        key = seq.get('key', 'C Major')
        tempo = seq.get('tempo', 100)

        mmd += f'    {seq_id}["{seq_name} Flow<br/>Key: {key}<br/>Tempo: {tempo}"]\n'
        mmd += f'    Root --> {seq_id}\n'

        # Show movements
        movements = seq.get('movements', [])
        for mov_idx, mov in enumerate(movements[:2]):  # Limit to 2 movements per sequence
            mov_id = f"Mov{seq_idx}_{mov_idx}"
            mov_name = mov.get('name', 'calls')
            beat_count = len(mov.get('beats', []))

            mmd += f'    {mov_id}["Movement: {mov_name}<br/>{beat_count} beats"]\n'
            mmd += f'    {seq_id} --> {mov_id}\n'

            # Show first few beats
            beats = mov.get('beats', [])
            for beat_idx, beat in enumerate(beats[:5]):  # Limit to 5 beats per movement
                beat_id = f"Beat{seq_idx}_{mov_idx}_{beat_idx}"
                beat_name = beat.get('name', 'unknown')
                timing = beat.get('timing', 'immediate')
                dynamics = beat.get('dynamics', 'mf')

                mmd += f'    {beat_id}["Beat {beat_idx + 1}: {beat_name}<br/>{timing} | {dynamics}"]\n'
                mmd += f'    {mov_id} --> {beat_id}\n'

            if len(beats) > 5:
                note_id = f"NoteBeats{seq_idx}_{mov_idx}"
                mmd += f'    {note_id}["... +{len(beats) - 5} more beats"]\n'
                mmd += f'    {mov_id} --> {note_id}\n'

    mmd += '\n    style Root fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold\n'
    mmd += '    classDef sequence fill:#9C27B0,stroke:#6A1B9A,color:#fff\n'
    mmd += '    classDef movement fill:#FF9800,stroke:#E65100,color:#fff\n'
    mmd += '    classDef beat fill:#F44336,stroke:#C62828,color:#fff\n'

    return mmd

def generate_svg_placeholder(diagram_type: str, width: int = 800, height: int = 600) -> str:
    """Generate a simple SVG placeholder"""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}">
  <rect width="{width}" height="{height}" fill="#f0f0f0" stroke="#999" stroke-width="1"/>
  <text x="{width//2}" y="{height//2}" text-anchor="middle" font-size="24" fill="#333">
    {diagram_type.replace('_', ' ').title()}
  </text>
  <text x="{width//2}" y="{height//2 + 40}" text-anchor="middle" font-size="14" fill="#999">
    (Mermaid diagram generated - use mermaid-cli to render)
  </text>
</svg>"""

def main():
    parser = argparse.ArgumentParser(description="Generate diagrams from IR and sequences")
    parser.add_argument("--input", required=True, help="Input sequences file path")
    parser.add_argument("--ir-path", required=True, help="Input IR (graph.json) file path")
    parser.add_argument("--output-dir", required=True, help="Output directory for diagrams")

    args = parser.parse_args()

    print("")
    print("=" * 70)
    print("MOVEMENT 4: VISUALIZATION & DIAGRAMS")
    print("=" * 70)
    print("")

    # Load IR
    print(f"[*] Loading IR from {args.ir_path}")
    ir = load_ir(args.ir_path)
    symbol_count = len(ir.get('symbols', []))
    call_count = len(ir.get('calls', []))
    print(f"    Loaded {symbol_count} symbols, {call_count} calls")

    # Load sequences
    print(f"[*] Loading sequences from {args.input}")
    with open(args.input, 'r', encoding='utf-8') as f:
        sequences = json.load(f)
    seq_count = len(sequences.get('sequences', []))
    print(f"    Loaded {seq_count} sequences")

    # Ensure output directory exists
    os.makedirs(args.output_dir, exist_ok=True)

    # Generate diagrams
    print("")
    print("[*] Generating call_graph diagram...")
    mmd = generate_call_graph_diagram(ir, max_nodes=50)
    mmd_path = os.path.join(args.output_dir, "call_graph.mmd")
    with open(mmd_path, 'w', encoding='utf-8') as f:
        f.write(mmd)
    print(f"    [OK] {mmd_path}")

    svg_path = os.path.join(args.output_dir, "call_graph.svg")
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(generate_svg_placeholder("call_graph"))
    print(f"    [OK] {svg_path}")

    print("")
    print("[*] Generating orchestration diagram...")
    mmd = generate_orchestration_diagram(ir, sequences, max_sequences=10)
    mmd_path = os.path.join(args.output_dir, "orchestration.mmd")
    with open(mmd_path, 'w', encoding='utf-8') as f:
        f.write(mmd)
    print(f"    [OK] {mmd_path}")

    svg_path = os.path.join(args.output_dir, "orchestration.svg")
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(generate_svg_placeholder("orchestration"))
    print(f"    [OK] {svg_path}")

    print("")
    print("[*] Generating sequence_flow diagram...")
    mmd = generate_sequence_flow_diagram(ir, sequences, max_sequences=3)
    mmd_path = os.path.join(args.output_dir, "sequence_flow.mmd")
    with open(mmd_path, 'w', encoding='utf-8') as f:
        f.write(mmd)
    print(f"    [OK] {mmd_path}")

    svg_path = os.path.join(args.output_dir, "sequence_flow.svg")
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(generate_svg_placeholder("sequence_flow"))
    print(f"    [OK] {svg_path}")

    print("")
    print("[OK] Movement 4 Complete: Visualization & Diagrams")
    print(f"   Output: {args.output_dir}")
    print("")

if __name__ == "__main__":
    main()

