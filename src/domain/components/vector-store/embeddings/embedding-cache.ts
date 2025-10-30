/**
 * Embedding Cache
 * Caches embeddings in memory to avoid recomputation
 */

export interface CacheEntry {
  embedding: number[];
  timestamp: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export class EmbeddingCache {
  private cache: Map<string, CacheEntry> = new Map();
  private hits: number = 0;
  private misses: number = 0;
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  /**
   * Create a new embedding cache
   * @param maxSize Maximum number of entries to cache (default: 10000)
   * @param ttl Time to live in milliseconds (default: 24 hours)
   */
  constructor(maxSize: number = 10000, ttl: number = 24 * 60 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Get embedding from cache
   * @param key Cache key (usually the text to embed)
   * @returns Embedding if found and not expired, null otherwise
   */
  get(key: string): number[] | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.embedding;
  }

  /**
   * Set embedding in cache
   * @param key Cache key
   * @param embedding Embedding vector
   */
  set(key: string, embedding: number[]): void {
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      embedding,
      timestamp: Date.now(),
    });
  }

  /**
   * Check if key exists in cache
   * @param key Cache key
   * @returns True if key exists and not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all entries from cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Remove expired entries from cache
   */
  removeExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    const hitRate = total === 0 ? 0 : this.hits / total;

    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate,
    };
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

