import { describe, it, expect } from 'vitest';
import path from 'path';
import { InMemoryVectorStore } from '../store/in-memory-store';
import { EmbeddingServiceFactory } from '../embeddings/embedding-service-factory';
import { OgraphXArtifactIndexer } from '../indexing/ographx-artifact-indexer';
import { OgraphXArtifactRetriever } from '../search/ographx-artifact-retriever';

// This simulation test indexes the existing OgraphX artifacts and runs the exact search the user tried
// It prints results to the console so you can see them in the terminal

describe('RAG search simulation (console demo)', () => {
  it('indexes rag-system artifacts and runs: searchSymbols("canvas selection handler")', async () => {
    const vectorStore = new InMemoryVectorStore();
    await vectorStore.initialize(384);
    const embeddingService = EmbeddingServiceFactory.createLocal();

    const indexer = new OgraphXArtifactIndexer(vectorStore, embeddingService);
    const artifactDir = path.resolve(__dirname, '../../../../../packages/ographx/.ographx/artifacts/rag-system');
    console.log('Using artifactDir:', artifactDir);

    const indexResult = await indexer.indexCodebaseArtifacts(artifactDir, 'rag-system');
    console.log('Index result:', indexResult);
    // Basic sanity
    expect(indexResult.total).toBeGreaterThan(0);
    expect(indexResult.indexed).toBeGreaterThan(0);

    const retriever = new OgraphXArtifactRetriever(vectorStore, embeddingService);

    const query = 'canvas selection handler';
    console.log('\n=== RAG Search Demo ===');
    console.log(`Query: ${query}`);

    const results = await retriever.searchSymbols(query, { limit: 10 });

    console.log(`Found ${results.length} results`);
    for (let i = 0; i < Math.min(results.length, 10); i++) {
      const r = results[i];
      console.log(`${i + 1}. ${r.title}  [${(r.similarity * 100).toFixed(1)}%]`);
      console.log(`   tags: ${r.metadata.tags.join(', ')}`);
      if (r.metadata.filePath) console.log(`   file: ${r.metadata.filePath}`);
    }

    expect(results.length).toBeGreaterThan(0);
  }, 30000);
});

