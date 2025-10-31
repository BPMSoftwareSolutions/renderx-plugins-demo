/**
 * Vector Store Types and Interfaces
 * Defines the core types for vector storage, similarity search, and component metadata
 */

/**
 * Component metadata stored in the vector store
 */
export interface ComponentMetadata {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  tags: string[];
  markup?: string;
  cssPreview?: string;
  template?: Record<string, unknown>;
}

/**
 * Search options for querying the vector store
 */
export interface SearchOptions {
  limit?: number;           // Max results (default: 5)
  threshold?: number;       // Min similarity score (0-1)
  filters?: {
    category?: string;
    type?: string;
    tags?: string[];
  };
}

/**
 * Individual search result
 */
export interface SearchResult {
  id: string;
  metadata: ComponentMetadata;
  similarity: number;       // 0-1 score
  rank: number;
}

/**
 * Statistics about the vector store
 */
export interface StoreStats {
  totalComponents: number;
  embeddingDimensions: number;
  lastUpdated: Date;
  memoryUsage?: number;
}

/**
 * Core vector store interface
 */
export interface VectorStore {
  /**
   * Add a component to the store
   */
  add(id: string, embedding: number[], metadata: ComponentMetadata): Promise<void>;

  /**
   * Search for similar components
   */
  search(query: number[], options?: SearchOptions): Promise<SearchResult[]>;

  /**
   * Get component by ID
   */
  get(id: string): Promise<ComponentMetadata | null>;

  /**
   * Remove component from store
   */
  remove(id: string): Promise<void>;

  /**
   * Clear all components from store
   */
  clear(): Promise<void>;

  /**
   * Get store statistics
   */
  stats(): StoreStats;

  /**
   * Check if store is initialized
   */
  isInitialized(): boolean;
}

/**
 * Embedding service interface
 */
export interface EmbeddingService {
  /**
   * Generate embedding for text
   */
  embed(text: string): Promise<number[]>;

  /**
   * Batch embed multiple texts
   */
  embedBatch(texts: string[]): Promise<number[][]>;

  /**
   * Get embedding model info
   */
  getModelInfo(): ModelInfo;
}

/**
 * Embedding model information
 */
export interface ModelInfo {
  name: string;
  provider: string;          // 'openai', 'local', 'huggingface', etc.
  dimensions: number;        // Embedding vector size
  maxTokens?: number;
}

