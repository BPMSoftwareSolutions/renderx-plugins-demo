import { describe, it, expect, beforeEach } from 'vitest';
import { 
  parseTelemetryRequested,
  loadLogFiles,
  extractTelemetryEvents,
  normalizeTelemetryData,
  aggregateTelemetryMetrics,
  storeTelemetryDatabase,
  parseTelemetryCompleted
} from '../src/handlers';
import { makeEvent, makeEvents } from './support/telemetryFactory';

/**
 * Test suite for Parse Production Telemetry
 * 
 * Handlers: 7
 * Tests: 14
 */

describe('Parse Production Telemetry (self-healing-telemetry-parse-symphony)', () => {
  beforeEach(() => {
    // reset any shared state in future (none yet)
  });

  it('parseTelemetryRequested - happy path', () => {
    const evt = parseTelemetryRequested('seq-123');
    expect(evt.event).toBe('telemetry.parse.requested');
    expect(evt.context?.sequenceId).toBe('seq-123');
    expect(typeof evt.timestamp).toBe('string');
  });
  it('parseTelemetryRequested - error handling (missing id)', () => {
    expect(() => parseTelemetryRequested('')).toThrow(/sequenceId/);
  });
  it('loadLogFiles - happy path', () => {
    return loadLogFiles(['app.log']).then(res => {
      expect(res.event).toBe('telemetry.load.logs');
      expect(res.context.files.length).toBe(1);
      expect(res.context.paths[0]).toBe('app.log');
    });
  });
  it('loadLogFiles - error handling', () => {
    // @ts-expect-error invalid
    expect(loadLogFiles('not-an-array')).rejects.toThrow(/paths/);
  });
  it('extractTelemetryEvents - happy path', () => {
    const res = extractTelemetryEvents([{ path: 'a.log', content: '' }]);
    expect(res.event).toBe('telemetry.extract.events');
    expect(res.context.rawCount).toBe(1);
    expect(Array.isArray(res.context.events)).toBe(true);
  });
  it('extractTelemetryEvents - error handling', () => {
    // @ts-expect-error invalid
    expect(() => extractTelemetryEvents('bad')).toThrow(/rawLogs/);
  });
  it('normalizeTelemetryData - happy path', () => {
    const res = normalizeTelemetryData([]);
    expect(res.event).toBe('telemetry.normalize.data');
    expect(res.context.normalized.length).toBe(0);
  });
  it('normalizeTelemetryData - error handling', () => {
    // @ts-expect-error invalid
    expect(() => normalizeTelemetryData('oops')).toThrow(/events/);
  });
  it('aggregateTelemetryMetrics - happy path (empty events)', () => {
    const res = aggregateTelemetryMetrics([] as any);
    expect(res.context.metrics.totalEvents).toBe(0);
    expect(res.context.metrics.handlers).toEqual({});
  });
  it('aggregateTelemetryMetrics - with sample events', () => {
    const events = makeEvents(3);
    const res = aggregateTelemetryMetrics(events as any);
    expect(res.context.metrics.totalEvents).toBe(3);
  });
  it('storeTelemetryDatabase - happy path', () => {
    const metricsEvt = aggregateTelemetryMetrics([] as any);
    return storeTelemetryDatabase(metricsEvt.context.metrics).then(res => {
      expect(res.context.stored).toBe(true);
      expect(res.event).toBe('telemetry.store.database');
    });
  });
  it('storeTelemetryDatabase - error handling', () => {
    // @ts-expect-error invalid
    expect(storeTelemetryDatabase(null)).rejects.toThrow(/metrics/);
  });
  it('parseTelemetryCompleted - happy path', () => {
    const metricsEvt = aggregateTelemetryMetrics([] as any);
    const completed = parseTelemetryCompleted('seq-123', metricsEvt.context.metrics);
    expect(completed.event).toBe('telemetry.parse.completed');
    expect(completed.context?.sequenceId).toBe('seq-123');
  });
  it('parseTelemetryCompleted - error handling (missing metrics)', () => {
    // @ts-expect-error intentional
    expect(() => parseTelemetryCompleted('seq-123')).toThrow(/metrics/);
  });
});
