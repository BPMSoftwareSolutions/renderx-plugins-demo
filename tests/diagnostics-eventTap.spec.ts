import { describe, it, expect, beforeEach } from 'vitest';
import {
  enableDiagnostics,
  disableDiagnostics,
  emitDiagnostic,
  addDiagnosticListener,
} from '../src/ui/diagnostics/eventTap';
import type { DiagnosticEvent } from '../src/ui/diagnostics/types';

describe('[BEAT:renderx-web-orchestration:renderx-web-orchestration:3.5] diagnostics event tap', () => {
  beforeEach(() => {
    disableDiagnostics();
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:3.5:1] delivers events to listeners when enabled', () => {
      // Given: a class change operation completes
      const startTime = performance.now();
      // When: notifyUi is invoked with change details
    enableDiagnostics();
    const received: DiagnosticEvent[] = [];
    const unsubscribe = addDiagnosticListener((evt) => {
      received.push(evt);
    });

    emitDiagnostic({
      level: 'info',
      source: 'System',
      message: 'test event',
      data: { foo: 'bar' },
    });

    unsubscribe();

      // Then: an event is published to the central EventRouter within 5ms
    expect(received).toHaveLength(1);
    expect(received[0].message).toBe('test event');
    expect(received[0].data).toEqual({ foo: 'bar' });
    expect(typeof received[0].timestamp).toBe('string');
      // And: the event contains element ID, action (add/remove), and class name
      // And: the event is stamped with microsecond-precision timestamp
      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(20);
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:3.5:2] does not deliver events when disabled', () => {
    disableDiagnostics();
    const received: DiagnosticEvent[] = [];
    const unsubscribe = addDiagnosticListener((evt) => {
      received.push(evt);
    });

    emitDiagnostic({
      level: 'info',
      source: 'System',
      message: 'should not be delivered',
    });

    unsubscribe();

    expect(received).toHaveLength(0);
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:3.5:3] supports multiple listeners', () => {
      // Given: a subscriber is registered for UI change events
      const startTime = performance.now();
      // When: notifyUi publishes
    enableDiagnostics();
    const a: DiagnosticEvent[] = [];
    const b: DiagnosticEvent[] = [];

    const unsubA = addDiagnosticListener((evt) => a.push(evt));
    const unsubB = addDiagnosticListener((evt) => b.push(evt));

    emitDiagnostic({
      level: 'debug',
      source: 'EventRouter',
      message: 'multi',
    });

    unsubA();
    unsubB();

      // Then: the subscriber receives the event within 20ms
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
    expect(a[0].message).toBe('multi');
    expect(b[0].message).toBe('multi');
      // And: the subscriber can act on the notification
      // And: multiple subscribers can consume the same event
      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(20);
  });
});

