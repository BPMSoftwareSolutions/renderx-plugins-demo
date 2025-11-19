#!/usr/bin/env node
/**
 * Demo: Vectorize and Search Sequences from renderx-web
 * 
 * This script shows how to:
 * 1. Load sequences.json
 * 2. Create embeddings for each sequence
 * 3. Store in vector database
 * 4. Perform semantic search
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { InMemoryVectorStore } from '../src/domain/components/vector-store/store/in-memory-store';
import { EmbeddingServiceFactory } from '../src/domain/components/vector-store/embeddings/embedding-service-factory';
import { OgraphXArtifactIndexer } from '../src/domain/components/vector-store/indexing/ographx-artifact-indexer';
import { OgraphXArtifactRetriever } from '../src/domain/components/vector-store/search/ographx-artifact-retriever';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('🎵 Vectorizing Sequences from renderx-web\n');
  console.log('=' .repeat(70));

  // Initialize vector store and embedding service
  const vectorStore = new InMemoryVectorStore();
  await vectorStore.initialize(384);
  const embeddingService = EmbeddingServiceFactory.createLocal();

  console.log('✅ Vector store initialized (384 dimensions)');
  console.log('✅ Embedding service ready (local hash-based)\n');

  // Create indexer
  const indexer = new OgraphXArtifactIndexer(vectorStore, embeddingService);

  // Index renderx-web artifacts
  const artifactDir = path.resolve(__dirname, '.ographx/artifacts/renderx-web');
  console.log(`📦 Indexing sequences from: ${artifactDir}\n`);

  const indexResult = await indexer.indexCodebaseArtifacts(artifactDir, 'renderx-web');
  
  console.log('✅ Indexing complete!');
  console.log(`   Total documents: ${indexResult.total}`);
  console.log(`   Sequences: ${indexResult.documentsByType?.['sequence'] || 0}`);
  console.log(`   Movements: ${indexResult.documentsByType?.['movement'] || 0}`);
  console.log(`   Beats: ${indexResult.documentsByType?.['beat'] || 0}\n`);

  // Create retriever
  const retriever = new OgraphXArtifactRetriever(vectorStore, embeddingService);

  // Example searches
  const queries = [
    'canvas drag handlers',
    'component creation',
    'event publishing',
    'resize operations',
  ];

  console.log('🔍 Running semantic searches:\n');
  console.log('=' .repeat(70));

  for (const query of queries) {
    console.log(`\n📌 Query: "${query}"`);
    const results = await retriever.searchSequences(query, { limit: 5 });
    
    if (results.length === 0) {
      console.log('   No results found');
      continue;
    }

    results.forEach((result, idx) => {
      console.log(`   ${idx + 1}. ${result.id}`);
      console.log(`      Score: ${(result.score * 100).toFixed(1)}%`);
      if (result.metadata?.source?.file) {
        const file = result.metadata.source.file.split('\\').pop();
        console.log(`      File: ${file}`);
      }
    });
  }

  console.log('\n' + '=' .repeat(70));
  console.log('\n✨ Demo complete!\n');
}

main().catch(console.error);

