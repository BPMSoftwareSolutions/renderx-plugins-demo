import { describe, it, expect } from 'vitest';
import {
  cosineSimilarity,
  normalizeVector,
  euclideanDistance,
  manhattanDistance,
} from '../search/similarity-search';

describe('Similarity Search', () => {
  describe('cosineSimilarity', () => {
    it('should return 1 for identical vectors', () => {
      const similarity = cosineSimilarity([1, 0, 0], [1, 0, 0]);
      expect(similarity).toBeCloseTo(1, 5);
    });

    it('should return -1 for opposite vectors', () => {
      const similarity = cosineSimilarity([1, 0, 0], [-1, 0, 0]);
      expect(similarity).toBeCloseTo(-1, 5);
    });

    it('should return 0 for orthogonal vectors', () => {
      const similarity = cosineSimilarity([1, 0, 0], [0, 1, 0]);
      expect(similarity).toBeCloseTo(0, 5);
    });

    it('should be symmetric', () => {
      const sim1 = cosineSimilarity([1, 2, 3], [4, 5, 6]);
      const sim2 = cosineSimilarity([4, 5, 6], [1, 2, 3]);
      expect(sim1).toBeCloseTo(sim2, 5);
    });

    it('should handle normalized vectors', () => {
      const v1 = [0.707, 0.707, 0];
      const v2 = [0.707, 0.707, 0];
      const similarity = cosineSimilarity(v1, v2);
      expect(similarity).toBeCloseTo(1, 2);
    });

    it('should throw error for mismatched dimensions', () => {
      expect(() => cosineSimilarity([1, 2], [1, 2, 3])).toThrow(
        'Vectors must have the same length'
      );
    });

    it('should handle zero vectors', () => {
      const similarity = cosineSimilarity([0, 0, 0], [1, 2, 3]);
      expect(similarity).toBe(0);
    });

    it('should handle empty vectors', () => {
      const similarity = cosineSimilarity([], []);
      expect(similarity).toBe(0);
    });

    it('should calculate correct similarity for real embeddings', () => {
      const embedding1 = [0.1, 0.2, 0.3, 0.4, 0.5];
      const embedding2 = [0.15, 0.25, 0.35, 0.45, 0.55];
      const similarity = cosineSimilarity(embedding1, embedding2);
      expect(similarity).toBeGreaterThan(0.99);
      expect(similarity).toBeLessThanOrEqual(1);
    });
  });

  describe('normalizeVector', () => {
    it('should normalize a vector to unit length', () => {
      const normalized = normalizeVector([3, 4, 0]);
      const magnitude = Math.sqrt(
        normalized[0] * normalized[0] +
          normalized[1] * normalized[1] +
          normalized[2] * normalized[2]
      );
      expect(magnitude).toBeCloseTo(1, 5);
    });

    it('should handle zero vector', () => {
      const normalized = normalizeVector([0, 0, 0]);
      expect(normalized).toEqual([0, 0, 0]);
    });

    it('should preserve direction', () => {
      const original = [1, 2, 3];
      const normalized = normalizeVector(original);
      const similarity = cosineSimilarity(original, normalized);
      expect(similarity).toBeCloseTo(1, 5);
    });
  });

  describe('euclideanDistance', () => {
    it('should return 0 for identical vectors', () => {
      const distance = euclideanDistance([1, 2, 3], [1, 2, 3]);
      expect(distance).toBeCloseTo(0, 5);
    });

    it('should calculate correct distance', () => {
      const distance = euclideanDistance([0, 0, 0], [3, 4, 0]);
      expect(distance).toBeCloseTo(5, 5);
    });

    it('should be symmetric', () => {
      const dist1 = euclideanDistance([1, 2, 3], [4, 5, 6]);
      const dist2 = euclideanDistance([4, 5, 6], [1, 2, 3]);
      expect(dist1).toBeCloseTo(dist2, 5);
    });

    it('should throw error for mismatched dimensions', () => {
      expect(() => euclideanDistance([1, 2], [1, 2, 3])).toThrow(
        'Vectors must have the same length'
      );
    });
  });

  describe('manhattanDistance', () => {
    it('should return 0 for identical vectors', () => {
      const distance = manhattanDistance([1, 2, 3], [1, 2, 3]);
      expect(distance).toBeCloseTo(0, 5);
    });

    it('should calculate correct distance', () => {
      const distance = manhattanDistance([0, 0, 0], [1, 2, 3]);
      expect(distance).toBe(6);
    });

    it('should be symmetric', () => {
      const dist1 = manhattanDistance([1, 2, 3], [4, 5, 6]);
      const dist2 = manhattanDistance([4, 5, 6], [1, 2, 3]);
      expect(dist1).toBeCloseTo(dist2, 5);
    });

    it('should throw error for mismatched dimensions', () => {
      expect(() => manhattanDistance([1, 2], [1, 2, 3])).toThrow(
        'Vectors must have the same length'
      );
    });
  });
});

