# Quick Start: Sequences Vectorization

## 30-Second Overview

Your sequences.json file contains 1,120 function execution flows. Each can be converted to a 384-dimensional vector for semantic search.

## Run the Demos

```bash
cd packages/ographx

# Basic demo - semantic search
python demo_sequences_vectorization.py

# Advanced demo - better semantics
python demo_sequences_advanced.py

# RAG integration - unified search
python demo_rag_integration.py

# Startup analysis - find bottlenecks
python demo_startup_analysis.py
```

## What You Get

### Search Results
```
Query: "drag handlers"
1. Sequence: generateConnectionPaths (15.6% match)
   Calls: 1
   File: animation-coordinator.ts (lines 167-195)

2. Sequence: getCanvasRect (15.5% match)
   Calls: 2
   File: select.overlay.dom.stage-crew.ts (lines 35-37)
```

### Complexity Analysis
```
Top 5 most complex sequences:
• extractPatterns: 101 calls
• updateSize: 63 calls
• ChatWindow: 62 calls
• recomputeLineSvg: 61 calls
• generatePresentationJS: 56 calls
```

### Startup Bottlenecks
```
collectCssClasses: 20 calls
getCurrentTheme: 7 calls
inferSequenceName: 6 calls
loadSpriteLibrary: 5 calls
_handleDeleteClass: 5 calls
```

## Use in TypeScript

```typescript
import { InMemoryVectorStore } from '../src/domain/components/vector-store/store/in-memory-store';
import { EmbeddingServiceFactory } from '../src/domain/components/vector-store/embeddings/embedding-service-factory';
import { OgraphXArtifactIndexer } from '../src/domain/components/vector-store/indexing/ographx-artifact-indexer';
import { OgraphXArtifactRetriever } from '../src/domain/components/vector-store/search/ographx-artifact-retriever';

// Initialize
const vectorStore = new InMemoryVectorStore();
await vectorStore.initialize(384);
const embeddingService = EmbeddingServiceFactory.createLocal();

// Index
const indexer = new OgraphXArtifactIndexer(vectorStore, embeddingService);
await indexer.indexCodebaseArtifacts(
  'packages/ographx/.ographx/artifacts/renderx-web',
  'renderx-web'
);

// Search
const retriever = new OgraphXArtifactRetriever(vectorStore, embeddingService);
const results = await retriever.searchSequences('canvas drag handlers', { limit: 10 });

// Results
results.forEach(r => {
  console.log(`${r.id}: ${(r.score * 100).toFixed(1)}%`);
});
```

## Key Numbers

| Metric | Value |
|--------|-------|
| Total sequences | 1,120 |
| Indexing time | <1 second |
| Search time | ~100ms |
| Embedding size | 384 dimensions |
| Memory usage | ~50MB |

## What Gets Vectorized

Each sequence includes:
- ✅ Function name
- ✅ Call graph (all function calls)
- ✅ Source location (file + line numbers)
- ✅ Complexity (call count)
- ✅ Execution flow (movements + beats)

## Common Queries

```
"drag handlers"           → Find drag-related code
"component creation"      → Find component setup
"event publishing"        → Find event emission
"resize operations"       → Find resize logic
"plugin loading"          → Find plugin initialization
"initialization"          → Find startup sequences
```

## Next Steps

1. Run the demos to see it in action
2. Read `SEQUENCES_VECTORIZATION_GUIDE.md` for details
3. Integrate into your chat module
4. Use for startup performance analysis
5. Switch to OpenAI embeddings for production

## Files

- `demo_sequences_vectorization.py` - Basic demo
- `demo_sequences_advanced.py` - Advanced demo
- `demo_rag_integration.py` - RAG integration
- `demo_startup_analysis.py` - Startup analysis
- `SEQUENCES_VECTORIZATION_GUIDE.md` - Full guide
- `VECTORIZATION_SUMMARY.md` - Complete summary

