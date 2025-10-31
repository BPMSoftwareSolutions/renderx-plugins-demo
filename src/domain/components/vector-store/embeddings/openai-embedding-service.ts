/**
 * OpenAI Embedding Service Implementation
 * Uses OpenAI's embedding API to generate vector embeddings
 */

import { EmbeddingService, ModelInfo, EmbeddingServiceConfig } from '../store/store.types';
import { EmbeddingCache } from './embedding-cache';

export class OpenAIEmbeddingService implements EmbeddingService {
  private apiKey: string;
  private model: string;
  private baseURL: string;
  private dimensions: number;
  private cache: EmbeddingCache;
  private modelInfo: ModelInfo;

  constructor(config: EmbeddingServiceConfig) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.apiKey = config.apiKey;
    this.model = config.model || 'text-embedding-3-small';
    this.baseURL = config.baseUrl || 'https://api.openai.com/v1';
    this.dimensions = config.dimensions || 1536;

    // Initialize cache with default settings
    this.cache = new EmbeddingCache({
      maxSize: 10000,
      ttlMs: 24 * 60 * 60 * 1000, // 24 hours
    });

    this.modelInfo = {
      name: this.model,
      provider: 'openai',
      dimensions: this.dimensions,
      maxTokens: config.maxTokens,
    };
  }

  /**
   * Generate embedding for text
   */
  async embed(text: string): Promise<number[]> {
    // Check cache first
    if (this.cache.has(text)) {
      return this.cache.get(text)!;
    }

    // Call OpenAI API
    const embedding = await this.callOpenAIEmbedding(text);

    // Cache the result
    this.cache.set(text, embedding);

    return embedding;
  }

  /**
   * Batch embed multiple texts
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    const uncachedTexts: string[] = [];
    const uncachedIndices: number[] = [];

    // Check cache for each text
    for (let i = 0; i < texts.length; i++) {
      const cached = this.cache.get(texts[i]);
      if (cached) {
        results[i] = cached;
      } else {
        uncachedTexts.push(texts[i]);
        uncachedIndices.push(i);
      }
    }

    // If all texts are cached, return early
    if (uncachedTexts.length === 0) {
      return results;
    }

    // Call OpenAI API for uncached texts
    const embeddings = await this.callOpenAIBatchEmbedding(uncachedTexts);

    // Cache and store results
    for (let i = 0; i < uncachedTexts.length; i++) {
      const embedding = embeddings[i];
      this.cache.set(uncachedTexts[i], embedding);
      results[uncachedIndices[i]] = embedding;
    }

    return results;
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
    try {
      // Try a simple embedding to verify API key works
      await this.callOpenAIEmbedding('test');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Call OpenAI embedding API for single text
   */
  private async callOpenAIEmbedding(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  /**
   * Call OpenAI embedding API for batch texts
   */
  private async callOpenAIBatchEmbedding(texts: string[]): Promise<number[][]> {
    const response = await fetch(`${this.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    // Sort by index to maintain order
    return data.data.sort((a: any, b: any) => a.index - b.index).map((item: any) => item.embedding);
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

