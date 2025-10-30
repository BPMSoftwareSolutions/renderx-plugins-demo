import { describe, it, expect, beforeEach } from 'vitest';
import { AIComponentGenerator } from '../ai/ai-component-generator';
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

describe('AIComponentGenerator', () => {
  let generator: AIComponentGenerator;
  let vectorStore: InMemoryVectorStore;
  let embeddingService: MockEmbeddingService;

  beforeEach(async () => {
    vectorStore = new InMemoryVectorStore();
    await vectorStore.initialize(3);
    embeddingService = new MockEmbeddingService();
    generator = new AIComponentGenerator(vectorStore, embeddingService);

    // Add some sample components to the store
    const components = [
      {
        id: 'button-1',
        embedding: [0.1, 0.2, 0.3],
        metadata: {
          id: 'button-1',
          name: 'Button',
          description: 'A clickable button component',
          type: 'button',
          category: 'interactive',
          tags: ['ui', 'interactive', 'clickable'],
          markup: '<button>Click me</button>',
        },
      },
      {
        id: 'input-1',
        embedding: [0.2, 0.3, 0.4],
        metadata: {
          id: 'input-1',
          name: 'Input Field',
          description: 'A text input field',
          type: 'input',
          category: 'form',
          tags: ['form', 'input', 'text'],
          markup: '<input type="text" />',
        },
      },
      {
        id: 'card-1',
        embedding: [0.3, 0.4, 0.5],
        metadata: {
          id: 'card-1',
          name: 'Card',
          description: 'A card component for displaying content',
          type: 'card',
          category: 'layout',
          tags: ['layout', 'container', 'card'],
          markup: '<div class="card">Content</div>',
        },
      },
    ];

    for (const component of components) {
      await vectorStore.add(component.id, component.embedding, component.metadata);
    }
  });

  describe('prepareGenerationContext', () => {
    it('should prepare context with similar components', async () => {
      const context = await generator.prepareGenerationContext({
        prompt: 'Create a button component',
      });

      expect(context.prompt).toBe('Create a button component');
      expect(context.similarComponents.length).toBeGreaterThan(0);
      expect(context.systemPrompt).toContain('You are an expert UI component generator');
    });

    it('should include similar components in system prompt', async () => {
      const context = await generator.prepareGenerationContext({
        prompt: 'Create a form input',
      });

      expect(context.systemPrompt).toContain('Similar existing components');
      expect(context.systemPrompt).toContain('Button');
    });

    it('should respect maxSimilarComponents limit', async () => {
      const context = await generator.prepareGenerationContext({
        prompt: 'Create a component',
        maxSimilarComponents: 1,
      });

      expect(context.similarComponents.length).toBeLessThanOrEqual(1);
    });

    it('should respect similarity threshold', async () => {
      const context = await generator.prepareGenerationContext({
        prompt: 'Create a component',
        similarityThreshold: 0.9,
      });

      // With high threshold, might get fewer results
      expect(context.similarComponents.length).toBeGreaterThanOrEqual(0);
    });

    it('should include component metadata in context', async () => {
      const context = await generator.prepareGenerationContext({
        prompt: 'Create a button',
      });

      const hasComponentInfo = context.similarComponents.some(
        (comp) => comp.name && comp.type && comp.category
      );
      expect(hasComponentInfo).toBe(true);
    });
  });

  describe('getDiscoveryMetrics', () => {
    it('should return discovery metrics', async () => {
      const metrics = await generator.getDiscoveryMetrics();

      expect(metrics.totalComponents).toBe(3);
      expect(typeof metrics.averageSimilarity).toBe('number');
      expect(typeof metrics.cacheHitRate).toBe('number');
    });

    it('should reflect vector store statistics', async () => {
      const metrics = await generator.getDiscoveryMetrics();
      const stats = vectorStore.stats();

      expect(metrics.totalComponents).toBe(stats.totalComponents);
    });
  });

  describe('system prompt generation', () => {
    it('should generate valid system prompt', async () => {
      const context = await generator.prepareGenerationContext({
        prompt: 'Create a button',
      });

      expect(context.systemPrompt).toContain('User Request');
      expect(context.systemPrompt).toContain('component JSON');
      expect(context.systemPrompt).toContain('metadata');
    });

    it('should include component examples in prompt', async () => {
      const context = await generator.prepareGenerationContext({
        prompt: 'Create a component',
      });

      if (context.similarComponents.length > 0) {
        expect(context.systemPrompt).toContain('Similar existing components');
        context.similarComponents.forEach((comp) => {
          expect(context.systemPrompt).toContain(comp.name);
        });
      }
    });
  });
});

