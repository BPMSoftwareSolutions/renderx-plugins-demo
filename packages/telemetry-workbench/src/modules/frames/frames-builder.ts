// TimelineEvent type is available but not currently used
// import type { TimelineEvent } from '../TimelineFlowVisualization';

export interface FrameEvent {
  raw: string;
  type: string;
}

export interface FrameRecord {
  ts: string;
  epochMs: number;
  events: FrameEvent[];
}

export interface FramesResult {
  summary: {
    totalFrames: number;
    totalEvents: number;
    firstTs: string | null;
    lastTs: string | null;
  };
  frames: FrameRecord[];
}

const TS_RE = /^(?:[^ ]+?:\d+\s+)?(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\s+(.*)$/;

const CLASSIFIERS: Array<[string, RegExp]> = [
  ['sequence_registry_pass', /^✅\s+SequenceRegistry: Sequence/],
  ['sequence_registry_registered', /^🎼\s+SequenceRegistry: Registered sequence/],
  ['execution_queue', /^🎼\s+ExecutionQueue:/],
  ['performance_tracker', /^⏱️\s+PerformanceTracker:/],
  ['databaton', /^🎽\s+DataBaton:/],
  ['plugin_manager', /^🧠\s+PluginManager:/],
];

export function buildFramesFromRawLog(raw: string): FramesResult {
  const framesMap: Record<string, FrameRecord> = {};
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(TS_RE);
    if (!m) continue;
    const iso = m[1];
    const msg = m[2];
    let type = 'other';
    for (const [t, rx] of CLASSIFIERS) {
      if (rx.test(msg)) { type = t; break; }
    }
    const epochMs = Date.parse(iso);
    let fr = framesMap[iso];
    if (!fr) {
      fr = { ts: iso, epochMs, events: [] };
      framesMap[iso] = fr;
    }
    fr.events.push({ raw: msg, type });
  }
  const frames = Object.values(framesMap).sort((a,b) => a.epochMs - b.epochMs);
  const summary = {
    totalFrames: frames.length,
    totalEvents: frames.reduce((sum, f) => sum + f.events.length, 0),
    firstTs: frames[0]?.ts || null,
    lastTs: frames[frames.length - 1]?.ts || null
  };
  return { summary, frames };
}
