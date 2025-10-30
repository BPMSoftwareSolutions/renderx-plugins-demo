import { describe, it, expect } from 'vitest';
import { EmbeddingServiceFactory } from '../embeddings/embedding-service-factory';
import { LocalEmbeddingService } from '../embeddings/local-embedding-service';
import { OpenAIEmbeddingService } from '../embeddings/openai-embedding-service';

describe('EmbeddingServiceFactory', () => {
  describe('create', () => {
    it('should create local embedding service', () => {
      const service = EmbeddingServiceFactory.create({
        provider: 'local',
        model: 'local',
        dimensions: 384,
      });

      expect(service).toBeInstanceOf(LocalEmbeddingService);
    });

    it('should create OpenAI embedding service', () => {
      const service = EmbeddingServiceFactory.create({
        provider: 'openai',
        apiKey: 'test-key',
        model: 'text-embedding-3-small',
        dimensions: 1536,
      });

      expect(service).toBeInstanceOf(OpenAIEmbeddingService);
    });

    it('should throw for unknown provider', () => {
      expect(() => {
        EmbeddingServiceFactory.create({
          provider: 'unknown' as any,
          model: 'test',
          dimensions: 384,
        });
      }).toThrow('Unknown embedding provider');
    });

    it('should throw for HuggingFace provider (not implemented)', () => {
      expect(() => {
        EmbeddingServiceFactory.create({
          provider: 'huggingface',
          model: 'test',
          dimensions: 384,
        });
      }).toThrow('HuggingFace embedding service not yet implemented');
    });
  });

  describe('createLocal', () => {
    it('should create local embedding service with defaults', () => {
      const service = EmbeddingServiceFactory.createLocal();

      expect(service).toBeInstanceOf(LocalEmbeddingService);
      const info = service.getModelInfo();
      expect(info.provider).toBe('local');
      expect(info.dimensions).toBe(384);
    });
  });

  describe('createOpenAI', () => {
    it('should create OpenAI embedding service with defaults', () => {
      const service = EmbeddingServiceFactory.createOpenAI('test-key');

      expect(service).toBeInstanceOf(OpenAIEmbeddingService);
      const info = service.getModelInfo();
      expect(info.provider).toBe('openai');
      expect(info.name).toBe('text-embedding-3-small');
      expect(info.dimensions).toBe(1536);
    });

    it('should create OpenAI embedding service with custom model', () => {
      const service = EmbeddingServiceFactory.createOpenAI('test-key', 'text-embedding-3-large');

      const info = service.getModelInfo();
      expect(info.name).toBe('text-embedding-3-large');
    });

    it('should create OpenAI embedding service with custom dimensions', () => {
      const service = EmbeddingServiceFactory.createOpenAI('test-key', undefined, 256);

      const info = service.getModelInfo();
      expect(info.dimensions).toBe(256);
    });
  });
});

