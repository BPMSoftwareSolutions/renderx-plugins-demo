import { describe, it, expect, beforeEach } from 'vitest';
import { IndexedVectorStore } from '../store/indexed-vector-store';

describe('IndexedVectorStore', () => {
  let store: IndexedVectorStore;

  beforeEach(async () => {
    store = new IndexedVectorStore();
    await store.initialize(3);
  });

  describe('initialization', () => {
    it('should initialize with dimensions', async () => {
      const newStore = new IndexedVectorStore();
      expect(newStore.isInitialized()).toBe(false);

      await newStore.initialize(384);
      expect(newStore.isInitialized()).toBe(true);
    });

    it('should throw error when adding before initialization', async () => {
      const uninitializedStore = new IndexedVectorStore();

      await expect(
        uninitializedStore.add('test', [0.1, 0.2, 0.3], {
          id: 'test',
          name: 'Test',
          description: 'Test',
          type: 'test',
          category: 'test',
          tags: [],
        })
      ).rejects.toThrow('not initialized');
    });
  });

  describe('add and get', () => {
    it('should add and retrieve component', async () => {
      const metadata = {
        id: 'button-1',
        name: 'Button',
        description: 'A button',
        type: 'button',
        category: 'interactive',
        tags: ['ui'],
      };

      await store.add('button-1', [0.1, 0.2, 0.3], metadata);
      const retrieved = await store.get('button-1');

      expect(retrieved).toEqual(metadata);
    });

    it('should throw error for dimension mismatch', async () => {
      const metadata = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'test',
        category: 'test',
        tags: [],
      };

      await expect(store.add('test', [0.1, 0.2], metadata)).rejects.toThrow('dimension mismatch');
    });
  });

  describe('search with indexing', () => {
    beforeEach(async () => {
      const components = [
        {
          id: 'button-1',
          embedding: [0.1, 0.2, 0.3],
          metadata: {
            id: 'button-1',
            name: 'Button',
            description: 'A button',
            type: 'button',
            category: 'interactive',
            tags: ['ui', 'clickable'],
          },
        },
        {
          id: 'input-1',
          embedding: [0.2, 0.3, 0.4],
          metadata: {
            id: 'input-1',
            name: 'Input',
            description: 'An input',
            type: 'input',
            category: 'form',
            tags: ['form', 'input'],
          },
        },
        {
          id: 'card-1',
          embedding: [0.3, 0.4, 0.5],
          metadata: {
            id: 'card-1',
            name: 'Card',
            description: 'A card',
            type: 'card',
            category: 'layout',
            tags: ['layout', 'container'],
          },
        },
      ];

      for (const component of components) {
        await store.add(component.id, component.embedding, component.metadata);
      }
    });

    it('should search and return results', async () => {
      const results = await store.search([0.1, 0.2, 0.3]);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].rank).toBe(1);
    });

    it('should filter by category', async () => {
      const results = await store.search([0.1, 0.2, 0.3], {
        filters: { category: 'interactive' },
      });

      expect(results.every((r) => r.metadata.category === 'interactive')).toBe(true);
    });

    it('should filter by type', async () => {
      const results = await store.search([0.1, 0.2, 0.3], {
        filters: { type: 'button' },
      });

      expect(results.every((r) => r.metadata.type === 'button')).toBe(true);
    });

    it('should filter by tags', async () => {
      const results = await store.search([0.1, 0.2, 0.3], {
        filters: { tags: ['form'] },
      });

      expect(results.every((r) => r.metadata.tags.includes('form'))).toBe(true);
    });

    it('should respect limit', async () => {
      const results = await store.search([0.1, 0.2, 0.3], { limit: 1 });

      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('should respect threshold', async () => {
      const results = await store.search([0.1, 0.2, 0.3], { threshold: 0.99 });

      expect(results.every((r) => r.similarity >= 0.99)).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove component', async () => {
      const metadata = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'test',
        category: 'test',
        tags: ['tag1'],
      };

      await store.add('test', [0.1, 0.2, 0.3], metadata);
      expect(await store.get('test')).not.toBeNull();

      await store.remove('test');
      expect(await store.get('test')).toBeNull();
    });

    it('should update indices on remove', async () => {
      const metadata = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'test',
        category: 'test',
        tags: ['tag1'],
      };

      await store.add('test', [0.1, 0.2, 0.3], metadata);
      await store.remove('test');

      const results = await store.search([0.1, 0.2, 0.3], {
        filters: { category: 'test' },
      });

      expect(results.find((r) => r.id === 'test')).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear all components', async () => {
      const metadata = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'test',
        category: 'test',
        tags: [],
      };

      await store.add('test', [0.1, 0.2, 0.3], metadata);
      expect(store.stats().totalComponents).toBe(1);

      await store.clear();
      expect(store.stats().totalComponents).toBe(0);
    });
  });

  describe('stats', () => {
    it('should return store statistics', async () => {
      const metadata = {
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
      expect(stats.embeddingDimensions).toBe(3);
      expect(stats.lastUpdated).toBeInstanceOf(Date);
      expect(stats.memoryUsage).toBeGreaterThan(0);
    });
  });
});

