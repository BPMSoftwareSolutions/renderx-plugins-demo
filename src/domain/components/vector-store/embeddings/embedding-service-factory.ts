/**
 * Embedding Service Factory
 * Creates appropriate embedding service based on configuration
 */

import { EmbeddingService, EmbeddingServiceConfig } from '../store/store.types';
import { OpenAIEmbeddingService } from './openai-embedding-service';
import { LocalEmbeddingService } from './local-embedding-service';

export class EmbeddingServiceFactory {
  /**
   * Create embedding service based on configuration
   */
  static create(config: EmbeddingServiceConfig): EmbeddingService {
    switch (config.provider) {
      case 'openai':
        return new OpenAIEmbeddingService(config);
      case 'local':
        return new LocalEmbeddingService(config);
      case 'huggingface':
        // TODO: Implement HuggingFace embedding service
        throw new Error('HuggingFace embedding service not yet implemented');
      default:
        throw new Error(`Unknown embedding provider: ${config.provider}`);
    }
  }

  /**
   * Create default local embedding service for development
   */
  static createLocal(): EmbeddingService {
    return new LocalEmbeddingService({
      provider: 'local',
      model: 'local-embedding',
      dimensions: 384,
    });
  }

  /**
   * Create OpenAI embedding service
   */
  static createOpenAI(apiKey: string, model?: string, dimensions?: number): EmbeddingService {
    return new OpenAIEmbeddingService({
      provider: 'openai',
      apiKey,
      model: model || 'text-embedding-3-small',
      dimensions: dimensions || 1536,
    });
  }
}

