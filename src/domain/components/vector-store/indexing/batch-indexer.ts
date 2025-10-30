/**
 * Batch Indexer Implementation
 * Indexes components in batches for improved performance
 */

import { VectorStore, ComponentMetadata, EmbeddingService } from '../store/store.types';
import { IndexResult, IndexError } from './indexer.types';

export interface BatchIndexerOptions {
  batchSize?: number;
  concurrency?: number;
}

export class BatchIndexer {
  private batchSize: number;
  private concurrency: number;
  private errors: IndexError[] = [];

  constructor(
    private vectorStore: VectorStore,
    private embeddingService: EmbeddingService,
    options?: BatchIndexerOptions
  ) {
    this.batchSize = options?.batchSize ?? 10;
    this.concurrency = options?.concurrency ?? 5;
  }

  /**
   * Index components in batches
   */
  async indexBatch(
    components: Array<{ id: string; data: Record<string, unknown> }>
  ): Promise<IndexResult> {
    this.errors = [];
    let indexed = 0;
    let failed = 0;

    // Process components in batches
    for (let i = 0; i < components.length; i += this.batchSize) {
      const batch = components.slice(i, i + this.batchSize);

      // Process batch with concurrency limit
      const results = await Promise.allSettled(
        batch.map((component) => this.indexComponent(component.id, component.data))
      );

      // Count successes and failures
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          indexed++;
        } else {
          failed++;
        }
      });
    }

    return {
      total: components.length,
      indexed,
      failed,
      errors: this.errors,
    };
  }

  /**
   * Index single component
   */
  private async indexComponent(
    componentId: string,
    componentData: Record<string, unknown>
  ): Promise<void> {
    try {
      const metadata = this.extractMetadata(componentId, componentData);
      const textToEmbed = this.generateEmbeddingText(metadata);
      const embedding = await this.embeddingService.embed(textToEmbed);
      await this.vectorStore.add(componentId, embedding, metadata);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.errors.push({
        componentId,
        error: errorMessage,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Extract metadata from component data
   */
  private extractMetadata(componentId: string, componentData: Record<string, unknown>): ComponentMetadata {
    return {
      id: componentId,
      name: (componentData.name as string) || componentId,
      description: (componentData.description as string) || '',
      type: (componentData.type as string) || 'unknown',
      category: (componentData.category as string) || 'general',
      tags: (componentData.tags as string[]) || [],
      markup: (componentData.markup as string) || undefined,
      cssPreview: (componentData.cssPreview as string) || undefined,
      template: (componentData.template as Record<string, unknown>) || undefined,
    };
  }

  /**
   * Generate text for embedding from component metadata
   */
  private generateEmbeddingText(metadata: ComponentMetadata): string {
    const parts: string[] = [
      metadata.name,
      metadata.description,
      metadata.type,
      metadata.category,
      ...metadata.tags,
    ];

    return parts.filter((p) => p && p.length > 0).join(' ');
  }

  /**
   * Get errors from last indexing operation
   */
  getErrors(): IndexError[] {
    return [...this.errors];
  }

  /**
   * Clear errors
   */
  clearErrors(): void {
    this.errors = [];
  }
}

