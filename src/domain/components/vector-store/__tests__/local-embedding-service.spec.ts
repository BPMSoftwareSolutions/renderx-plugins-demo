import { describe, it, expect, beforeEach } from 'vitest';
import { LocalEmbeddingService } from '../embeddings/local-embedding-service';

describe('LocalEmbeddingService', () => {
  let service: LocalEmbeddingService;

  beforeEach(() => {
    service = new LocalEmbeddingService({ provider: 'local', model: 'local', dimensions: 384 });
  });

  describe('embed', () => {
    it('should generate embedding for text', async () => {
      const embedding = await service.embed('hello world');

      expect(embedding).toBeInstanceOf(Array);
      expect(embedding.length).toBe(384);
      expect(embedding.every((v) => typeof v === 'number')).toBe(true);
    });

    it('should generate consistent embeddings for same text', async () => {
      const text = 'test text';
      const embedding1 = await service.embed(text);
      const embedding2 = await service.embed(text);

      expect(embedding1).toEqual(embedding2);
    });

    it('should generate different embeddings for different texts', async () => {
      const embedding1 = await service.embed('text one');
      const embedding2 = await service.embed('text two');

      expect(embedding1).not.toEqual(embedding2);
    });

    it('should normalize embeddings to unit length', async () => {
      const embedding = await service.embed('test');

      const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
      expect(magnitude).toBeCloseTo(1, 5);
    });

    it('should cache embeddings', async () => {
      const text = 'cached text';
      const embedding1 = await service.embed(text);
      const embedding2 = await service.embed(text);

      expect(embedding1).toBe(embedding2); // Same reference due to caching
    });
  });

  describe('embedBatch', () => {
    it('should batch embed multiple texts', async () => {
      const texts = ['text one', 'text two', 'text three'];
      const embeddings = await service.embedBatch(texts);

      expect(embeddings.length).toBe(3);
      embeddings.forEach((embedding) => {
        expect(embedding.length).toBe(384);
      });
    });

    it('should maintain order in batch embeddings', async () => {
      const texts = ['first', 'second', 'third'];
      const embeddings = await service.embedBatch(texts);

      // Verify order by checking consistency
      const singleEmbeddings = await Promise.all(texts.map((t) => service.embed(t)));
      embeddings.forEach((embedding, i) => {
        expect(embedding).toEqual(singleEmbeddings[i]);
      });
    });

    it('should handle empty batch', async () => {
      const embeddings = await service.embedBatch([]);
      expect(embeddings).toEqual([]);
    });
  });

  describe('getModelInfo', () => {
    it('should return model info', () => {
      const info = service.getModelInfo();

      expect(info.name).toBe('local-embedding');
      expect(info.provider).toBe('local');
      expect(info.dimensions).toBe(384);
    });
  });

  describe('isReady', () => {
    it('should always be ready', async () => {
      const ready = await service.isReady();
      expect(ready).toBe(true);
    });
  });

  describe('clearCache', () => {
    it('should clear cache', async () => {
      const text = 'test';
      const embedding1 = await service.embed(text);

      service.clearCache();

      const embedding2 = await service.embed(text);
      expect(embedding1).toEqual(embedding2); // Same values but different reference
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      await service.embed('text one');
      await service.embed('text two');
      await service.embed('text one'); // Cache hit

      const stats = service.getCacheStats();
      expect(stats.hits).toBeGreaterThanOrEqual(1); // At least one cache hit
      expect(stats.size).toBeGreaterThan(0); // Cache has entries
    });

    it('should track cache hits and misses', async () => {
      const stats1 = service.getCacheStats();
      expect(stats1.hits).toBe(0);

      await service.embed('text one');
      const stats2 = service.getCacheStats();
      expect(stats2.hits).toBe(0); // First call is a miss

      await service.embed('text one');
      const stats3 = service.getCacheStats();
      expect(stats3.hits).toBeGreaterThan(0); // Second call is a hit
    });
  });
});

