/**
 * Mock Handler Registry Tests
 */

import { describe, it, expect } from 'vitest';
import {
  shouldMockBeat,
  getMockDelay,
  formatMockContext,
  parseMockOptions,
  // BeatKind type is available but not used in tests
  // type BeatKind,
} from '../../../tools/cli/mocking/MockHandlerRegistry';

describe('MockHandlerRegistry', () => {
  describe('shouldMockBeat', () => {
    it('should mock beats when service kind is in mockServices', () => {
      const result = shouldMockBeat(1, 'stage-crew', {
        mockServices: ['stage-crew'],
      });
      expect(result).toBe(true);
    });

    it('should mock beats when beat number is in mockBeats', () => {
      const result = shouldMockBeat(1, 'pure', {
        mockBeats: [1, 2, 3],
      });
      expect(result).toBe(true);
    });

    it('should not mock when unmockBeats includes beat number', () => {
      const result = shouldMockBeat(1, 'stage-crew', {
        mockServices: ['stage-crew'],
        unmockBeats: [1],
      });
      expect(result).toBe(false);
    });

    it('should not mock when unmockServices includes kind', () => {
      const result = shouldMockBeat(1, 'stage-crew', {
        mockServices: ['stage-crew'],
        unmockServices: ['stage-crew'],
      });
      expect(result).toBe(false);
    });

    it('should not mock by default', () => {
      const result = shouldMockBeat(1, 'pure', {});
      expect(result).toBe(false);
    });
  });

  describe('getMockDelay', () => {
    it('should return 1ms for pure beats', () => {
      expect(getMockDelay('pure')).toBe(1);
    });

    it('should return 5ms for io beats', () => {
      expect(getMockDelay('io')).toBe(5);
    });

    it('should return 2ms for stage-crew beats', () => {
      expect(getMockDelay('stage-crew')).toBe(2);
    });

    it('should return 10ms for api beats', () => {
      expect(getMockDelay('api')).toBe(10);
    });
  });

  describe('formatMockContext', () => {
    it('should format mocked context', () => {
      const result = formatMockContext({
        isMocked: true,
        kind: 'stage-crew',
        beatNumber: 1,
        handler: 'renderReact',
      });
      expect(result).toContain('🎭 MOCKED');
      expect(result).toContain('Beat 1');
      expect(result).toContain('renderReact');
      expect(result).toContain('stage-crew');
    });

    it('should format unmocked context', () => {
      const result = formatMockContext({
        isMocked: false,
        kind: 'pure',
        beatNumber: 2,
        handler: 'resolveTemplate',
      });
      expect(result).toContain('✨ UNMOCKED');
      expect(result).toContain('Beat 2');
      expect(result).toContain('resolveTemplate');
    });
  });

  describe('parseMockOptions', () => {
    it('should parse --mock flag', () => {
      const result = parseMockOptions({
        mock: 'pure,io,stage-crew',
      });
      expect(result.mockServices).toEqual(['pure', 'io', 'stage-crew']);
    });

    it('should parse --mock-beat flag', () => {
      const result = parseMockOptions({
        'mock-beat': '1,2,3',
      });
      expect(result.mockBeats).toEqual([1, 2, 3]);
    });

    it('should parse --unmock flag', () => {
      const result = parseMockOptions({
        unmock: 'api',
      });
      expect(result.unmockServices).toEqual(['api']);
    });

    it('should parse --unmock-beat flag', () => {
      const result = parseMockOptions({
        'unmock-beat': '4,5',
      });
      expect(result.unmockBeats).toEqual([4, 5]);
    });

    it('should parse all flags together', () => {
      const result = parseMockOptions({
        mock: 'pure,io',
        'mock-beat': '1',
        unmock: 'api',
        'unmock-beat': '6',
      });
      expect(result.mockServices).toEqual(['pure', 'io']);
      expect(result.mockBeats).toEqual([1]);
      expect(result.unmockServices).toEqual(['api']);
      expect(result.unmockBeats).toEqual([6]);
    });

    it('should return empty options when no flags provided', () => {
      const result = parseMockOptions({});
      expect(result).toEqual({});
    });
  });
});

