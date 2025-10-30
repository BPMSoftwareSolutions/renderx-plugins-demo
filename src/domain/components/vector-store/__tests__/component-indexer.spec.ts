import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultComponentIndexer } from '../indexing/component-indexer';
import { InMemoryVectorStore } from '../store/in-memory-store';
import { EmbeddingService, ModelInfo } from '../store/store.types';

// Mock embedding service
class MockEmbeddingService implements EmbeddingService {
  async embed(text: string): Promise<number[]> {
    // Simple mock: return a vector based on text length
    const length = text.length;
    return [length / 100, (length % 100) / 100, 0.5];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.embed(text)));
  }

  getModelInfo(): ModelInfo {
    return {
      name: 'mock-model',
      provider: 'mock',
      dimensions: 3,
    };
  }

  async isReady(): Promise<boolean> {
    return true;
  }
}

describe('DefaultComponentIndexer', () => {
  let indexer: DefaultComponentIndexer;
  let vectorStore: InMemoryVectorStore;
  let embeddingService: MockEmbeddingService;

  beforeEach(async () => {
    vectorStore = new InMemoryVectorStore();
    await vectorStore.initialize(3);
    embeddingService = new MockEmbeddingService();
    indexer = new DefaultComponentIndexer(vectorStore, embeddingService);
  });

  describe('indexComponent', () => {
    it('should index a single component', async () => {
      const componentData = {
        name: 'Button',
        description: 'A button component',
        type: 'button',
        category: 'interactive',
        tags: ['ui', 'interactive'],
      };

      await indexer.indexComponent('button-1', componentData);

      const retrieved = await vectorStore.get('button-1');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Button');
      expect(retrieved?.type).toBe('button');
    });

    it('should generate embeddings for components', async () => {
      const componentData = {
        name: 'Input',
        description: 'An input field',
        type: 'input',
        category: 'form',
        tags: ['form'],
      };

      await indexer.indexComponent('input-1', componentData);

      // Verify component was added to store
      const stats = vectorStore.stats();
      expect(stats.totalComponents).toBe(1);
    });

    it('should handle missing optional fields', async () => {
      const componentData = {
        name: 'Simple Component',
      };

      await indexer.indexComponent('simple-1', componentData);

      const retrieved = await vectorStore.get('simple-1');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Simple Component');
      expect(retrieved?.description).toBe('');
      expect(retrieved?.type).toBe('unknown');
      expect(retrieved?.category).toBe('general');
    });

    it('should track progress', async () => {
      const componentData = {
        name: 'Component 1',
        description: 'First component',
        type: 'test',
        category: 'test',
        tags: [],
      };

      const progress1 = indexer.getProgress();
      expect(progress1.processed).toBe(0);

      await indexer.indexComponent('comp-1', componentData);

      const progress2 = indexer.getProgress();
      expect(progress2.processed).toBe(1);
    });

    it('should handle indexing errors gracefully', async () => {
      // Create a mock embedding service that throws
      const failingEmbeddingService: EmbeddingService = {
        async embed(): Promise<number[]> {
          throw new Error('Embedding failed');
        },
        async embedBatch(): Promise<number[][]> {
          throw new Error('Batch embedding failed');
        },
        getModelInfo(): ModelInfo {
          return { name: 'mock', provider: 'mock', dimensions: 3 };
        },
        async isReady(): Promise<boolean> {
          return true;
        },
      };

      const failingIndexer = new DefaultComponentIndexer(vectorStore, failingEmbeddingService);

      const componentData = {
        name: 'Component',
        description: 'Test',
        type: 'test',
        category: 'test',
        tags: [],
      };

      // Should not throw, but handle error internally
      await failingIndexer.indexComponent('comp-1', componentData);

      // Component should not be in store
      const retrieved = await vectorStore.get('comp-1');
      expect(retrieved).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all indexed components', async () => {
      const componentData = {
        name: 'Component',
        description: 'Test',
        type: 'test',
        category: 'test',
        tags: [],
      };

      await indexer.indexComponent('comp-1', componentData);
      expect(vectorStore.stats().totalComponents).toBe(1);

      await indexer.clear();
      expect(vectorStore.stats().totalComponents).toBe(0);
    });

    it('should reset progress after clear', async () => {
      const componentData = {
        name: 'Component',
        description: 'Test',
        type: 'test',
        category: 'test',
        tags: [],
      };

      await indexer.indexComponent('comp-1', componentData);
      const progress1 = indexer.getProgress();
      expect(progress1.processed).toBe(1);

      await indexer.clear();
      const progress2 = indexer.getProgress();
      expect(progress2.processed).toBe(0);
    });
  });

  describe('getProgress', () => {
    it('should return current progress', async () => {
      const progress = indexer.getProgress();
      expect(progress.processed).toBe(0);
      expect(progress.percentage).toBe(0);
      expect(progress.startTime).toBeInstanceOf(Date);
    });
  });
});

