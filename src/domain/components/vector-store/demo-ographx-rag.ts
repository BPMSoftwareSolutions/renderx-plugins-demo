/**
 * OgraphX RAG System Demo
 * Shows how to use the integrated OgraphX artifact indexing and retrieval
 */

import { InMemoryVectorStore } from './store/in-memory-store';
import { EmbeddingServiceFactory } from './embeddings/embedding-service-factory';
import { OgraphXArtifactIndexer } from './indexing/ographx-artifact-indexer';
import { OgraphXArtifactRetriever } from './search/ographx-artifact-retriever';
import { OgraphXContextBuilder } from './ai/ographx-context-builder';
import { AIComponentGenerator } from './ai/ai-component-generator';
import path from 'path';

async function main() {
  console.log('🎵 OgraphX RAG System Demo\n');

  // Initialize vector store and embedding service
  const vectorStore = new InMemoryVectorStore();
  await vectorStore.initialize(384);
  const embeddingService = EmbeddingServiceFactory.createLocal();

  // Create indexer
  const indexer = new OgraphXArtifactIndexer(vectorStore, embeddingService);

  // Index OgraphX artifacts from the RAG system
  const artifactDir = path.resolve(process.cwd(), 'packages/ographx/.ographx/artifacts/rag-system');
  console.log(`📦 Indexing OgraphX artifacts from: ${artifactDir}\n`);

  const indexResult = await indexer.indexCodebaseArtifacts(artifactDir, 'rag-system');
  console.log(`✅ Indexed ${indexResult.totalDocuments} artifacts`);
  console.log(`   - Symbols: ${indexResult.symbolsIndexed}`);
  console.log(`   - Sequences: ${indexResult.sequencesIndexed}`);
  console.log(`   - Analysis: ${indexResult.analysisIndexed}\n`);

  // Create retriever
  const retriever = new OgraphXArtifactRetriever(vectorStore, embeddingService);

  // Demo 1: Search for symbols
  console.log('🔍 Demo 1: Search for Symbols');
  console.log('Query: "vector store search"');
  const symbolResults = await retriever.searchSymbols('vector store search', { limit: 3 });
  console.log(`Found ${symbolResults.length} similar symbols:`);
  symbolResults.forEach((result, i) => {
    console.log(`  ${i + 1}. ${result.metadata.name} (${result.similarity.toFixed(2)})`);
  });
  console.log();

  // Demo 1b: Run the user's query exactly
  const userQuery = 'canvas selection handler';
  console.log('🔍 Demo 1b: User Query');
  console.log(`Query: "${userQuery}"`);
  const userQueryResults = await retriever.searchSymbols(userQuery, { limit: 10 });
  if (userQueryResults.length === 0) {
    console.log('No results found.');
  } else {
    console.log(`Found ${userQueryResults.length} symbols:`);
    userQueryResults.forEach((result, i) => {
      console.log(`  ${i + 1}. ${result.metadata.name} (${(result.similarity * 100).toFixed(1)}%)`);
    });
  }
  console.log();

  // Demo 2: Search for sequences
  console.log('🔍 Demo 2: Search for Sequences');
  console.log('Query: "indexing workflow"');
  const sequenceResults = await retriever.searchSequences('indexing workflow', { limit: 3 });
  console.log(`Found ${sequenceResults.length} similar sequences:`);
  sequenceResults.forEach((result, i) => {
    console.log(`  ${i + 1}. ${result.metadata.name} (${result.similarity.toFixed(2)})`);
  });
  console.log();

  // Demo 3: Find call chains
  console.log('🔍 Demo 3: Find Call Chains');
  console.log('Starting from: "indexCodebaseArtifacts"');
  const callChain = await retriever.findCallChain('indexCodebaseArtifacts', 2);
  console.log(`Found ${callChain.chain.length} calls in chain:`);
  callChain.chain.forEach((node, i) => {
    console.log(`  ${i + 1}. ${node.symbol}`);
  });
  console.log();

  // Demo 4: Discover patterns
  console.log('🔍 Demo 4: Discover Patterns');
  console.log('Query: "indexing"');
  const patterns = await retriever.discoverPatterns('indexing', 0.7);
  console.log(`Found ${patterns.length} patterns:`);
  patterns.forEach((pattern, i) => {
    console.log(`  ${i + 1}. ${pattern.name} (frequency: ${pattern.frequency})`);
  });
  console.log();

  // Demo 5: Build context for AI generation
  console.log('🎯 Demo 5: Build Context for AI Generation');
  const contextBuilder = new OgraphXContextBuilder(retriever);
  const generationContext = await contextBuilder.buildGenerationContext({
    prompt: 'Create a component indexer for SVG files',
    type: 'symbol',
    codebase: 'rag-system',
  });
  console.log(`Context built with:`);
  console.log(`  - Similar artifacts: ${generationContext.similarArtifacts.length}`);
  console.log(`  - Patterns discovered: ${generationContext.patterns.length}`);
  console.log(`  - Average similarity: ${(generationContext.metadata.averageSimilarity * 100).toFixed(1)}%`);
  console.log();

  // Demo 6: Enhanced AI component generation
  console.log('🚀 Demo 6: Enhanced AI Component Generation');
  const generator = new AIComponentGenerator(vectorStore, embeddingService, retriever);
  const aiContext = await generator.prepareGenerationContext({
    prompt: 'Create a button component with drag support',
    includeOgraphXContext: true,
  });
  console.log(`AI Generation Context:`);
  console.log(`  - Similar components: ${aiContext.similarComponents.length}`);
  console.log(`  - OgraphX context included: ${aiContext.ographxContext ? '✅' : '❌'}`);
  if (aiContext.ographxContext) {
    console.log(`  - OgraphX artifacts: ${aiContext.ographxContext.similarArtifacts.length}`);
  }
  console.log();

  // Demo 7: Format context for LLM
  console.log('📝 Demo 7: Format Context for LLM Prompt');
  const formattedContext = contextBuilder.formatContextForPrompt(generationContext);
  console.log('Formatted context (first 500 chars):');
  console.log(formattedContext.substring(0, 500) + '...\n');

  console.log('✨ Demo complete!');
}

main().catch(console.error);

