import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { InMemoryVectorStore } from '../store/in-memory-store';
import { EmbeddingServiceFactory } from '../embeddings/embedding-service-factory';
import { DefaultComponentIndexer } from '../indexing/component-indexer';
import { AIComponentGenerator } from '../ai/ai-component-generator';

const TEST_DIR = path.join(__dirname, 'test-components');
const INDEX_FILE = 'index.json';
const COMPONENT_FILE = 'button.json';

const indexJson = JSON.stringify(['button.json']);
const buttonJson = JSON.stringify({
  metadata: {
    type: 'button',
    name: 'Button',
    description: 'A clickable button',
    category: 'basic',
    tags: ['ui', 'clickable']
  },
  ui: {
    template: '<button>Click me</button>',
    styles: { css: '.btn{color:red;}' }
  }
});

describe('Demo AI Component Generator (integration)', () => {
  beforeAll(async () => {
    await fs.mkdir(TEST_DIR, { recursive: true });
    await fs.writeFile(path.join(TEST_DIR, INDEX_FILE), indexJson);
    await fs.writeFile(path.join(TEST_DIR, COMPONENT_FILE), buttonJson);
  });

  afterAll(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  it('loads, indexes, and searches for components end-to-end', async () => {
    // 1. Initialize vector store
    const vectorStore = new InMemoryVectorStore();
    await vectorStore.initialize(384);

    // 2. Create embedding service and indexer
    const embeddingService = EmbeddingServiceFactory.createLocal();
    const indexer = new DefaultComponentIndexer(vectorStore, embeddingService);

    // 3. Load and index components
    const indexResult = await indexer.indexDirectory(TEST_DIR);
    expect(indexResult.total).toBe(1);
    expect(indexResult.indexed).toBe(1);
    expect(indexResult.failed).toBe(0);

    // 4. Create AI generator
    const aiGenerator = new AIComponentGenerator(vectorStore, embeddingService);

    // 5. Search for similar components
    const context = await aiGenerator.prepareGenerationContext({
      prompt: 'Create a button component',
      maxSimilarComponents: 5,
    });

    // 6. Validate results
    expect(context.similarComponents.length).toBeGreaterThan(0);
    expect(context.similarComponents[0].name).toBe('Button');
    expect(context.systemPrompt).toContain('Button');
  });
});
