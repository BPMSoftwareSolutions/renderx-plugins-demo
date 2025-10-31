/**
 * Local Embedding Service Implementation
 * Provides simple embeddings for development/testing without external API calls
 * Uses a simple hash-based approach to generate consistent embeddings
 */

import { EmbeddingService, ModelInfo, EmbeddingServiceConfig } from '../store/store.types';
import { EmbeddingCache } from './embedding-cache';

export class LocalEmbeddingService implements EmbeddingService {
  private dimensions: number;
  private cache: EmbeddingCache;
  private modelInfo: ModelInfo;

  constructor(config?: EmbeddingServiceConfig) {
    this.dimensions = config?.dimensions || 384;

    // Initialize cache
    this.cache = new EmbeddingCache({
      maxSize: 10000,
      ttlMs: 24 * 60 * 60 * 1000, // 24 hours
    });

    this.modelInfo = {
      name: 'local-embedding',
      provider: 'local',
      dimensions: this.dimensions,
    };
  }

  /**
   * Generate embedding for text using simple hash-based approach
   */
  async embed(text: string): Promise<number[]> {
    // Check cache first
    if (this.cache.has(text)) {
      return this.cache.get(text)!;
    }

    const embedding = this.generateEmbedding(text);
    this.cache.set(text, embedding);
    return embedding;
  }

  /**
   * Batch embed multiple texts
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    return texts.map((text) => {
      if (this.cache.has(text)) {
        return this.cache.get(text)!;
      }
      const embedding = this.generateEmbedding(text);
      this.cache.set(text, embedding);
      return embedding;
    });
  }

  /**
   * Get embedding model info
   */
  getModelInfo(): ModelInfo {
    return { ...this.modelInfo };
  }

  /**
   * Check if service is ready
   */
  async isReady(): Promise<boolean> {
    return true; // Local service is always ready
  }

  /**
   * Generate embedding using hash-based approach
   * Creates a deterministic vector from text content
   */
  private generateEmbedding(text: string): number[] {
    const embedding: number[] = [];

    // Use text length and character codes to seed the embedding
    let hash = this.hashString(text);

    for (let i = 0; i < this.dimensions; i++) {
      // Generate pseudo-random values based on hash
      hash = this.nextHash(hash);
      // Normalize to [-1, 1] range
      const value = ((hash % 1000) / 500) - 1;
      embedding.push(value);
    }

    // Normalize the vector to unit length
    return this.normalizeVector(embedding);
  }

  /**
   * Simple hash function for string
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Generate next hash value using linear congruential generator
   */
  private nextHash(seed: number): number {
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    return ((a * seed + c) % m) / m;
  }

  /**
   * Normalize vector to unit length
   */
  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) {
      return vector;
    }
    return vector.map((val) => val / magnitude);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

