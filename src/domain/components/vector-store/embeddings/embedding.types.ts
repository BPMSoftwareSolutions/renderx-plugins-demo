/**
 * Embedding Service Types and Interfaces
 */

/**
 * Embedding model information
 */
export interface ModelInfo {
  name: string;
  provider: string;          // 'openai', 'local', 'huggingface', etc.
  dimensions: number;        // Embedding vector size
  maxTokens?: number;
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

  /**
   * Check if service is ready
   */
  isReady(): Promise<boolean>;
}

/**
 * Configuration for embedding service
 */
export interface EmbeddingServiceConfig {
  provider: 'openai' | 'local' | 'huggingface';
  model: string;
  apiKey?: string;
  dimensions: number;
  maxTokens?: number;
  baseUrl?: string;
  timeout?: number;
}

