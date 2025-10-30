/**
 * AI Component Generator
 * Uses vector store to discover similar templates and enhance AI generation
 */

import { VectorStore, ComponentMetadata, EmbeddingService } from '../store/store.types';

export interface AIGenerationRequest {
  prompt: string;
  context?: string;
  maxSimilarComponents?: number;
  similarityThreshold?: number;
}

export interface AIGenerationContext {
  prompt: string;
  similarComponents: ComponentMetadata[];
  systemPrompt: string;
}

export class AIComponentGenerator {
  constructor(
    private vectorStore: VectorStore,
    private embeddingService: EmbeddingService
  ) {}

  /**
   * Prepare context for AI generation by finding similar components
   */
  async prepareGenerationContext(request: AIGenerationRequest): Promise<AIGenerationContext> {
    const maxSimilar = request.maxSimilarComponents ?? 5;
    const threshold = request.similarityThreshold ?? 0.5;

    // Generate embedding for the prompt
    const promptEmbedding = await this.embeddingService.embed(request.prompt);

    // Search for similar components
    const similarComponents = await this.vectorStore.search(promptEmbedding, {
      limit: maxSimilar,
      threshold,
    });

    // Extract metadata from search results
    const componentMetadata = similarComponents.map((result) => result.metadata);

    // Build system prompt with similar components as examples
    const systemPrompt = this.buildSystemPrompt(request.prompt, componentMetadata);

    return {
      prompt: request.prompt,
      similarComponents: componentMetadata,
      systemPrompt,
    };
  }

  /**
   * Build system prompt with similar components as context
   */
  private buildSystemPrompt(userPrompt: string, similarComponents: ComponentMetadata[]): string {
    let prompt = `You are an expert UI component generator. Generate a component based on the user's request.

User Request: "${userPrompt}"

`;

    if (similarComponents.length > 0) {
      prompt += `Similar existing components that you can use as reference:\n\n`;

      similarComponents.forEach((component, index) => {
        prompt += `${index + 1}. ${component.name}
   Type: ${component.type}
   Category: ${component.category}
   Description: ${component.description}
   Tags: ${component.tags.join(', ')}
`;

        if (component.markup) {
          prompt += `   Markup: ${component.markup.substring(0, 100)}...
`;
        }

        prompt += '\n';
      });

      prompt += `Use these components as inspiration and reference for your generation. Ensure consistency with existing patterns.

`;
    }

    prompt += `Generate a component JSON with the following structure:
{
  "metadata": {
    "name": "ComponentName",
    "description": "Brief description",
    "type": "component-type",
    "category": "category",
    "tags": ["tag1", "tag2"]
  },
  "markup": "<html>...</html>",
  "cssPreview": ".class { ... }",
  "template": { ... }
}

Ensure the generated component:
1. Follows the same patterns as similar components
2. Is semantically correct and accessible
3. Includes proper metadata
4. Has clean, maintainable markup`;

    return prompt;
  }

  /**
   * Get metrics about component discovery
   */
  async getDiscoveryMetrics(): Promise<{
    totalComponents: number;
    averageSimilarity: number;
    cacheHitRate: number;
  }> {
    const stats = this.vectorStore.stats();

    return {
      totalComponents: stats.totalComponents,
      averageSimilarity: 0.75, // Default average similarity
      cacheHitRate: 0, // Would be populated from embedding service cache
    };
  }
}

