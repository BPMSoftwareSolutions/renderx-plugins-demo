#!/usr/bin/env python3
"""
Demo: Leverage Sequence Features for Analysis

Shows how to use the rich feature set in sequences.json for:
1. Code navigation
2. Complexity analysis
3. Dependency analysis
4. Testing strategy
5. Refactoring guidance
"""

import json
from pathlib import Path
from collections import defaultdict
from typing import List, Dict, Any

def main():
    print("\n🎵 Sequence Features - Advanced Analysis\n")
    print("=" * 80)
    
    # Load sequences
    with open('.ographx/artifacts/renderx-web/sequences/sequences.json', 'r') as f:
        data = json.load(f)
    sequences = data.get('sequences', [])
    
    print(f"📊 Loaded {len(sequences)} sequences\n")
    
    # ========== USE CASE 1: CODE NAVIGATION ==========
    print("=" * 80)
    print("\n🔍 USE CASE 1: CODE NAVIGATION\n")
    
    # Find a specific sequence
    target_seq = next((s for s in sequences if 'generateSceneKeyframes' in s['name']), None)
    if target_seq:
        print(f"📍 Found: {target_seq['name']}")
        print(f"   File: {target_seq['source']['file']}")
        print(f"   Lines: {target_seq['source']['startLine']}-{target_seq['source']['endLine']}")
        print(f"   Calls: {target_seq['callCount']}")
        
        # Show beats with line numbers
        print(f"\n   Execution flow:")
        for mov in target_seq['movements']:
            if mov['name'] == 'Execution':
                for beat in mov['beats'][:3]:
                    line = beat.get('line', 'N/A')
                    target = beat.get('target', 'N/A')
                    print(f"     • Line {line}: {beat['event']} → {target}")
    
    # ========== USE CASE 2: COMPLEXITY ANALYSIS ==========
    print("\n" + "=" * 80)
    print("\n📈 USE CASE 2: COMPLEXITY ANALYSIS\n")
    
    # Complexity distribution
    call_ranges = {
        '0 calls': 0,
        '1-5 calls': 0,
        '6-20 calls': 0,
        '21-50 calls': 0,
        '50+ calls': 0,
    }
    
    for seq in sequences:
        calls = seq.get('callCount', 0)
        if calls == 0:
            call_ranges['0 calls'] += 1
        elif calls <= 5:
            call_ranges['1-5 calls'] += 1
        elif calls <= 20:
            call_ranges['6-20 calls'] += 1
        elif calls <= 50:
            call_ranges['21-50 calls'] += 1
        else:
            call_ranges['50+ calls'] += 1
    
    print("Complexity distribution:")
    for range_name, count in call_ranges.items():
        pct = (count / len(sequences)) * 100
        bar = '█' * int(pct / 2)
        print(f"  {range_name:15} {count:4} ({pct:5.1f}%) {bar}")
    
    # ========== USE CASE 3: DEPENDENCY ANALYSIS ==========
    print("\n" + "=" * 80)
    print("\n🔗 USE CASE 3: DEPENDENCY ANALYSIS\n")
    
    # Extract all targets
    targets = defaultdict(int)
    for seq in sequences:
        for mov in seq.get('movements', []):
            for beat in mov.get('beats', []):
                if 'target' in beat:
                    targets[beat['target']] += 1
    
    # Top called functions
    top_targets = sorted(targets.items(), key=lambda x: -x[1])[:10]
    print("Top 10 most-called functions:")
    for target, count in top_targets:
        print(f"  • {target}: {count} calls")
    
    # ========== USE CASE 4: TESTING STRATEGY ==========
    print("\n" + "=" * 80)
    print("\n🧪 USE CASE 4: TESTING STRATEGY\n")
    
    # Generate test cases from beats
    test_seq = next((s for s in sequences if s.get('callCount', 0) > 5), None)
    if test_seq:
        print(f"Test suite for: {test_seq['name']}")
        print(f"Total beats: {sum(len(m['beats']) for m in test_seq['movements'])}")
        print(f"\nGenerated test cases:")
        
        for mov in test_seq['movements']:
            print(f"\n  describe('{mov['name']}', () => {{")
            for beat in mov['beats'][:3]:  # Show first 3
                event = beat['event']
                line = beat.get('line', 'N/A')
                print(f"    it('should handle {event} at line {line}', () => {{")
                print(f"      // Test implementation")
                print(f"    }});")
            if len(mov['beats']) > 3:
                print(f"    // ... {len(mov['beats']) - 3} more tests")
            print(f"  }});")
    
    # ========== USE CASE 5: REFACTORING GUIDANCE ==========
    print("\n" + "=" * 80)
    print("\n🔧 USE CASE 5: REFACTORING GUIDANCE\n")
    
    # Find refactoring candidates
    refactoring_candidates = [
        s for s in sequences 
        if s.get('callCount', 0) > 50
    ]
    
    print(f"Found {len(refactoring_candidates)} refactoring candidates (>50 calls):\n")
    
    for seq in refactoring_candidates[:5]:
        calls = seq['callCount']
        file = seq['source']['file'].split('\\')[-1]
        
        # Estimate refactoring effort
        if calls > 80:
            effort = "HIGH"
            strategy = "Extract multiple functions"
        elif calls > 50:
            effort = "MEDIUM"
            strategy = "Extract 2-3 functions"
        else:
            effort = "LOW"
            strategy = "Extract 1-2 functions"
        
        print(f"  • {seq['name']}")
        print(f"    File: {file}")
        print(f"    Calls: {calls}")
        print(f"    Effort: {effort}")
        print(f"    Strategy: {strategy}")
        print()
    
    # ========== SUMMARY ==========
    print("=" * 80)
    print("\n✨ SEQUENCE FEATURES ENABLE:\n")
    print("  ✅ Code Navigation - Jump to source from sequences")
    print("  ✅ Complexity Analysis - Identify god functions")
    print("  ✅ Dependency Analysis - Understand call graphs")
    print("  ✅ Testing Strategy - Generate tests from beats")
    print("  ✅ Refactoring Guidance - Prioritize improvements")
    print("  ✅ Performance Analysis - Find bottlenecks")
    print("  ✅ Trend Tracking - Monitor metrics over time")
    print()
    print("=" * 80)
    print("\n🎯 Next: Build tooling to leverage these features!\n")

if __name__ == '__main__':
    main()

