/**
 * Lightweight telemetry emitter for demo instrumentation.
 * Stores events in an in-memory buffer so tests can assert on emitted telemetry.
 */
export interface TelemetryEvent<T=any> {
  type: string;
  timestamp: string;
  data: T;
}

const _buffer: TelemetryEvent[] = [];

export function emitTelemetry(type: string, data: any){
  _buffer.push({ type, timestamp: new Date().toISOString(), data });
}

export function getTelemetryBuffer(): TelemetryEvent[] {
  return _buffer;
}

export function clearTelemetryBuffer(){
  _buffer.length = 0;
}
