/**
 * Data adapter for transforming analyzer JSON output to timeline visualization format
 */

import { TimelineEvent, TimelineData } from './TimelineFlowVisualization';

export interface AnalyzerOutput {
  file: string;
  totalLines: number;
  earliest: string;
  latest: string;
  durationMs: number;
  pluginMounts?: {
    byPlugin?: Record<string, any>;
  };
  sequences?: Record<string, any>;
  topics?: Record<string, any>;
  performance?: {
    gaps?: Array<{
      start: string;
      end: string;
      durationMs: number;
    }>;
    metrics?: Record<string, any>;
  };
}

/**
 * Convert analyzer output to timeline visualization data
 */
export function analyzerToTimelineData(analyzerData: AnalyzerOutput): TimelineData {
  const events: TimelineEvent[] = [];
  const baseTime = new Date(analyzerData.earliest).getTime();

  // 1. Add plugin mount events
  if (analyzerData.pluginMounts?.byPlugin) {
    Object.entries(analyzerData.pluginMounts.byPlugin).forEach(([pluginName, data]: [string, any]) => {
      if (data.successTimestamps && Array.isArray(data.successTimestamps)) {
        data.successTimestamps.forEach((timestamp: string, idx: number) => {
          const eventTime = new Date(timestamp).getTime() - baseTime;
          const duration = data.durations?.[idx] ?? 1;

          events.push({
            time: eventTime,
            duration: Math.max(duration, 1),
            name: `${pluginName}`,
            type: 'plugin',
            color: '#a855f7',
            details: {
              plugin: pluginName,
              timestamp,
            },
          });
        });
      }
    });
  }

  // 2. Add sequence events
  if (analyzerData.sequences) {
    Object.entries(analyzerData.sequences).forEach(([seqId, seqData]: [string, any]) => {
      if (seqData.timestamps && Array.isArray(seqData.timestamps) && seqData.timestamps.length > 0) {
        const startTime = new Date(seqData.timestamps[0]).getTime() - baseTime;
        const endTime =
          seqData.timestamps.length > 1
            ? new Date(seqData.timestamps[seqData.timestamps.length - 1]).getTime() - baseTime
            : startTime;
        const duration = Math.max(endTime - startTime, 1);

        events.push({
          time: startTime,
          duration,
          name: `Sequence ${seqId.slice(0, 8)}`,
          type: 'sequence',
          color: '#f43f5e',
          details: {
            sequenceId: seqId,
            beats: seqData.timestamps.length,
          },
        });
      }
    });
  }

  // 3. Add topic events
  if (analyzerData.topics) {
    Object.entries(analyzerData.topics).forEach(([topicName, topicData]: [string, any]) => {
      if (topicData.firstSeen && topicData.lastSeen) {
        const startTime = new Date(topicData.firstSeen).getTime() - baseTime;
        const endTime = new Date(topicData.lastSeen).getTime() - baseTime;
        const duration = Math.max(endTime - startTime, 1);

        events.push({
          time: startTime,
          duration,
          name: `Topic: ${topicName}`,
          type: 'topic',
          color: '#14b8a6',
          details: {
            topic: topicName,
            messages: topicData.count,
          },
        });
      }
    });
  }

  // 4. Add performance gaps
  if (analyzerData.performance?.gaps && Array.isArray(analyzerData.performance.gaps)) {
    analyzerData.performance.gaps.forEach(gap => {
      const startTime = new Date(gap.start).getTime() - baseTime;
      const duration = gap.durationMs;

      // Categorize gaps
      let gapType: TimelineEvent['type'] = 'gap';
      let gapColor = '#dc2626'; // Default red for gaps
      let gapName = `Gap (${(duration / 1000).toFixed(2)}s)`;

      // Highlight particularly long gaps as "blocked"
      if (duration > 5000) {
        gapType = 'blocked';
        gapColor = '#ef4444';
        gapName = `⚠️ React Block (${(duration / 1000).toFixed(2)}s)`;
      }

      events.push({
        time: startTime,
        duration,
        name: gapName,
        type: gapType,
        color: gapColor,
        details: {
          durationMs: duration,
          category: 'performance-gap',
        },
      });
    });
  }

  // Sort events by time
  events.sort((a, b) => a.time - b.time);

  return {
    events,
    totalDuration: analyzerData.durationMs,
    sessionStart: analyzerData.earliest,
    sessionEnd: analyzerData.latest,
  };
}

/**
 * Load analyzer JSON file and convert to timeline data
 */
export async function loadAnalyzerFile(file: File): Promise<TimelineData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = JSON.parse(e.target?.result as string);
        const timelineData = analyzerToTimelineData(content);
        resolve(timelineData);
      } catch (error) {
        reject(new Error(`Failed to parse analyzer file: ${error}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Create sample timeline data for demo/testing
 */
export function createSampleTimelineData(): TimelineData {
  return {
    events: [
      { time: 0, duration: 3073, name: 'System Init', type: 'init', color: '#6366f1' },
      { time: 3073, duration: 144, name: 'Header UI Theme Get', type: 'ui', color: '#f59e0b' },
      { time: 3217, duration: 78, name: 'Library Load', type: 'data', color: '#8b5cf6' },
      { time: 3295, duration: 379, name: 'Control Panel UI Init', type: 'ui', color: '#ec4899' },
      { time: 3674, duration: 2626, name: 'Gap', type: 'gap', color: '#dc2626' },
      { time: 6300, duration: 61, name: 'Library Load', type: 'data', color: '#8b5cf6' },
      { time: 6361, duration: 92, name: 'Control Panel UI Render', type: 'render', color: '#10b981' },
      { time: 6453, duration: 9771, name: 'Gap (no activity)', type: 'gap', color: '#dc2626' },
      { time: 16224, duration: 10, name: 'Library Component Drag', type: 'interaction', color: '#3b82f6' },
      { time: 16234, duration: 2843, name: 'Gap', type: 'gap', color: '#dc2626' },
      { time: 19077, duration: 14, name: 'Library Component Drop', type: 'interaction', color: '#3b82f6' },
      { time: 19091, duration: 2383, name: '⚠️ React Render Block', type: 'blocked', color: '#ef4444' },
      { time: 21474, duration: 58, name: 'Canvas Component Create', type: 'create', color: '#06b6d4' },
      { time: 21532, duration: 2359, name: 'Gap', type: 'gap', color: '#dc2626' },
      { time: 23891, duration: 10, name: 'Header UI Theme Toggle', type: 'ui', color: '#f59e0b' },
      { time: 23901, duration: 3985, name: 'Gap', type: 'gap', color: '#dc2626' },
      { time: 27886, duration: 14, name: 'Header UI Theme Toggle 2', type: 'ui', color: '#f59e0b' },
    ],
    totalDuration: 28353,
    sessionStart: '2025-11-10T21:56:16.932Z',
    sessionEnd: '2025-11-10T21:56:45.285Z',
  };
}
