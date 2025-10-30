/**
 * Component Indexer Implementation
 * Indexes components from JSON files and populates the vector store
 */

import { VectorStore, ComponentMetadata, EmbeddingService } from '../store/store.types';
import { ComponentIndexer, IndexResult, IndexProgress, IndexError } from './indexer.types';

export class DefaultComponentIndexer implements ComponentIndexer {
  private progress: IndexProgress;
  private errors: IndexError[] = [];

  constructor(
    private vectorStore: VectorStore,
    private embeddingService: EmbeddingService
  ) {
    this.progress = {
      total: 0,
      processed: 0,
      percentage: 0,
      startTime: new Date(),
    };
  }

  /**
   * Index all components from directory
   * Note: This is a simplified implementation. In production, you'd read from actual files.
   */
  async indexDirectory(path: string): Promise<IndexResult> {
    this.progress = {
      total: 0,
      processed: 0,
      percentage: 0,
      startTime: new Date(),
    };
    this.errors = [];

    // This would be implemented to read from actual file system
    // For now, return empty result as placeholder
    return {
      total: 0,
      indexed: 0,
      failed: 0,
      errors: [],
    };
  }

  /**
   * Index single component
   */
  async indexComponent(componentId: string, componentData: Record<string, unknown>): Promise<void> {
    try {
      // Extract metadata from component data
      const metadata = this.extractMetadata(componentId, componentData);

      // Generate embedding from component description and markup
      const textToEmbed = this.generateEmbeddingText(metadata);
      const embedding = await this.embeddingService.embed(textToEmbed);

      // Add to vector store
      await this.vectorStore.add(componentId, embedding, metadata);

      this.progress.processed++;
      this.updateProgress();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.errors.push({
        componentId,
        error: errorMessage,
        timestamp: new Date(),
      });
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
   * Get indexing progress
   */
  getProgress(): IndexProgress {
    return { ...this.progress };
  }

  /**
   * Update progress percentage
   */
  private updateProgress(): void {
    if (this.progress.total > 0) {
      this.progress.percentage = (this.progress.processed / this.progress.total) * 100;
      const elapsed = Date.now() - this.progress.startTime.getTime();
      const rate = this.progress.processed / (elapsed / 1000); // items per second
      if (rate > 0) {
        const remaining = this.progress.total - this.progress.processed;
        this.progress.estimatedTimeRemaining = (remaining / rate) * 1000; // in milliseconds
      }
    }
  }

  /**
   * Clear all indexed components
   */
  async clear(): Promise<void> {
    await this.vectorStore.clear();
    this.progress = {
      total: 0,
      processed: 0,
      percentage: 0,
      startTime: new Date(),
    };
    this.errors = [];
  }
}

