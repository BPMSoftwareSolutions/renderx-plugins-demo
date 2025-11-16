import { describe, it, expect, beforeEach } from 'vitest';
import {
  enableDiagnostics,
  disableDiagnostics,
  emitDiagnostic,
  addDiagnosticListener,
} from '../src/ui/diagnostics/eventTap';
import type { DiagnosticEvent } from '../src/ui/diagnostics/types';

describe('diagnostics event tap', () => {
  beforeEach(() => {
    disableDiagnostics();
  });

  it('delivers events to listeners when enabled', () => {
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

    expect(received).toHaveLength(1);
    expect(received[0].message).toBe('test event');
    expect(received[0].data).toEqual({ foo: 'bar' });
    expect(typeof received[0].timestamp).toBe('string');
  });

  it('does not deliver events when disabled', () => {
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

  it('supports multiple listeners', () => {
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

    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
    expect(a[0].message).toBe('multi');
    expect(b[0].message).toBe('multi');
  });
});

