#!/usr/bin/env python3
"""
Startup Performance Report
Generates a detailed report on startup performance using OgraphX analysis.
Identifies initialization bottlenecks, parallel opportunities, and optimization targets.
"""
import json
from pathlib import Path
from collections import defaultdict

def load_json(path):
    """Load JSON file"""
    try:
        with open(path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Error loading {path}: {e}")
        return None

def analyze_initialization_order(graph_data):
    """Analyze the order and dependencies of initialization functions"""
    init_funcs = {}
    
    for symbol in graph_data.get('symbols', []):
        if isinstance(symbol, dict):
            name = symbol.get('name', '')
            if any(kw in name.lower() for kw in ['init', 'startup', 'bootstrap']):
                init_funcs[name] = {
                    'callers': [],
                    'callees': [],
                    'file': symbol.get('file', ''),
                    'line': symbol.get('line', 0)
                }
    
    # Build call graph
    for call in graph_data.get('calls', []):
        caller = call.get('caller', '')
        callee = call.get('callee', '')
        
        if caller in init_funcs:
            if callee not in init_funcs[caller]['callees']:
                init_funcs[caller]['callees'].append(callee)
        
        if callee in init_funcs:
            if caller not in init_funcs[callee]['callers']:
                init_funcs[callee]['callers'].append(caller)
    
    return init_funcs

def find_parallel_opportunities(init_funcs):
    """Find initialization functions that could run in parallel"""
    parallel_groups = []
    
    # Functions with no dependencies can run in parallel
    independent = [name for name, data in init_funcs.items() if not data['callers']]
    
    if independent:
        parallel_groups.append({
            'type': 'independent',
            'functions': independent,
            'reason': 'No callers - can run in parallel'
        })
    
    return parallel_groups

def analyze_god_functions_in_startup(god_functions_data, init_funcs):
    """Identify god functions called during startup"""
    god_funcs = god_functions_data.get('god_functions', [])
    startup_gods = []
    
    for gf in god_funcs:
        symbol = gf.get('symbol', '')
        func_name = symbol.split('::')[-1]
        
        # Check if this god function is called by any init function
        for init_name, init_data in init_funcs.items():
            if func_name in init_data['callees']:
                startup_gods.append({
                    'name': func_name,
                    'rank': gf.get('rank', 0),
                    'calls': gf.get('metrics', {}).get('total_calls', 0),
                    'called_by': init_name,
                    'file': gf.get('file', '')
                })
    
    return startup_gods

def main():
    artifact_dir = Path(__file__).parent.parent / '.ographx' / 'artifacts' / 'renderx-web'
    
    print("\n" + "=" * 80)
    print("🚀 STARTUP PERFORMANCE ANALYSIS REPORT")
    print("=" * 80)
    
    # Load data
    graph_data = load_json(artifact_dir / 'ir' / 'graph.json')
    god_functions_data = load_json(artifact_dir / 'god-functions.json')
    
    if not graph_data:
        print("❌ Cannot load graph data")
        return 1
    
    # Analyze initialization order
    init_funcs = analyze_initialization_order(graph_data)
    print(f"\n📋 Initialization Functions: {len(init_funcs)}")
    for name in sorted(init_funcs.keys()):
        data = init_funcs[name]
        print(f"  • {name}")
        if data['callees']:
            print(f"    └─ calls: {', '.join(data['callees'][:3])}")
    
    # Find parallel opportunities
    parallel = find_parallel_opportunities(init_funcs)
    print(f"\n⚡ Parallelization Opportunities:")
    for group in parallel:
        print(f"  {group['reason']}")
        for func in group['functions'][:5]:
            print(f"    • {func}")
    
    # Analyze god functions in startup
    if god_functions_data:
        startup_gods = analyze_god_functions_in_startup(god_functions_data, init_funcs)
        print(f"\n⚠️  God Functions in Startup Path: {len(startup_gods)}")
        for god in startup_gods[:5]:
            print(f"  • {god['name']} (rank #{god['rank']}, {god['calls']} calls)")
            print(f"    └─ called by: {god['called_by']}")
    
    # Recommendations
    print(f"\n💡 RECOMMENDATIONS:")
    print(f"  1. Profile initializeCommunicationSystem - likely critical path")
    print(f"  2. Consider lazy-loading non-critical plugins")
    print(f"  3. Parallelize independent init functions")
    print(f"  4. Cache manifest data to avoid re-parsing")
    print(f"  5. Defer non-critical validation (e.g., startup validation)")
    
    print("\n" + "=" * 80)
    return 0

if __name__ == '__main__':
    import sys
    sys.exit(main())

