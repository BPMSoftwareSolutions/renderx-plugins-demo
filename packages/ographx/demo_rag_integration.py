#!/usr/bin/env python3
"""
Demo: Integrate Sequences into RAG System

Shows how to:
1. Load sequences and IR graph
2. Create a unified search index
3. Query across both symbols and sequences
4. Use for startup performance analysis
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
    print("\n🎵 RAG Integration: Sequences + IR Graph\n")
    print("=" * 80)
    
    # Load both artifacts
    sequences_path = Path('.ographx/artifacts/renderx-web/sequences/sequences.json')
    ir_path = Path('.ographx/artifacts/renderx-web/ir/graph.json')
    
    print(f"📦 Loading artifacts...\n")
    
    with open(sequences_path, 'r') as f:
        sequences_data = json.load(f)
    sequences = sequences_data.get('sequences', [])
    
    with open(ir_path, 'r') as f:
        ir_data = json.load(f)
    symbols = ir_data.get('symbols', [])
    calls = ir_data.get('calls', [])
    
    print(f"✅ Sequences: {len(sequences)}")
    print(f"✅ Symbols: {len(symbols)}")
    print(f"✅ Calls: {len(calls)}\n")
    
    # Create unified index
    print("🔧 Building unified search index...\n")
    
    index: Dict[str, Tuple[List[float], Dict]] = {}
    
    # Index sequences
    for seq in sequences:
        seq_id = seq['id']
        text = f"{seq['name']} calls {seq.get('callCount', 0)} functions"
        embedding = generate_embedding(text)
        index[seq_id] = (embedding, {
            'type': 'sequence',
            'name': seq['name'],
            'callCount': seq.get('callCount', 0),
            'source': seq.get('source', {}),
        })
    
    # Index symbols
    for symbol in symbols:
        sym_id = symbol['id']
        text = f"{symbol['name']} {symbol.get('kind', '')} {symbol.get('class_name', '')}"
        embedding = generate_embedding(text)
        index[sym_id] = (embedding, {
            'type': 'symbol',
            'name': symbol['name'],
            'kind': symbol.get('kind', ''),
            'file': symbol.get('file', ''),
            'range': symbol.get('range', []),
        })
    
    print(f"✅ Indexed {len(index)} items (sequences + symbols)\n")
    
    # Use case: Find startup bottlenecks
    print("=" * 80)
    print("\n🎯 Use Case: Startup Performance Analysis\n")
    
    startup_queries = [
        ('initialization', 'Find initialization sequences'),
        ('plugin loading', 'Find plugin loading sequences'),
        ('manifest loading', 'Find manifest-related operations'),
        ('event system setup', 'Find event system initialization'),
    ]
    
    for query, description in startup_queries:
        print(f"📌 {description}")
        print(f"   Query: \"{query}\"\n")
        
        query_embedding = generate_embedding(query)
        
        results = []
        for item_id, (embedding, metadata) in index.items():
            score = cosine_similarity(query_embedding, embedding)
            results.append((score, item_id, metadata))
        
        results.sort(reverse=True)
        
        # Show top results by type
        sequences_found = [r for r in results if r[2]['type'] == 'sequence'][:2]
        symbols_found = [r for r in results if r[2]['type'] == 'symbol'][:2]
        
        if sequences_found:
            print("   Sequences:")
            for score, item_id, metadata in sequences_found:
                print(f"     • {metadata['name']} ({(score*100):.1f}%)")
                print(f"       Calls: {metadata['callCount']}")
        
        if symbols_found:
            print("   Symbols:")
            for score, item_id, metadata in symbols_found:
                print(f"     • {metadata['name']} ({(score*100):.1f}%)")
                print(f"       Kind: {metadata['kind']}")
        
        print()
    
    # Complexity analysis
    print("=" * 80)
    print("\n📊 Complexity Analysis\n")
    
    # Find sequences with most calls
    complex_sequences = sorted(
        [(s['id'], s['name'], s.get('callCount', 0)) for s in sequences],
        key=lambda x: x[2],
        reverse=True
    )[:5]
    
    print("Top 5 most complex sequences:")
    for seq_id, name, call_count in complex_sequences:
        print(f"   • {name}: {call_count} calls")
    
    print("\n" + "=" * 80)
    print("\n✨ RAG Integration demo complete!\n")

if __name__ == '__main__':
    main()

