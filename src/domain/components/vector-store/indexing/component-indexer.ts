/**
 * Component Indexer Implementation
 * Indexes components from JSON files and populates the vector store
 */


import { VectorStore, ComponentMetadata, EmbeddingService } from '../store/store.types';
import { ComponentIndexer, IndexResult, IndexProgress, IndexError } from './indexer.types';
import { ComponentLoader, LoadedComponent } from '../loaders/component-loader';

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
  async indexDirectory(dirPath: string): Promise<IndexResult> {
    this.progress = {
      total: 0,
      processed: 0,
      percentage: 0,
      startTime: new Date(),
    };
    this.errors = [];

    const loader = new ComponentLoader();
    let components: LoadedComponent[] = [];
    try {
      components = await loader.loadAll({ basePath: dirPath });
    } catch (err) {
      this.errors.push({
        componentId: 'ALL',
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date(),
      });
      return {
        total: 0,
        indexed: 0,
        failed: 0, // No components failed, directory-level error only
        errors: this.errors,
      };
    }

    this.progress.total = components.length;
    for (const comp of components) {
      await this.indexComponent(comp.id, comp.data);
    }

    return {
      total: components.length,
      indexed: this.progress.processed,
      failed: this.errors.length,
      errors: this.errors,
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
    // Try nested RenderX format first
    let metadata = (componentData.metadata as Record<string, unknown>) || {};
    let ui = (componentData.ui as Record<string, any>) || {};
    // If metadata is empty, try flat format
    if (Object.keys(metadata).length === 0) {
      metadata = componentData;
    }
    const styles = (ui.styles as Record<string, any>) || {};
    return {
      id: componentId,
      name: (metadata.name as string) || componentId,
      description: (metadata.description as string) || '',
      type: (metadata.type as string) || 'unknown',
      category: (metadata.category as string) || 'general',
      tags: (metadata.tags as string[]) || [],
      markup: (ui.template as string) || undefined,
      cssPreview: (styles.css as string)?.substring(0, 200) || undefined,
      template: ui || undefined,
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

