#!/usr/bin/env python3
"""
Advanced Demo: Vectorize and Search Sequences with Better Semantics

Features:
- Smarter text representation (includes call names)
- Better similarity scoring
- Detailed sequence information
- Pattern discovery
"""

import json
import math
from pathlib import Path
from typing import List, Dict, Tuple

def hash_string(text: str) -> int:
    """Simple hash function"""
    hash_val = 0
    for char in text:
        hash_val = ((hash_val << 5) - hash_val) + ord(char)
        hash_val = hash_val & 0xFFFFFFFF
    return hash_val

def generate_embedding(text: str, dimensions: int = 384) -> List[float]:
    """Generate deterministic embedding from text"""
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
    """Calculate cosine similarity between two vectors"""
    return sum(a * b for a, b in zip(vec1, vec2))

def extract_sequence_text(seq: Dict) -> str:
    """Extract meaningful text from sequence for embedding"""
    parts = [seq['name']]
    
    # Add call information
    call_count = seq.get('callCount', 0)
    if call_count > 0:
        parts.append(f"makes {call_count} calls")
    
    # Extract function names from beats
    calls_made = set()
    for movement in seq.get('movements', []):
        for beat in movement.get('beats', []):
            event = beat.get('event', '')
            if event.startswith('call:'):
                call_name = event[5:]  # Remove 'call:' prefix
                calls_made.add(call_name)
    
    if calls_made:
        parts.append(' '.join(sorted(calls_made)))
    
    return ' '.join(parts)

def main():
    print("\n🎵 Advanced Sequence Vectorization & Search\n")
    print("=" * 80)
    
    # Load sequences
    sequences_path = Path('.ographx/artifacts/renderx-web/sequences/sequences.json')
    print(f"📦 Loading sequences from: {sequences_path}\n")
    
    with open(sequences_path, 'r') as f:
        data = json.load(f)
    
    sequences = data.get('sequences', [])
    print(f"✅ Loaded {len(sequences)} sequences")
    
    # Statistics
    call_counts = [seq.get('callCount', 0) for seq in sequences]
    print(f"   Min calls: {min(call_counts)}, Max calls: {max(call_counts)}, Avg: {sum(call_counts)/len(call_counts):.1f}\n")
    
    # Create embeddings with better text representation
    print("🔧 Generating embeddings with semantic text...\n")
    sequence_embeddings: Dict[str, Tuple[List[float], Dict]] = {}
    
    for seq in sequences:
        seq_id = seq['id']
        text_to_embed = extract_sequence_text(seq)
        embedding = generate_embedding(text_to_embed)
        
        # Extract calls made
        calls_made = []
        for movement in seq.get('movements', []):
            for beat in movement.get('beats', []):
                event = beat.get('event', '')
                if event.startswith('call:'):
                    calls_made.append(event[5:])
        
        metadata = {
            'id': seq_id,
            'name': seq['name'],
            'callCount': seq.get('callCount', 0),
            'calls': calls_made,
            'source': seq.get('source', {}),
        }
        
        sequence_embeddings[seq_id] = (embedding, metadata)
    
    print(f"✅ Generated {len(sequence_embeddings)} embeddings\n")
    
    # Advanced searches
    queries = [
        ('drag handlers', 'Find drag-related event handlers'),
        ('publish events', 'Find event publishing sequences'),
        ('resize', 'Find resize-related operations'),
        ('create component', 'Find component creation'),
        ('load plugin', 'Find plugin loading'),
    ]
    
    print("🔍 Running semantic searches:\n")
    print("=" * 80)
    
    for query, description in queries:
        print(f"\n📌 {description}")
        print(f"   Query: \"{query}\"\n")
        
        query_embedding = generate_embedding(query)
        
        similarities = []
        for seq_id, (embedding, metadata) in sequence_embeddings.items():
            score = cosine_similarity(query_embedding, embedding)
            similarities.append((score, seq_id, metadata))
        
        similarities.sort(reverse=True)
        
        for idx, (score, seq_id, metadata) in enumerate(similarities[:3]):
            print(f"   {idx + 1}. {metadata['name']}")
            print(f"      Similarity: {(score * 100):.1f}%")
            print(f"      Calls: {metadata['callCount']}")
            if metadata['calls']:
                print(f"      Makes: {', '.join(metadata['calls'][:3])}")
                if len(metadata['calls']) > 3:
                    print(f"             ... and {len(metadata['calls']) - 3} more")
            if metadata['source'].get('file'):
                file_name = metadata['source']['file'].split('\\')[-1]
                line_range = f"lines {metadata['source'].get('startLine', '?')}-{metadata['source'].get('endLine', '?')}"
                print(f"      Location: {file_name} ({line_range})")
            print()
    
    # Pattern discovery
    print("=" * 80)
    print("\n🎯 Pattern Discovery: Functions with most calls\n")
    
    sorted_by_calls = sorted(
        sequence_embeddings.items(),
        key=lambda x: x[1][1]['callCount'],
        reverse=True
    )
    
    for seq_id, (_, metadata) in sorted_by_calls[:5]:
        print(f"   • {metadata['name']}")
        print(f"     Calls: {metadata['callCount']}")
        if metadata['source'].get('file'):
            file_name = metadata['source']['file'].split('\\')[-1]
            print(f"     File: {file_name}")
        print()
    
    print("=" * 80)
    print("\n✨ Demo complete!\n")

if __name__ == '__main__':
    main()

