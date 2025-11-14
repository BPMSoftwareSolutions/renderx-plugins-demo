/**
 * OgraphX Artifact Indexer Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OgraphXArtifactIndexer } from '../ographx-artifact-indexer';
import { VectorStore, ComponentMetadata, EmbeddingService } from '../../store/store.types';

describe('OgraphXArtifactIndexer', () => {
  let indexer: OgraphXArtifactIndexer;
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
  });

  describe('indexIRGraph', () => {
    it('should index IR graph symbols', async () => {
      const irPath = 'test-ir.json';
      const mockIRGraph = {
        files: ['file1.ts', 'file2.ts'],
        symbols: [
          {
            id: 'symbol1',
            file: 'file1.ts',
            kind: 'class',
            name: 'MyClass',
            class_name: null,
            exported: true,
            params_contract: null,
            range: [1, 10],
          },
        ],
        calls: [
          {
            id: 'call1',
            from: 'symbol1',
            to: 'symbol2',
            range: [5, 5],
          },
        ],
      };

      // Mock fs.readFileSync
      vi.doMock('fs', () => ({
        readFileSync: vi.fn().mockReturnValue(JSON.stringify(mockIRGraph)),
        existsSync: vi.fn().mockReturnValue(true),
      }));

      const documents = await indexer.indexIRGraph(irPath, 'test-codebase');

      expect(documents.length).toBeGreaterThan(0);
      expect(documents.some(d => d.type === 'symbol')).toBe(true);
      expect(documents.some(d => d.type === 'call')).toBe(true);
    });

    it('should handle missing IR graph file gracefully', async () => {
      const irPath = 'nonexistent.json';
      const documents = await indexer.indexIRGraph(irPath, 'test-codebase');

      expect(documents).toEqual([]);
    });
  });

  describe('indexSequences', () => {
    it('should index sequences with movements and beats', async () => {
      const seqPath = 'test-sequences.json';
      const mockSequences = {
        version: '0.1.0',
        sequences: [
          {
            id: 'seq1',
            name: 'Test Sequence',
            type: 'sequence',
            movements: [
              {
                id: 'mov1',
                name: 'Initialization',
                beats: [
                  {
                    id: 'beat1',
                    event: 'start',
                    timing: 'immediate',
                  },
                ],
              },
            ],
          },
        ],
      };

      vi.doMock('fs', () => ({
        readFileSync: vi.fn().mockReturnValue(JSON.stringify(mockSequences)),
        existsSync: vi.fn().mockReturnValue(true),
      }));

      const documents = await indexer.indexSequences(seqPath, 'test-codebase');

      expect(documents.length).toBeGreaterThan(0);
      expect(documents.some(d => d.type === 'sequence')).toBe(true);
      expect(documents.some(d => d.type === 'movement')).toBe(true);
      expect(documents.some(d => d.type === 'beat')).toBe(true);
    });
  });

  describe('indexTestStructure', () => {
    it('should index test categories', async () => {
      const testPath = 'test-structure.json';
      const mockTestStructure = {
        unit: {
          'Core Tests': [
            {
              name: 'TestClass',
              description: 'Test class description',
              methods: [
                {
                  name: 'test_method',
                  description: 'Test method description',
                },
              ],
              count: 1,
            },
          ],
        },
      };

      vi.doMock('fs', () => ({
        readFileSync: vi.fn().mockReturnValue(JSON.stringify(mockTestStructure)),
        existsSync: vi.fn().mockReturnValue(true),
      }));

      const documents = await indexer.indexTestStructure(testPath, 'test-codebase');

      expect(documents.length).toBeGreaterThan(0);
      expect(documents.some(d => d.type === 'test')).toBe(true);
    });
  });

  describe('indexAnalysis', () => {
    it('should index analysis metrics', async () => {
      const analysisPath = 'analysis.json';
      const mockAnalysis = {
        version: '0.1.0',
        generated_at: '2025-11-13',
        statistics: {
          files: 10,
          symbols: 50,
          calls: 100,
          contracts: 40,
        },
        symbol_types: { class: 10, function: 40 },
        call_distribution: { direct: 80, indirect: 20 },
        complexity: {
          average_calls_per_symbol: 2.0,
          max_calls_per_symbol: 10,
          min_calls_per_symbol: 0,
        },
        coverage: {
          symbols_with_calls: 40,
          symbols_without_calls: 10,
        },
      };

      vi.doMock('fs', () => ({
        readFileSync: vi.fn().mockReturnValue(JSON.stringify(mockAnalysis)),
        existsSync: vi.fn().mockReturnValue(true),
      }));

      const documents = await indexer.indexAnalysis(analysisPath, 'test-codebase');

      expect(documents.length).toBeGreaterThan(0);
      expect(documents.some(d => d.type === 'metric')).toBe(true);
    });
  });

  describe('document structure', () => {
    it('should create documents with proper metadata', async () => {
      const irPath = 'test-ir.json';
      const mockIRGraph = {
        files: ['file1.ts'],
        symbols: [
          {
            id: 'symbol1',
            file: 'file1.ts',
            kind: 'function',
            name: 'testFunc',
            class_name: null,
            exported: true,
            params_contract: null,
            range: [1, 5],
          },
        ],
        calls: [],
      };

      vi.doMock('fs', () => ({
        readFileSync: vi.fn().mockReturnValue(JSON.stringify(mockIRGraph)),
        existsSync: vi.fn().mockReturnValue(true),
      }));

      const documents = await indexer.indexIRGraph(irPath, 'test-codebase');
      const symbolDoc = documents.find(d => d.type === 'symbol');

      expect(symbolDoc).toBeDefined();
      expect(symbolDoc?.metadata.artifactType).toBe('ir');
      expect(symbolDoc?.metadata.codebaseName).toBe('test-codebase');
      expect(symbolDoc?.metadata.tags).toContain('function');
      expect(symbolDoc?.metadata.tags).toContain('exported');
    });
  });
});

