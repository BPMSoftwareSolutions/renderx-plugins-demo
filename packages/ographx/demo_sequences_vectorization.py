#!/usr/bin/env python3
"""
Demo: Vectorize and Search Sequences from renderx-web

This script shows how to:
1. Load sequences.json
2. Create embeddings for each sequence
3. Store in vector database
4. Perform semantic search
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
    
    # Normalize to unit length
    magnitude = math.sqrt(sum(x * x for x in embedding))
    if magnitude > 0:
        embedding = [x / magnitude for x in embedding]
    
    return embedding

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculate cosine similarity between two vectors"""
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    return dot_product

def main():
    print("\n🎵 Vectorizing Sequences from renderx-web\n")
    print("=" * 70)
    
    # Load sequences
    sequences_path = Path('.ographx/artifacts/renderx-web/sequences/sequences.json')
    print(f"📦 Loading sequences from: {sequences_path}\n")
    
    with open(sequences_path, 'r') as f:
        data = json.load(f)
    
    sequences = data.get('sequences', [])
    print(f"✅ Loaded {len(sequences)} sequences\n")
    
    # Create embeddings for each sequence
    print("🔧 Generating embeddings...\n")
    sequence_embeddings: Dict[str, Tuple[List[float], Dict]] = {}
    
    for seq in sequences:
        seq_id = seq['id']
        seq_name = seq['name']
        call_count = seq.get('callCount', 0)
        
        # Create text representation of sequence
        text_parts = [
            seq_name,
            f"calls {call_count} functions",
        ]
        
        # Add beat information
        for movement in seq.get('movements', []):
            text_parts.append(movement['name'])
            for beat in movement.get('beats', []):
                event = beat.get('event', '')
                text_parts.append(event)
        
        text_to_embed = ' '.join(text_parts)
        embedding = generate_embedding(text_to_embed)
        
        metadata = {
            'id': seq_id,
            'name': seq_name,
            'callCount': call_count,
            'source': seq.get('source', {}),
        }
        
        sequence_embeddings[seq_id] = (embedding, metadata)
    
    print(f"✅ Generated {len(sequence_embeddings)} embeddings\n")
    
    # Example searches
    queries = [
        'canvas drag handlers',
        'component creation',
        'event publishing',
        'resize operations',
    ]
    
    print("🔍 Running semantic searches:\n")
    print("=" * 70)
    
    for query in queries:
        print(f"\n📌 Query: \"{query}\"")
        
        # Generate query embedding
        query_embedding = generate_embedding(query)
        
        # Search for similar sequences
        similarities = []
        for seq_id, (embedding, metadata) in sequence_embeddings.items():
            score = cosine_similarity(query_embedding, embedding)
            similarities.append((score, seq_id, metadata))
        
        # Sort by similarity (descending)
        similarities.sort(reverse=True)
        
        # Show top 5 results
        for idx, (score, seq_id, metadata) in enumerate(similarities[:5]):
            print(f"   {idx + 1}. {metadata['name']}")
            print(f"      Score: {(score * 100):.1f}%")
            print(f"      Calls: {metadata['callCount']}")
            if metadata['source'].get('file'):
                file_name = metadata['source']['file'].split('\\')[-1]
                print(f"      File: {file_name}")
    
    print("\n" + "=" * 70)
    print("\n✨ Demo complete!\n")

if __name__ == '__main__':
    main()

