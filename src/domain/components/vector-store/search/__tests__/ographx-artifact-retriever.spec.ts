/**
 * OgraphX Artifact Retriever Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OgraphXArtifactRetriever } from '../ographx-artifact-retriever';
import { VectorStore, EmbeddingService, SearchResult } from '../../store/store.types';

describe('OgraphXArtifactRetriever', () => {
  let retriever: OgraphXArtifactRetriever;
  let mockVectorStore: VectorStore;
  let mockEmbeddingService: EmbeddingService;

  beforeEach(() => {
    mockVectorStore = {
      add: vi.fn().mockResolvedValue(undefined),
      search: vi.fn().mockResolvedValue([]),
      get: vi.fn().mockResolvedValue(null),
      remove: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
      stats: vi.fn().mockReturnValue({
        totalComponents: 0,
        embeddingDimensions: 384,
        lastUpdated: new Date(),
      }),
      isInitialized: vi.fn().mockReturnValue(true),
    };

    mockEmbeddingService = {
      embed: vi.fn().mockResolvedValue(new Array(384).fill(0.1)),
      embedBatch: vi.fn().mockResolvedValue([new Array(384).fill(0.1)]),
      getModelInfo: vi.fn().mockReturnValue({
        name: 'test-model',
        provider: 'test',
        dimensions: 384,
      }),
    };

    retriever = new OgraphXArtifactRetriever(mockVectorStore, mockEmbeddingService);
  });

  describe('searchSymbols', () => {
    it('should search for symbols by semantic similarity', async () => {
      const mockResults: SearchResult[] = [
        {
          id: 'symbol:test1',
          metadata: {
            id: 'symbol:test1',
            name: 'TestSymbol',
            description: 'A test symbol',
            type: 'symbol',
            category: 'ir',
            tags: ['symbol', 'function'],
            codebaseName: 'test-codebase',
            filePath: 'test.ts',
          },
          similarity: 0.95,
          rank: 1,
        },
      ];

      vi.mocked(mockVectorStore.search).mockResolvedValue(mockResults);

      const results = await retriever.searchSymbols('Find handlers that deal with canvas selection');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].type).toBe('symbol');
      expect(results[0].similarity).toBeGreaterThan(0.9);
    });

    it('should apply search options', async () => {
      const mockResults: SearchResult[] = [];
      vi.mocked(mockVectorStore.search).mockResolvedValue(mockResults);

      await retriever.searchSymbols('test query', {
        limit: 5,
        threshold: 0.5,
        filters: { codebaseName: ['test-codebase'] },
      });

      expect(mockVectorStore.search).toHaveBeenCalled();
    });
  });

  describe('searchSequences', () => {
    it('should search for sequences by semantic similarity', async () => {
      const mockResults: SearchResult[] = [
        {
          id: 'sequence:seq1',
          metadata: {
            id: 'sequence:seq1',
            name: 'ComponentCreationSequence',
            description: 'Sequence for component creation',
            type: 'sequence',
            category: 'sequence',
            tags: ['sequence', 'orchestration'],
            codebaseName: 'test-codebase',
            filePath: 'sequences.json',
          },
          similarity: 0.88,
          rank: 1,
        },
      ];

      vi.mocked(mockVectorStore.search).mockResolvedValue(mockResults);

      const results = await retriever.searchSequences('Find sequences that orchestrate component creation');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].type).toBe('sequence');
    });
  });

  describe('searchHandlers', () => {
    it('should search for handlers by pattern', async () => {
      const mockResults: SearchResult[] = [
        {
          id: 'symbol:onDragStart',
          metadata: {
            id: 'symbol:onDragStart',
            name: 'onDragStart',
            description: 'Drag start handler',
            type: 'symbol',
            category: 'ir',
            tags: ['function', 'handler'],
            codebaseName: 'test-codebase',
            filePath: 'handlers.ts',
          },
          similarity: 0.92,
          rank: 1,
        },
      ];

      vi.mocked(mockVectorStore.search).mockResolvedValue(mockResults);

      const results = await retriever.searchHandlers('Find handlers similar to onDragStart');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toBe('onDragStart');
    });
  });

  describe('findCallChain', () => {
    it('should find call chains', async () => {
      const result = await retriever.findCallChain('createComponent', 3);

      expect(result.startSymbol).toBe('createComponent');
      expect(result.depth).toBe(3);
      expect(result.chain).toBeDefined();
    });
  });

  describe('findDependents', () => {
    it('should find dependents of a symbol', async () => {
      const mockResults: SearchResult[] = [
        {
          id: 'call:call1',
          metadata: {
            id: 'call:call1',
            name: 'Call to utility',
            description: 'Function call',
            type: 'call',
            category: 'ir',
            tags: ['call', 'dependency'],
            codebaseName: 'test-codebase',
            filePath: 'calls.json',
          },
          similarity: 0.85,
          rank: 1,
        },
      ];

      vi.mocked(mockVectorStore.search).mockResolvedValue(mockResults);

      const results = await retriever.findDependents('utilityFunction');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].type).toBe('call');
    });
  });

  describe('discoverPatterns', () => {
    it('should discover patterns in artifacts', async () => {
      const mockResults: SearchResult[] = [
        {
          id: 'symbol:handler1',
          metadata: {
            id: 'symbol:handler1',
            name: 'Handler1',
            description: 'Event handler',
            type: 'symbol',
            category: 'ir',
            tags: ['function', 'handler', 'event'],
            codebaseName: 'test-codebase',
            filePath: 'handlers.ts',
          },
          similarity: 0.9,
          rank: 1,
        },
        {
          id: 'symbol:handler2',
          metadata: {
            id: 'symbol:handler2',
            name: 'Handler2',
            description: 'Event handler',
            type: 'symbol',
            category: 'ir',
            tags: ['function', 'handler', 'event'],
            codebaseName: 'test-codebase',
            filePath: 'handlers.ts',
          },
          similarity: 0.88,
          rank: 2,
        },
      ];

      vi.mocked(mockVectorStore.search).mockResolvedValue(mockResults);

      const patterns = await retriever.discoverPatterns('Find all similar orchestration patterns');

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].examples.length).toBeGreaterThan(0);
    });
  });

  describe('getSearchStats', () => {
    it('should calculate search statistics', () => {
      const results = [
        {
          id: 'test1',
          type: 'symbol' as const,
          title: 'Test1',
          content: 'Content1',
          similarity: 0.9,
          metadata: {
            artifactType: 'ir',
            codebaseName: 'test',
            filePath: 'test.ts',
            tags: [],
            relationships: {},
          },
        },
        {
          id: 'test2',
          type: 'symbol' as const,
          title: 'Test2',
          content: 'Content2',
          similarity: 0.8,
          metadata: {
            artifactType: 'ir',
            codebaseName: 'test',
            filePath: 'test.ts',
            tags: [],
            relationships: {},
          },
        },
      ];

      const stats = retriever.getSearchStats('test query', results);

      expect(stats.query).toBe('test query');
      expect(stats.resultsCount).toBe(2);
      expect(stats.averageSimilarity).toBe(0.85);
    });
  });
});

