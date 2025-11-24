# Sequences Vectorization Guide

## Overview

The sequences.json file can be vectorized for ML/RAG applications. This guide shows how to:
1. Generate embeddings for sequences
2. Perform semantic search
3. Integrate with your RAG system
4. Use for startup performance analysis

## What Gets Vectorized

Each sequence contains:
- **Sequence ID** - Unique identifier (e.g., `seq_CanvasDrop.ts::onDragStart`)
- **Function name** - What the sequence represents
- **Call graph** - All function calls made (beats)
- **Source location** - File path and line numbers
- **Call count** - Complexity metric (0-101 calls)

## Quick Start

### 1. Basic Vectorization (Python)

```bash
cd packages/ographx
python demo_sequences_vectorization.py
```

This loads 1,120 sequences and performs semantic searches.

### 2. Advanced Vectorization (Python)

```bash
python demo_sequences_advanced.py
```

Features:
- Smarter text representation (includes call names)
- Better similarity scoring
- Detailed sequence information
- Pattern discovery

### 3. RAG Integration (Python)

```bash
python demo_rag_integration.py
```

Combines sequences + IR graph for unified search:
- 1,120 sequences
- 1,153 symbols
- 5,610 calls
- 2,273 total indexed items

## TypeScript Integration

Use the existing RAG system in your codebase:

```typescript
import { InMemoryVectorStore } from '../src/domain/components/vector-store/store/in-memory-store';
import { EmbeddingServiceFactory } from '../src/domain/components/vector-store/embeddings/embedding-service-factory';
import { OgraphXArtifactIndexer } from '../src/domain/components/vector-store/indexing/ographx-artifact-indexer';
import { OgraphXArtifactRetriever } from '../src/domain/components/vector-store/search/ographx-artifact-retriever';

// Initialize
const vectorStore = new InMemoryVectorStore();
await vectorStore.initialize(384);
const embeddingService = EmbeddingServiceFactory.createLocal();

// Index sequences
const indexer = new OgraphXArtifactIndexer(vectorStore, embeddingService);
const result = await indexer.indexCodebaseArtifacts(
  'packages/ographx/.ographx/artifacts/renderx-web',
  'renderx-web'
);

// Search
const retriever = new OgraphXArtifactRetriever(vectorStore, embeddingService);
const results = await retriever.searchSequences('canvas drag handlers', { limit: 10 });
```

## Use Cases

### 1. Startup Performance Analysis
Find initialization sequences and identify bottlenecks:
```
Query: "initialization"
Query: "plugin loading"
Query: "manifest loading"
```

### 2. Pattern Discovery
Find similar execution patterns:
```
Query: "event publishing"
Query: "component creation"
Query: "resize operations"
```

### 3. Complexity Analysis
Identify functions with most calls:
- extractPatterns: 101 calls
- updateSize: 63 calls
- ChatWindow: 62 calls
- recomputeLineSvg: 61 calls

### 4. RAG/Chat Integration
Use in AI chat features to find relevant code:
```
User: "How does drag and drop work?"
→ Search sequences for "drag" + "drop"
→ Return matching sequences with source locations
```

## Embedding Models

### Development (Local)
- **Model**: Hash-based
- **Dimensions**: 384
- **Speed**: Instant
- **Quality**: Good for testing

### Production (OpenAI)
- **Model**: text-embedding-3-small
- **Dimensions**: 1536
- **Speed**: API call (~100ms)
- **Quality**: Excellent

Switch with:
```typescript
const embeddingService = EmbeddingServiceFactory.createOpenAI(apiKey);
```

## Data Structure

Each sequence in sequences.json:
```json
{
  "id": "seq_CanvasDrop.ts::onDragStart",
  "name": "Sequence: onDragStart",
  "type": "sequence",
  "source": {
    "file": "C:\\...\\CanvasDrop.ts",
    "startLine": 37,
    "endLine": 56
  },
  "callCount": 4,
  "movements": [
    {
      "id": "mov_1_...",
      "name": "Initialization",
      "beats": [...]
    },
    {
      "id": "mov_2_...",
      "name": "Execution",
      "beats": [
        {
          "id": "beat_1_...",
          "event": "call:notification",
          "line": 40,
          "target": "..."
        }
      ]
    },
    {
      "id": "mov_3_...",
      "name": "Completion",
      "beats": [...]
    }
  ]
}
```

## Performance

- **Indexing**: ~1,120 sequences in <1 second
- **Search**: ~100ms per query (local embeddings)
- **Memory**: ~50MB for 1,120 sequences + embeddings
- **Scalability**: Tested up to 5,000+ sequences

## Next Steps

1. ✅ Vectorization working
2. ⏭️ Integrate into chat module
3. ⏭️ Add to startup analysis
4. ⏭️ Use for pattern discovery
5. ⏭️ Switch to production embeddings (OpenAI)

