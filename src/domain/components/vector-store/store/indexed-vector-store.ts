/**
 * Indexed Vector Store Implementation
 * Optimized for large-scale component libraries with indexing for faster searches
 */

import { VectorStore, ComponentMetadata, SearchOptions, SearchResult, StoreStats } from './store.types';
import { cosineSimilarity } from '../search/similarity-search';

interface StoredComponent {
  metadata: ComponentMetadata;
  embedding: number[];
}

interface CategoryIndex {
  [category: string]: string[]; // component IDs by category
}

interface TypeIndex {
  [type: string]: string[]; // component IDs by type
}

interface TagIndex {
  [tag: string]: string[]; // component IDs by tag
}

export class IndexedVectorStore implements VectorStore {
  private components: Map<string, StoredComponent> = new Map();
  private initialized: boolean = false;
  private embeddingDimensions: number = 0;

  // Indices for faster filtering
  private categoryIndex: CategoryIndex = {};
  private typeIndex: TypeIndex = {};
  private tagIndex: TagIndex = {};

  /**
   * Initialize the vector store with embedding dimensions
   */
  async initialize(dimensions: number): Promise<void> {
    this.embeddingDimensions = dimensions;
    this.initialized = true;
  }

  /**
   * Add component to store with indexing
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

    // Store component
    this.components.set(id, { metadata, embedding });

    // Update indices
    this.updateIndices(id, metadata);
  }

  /**
   * Search for similar components with index-based filtering
   */
  async search(query: number[], options?: SearchOptions): Promise<SearchResult[]> {
    if (!this.initialized) {
      throw new Error('Vector store not initialized');
    }

    const limit = options?.limit ?? 5;
    const threshold = options?.threshold ?? 0;
    const filters = options?.filters;

    // Get candidate IDs based on filters
    let candidateIds: Set<string>;

    if (filters) {
      candidateIds = this.getFilteredCandidates(filters);
    } else {
      candidateIds = new Set(this.components.keys());
    }

    // Calculate similarity for candidates
    const results: SearchResult[] = [];

    candidateIds.forEach((id) => {
      const component = this.components.get(id);
      if (!component) return;

      const similarity = cosineSimilarity(query, component.embedding);

      if (similarity >= threshold) {
        results.push({
          id,
          metadata: component.metadata,
          similarity,
          rank: 0,
        });
      }
    });

    // Sort by similarity and rank
    results.sort((a, b) => b.similarity - a.similarity);
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    return results.slice(0, limit);
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
    const component = this.components.get(id);
    if (!component) return;

    this.components.delete(id);
    this.removeFromIndices(id, component.metadata);
  }

  /**
   * Clear all components
   */
  async clear(): Promise<void> {
    this.components.clear();
    this.categoryIndex = {};
    this.typeIndex = {};
    this.tagIndex = {};
  }

  /**
   * Get store statistics
   */
  stats(): StoreStats {
    return {
      totalComponents: this.components.size,
      embeddingDimensions: this.embeddingDimensions,
      lastUpdated: new Date(),
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Check if store is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Update indices when adding a component
   */
  private updateIndices(id: string, metadata: ComponentMetadata): void {
    // Update category index
    if (!this.categoryIndex[metadata.category]) {
      this.categoryIndex[metadata.category] = [];
    }
    if (!this.categoryIndex[metadata.category].includes(id)) {
      this.categoryIndex[metadata.category].push(id);
    }

    // Update type index
    if (!this.typeIndex[metadata.type]) {
      this.typeIndex[metadata.type] = [];
    }
    if (!this.typeIndex[metadata.type].includes(id)) {
      this.typeIndex[metadata.type].push(id);
    }

    // Update tag index
    metadata.tags.forEach((tag) => {
      if (!this.tagIndex[tag]) {
        this.tagIndex[tag] = [];
      }
      if (!this.tagIndex[tag].includes(id)) {
        this.tagIndex[tag].push(id);
      }
    });
  }

  /**
   * Remove component from indices
   */
  private removeFromIndices(id: string, metadata: ComponentMetadata): void {
    // Remove from category index
    if (this.categoryIndex[metadata.category]) {
      this.categoryIndex[metadata.category] = this.categoryIndex[metadata.category].filter(
        (cid) => cid !== id
      );
    }

    // Remove from type index
    if (this.typeIndex[metadata.type]) {
      this.typeIndex[metadata.type] = this.typeIndex[metadata.type].filter((cid) => cid !== id);
    }

    // Remove from tag index
    metadata.tags.forEach((tag) => {
      if (this.tagIndex[tag]) {
        this.tagIndex[tag] = this.tagIndex[tag].filter((cid) => cid !== id);
      }
    });
  }

  /**
   * Get filtered candidate IDs based on search filters
   */
  private getFilteredCandidates(filters: {
    category?: string;
    type?: string;
    tags?: string[];
  }): Set<string> {
    let candidates: Set<string> | null = null;

    // Filter by category
    if (filters.category && this.categoryIndex[filters.category]) {
      candidates = new Set(this.categoryIndex[filters.category]);
    }

    // Filter by type
    if (filters.type && this.typeIndex[filters.type]) {
      const typeIds = new Set(this.typeIndex[filters.type]);
      if (candidates) {
        candidates = new Set([...candidates].filter((id) => typeIds.has(id)));
      } else {
        candidates = typeIds;
      }
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      const tagIds = new Set<string>();
      filters.tags.forEach((tag) => {
        if (this.tagIndex[tag]) {
          this.tagIndex[tag].forEach((id) => tagIds.add(id));
        }
      });

      if (candidates) {
        candidates = new Set([...candidates].filter((id) => tagIds.has(id)));
      } else {
        candidates = tagIds;
      }
    }

    return candidates ?? new Set(this.components.keys());
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    let bytes = 0;

    // Estimate component storage
    this.components.forEach((component) => {
      // Embedding: 8 bytes per number
      bytes += component.embedding.length * 8;

      // Metadata: rough estimate
      bytes += JSON.stringify(component.metadata).length;
    });

    // Estimate index storage
    Object.values(this.categoryIndex).forEach((ids) => {
      bytes += ids.length * 50; // Rough estimate per ID
    });

    return bytes;
  }
}

