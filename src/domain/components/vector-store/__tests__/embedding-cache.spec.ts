import { describe, it, expect, beforeEach } from 'vitest';
import { EmbeddingCache } from '../embeddings/embedding-cache';

describe('EmbeddingCache', () => {
  let cache: EmbeddingCache;

  beforeEach(() => {
    cache = new EmbeddingCache(100, 1000); // 100 max size, 1 second TTL
  });

  describe('get and set', () => {
    it('should set and get an embedding', () => {
      const embedding = [0.1, 0.2, 0.3];
      cache.set('test-key', embedding);

      const retrieved = cache.get('test-key');
      expect(retrieved).toEqual(embedding);
    });

    it('should return null for non-existent key', () => {
      const retrieved = cache.get('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should overwrite existing key', () => {
      const embedding1 = [0.1, 0.2, 0.3];
      const embedding2 = [0.4, 0.5, 0.6];

      cache.set('test-key', embedding1);
      cache.set('test-key', embedding2);

      const retrieved = cache.get('test-key');
      expect(retrieved).toEqual(embedding2);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      cache.set('test-key', [0.1, 0.2, 0.3]);
      expect(cache.has('test-key')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('non-existent')).toBe(false);
    });
  });

  describe('cache statistics', () => {
    it('should track hits and misses', () => {
      cache.set('key1', [0.1, 0.2, 0.3]);

      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('non-existent'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(2 / 3, 5);
    });

    it('should report correct cache size', () => {
      cache.set('key1', [0.1, 0.2, 0.3]);
      cache.set('key2', [0.4, 0.5, 0.6]);

      expect(cache.size()).toBe(2);
      expect(cache.getStats().size).toBe(2);
    });

    it('should calculate hit rate correctly', () => {
      cache.set('key1', [0.1, 0.2, 0.3]);

      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('non-existent'); // miss

      const stats = cache.getStats();
      expect(stats.hitRate).toBeCloseTo(0.75, 5);
    });

    it('should return 0 hit rate when no accesses', () => {
      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      cache.set('key1', [0.1, 0.2, 0.3]);
      cache.set('key2', [0.4, 0.5, 0.6]);

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });

    it('should reset statistics', () => {
      cache.set('key1', [0.1, 0.2, 0.3]);
      cache.get('key1');
      cache.get('non-existent');

      cache.clear();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('max size', () => {
    it('should evict oldest entry when max size is reached', () => {
      const smallCache = new EmbeddingCache(2, 10000);

      smallCache.set('key1', [0.1, 0.2, 0.3]);
      smallCache.set('key2', [0.4, 0.5, 0.6]);
      smallCache.set('key3', [0.7, 0.8, 0.9]); // Should evict key1

      expect(smallCache.size()).toBe(2);
      expect(smallCache.get('key1')).toBeNull();
      expect(smallCache.get('key2')).not.toBeNull();
      expect(smallCache.get('key3')).not.toBeNull();
    });

    it('should not evict when updating existing key', () => {
      const smallCache = new EmbeddingCache(2, 10000);

      smallCache.set('key1', [0.1, 0.2, 0.3]);
      smallCache.set('key2', [0.4, 0.5, 0.6]);
      smallCache.set('key1', [0.7, 0.8, 0.9]); // Update key1

      expect(smallCache.size()).toBe(2);
      expect(smallCache.get('key1')).toEqual([0.7, 0.8, 0.9]);
      expect(smallCache.get('key2')).not.toBeNull();
    });
  });

  describe('TTL expiration', () => {
    it('should return null for expired entries', async () => {
      const shortTTLCache = new EmbeddingCache(100, 100); // 100ms TTL

      shortTTLCache.set('key1', [0.1, 0.2, 0.3]);
      expect(shortTTLCache.get('key1')).not.toBeNull();

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(shortTTLCache.get('key1')).toBeNull();
    });

    it('should remove expired entries on removeExpired', async () => {
      const shortTTLCache = new EmbeddingCache(100, 100); // 100ms TTL

      shortTTLCache.set('key1', [0.1, 0.2, 0.3]);
      shortTTLCache.set('key2', [0.4, 0.5, 0.6]);

      expect(shortTTLCache.size()).toBe(2);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      shortTTLCache.removeExpired();
      expect(shortTTLCache.size()).toBe(0);
    });
  });
});

