import type { TimelineData, TimelineEvent } from './TimelineFlowVisualization';

export interface AnalyzerOutput {
  earliest: string;
  latest: string;
  durationMs: number;
  sequences?: Record<string, any>;
  pluginMounts?: { byPlugin?: Record<string, any> };
  topics?: Record<string, any>;
  performance?: { gaps?: Array<{ start: string; end: string; durationMs: number }> };
}

export function analyzerToTimelineData(analyzerData: AnalyzerOutput): TimelineData {
  const events: TimelineEvent[] = [];
  const baseTime = Date.parse(analyzerData.earliest);

  // sequences -> events with beat pins
  if (analyzerData.sequences) {
    Object.entries(analyzerData.sequences).forEach(([seqId, seqData]) => {
      if (Array.isArray(seqData.timestamps) && seqData.timestamps.length) {
        const startAbs = Date.parse(seqData.timestamps[0]);
        const endAbs = Date.parse(seqData.timestamps[seqData.timestamps.length - 1]);
        const start = startAbs - baseTime;
        const duration = Math.max(endAbs - startAbs, 1);
        const pins = seqData.timestamps.map((ts: string, i: number) => ({
          offset: Date.parse(ts) - startAbs,
          label: `Beat ${i + 1}`,
          type: 'beat',
          color: '#f59e0b',
          sourceTimestamp: Date.parse(ts)
        }));
        events.push({
          time: start,
          duration,
          name: seqData.name || seqId,
          type: 'sequence',
          color: '#f43f5e',
          sourceTimestamp: startAbs,
          details: { sequenceId: seqId, beats: pins.length },
          pins
        });
      }
    });
  }

  // performance gaps
  analyzerData.performance?.gaps?.forEach(gap => {
    const startAbs = Date.parse(gap.start);
    events.push({
      time: startAbs - baseTime,
      duration: gap.durationMs,
      name: gap.durationMs > 5000 ? `⚠️ React Block (${(gap.durationMs/1000).toFixed(2)}s)` : `Gap (${(gap.durationMs/1000).toFixed(2)}s)`,
      type: gap.durationMs > 5000 ? 'blocked' : 'gap',
      color: gap.durationMs > 5000 ? '#ef4444' : '#dc2626',
      sourceTimestamp: startAbs,
      details: { start: gap.start, end: gap.end, durationMs: gap.durationMs }
    });
  });

  events.sort((a,b) => a.time - b.time);
  return { events, totalDuration: analyzerData.durationMs, sessionStart: analyzerData.earliest, sessionEnd: analyzerData.latest };
}
