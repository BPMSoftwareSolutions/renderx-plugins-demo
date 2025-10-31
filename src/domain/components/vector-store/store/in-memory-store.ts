/**
 * In-Memory Vector Store Implementation
 * Suitable for development, testing, and small to medium-sized component libraries
 */

import {
  VectorStore,
  ComponentMetadata,
  SearchOptions,
  SearchResult,
  StoreStats,
} from './store.types';
import { cosineSimilarity } from '../search/similarity-search';

interface StoredComponent {
  id: string;
  embedding: number[];
  metadata: ComponentMetadata;
}

export class InMemoryVectorStore implements VectorStore {
  private components: Map<string, StoredComponent> = new Map();
  private initialized: boolean = false;
  private embeddingDimensions: number = 0;
  private lastUpdated: Date = new Date();

  /**
   * Initialize the store
   */
  async initialize(embeddingDimensions: number): Promise<void> {
    this.embeddingDimensions = embeddingDimensions;
    this.initialized = true;
  }

  /**
   * Add a component to the store
   */
  async add(id: string, embedding: number[], metadata: ComponentMetadata): Promise<void> {
    if (!this.initialized) {
      throw new Error('Vector store not initialized');
    }

    if (embedding.length !== this.embeddingDimensions) {
      throw new Error(
        `Embedding dimension mismatch: expected ${this.embeddingDimensions}, got ${embedding.length}`
      );
    }

    this.components.set(id, {
      id,
      embedding,
      metadata,
    });

    this.lastUpdated = new Date();
  }

  /**
   * Search for similar components
   */
  async search(query: number[], options?: SearchOptions): Promise<SearchResult[]> {
    if (!this.initialized) {
      throw new Error('Vector store not initialized');
    }

    if (query.length !== this.embeddingDimensions) {
      throw new Error(
        `Query embedding dimension mismatch: expected ${this.embeddingDimensions}, got ${query.length}`
      );
    }

    const limit = options?.limit ?? 5;
    const threshold = options?.threshold ?? 0;
    const filters = options?.filters;

    // Calculate similarity for all components
    const results: SearchResult[] = [];

    this.components.forEach((component) => {
      // Apply filters if provided
      if (filters) {
        if (filters.category && component.metadata.category !== filters.category) {
          return;
        }
        if (filters.type && component.metadata.type !== filters.type) {
          return;
        }
        if (filters.tags && filters.tags.length > 0) {
          const hasMatchingTag = filters.tags.some((tag) =>
            component.metadata.tags.includes(tag)
          );
          if (!hasMatchingTag) {
            return;
          }
        }
      }

      const similarity = cosineSimilarity(query, component.embedding);

      if (similarity >= threshold) {
        results.push({
          id: component.id,
          metadata: component.metadata,
          similarity,
          rank: 0, // Will be set after sorting
        });
      }
    });

    // Sort by similarity (descending)
    results.sort((a, b) => b.similarity - a.similarity);

    // Set ranks and limit results
    return results.slice(0, limit).map((result, index) => ({
      ...result,
      rank: index + 1,
    }));
  }

  /**
   * Get component by ID
   */
  async get(id: string): Promise<ComponentMetadata | null> {
    const component = this.components.get(id);
    return component?.metadata ?? null;
  }

  /**
   * Remove component from store
   */
  async remove(id: string): Promise<void> {
    this.components.delete(id);
    this.lastUpdated = new Date();
  }

  /**
   * Clear all components from store
   */
  async clear(): Promise<void> {
    this.components.clear();
    this.lastUpdated = new Date();
  }

  /**
   * Get store statistics
   */
  stats(): StoreStats {
    return {
      totalComponents: this.components.size,
      embeddingDimensions: this.embeddingDimensions,
      lastUpdated: this.lastUpdated,
    };
  }

  /**
   * Check if store is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

