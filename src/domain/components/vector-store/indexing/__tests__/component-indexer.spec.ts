import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { DefaultComponentIndexer } from '../component-indexer';
import { InMemoryVectorStore } from '../../store/in-memory-store';
import { EmbeddingServiceFactory } from '../../embeddings/embedding-service-factory';

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

describe('DefaultComponentIndexer', () => {
  beforeAll(async () => {
    await fs.mkdir(TEST_DIR, { recursive: true });
    await fs.writeFile(path.join(TEST_DIR, INDEX_FILE), indexJson);
    await fs.writeFile(path.join(TEST_DIR, COMPONENT_FILE), buttonJson);
  });

  afterAll(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  it('indexes all components in a directory', async () => {
    const vectorStore = new InMemoryVectorStore();
    await vectorStore.initialize(384);
    const embeddingService = EmbeddingServiceFactory.createLocal();
    const indexer = new DefaultComponentIndexer(vectorStore, embeddingService);
    const result = await indexer.indexDirectory(TEST_DIR);
    expect(result.total).toBe(1);
    expect(result.indexed).toBe(1);
    expect(result.failed).toBe(0);
    const comp = await vectorStore.get('button');
    expect(comp?.name).toBe('Button');
    expect(comp?.type).toBe('button');
  });

  it('handles missing directory gracefully', async () => {
    const vectorStore = new InMemoryVectorStore();
    await vectorStore.initialize(384);
    const embeddingService = EmbeddingServiceFactory.createLocal();
    const indexer = new DefaultComponentIndexer(vectorStore, embeddingService);
    const result = await indexer.indexDirectory('not-a-real-dir');
    expect(result.total).toBe(0);
    expect(result.indexed).toBe(0);
    expect(result.failed).toBe(0); // No components failed, but error is reported
    expect(result.errors.length).toBeGreaterThan(0); // Error array should have entry
  });

  it('extracts metadata correctly', () => {
    const vectorStore = new InMemoryVectorStore();
    const embeddingService = EmbeddingServiceFactory.createLocal();
    const indexer = new DefaultComponentIndexer(vectorStore, embeddingService);
    const data = JSON.parse(buttonJson);
    // @ts-expect-error: test private method
    const meta = indexer.extractMetadata('button', data);
    expect(meta.name).toBe('Button');
    expect(meta.type).toBe('button');
    expect(meta.category).toBe('basic');
    expect(meta.tags).toContain('ui');
    expect(meta.markup).toContain('Click me');
    expect(meta.cssPreview).toContain('color:red');
  });
});
