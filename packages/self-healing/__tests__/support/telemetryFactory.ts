import { TelemetryEvent } from '../../src/types';

export function makeEvent(overrides: Partial<TelemetryEvent> = {}): TelemetryEvent {
  return {
    timestamp: overrides.timestamp || new Date().toISOString(),
    handler: overrides.handler || 'testHandler',
    event: overrides.event || 'test.event',
    context: overrides.context || { sample: true },
    ...overrides,
  };
}

export function makeEvents(count: number): TelemetryEvent[] {
  return Array.from({ length: count }).map((_, i) => makeEvent({ handler: `h${i}` }));
}
