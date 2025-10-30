import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryVectorStore } from '../store/in-memory-store';
import { ComponentMetadata } from '../store/store.types';

describe('InMemoryVectorStore', () => {
  let store: InMemoryVectorStore;
  const embeddingDimensions = 3;

  beforeEach(async () => {
    store = new InMemoryVectorStore();
    await store.initialize(embeddingDimensions);
  });

  describe('initialization', () => {
    it('should initialize with correct dimensions', () => {
      expect(store.isInitialized()).toBe(true);
      expect(store.stats().embeddingDimensions).toBe(embeddingDimensions);
    });

    it('should throw error when adding before initialization', async () => {
      const uninitializedStore = new InMemoryVectorStore();
      const metadata: ComponentMetadata = {
        id: 'test',
        name: 'Test',
        description: 'Test component',
        type: 'button',
        category: 'interactive',
        tags: ['test'],
      };

      await expect(
        uninitializedStore.add('test', [0.1, 0.2, 0.3], metadata)
      ).rejects.toThrow('Vector store not initialized');
    });
  });

  describe('add and get', () => {
    it('should add and retrieve a component', async () => {
      const metadata: ComponentMetadata = {
        id: 'button-1',
        name: 'Button',
        description: 'A simple button',
        type: 'button',
        category: 'interactive',
        tags: ['ui', 'interactive'],
      };

      await store.add('button-1', [0.1, 0.2, 0.3], metadata);
      const retrieved = await store.get('button-1');

      expect(retrieved).toEqual(metadata);
    });

    it('should return null for non-existent component', async () => {
      const retrieved = await store.get('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should throw error for dimension mismatch', async () => {
      const metadata: ComponentMetadata = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'test',
        category: 'test',
        tags: [],
      };

      await expect(
        store.add('test', [0.1, 0.2], metadata) // Wrong dimension
      ).rejects.toThrow('Embedding dimension mismatch');
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      const components: Array<[string, number[], ComponentMetadata]> = [
        [
          'button-1',
          [1, 0, 0],
          {
            id: 'button-1',
            name: 'Button',
            description: 'A button',
            type: 'button',
            category: 'interactive',
            tags: ['ui'],
          },
        ],
        [
          'button-2',
          [0.7, 0.7, 0],
          {
            id: 'button-2',
            name: 'Button 2',
            description: 'Another button',
            type: 'button',
            category: 'interactive',
            tags: ['ui'],
          },
        ],
        [
          'input-1',
          [0, 1, 0],
          {
            id: 'input-1',
            name: 'Input',
            description: 'An input field',
            type: 'input',
            category: 'form',
            tags: ['form'],
          },
        ],
      ];

      for (const [id, embedding, metadata] of components) {
        await store.add(id, embedding, metadata);
      }
    });

    it('should search and return similar components', async () => {
      const results = await store.search([1, 0, 0], { limit: 2 });

      expect(results.length).toBe(2);
      expect(results[0].id).toBe('button-1');
      expect(results[0].similarity).toBeCloseTo(1, 5);
      expect(results[0].rank).toBe(1);
    });

    it('should respect limit parameter', async () => {
      const results = await store.search([1, 0, 0], { limit: 1 });
      expect(results.length).toBe(1);
    });

    it('should filter by category', async () => {
      const results = await store.search([1, 0, 0], {
        limit: 10,
        filters: { category: 'interactive' },
      });

      expect(results.length).toBe(2);
      expect(results.every((r) => r.metadata.category === 'interactive')).toBe(true);
    });

    it('should filter by type', async () => {
      const results = await store.search([1, 0, 0], {
        limit: 10,
        filters: { type: 'button' },
      });

      expect(results.length).toBe(2);
      expect(results.every((r) => r.metadata.type === 'button')).toBe(true);
    });

    it('should filter by tags', async () => {
      const results = await store.search([1, 0, 0], {
        limit: 10,
        filters: { tags: ['form'] },
      });

      expect(results.length).toBe(1);
      expect(results[0].id).toBe('input-1');
    });

    it('should respect threshold parameter', async () => {
      const results = await store.search([1, 0, 0], {
        limit: 10,
        threshold: 0.99,
      });

      expect(results.length).toBe(1);
      expect(results[0].id).toBe('button-1');
    });

    it('should throw error for dimension mismatch in search', async () => {
      await expect(store.search([0.1, 0.2])).rejects.toThrow(
        'Query embedding dimension mismatch'
      );
    });
  });

  describe('remove', () => {
    it('should remove a component', async () => {
      const metadata: ComponentMetadata = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'test',
        category: 'test',
        tags: [],
      };

      await store.add('test', [0.1, 0.2, 0.3], metadata);
      expect(await store.get('test')).not.toBeNull();

      await store.remove('test');
      expect(await store.get('test')).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all components', async () => {
      const metadata: ComponentMetadata = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'test',
        category: 'test',
        tags: [],
      };

      await store.add('test1', [0.1, 0.2, 0.3], metadata);
      await store.add('test2', [0.2, 0.3, 0.4], metadata);

      expect(store.stats().totalComponents).toBe(2);

      await store.clear();
      expect(store.stats().totalComponents).toBe(0);
    });
  });

  describe('stats', () => {
    it('should return correct statistics', async () => {
      const metadata: ComponentMetadata = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'test',
        category: 'test',
        tags: [],
      };

      await store.add('test', [0.1, 0.2, 0.3], metadata);

      const stats = store.stats();
      expect(stats.totalComponents).toBe(1);
      expect(stats.embeddingDimensions).toBe(embeddingDimensions);
      expect(stats.lastUpdated).toBeInstanceOf(Date);
    });
  });
});

