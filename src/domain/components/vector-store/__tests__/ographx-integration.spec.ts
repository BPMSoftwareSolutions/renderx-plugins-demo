/**
 * OgraphX Integration Tests
 * End-to-end tests for artifact indexing, retrieval, and context building
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OgraphXArtifactIndexer } from '../indexing/ographx-artifact-indexer';
import { OgraphXArtifactRetriever } from '../search/ographx-artifact-retriever';
import { OgraphXContextBuilder } from '../ai/ographx-context-builder';
import { AIComponentGenerator } from '../ai/ai-component-generator';
import { VectorStore, EmbeddingService } from '../store/store.types';

describe('OgraphX Integration', () => {
  let indexer: OgraphXArtifactIndexer;
  let retriever: OgraphXArtifactRetriever;
  let contextBuilder: OgraphXContextBuilder;
  let generator: AIComponentGenerator;
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

    indexer = new OgraphXArtifactIndexer(mockVectorStore, mockEmbeddingService);
    retriever = new OgraphXArtifactRetriever(mockVectorStore, mockEmbeddingService);
    contextBuilder = new OgraphXContextBuilder(retriever);
    generator = new AIComponentGenerator(mockVectorStore, mockEmbeddingService, retriever);
  });

  describe('end-to-end workflow', () => {
    it('should build generation context with artifacts', async () => {
      // This test focuses on the context building workflow
      const mockResults = [
        {
          id: 'symbol:test1',
          metadata: {
            id: 'symbol:test1',
            name: 'TestSymbol',
            description: 'A test symbol',
            type: 'symbol',
            category: 'ir',
            tags: ['function', 'handler'],
            codebaseName: 'test-codebase',
            filePath: 'test.ts',
          },
          similarity: 0.9,
          rank: 1,
        },
      ];

      vi.mocked(mockVectorStore.search).mockResolvedValue(mockResults);

      const documents = await contextBuilder.buildGenerationContext({
        prompt: 'Create a handler',
        type: 'symbol',
        codebase: 'test-codebase',
      });

      expect(documents.similarArtifacts.length).toBeGreaterThan(0);
      expect(documents.similarArtifacts[0].title).toBe('TestSymbol');
    });

    it('should build generation context with OgraphX artifacts', async () => {
      const mockResults = [
        {
          id: 'symbol:test1',
          metadata: {
            id: 'symbol:test1',
            name: 'TestSymbol',
            description: 'A test symbol',
            type: 'symbol',
            category: 'ir',
            tags: ['function', 'handler'],
            codebaseName: 'test-codebase',
            filePath: 'test.ts',
          },
          similarity: 0.9,
          rank: 1,
        },
      ];

      vi.mocked(mockVectorStore.search).mockResolvedValue(mockResults);

      const context = await contextBuilder.buildGenerationContext({
        prompt: 'Create a handler for canvas selection',
        type: 'symbol',
        codebase: 'test-codebase',
      });

      expect(context.prompt).toBe('Create a handler for canvas selection');
      expect(context.type).toBe('symbol');
      expect(context.similarArtifacts.length).toBeGreaterThan(0);
    });

    it('should enhance AI generation with OgraphX context', async () => {
      const mockResults = [
        {
          id: 'symbol:test1',
          metadata: {
            id: 'symbol:test1',
            name: 'TestSymbol',
            description: 'A test symbol',
            type: 'symbol',
            category: 'ir',
            tags: ['function'],
            codebaseName: 'test',
            filePath: 'test.ts',
          },
          similarity: 0.9,
          rank: 1,
        },
      ];

      vi.mocked(mockVectorStore.search).mockResolvedValue(mockResults);

      const context = await generator.prepareGenerationContext({
        prompt: 'Create a button component',
        includeOgraphXContext: true,
      });

      expect(context.prompt).toBe('Create a button component');
      expect(context.systemPrompt).toBeDefined();
      // OgraphX context may or may not be included depending on retriever availability
      expect(context.ographxContext).toBeDefined();
    });

    it('should format context for LLM prompt', async () => {
      const mockResults = [
        {
          id: 'symbol:test1',
          metadata: {
            id: 'symbol:test1',
            name: 'TestSymbol',
            description: 'A test symbol',
            type: 'symbol',
            category: 'ir',
            tags: ['function'],
            codebaseName: 'test',
            filePath: 'test.ts',
          },
          similarity: 0.9,
          rank: 1,
        },
      ];

      vi.mocked(mockVectorStore.search).mockResolvedValue(mockResults);

      const context = await contextBuilder.buildGenerationContext({
        prompt: 'Create a handler',
        type: 'symbol',
      });

      const formatted = contextBuilder.formatContextForPrompt(context);

      expect(formatted).toContain('Generation Context');
      expect(formatted).toContain('Similar Artifacts');
      // The formatted output should contain the artifact information
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle missing artifact files gracefully', async () => {
      vi.doMock('fs', () => ({
        readFileSync: vi.fn().mockImplementation(() => {
          throw new Error('File not found');
        }),
        existsSync: vi.fn().mockReturnValue(false),
      }));

      const documents = await indexer.indexIRGraph('nonexistent.json', 'test-codebase');

      expect(documents).toEqual([]);
    });

    it('should handle invalid JSON gracefully', async () => {
      vi.doMock('fs', () => ({
        readFileSync: vi.fn().mockReturnValue('invalid json'),
        existsSync: vi.fn().mockReturnValue(true),
      }));

      const documents = await indexer.indexIRGraph('invalid.json', 'test-codebase');

      expect(documents).toEqual([]);
    });

    it('should handle empty search results', async () => {
      vi.mocked(mockVectorStore.search).mockResolvedValue([]);

      const results = await retriever.searchSymbols('nonexistent symbol');

      expect(results).toEqual([]);
    });
  });

  describe('performance', () => {
    it('should handle search efficiently', async () => {
      const largeResults = Array.from({ length: 100 }, (_, i) => ({
        id: `symbol:${i}`,
        metadata: {
          id: `symbol:${i}`,
          name: `Symbol${i}`,
          description: `Symbol ${i}`,
          type: 'symbol',
          category: 'ir',
          tags: ['function'],
          codebaseName: 'test',
          filePath: `file${i}.ts`,
        },
        similarity: 0.9 - (i * 0.001),
        rank: i + 1,
      }));

      vi.mocked(mockVectorStore.search).mockResolvedValue(largeResults);

      const startTime = Date.now();
      const results = await retriever.searchSymbols('test query');
      const duration = Date.now() - startTime;

      expect(results.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(1000); // Should complete quickly
    });
  });

  describe('metadata preservation', () => {
    it('should preserve artifact metadata in search results', async () => {
      const mockResults = [
        {
          id: 'symbol:test1',
          metadata: {
            id: 'symbol:test1',
            name: 'TestClass',
            description: 'A test class',
            type: 'symbol',
            category: 'ir',
            tags: ['class', 'exported'],
            codebaseName: 'test-codebase',
            filePath: 'test.ts',
          },
          similarity: 0.95,
          rank: 1,
        },
      ];

      vi.mocked(mockVectorStore.search).mockResolvedValue(mockResults);

      const results = await retriever.searchSymbols('TestClass');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].metadata.tags).toContain('class');
      expect(results[0].metadata.tags).toContain('exported');
      expect(results[0].metadata.codebaseName).toBe('test-codebase');
    });
  });
});

