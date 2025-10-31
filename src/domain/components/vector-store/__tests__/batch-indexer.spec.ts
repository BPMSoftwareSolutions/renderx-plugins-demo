import { describe, it, expect, beforeEach } from 'vitest';
import { BatchIndexer } from '../indexing/batch-indexer';
import { InMemoryVectorStore } from '../store/in-memory-store';
import { EmbeddingService, ModelInfo } from '../store/store.types';

// Mock embedding service
class MockEmbeddingService implements EmbeddingService {
  async embed(text: string): Promise<number[]> {
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

describe('BatchIndexer', () => {
  let indexer: BatchIndexer;
  let vectorStore: InMemoryVectorStore;
  let embeddingService: MockEmbeddingService;

  beforeEach(async () => {
    vectorStore = new InMemoryVectorStore();
    await vectorStore.initialize(3);
    embeddingService = new MockEmbeddingService();
    indexer = new BatchIndexer(vectorStore, embeddingService, { batchSize: 2 });
  });

  describe('indexBatch', () => {
    it('should index multiple components in batches', async () => {
      const components = [
        {
          id: 'button-1',
          data: {
            name: 'Button',
            description: 'A button',
            type: 'button',
            category: 'interactive',
            tags: ['ui'],
          },
        },
        {
          id: 'input-1',
          data: {
            name: 'Input',
            description: 'An input field',
            type: 'input',
            category: 'form',
            tags: ['form'],
          },
        },
        {
          id: 'text-1',
          data: {
            name: 'Text',
            description: 'A text component',
            type: 'text',
            category: 'display',
            tags: ['text'],
          },
        },
      ];

      const result = await indexer.indexBatch(components);

      expect(result.total).toBe(3);
      expect(result.indexed).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.errors.length).toBe(0);
    });

    it('should respect batch size', async () => {
      const components = Array.from({ length: 5 }, (_, i) => ({
        id: `comp-${i}`,
        data: {
          name: `Component ${i}`,
          description: `Component ${i}`,
          type: 'test',
          category: 'test',
          tags: [],
        },
      }));

      const result = await indexer.indexBatch(components);

      expect(result.total).toBe(5);
      expect(result.indexed).toBe(5);
      expect(vectorStore.stats().totalComponents).toBe(5);
    });

    it('should handle empty batch', async () => {
      const result = await indexer.indexBatch([]);

      expect(result.total).toBe(0);
      expect(result.indexed).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should track errors in batch', async () => {
      // Create a failing embedding service
      const failingService: EmbeddingService = {
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

      const failingIndexer = new BatchIndexer(vectorStore, failingService, { batchSize: 2 });

      const components = [
        {
          id: 'comp-1',
          data: {
            name: 'Component 1',
            description: 'Test',
            type: 'test',
            category: 'test',
            tags: [],
          },
        },
        {
          id: 'comp-2',
          data: {
            name: 'Component 2',
            description: 'Test',
            type: 'test',
            category: 'test',
            tags: [],
          },
        },
      ];

      const result = await failingIndexer.indexBatch(components);

      expect(result.total).toBe(2);
      expect(result.indexed).toBe(0);
      expect(result.failed).toBe(2);
      expect(result.errors.length).toBe(2);
    });
  });

  describe('getErrors', () => {
    it('should return errors from indexing', async () => {
      const failingService: EmbeddingService = {
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

      const failingIndexer = new BatchIndexer(vectorStore, failingService);

      const components = [
        {
          id: 'comp-1',
          data: {
            name: 'Component 1',
            description: 'Test',
            type: 'test',
            category: 'test',
            tags: [],
          },
        },
      ];

      await failingIndexer.indexBatch(components);
      const errors = failingIndexer.getErrors();

      expect(errors.length).toBe(1);
      expect(errors[0].componentId).toBe('comp-1');
      expect(errors[0].error).toContain('Embedding failed');
    });
  });

  describe('clearErrors', () => {
    it('should clear errors', async () => {
      const failingService: EmbeddingService = {
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

      const failingIndexer = new BatchIndexer(vectorStore, failingService);

      const components = [
        {
          id: 'comp-1',
          data: {
            name: 'Component 1',
            description: 'Test',
            type: 'test',
            category: 'test',
            tags: [],
          },
        },
      ];

      await failingIndexer.indexBatch(components);
      expect(failingIndexer.getErrors().length).toBe(1);

      failingIndexer.clearErrors();
      expect(failingIndexer.getErrors().length).toBe(0);
    });
  });
});

