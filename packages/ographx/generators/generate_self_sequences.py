#!/usr/bin/env python3
"""
Generate Conductor sequences from OgraphX self_graph.json IR.
Converts symbols and calls into movements and beats.
"""
import json
import re
from dataclasses import dataclass
from typing import List, Dict, Set

@dataclass
class CallEdge:
    frm: str
    to: str
    name: str
    line: int

def build_call_graph(data: dict) -> Dict[str, List[CallEdge]]:
    """Build adjacency list from calls."""
    graph = {}
    for call in data['calls']:
        frm = call['frm']
        if frm not in graph:
            graph[frm] = []
        graph[frm].append(CallEdge(
            frm=call['frm'],
            to=call['to'],
            name=call['name'],
            line=call['line']
        ))
    return graph

def dfs_call_chain(start_id: str, call_graph: Dict[str, List[CallEdge]], 
                   visited: Set[str] = None, depth: int = 0, max_depth: int = 3) -> List[CallEdge]:
    """DFS to build enriched call chain."""
    if visited is None:
        visited = set()
    if depth > max_depth or start_id in visited:
        return []
    visited.add(start_id)
    chain = []
    for call in call_graph.get(start_id, []):
        chain.append(call)
        if call.to:
            chain.extend(dfs_call_chain(call.to, call_graph, visited, depth + 1, max_depth))
    return chain

def generate_sequences(ir_path: str, out_path: str):
    """Generate sequences from IR."""
    with open(ir_path) as f:
        data = json.load(f)
    
    call_graph = build_call_graph(data)
    sequences = []
    
    # Find exported symbols
    exported = [s for s in data['symbols'] if s.get('exported', False)]
    
    for sym in exported:
        sym_id = sym['id']
        beats = []
        
        # Get enriched call chain via DFS
        call_chain = dfs_call_chain(sym_id, call_graph, max_depth=3)
        
        # Deduplicate
        seen = set()
        unique_calls = []
        for c in call_chain:
            key = (c.frm, c.name, c.line)
            if key not in seen:
                seen.add(key)
                unique_calls.append(c)
        
        # Convert to beats
        for i, c in enumerate(unique_calls, start=1):
            beats.append({
                "beat": i,
                "event": f"call:{c.name}",
                "handler": c.name,
                "timing": "immediate",
                "dynamics": "mf"
            })
        
        # Create sequence
        seq_id = re.sub(r'[^A-Za-z0-9_\-\.]', '_', sym_id)
        sequences.append({
            "id": seq_id,
            "name": f"{sym['name']} Flow",
            "category": "analysis",
            "key": "C Major",
            "tempo": 100,
            "movements": [{
                "id": "calls",
                "beats": beats or [{
                    "beat": 1, "event": "noop", "handler": "noop",
                    "timing": "immediate", "dynamics": "pp"
                }]
            }]
        })
    
    # Write bundle
    bundle = {
        "version": "0.1.0",
        "contracts": data.get('contracts', []),
        "sequences": sequences
    }
    
    with open(out_path, 'w') as f:
        json.dump(bundle, f, indent=2)
    
    print(f"[OK] Generated {len(sequences)} sequences from {len(exported)} exported symbols")
    print(f"[OK] Sequences written to {out_path}")

if __name__ == '__main__':
    import os
    # Paths relative to packages/ographx/
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ir_path = os.path.join(base_dir, '.ographx', 'self-observation', 'self_graph.json')
    out_path = os.path.join(base_dir, '.ographx', 'sequences', 'self_sequences.json')
    generate_sequences(ir_path, out_path)

