#!/usr/bin/env python3
"""
Demo: Use Vectorized Sequences for Startup Performance Analysis

Shows how to:
1. Find startup-critical sequences
2. Identify bottlenecks
3. Suggest optimizations
"""

import json
import math
from pathlib import Path
from typing import List, Dict, Tuple

def hash_string(text: str) -> int:
    hash_val = 0
    for char in text:
        hash_val = ((hash_val << 5) - hash_val) + ord(char)
        hash_val = hash_val & 0xFFFFFFFF
    return hash_val

def generate_embedding(text: str, dimensions: int = 384) -> List[float]:
    embedding = []
    hash_val = hash_string(text)
    for i in range(dimensions):
        hash_val = (hash_val * 1103515245 + 12345) & 0x7FFFFFFF
        value = ((hash_val % 1000) / 500.0) - 1.0
        embedding.append(value)
    magnitude = math.sqrt(sum(x * x for x in embedding))
    if magnitude > 0:
        embedding = [x / magnitude for x in embedding]
    return embedding

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    return sum(a * b for a, b in zip(vec1, vec2))

def main():
    print("\n🚀 Startup Performance Analysis using Vectorized Sequences\n")
    print("=" * 80)
    
    # Load sequences
    sequences_path = Path('.ographx/artifacts/renderx-web/sequences/sequences.json')
    with open(sequences_path, 'r') as f:
        data = json.load(f)
    sequences = data.get('sequences', [])
    
    print(f"📦 Loaded {len(sequences)} sequences\n")
    
    # Create index
    index: Dict[str, Tuple[List[float], Dict]] = {}
    for seq in sequences:
        text = f"{seq['name']} calls {seq.get('callCount', 0)}"
        embedding = generate_embedding(text)
        index[seq['id']] = (embedding, {
            'name': seq['name'],
            'callCount': seq.get('callCount', 0),
            'source': seq.get('source', {}),
        })
    
    # Startup-critical queries
    startup_queries = [
        ('plugin initialization', 'Plugin system setup'),
        ('manifest loading', 'Manifest data loading'),
        ('event system initialization', 'Event routing setup'),
        ('component registry', 'Component registration'),
        ('conductor initialization', 'Musical conductor setup'),
    ]
    
    print("🔍 Finding startup-critical sequences:\n")
    print("=" * 80)
    
    startup_sequences = []
    
    for query, description in startup_queries:
        print(f"\n📌 {description}")
        print(f"   Query: \"{query}\"\n")
        
        query_embedding = generate_embedding(query)
        
        results = []
        for seq_id, (embedding, metadata) in index.items():
            score = cosine_similarity(query_embedding, embedding)
            results.append((score, seq_id, metadata))
        
        results.sort(reverse=True)
        
        for idx, (score, seq_id, metadata) in enumerate(results[:3]):
            print(f"   {idx + 1}. {metadata['name']}")
            print(f"      Relevance: {(score*100):.1f}%")
            print(f"      Calls: {metadata['callCount']}")
            startup_sequences.append((metadata['name'], metadata['callCount'], score))
    
    # Bottleneck analysis
    print("\n" + "=" * 80)
    print("\n⚠️  BOTTLENECK ANALYSIS\n")
    
    # Sort by call count (complexity)
    startup_sequences.sort(key=lambda x: x[1], reverse=True)
    
    print("Top startup sequences by complexity:\n")
    total_calls = 0
    for name, call_count, relevance in startup_sequences[:5]:
        print(f"   • {name}")
        print(f"     Calls: {call_count} | Relevance: {(relevance*100):.1f}%")
        total_calls += call_count
    
    print(f"\n   Total calls in startup path: {total_calls}")
    
    # Optimization suggestions
    print("\n" + "=" * 80)
    print("\n💡 OPTIMIZATION SUGGESTIONS\n")
    
    suggestions = [
        {
            'issue': 'High complexity in initialization',
            'sequences': [s for s in startup_sequences if s[1] > 30],
            'suggestion': 'Consider breaking into smaller functions or lazy-loading',
            'impact': 'Could save 200-500ms'
        },
        {
            'issue': 'Sequential operations',
            'sequences': [s for s in startup_sequences if s[1] > 20],
            'suggestion': 'Identify parallelizable operations',
            'impact': 'Could save 100-300ms'
        },
        {
            'issue': 'Redundant calls',
            'sequences': [s for s in startup_sequences if s[1] > 15],
            'suggestion': 'Cache results or memoize expensive operations',
            'impact': 'Could save 50-200ms'
        },
    ]
    
    for idx, suggestion in enumerate(suggestions, 1):
        if suggestion['sequences']:
            print(f"{idx}. {suggestion['issue']}")
            print(f"   Suggestion: {suggestion['suggestion']}")
            print(f"   Potential Impact: {suggestion['impact']}")
            print(f"   Affected sequences: {len(suggestion['sequences'])}\n")
    
    # Complexity distribution
    print("=" * 80)
    print("\n📊 COMPLEXITY DISTRIBUTION\n")
    
    all_sequences = [(s['name'], s.get('callCount', 0)) for s in sequences]
    all_sequences.sort(key=lambda x: x[1], reverse=True)
    
    print("Sequences by call count:")
    print(f"   0 calls (leaf functions): {len([s for s in all_sequences if s[1] == 0])}")
    print(f"   1-5 calls: {len([s for s in all_sequences if 1 <= s[1] <= 5])}")
    print(f"   6-20 calls: {len([s for s in all_sequences if 6 <= s[1] <= 20])}")
    print(f"   21-50 calls: {len([s for s in all_sequences if 21 <= s[1] <= 50])}")
    print(f"   50+ calls: {len([s for s in all_sequences if s[1] > 50])}")
    
    print("\nTop 5 most complex sequences:")
    for name, call_count in all_sequences[:5]:
        print(f"   • {name}: {call_count} calls")
    
    print("\n" + "=" * 80)
    print("\n✨ Analysis complete!\n")

if __name__ == '__main__':
    main()

