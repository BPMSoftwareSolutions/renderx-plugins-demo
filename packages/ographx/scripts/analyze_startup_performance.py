#!/usr/bin/env python3
"""
Startup Performance Analysis
Analyzes the application startup sequence to identify performance bottlenecks.
Uses OgraphX IR and sequences to trace initialization flow and identify slow paths.
"""
import json
import sys
from pathlib import Path
from collections import defaultdict

def load_artifact(artifact_path):
    """Load artifact JSON file"""
    try:
        with open(artifact_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Failed to load {artifact_path}: {e}")
        return None

def analyze_startup_sequence(sequences_data):
    """Analyze startup-related sequences"""
    startup_sequences = []
    
    if not sequences_data or 'sequences' not in sequences_data:
        return startup_sequences
    
    for seq in sequences_data.get('sequences', []):
        seq_id = seq.get('id', '')
        if any(keyword in seq_id.lower() for keyword in 
               ['startup', 'init', 'bootstrap', 'load', 'register']):
            startup_sequences.append(seq)
    
    return startup_sequences

def analyze_call_chains(graph_data, startup_functions):
    """Analyze call chains from startup functions"""
    call_chains = defaultdict(list)
    
    if not graph_data or 'calls' not in graph_data:
        return call_chains
    
    # Build reverse index for quick lookup
    calls_by_caller = defaultdict(list)
    for call in graph_data.get('calls', []):
        caller = call.get('caller', '')
        callee = call.get('callee', '')
        calls_by_caller[caller].append(callee)
    
    # Trace call chains from startup functions
    def trace_chain(func, depth=0, visited=None):
        if visited is None:
            visited = set()
        if func in visited or depth > 5:
            return []
        
        visited.add(func)
        chain = [func]
        
        for callee in calls_by_caller.get(func, [])[:3]:  # Limit to top 3
            chain.extend(trace_chain(callee, depth + 1, visited))
        
        return chain
    
    for func in startup_functions:
        call_chains[func] = trace_chain(func)
    
    return call_chains

def identify_bottlenecks(graph_data, god_functions_data):
    """Identify functions called during startup that are god functions"""
    bottlenecks = []

    # Extract god function names from the data structure
    god_funcs = god_functions_data.get('god_functions', []) if isinstance(god_functions_data, dict) else []
    god_func_names = {gf['symbol'].split('::')[-1] for gf in god_funcs}

    if not graph_data or 'calls' not in graph_data:
        return bottlenecks

    for call in graph_data.get('calls', []):
        callee = call.get('callee', '')
        if callee in god_func_names:
            bottlenecks.append({
                'function': callee,
                'caller': call.get('caller', ''),
                'type': 'god_function'
            })

    return bottlenecks

def main():
    artifact_dir = Path(__file__).parent.parent / '.ographx' / 'artifacts' / 'renderx-web'

    print("🔍 Startup Performance Analysis")
    print("=" * 80)

    # Load artifacts
    sequences_data = load_artifact(artifact_dir / 'sequences' / 'sequences.json')
    graph_data = load_artifact(artifact_dir / 'ir' / 'graph.json')
    god_functions = load_artifact(artifact_dir / 'god-functions.json') or []

    if not all([sequences_data, graph_data]):
        print("❌ Missing required artifacts")
        return 1

    # Analyze startup sequences
    startup_seqs = analyze_startup_sequence(sequences_data)
    print(f"\n📊 Startup Sequences Found: {len(startup_seqs)}")
    for seq in startup_seqs[:5]:
        print(f"  • {seq.get('id', 'unknown')}")

    # Extract startup function names from symbols
    startup_functions = set()
    for symbol in graph_data.get('symbols', []):
        if isinstance(symbol, dict):
            name = symbol.get('name', '')
            if any(kw in name.lower() for kw in ['init', 'startup', 'bootstrap']):
                startup_functions.add(name)

    print(f"\n🚀 Startup Functions: {len(startup_functions)}")
    for func in sorted(startup_functions)[:10]:
        print(f"  • {func}")
    
    # Analyze call chains
    call_chains = analyze_call_chains(graph_data, startup_functions)
    print(f"\n🔗 Call Chain Analysis:")
    for func, chain in list(call_chains.items())[:5]:
        print(f"  {func}")
        for i, called in enumerate(chain[1:6]):
            print(f"    {'└─' if i == len(chain)-2 else '├─'} {called}")
    
    # Identify bottlenecks
    bottlenecks = identify_bottlenecks(graph_data, god_functions)
    print(f"\n⚠️  Startup Bottlenecks (God Functions): {len(bottlenecks)}")
    for bn in bottlenecks[:10]:
        print(f"  • {bn['function']} (called by {bn['caller']})")
    
    print("\n" + "=" * 80)
    print("✅ Analysis complete")
    return 0

if __name__ == '__main__':
    sys.exit(main())

