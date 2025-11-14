/**
 * OgraphX Context Builder Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OgraphXContextBuilder } from '../ographx-context-builder';
import { OgraphXArtifactRetriever } from '../../search/ographx-artifact-retriever';

describe('OgraphXContextBuilder', () => {
  let builder: OgraphXContextBuilder;
  let mockRetriever: OgraphXArtifactRetriever;

  beforeEach(() => {
    mockRetriever = {
      searchSymbols: vi.fn().mockResolvedValue([]),
      searchSequences: vi.fn().mockResolvedValue([]),
      searchHandlers: vi.fn().mockResolvedValue([]),
      findCallChain: vi.fn().mockResolvedValue({ chain: [], totalCalls: 0 }),
      findDependents: vi.fn().mockResolvedValue([]),
      discoverPatterns: vi.fn().mockResolvedValue([]),
      getSearchStats: vi.fn().mockReturnValue({}),
    } as any;

    builder = new OgraphXContextBuilder(mockRetriever);
  });

  describe('buildGenerationContext', () => {
    it('should build context for symbol generation', async () => {
      const mockArtifacts = [
        {
          id: 'symbol:test1',
          type: 'symbol' as const,
          title: 'TestSymbol',
          content: 'A test symbol',
          similarity: 0.9,
          metadata: {
            artifactType: 'ir',
            codebaseName: 'test-codebase',
            filePath: 'test.ts',
            tags: ['function', 'handler'],
            relationships: {},
          },
        },
      ];

      vi.mocked(mockRetriever.searchSymbols).mockResolvedValue(mockArtifacts);
      vi.mocked(mockRetriever.discoverPatterns).mockResolvedValue([]);

      const context = await builder.buildGenerationContext({
        prompt: 'Create a handler for canvas selection',
        type: 'symbol',
        codebase: 'renderx-web',
      });

      expect(context.prompt).toBe('Create a handler for canvas selection');
      expect(context.type).toBe('symbol');
      expect(context.codebase).toBe('renderx-web');
      expect(context.similarArtifacts.length).toBeGreaterThan(0);
      expect(context.metadata.totalArtifactsFound).toBeGreaterThan(0);
    });

    it('should build context for sequence generation', async () => {
      const mockSequences = [
        {
          id: 'sequence:seq1',
          type: 'sequence' as const,
          title: 'ComponentCreation',
          content: 'Sequence with 3 movements and 5 beats',
          similarity: 0.85,
          metadata: {
            artifactType: 'sequence',
            codebaseName: 'test-codebase',
            filePath: 'sequences.json',
            tags: ['orchestration', 'component'],
            relationships: {},
          },
        },
      ];

      vi.mocked(mockRetriever.searchSequences).mockResolvedValue(mockSequences);
      vi.mocked(mockRetriever.discoverPatterns).mockResolvedValue([]);

      const context = await builder.buildGenerationContext({
        prompt: 'Create a sequence for component lifecycle',
        type: 'sequence',
      });

      expect(context.type).toBe('sequence');
      expect(context.similarArtifacts.length).toBeGreaterThan(0);
    });

    it('should calculate metadata correctly', async () => {
      const mockArtifacts = [
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
            tags: ['function', 'handler', 'event'],
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
            tags: ['function', 'handler'],
            relationships: {},
          },
        },
      ];

      vi.mocked(mockRetriever.searchSymbols).mockResolvedValue(mockArtifacts);
      vi.mocked(mockRetriever.discoverPatterns).mockResolvedValue([]);

      const context = await builder.buildGenerationContext({
        prompt: 'test',
        type: 'symbol',
      });

      expect(context.metadata.totalArtifactsFound).toBe(2);
      expect(context.metadata.averageSimilarity).toBeCloseTo(0.85, 2);
      expect(context.metadata.topTags).toContain('function');
      expect(context.metadata.topTags).toContain('handler');
    });
  });

  describe('buildHandlerContext', () => {
    it('should build context for handler generation', async () => {
      const mockHandlers = [
        {
          id: 'symbol:onDragStart',
          type: 'symbol' as const,
          title: 'onDragStart',
          content: 'Drag start handler',
          similarity: 0.92,
          metadata: {
            artifactType: 'ir',
            codebaseName: 'test',
            filePath: 'handlers.ts',
            tags: ['function', 'handler', 'event'],
            relationships: {},
          },
        },
      ];

      vi.mocked(mockRetriever.searchHandlers).mockResolvedValue(mockHandlers);
      vi.mocked(mockRetriever.discoverPatterns).mockResolvedValue([]);
      vi.mocked(mockRetriever.searchSequences).mockResolvedValue([]);

      const context = await builder.buildHandlerContext('onDragStart');

      expect(context.handlerName).toBe('onDragStart');
      expect(context.similarHandlers.length).toBeGreaterThan(0);
      expect(context.metadata.eventTypes).toContain('event');
    });
  });

  describe('buildSequenceContext', () => {
    it('should build context for sequence generation', async () => {
      const mockSequences = [
        {
          id: 'sequence:seq1',
          type: 'sequence' as const,
          title: 'ComponentCreation',
          content: 'Sequence with 3 movements and 5 beats',
          similarity: 0.88,
          metadata: {
            artifactType: 'sequence',
            codebaseName: 'test',
            filePath: 'sequences.json',
            tags: ['orchestration', 'movement'],
            relationships: {},
          },
        },
      ];

      vi.mocked(mockRetriever.searchSequences).mockResolvedValue(mockSequences);
      vi.mocked(mockRetriever.discoverPatterns).mockResolvedValue([]);
      vi.mocked(mockRetriever.searchHandlers).mockResolvedValue([]);

      const context = await builder.buildSequenceContext('ComponentCreation');

      expect(context.sequenceName).toBe('ComponentCreation');
      expect(context.similarSequences.length).toBeGreaterThan(0);
      expect(context.metadata.movementCount).toBeGreaterThan(0);
    });
  });

  describe('formatContextForPrompt', () => {
    it('should format context for LLM prompt', async () => {
      const mockArtifacts = [
        {
          id: 'test1',
          type: 'symbol' as const,
          title: 'TestSymbol',
          content: 'This is a test symbol with some content',
          similarity: 0.9,
          metadata: {
            artifactType: 'ir',
            codebaseName: 'test',
            filePath: 'test.ts',
            tags: ['function', 'handler'],
            relationships: {},
          },
        },
      ];

      vi.mocked(mockRetriever.searchSymbols).mockResolvedValue(mockArtifacts);
      vi.mocked(mockRetriever.discoverPatterns).mockResolvedValue([]);

      const context = await builder.buildGenerationContext({
        prompt: 'Create a handler',
        type: 'symbol',
      });

      const formatted = builder.formatContextForPrompt(context);

      expect(formatted).toContain('Generation Context for symbol');
      expect(formatted).toContain('Similar Artifacts');
      expect(formatted).toContain('TestSymbol');
      expect(formatted).toContain('renderx-web');
    });

    it('should include patterns in formatted context', async () => {
      const mockPatterns = [
        {
          patternId: 'pattern1',
          name: 'EventHandler',
          description: 'Common event handler pattern',
          examples: [],
          similarity: 0.85,
          frequency: 5,
          tags: ['handler', 'event'],
        },
      ];

      vi.mocked(mockRetriever.searchSymbols).mockResolvedValue([]);
      vi.mocked(mockRetriever.discoverPatterns).mockResolvedValue(mockPatterns);

      const context = await builder.buildGenerationContext({
        prompt: 'Create a handler',
        type: 'symbol',
      });

      const formatted = builder.formatContextForPrompt(context);

      expect(formatted).toContain('Discovered Patterns');
      expect(formatted).toContain('EventHandler');
    });
  });
});

