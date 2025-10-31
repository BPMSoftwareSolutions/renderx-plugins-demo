
import { InMemoryVectorStore } from './store/in-memory-store';
import { EmbeddingServiceFactory } from './embeddings/embedding-service-factory';
import { AIComponentGenerator } from './ai/ai-component-generator';
import { DefaultComponentIndexer } from './indexing/component-indexer';


// Initialize
const vectorStore = new InMemoryVectorStore();
await vectorStore.initialize(384); // Match local embedding service default

// Create embedding service
const embeddingService = EmbeddingServiceFactory.createLocal();

// Create indexer
const indexer = new DefaultComponentIndexer(vectorStore, embeddingService);

// Load and index components from json-components/
console.log('📦 Loading components from json-components/...');
const indexResult = await indexer.indexDirectory('./json-components');
console.log(`✅ Indexed ${indexResult.indexed}/${indexResult.total} components`);
if (indexResult.errors.length > 0) {
  console.error('⚠️ Errors during indexing:', indexResult.errors);
}

// Create AI generator
const aiGenerator = new AIComponentGenerator(vectorStore, embeddingService);

// Search for similar components
const context = await aiGenerator.prepareGenerationContext({
  prompt: 'Create a button component',
  maxSimilarComponents: 5,
});

// Validate the output
console.log('\n🔍 Search Results:');
console.log('✅ Prompt:', context.prompt);
console.log('✅ Similar Components Found:', context.similarComponents.length);
context.similarComponents.forEach((comp, i) => {
  console.log(`  ${i + 1}. ${comp.name} (${comp.type}) - ${comp.description}`);
});
console.log('\n📋 System Prompt Generated:');
console.log(context.systemPrompt.substring(0, 200) + '...');
