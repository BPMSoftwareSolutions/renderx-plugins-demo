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
  /** Optional array of raw events with absolute timestamps for fine-grained mapping */
  rawEvents?: Array<{
    timestamp: string; // ISO string
    type: string;
    name: string;
  }>;
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
 * Map plugin names to semantic operation types and colors
 */
const PLUGIN_TYPE_MAP: Record<string, { type: string; displayName: string; color: string }> = {
  Manager: { type: 'create', displayName: 'Component Create', color: '#06b6d4' },
  ControlPanel: { type: 'ui', displayName: 'Control Panel UI Init', color: '#ec4899' },
  DynamicTheme: { type: 'ui', displayName: 'Theme Manager', color: '#f59e0b' },
  HeaderComponent: { type: 'ui', displayName: 'Header UI Render', color: '#f59e0b' },
  LayoutManager: { type: 'create', displayName: 'Layout Manager Init', color: '#06b6d4' },
  SequenceCoordinator: { type: 'data', displayName: 'Sequence Coordinator', color: '#8b5cf6' },
  default: { type: 'create', displayName: 'Plugin Mount', color: '#a855f7' },
};

/**
 * Map topic names to semantic operation types and colors
 */
const TOPIC_TYPE_MAP: Record<string, { type: string; displayName: string; color: string }> = {
  // System initialization
  'app:initialized': { type: 'init', displayName: 'System Initialized', color: '#6366f1' },
  'symphony:initialized': { type: 'init', displayName: 'Symphony Initialized', color: '#6366f1' },

  // UI operations
  'app:ui:theme:toggle': { type: 'ui', displayName: 'Header UI Theme Toggle', color: '#f59e0b' },
  'app:ui:theme:get': { type: 'ui', displayName: 'Header UI Theme Get', color: '#f59e0b' },
  'app:ui:theme:notify': { type: 'ui', displayName: 'Theme Manager', color: '#f59e0b' },
  'theme:changed': { type: 'ui', displayName: 'Theme Changed', color: '#f59e0b' },
  'control-panel:ready': { type: 'ui', displayName: 'Control Panel UI Init', color: '#ec4899' },

  // Data/Library operations
  'library:components:load': { type: 'data', displayName: 'Library Load', color: '#8b5cf6' },
  'library:components:notify-ui': { type: 'data', displayName: 'Library Notify UI', color: '#8b5cf6' },

  // Canvas/Layout operations
  'canvas:component:resolve-template': { type: 'create', displayName: 'Canvas Template Resolve', color: '#06b6d4' },
  'canvas:component:register-instance': { type: 'create', displayName: 'Canvas Register', color: '#06b6d4' },
  'canvas:component:create': { type: 'create', displayName: 'Canvas Component Create', color: '#06b6d4' },
  'canvas:component:render-react': { type: 'render', displayName: 'Canvas React Render', color: '#10b981' },
  'canvas:component:notify-ui': { type: 'render', displayName: 'Canvas Notify UI', color: '#10b981' },

  // Beat/Movement events (render timing)
  'musical-conductor:beat:started': { type: 'render', displayName: 'Beat Started', color: '#10b981' },
  'musical-conductor:beat:completed': { type: 'render', displayName: 'Beat Completed', color: '#10b981' },
  'beat-started': { type: 'render', displayName: 'Beat Started', color: '#10b981' },
  'beat-completed': { type: 'render', displayName: 'Beat Completed', color: '#10b981' },
  'movement-started': { type: 'render', displayName: 'Movement Started', color: '#10b981' },
  'movement-completed': { type: 'render', displayName: 'Movement Completed', color: '#10b981' },

  // Sequence/Coordination events (marked as data since they're metadata)
  'LibraryPlugin:sequence:completed': { type: 'data', displayName: 'Library Sequence', color: '#8b5cf6' },
  'HeaderThemePlugin:sequence:completed': { type: 'ui', displayName: 'Header Sequence', color: '#f59e0b' },

  default: { type: 'data', displayName: 'Topic Event', color: '#14b8a6' },
};

/**
 * Map sequence names to semantic operation types and colors
 */
const SEQUENCE_TYPE_MAP: Record<string, { type: TimelineEvent['type']; displayName: string; color: string }> = {
  // Data/library
  'Library Load': { type: 'data', displayName: 'Library Load', color: '#8b5cf6' },

  // Header/UI
  'Header UI Theme Toggle': { type: 'ui', displayName: 'Header UI Theme Toggle', color: '#f59e0b' },
  'Header UI Theme Get': { type: 'ui', displayName: 'Header UI Theme Get', color: '#f59e0b' },

  // Canvas operations
  'Canvas Component Create': { type: 'create', displayName: 'Canvas Component Create', color: '#06b6d4' },
  'Canvas Component Update': { type: 'render', displayName: 'Canvas Component Update', color: '#10b981' },

  // Control Panel
  'Control Panel UI Init': { type: 'ui', displayName: 'Control Panel UI Init', color: '#ec4899' },
  'Control Panel UI Init (Batched)': { type: 'ui', displayName: 'Control Panel UI Init (Batched)', color: '#ec4899' },
  'Control Panel UI Render': { type: 'render', displayName: 'Control Panel UI Render', color: '#10b981' },
  'Control Panel UI Field Change': { type: 'ui', displayName: 'Control Panel Field Change', color: '#ec4899' },

  // Library interactions
  'Library Component Drag': { type: 'interaction', displayName: 'Library Component Drag', color: '#3b82f6' },
  'Library Component Drop': { type: 'interaction', displayName: 'Library Component Drop', color: '#3b82f6' },
  'Library Component Container Drop': { type: 'interaction', displayName: 'Library Container Drop', color: '#3b82f6' },

  // Default
  default: { type: 'sequence', displayName: 'Sequence', color: '#f43f5e' },
};

/**
 * Convert analyzer output to timeline visualization data
 * Includes semantic mapping to high-level operations
 */
export function analyzerToTimelineData(analyzerData: AnalyzerOutput): TimelineData {
  const events: TimelineEvent[] = [];
  const baseTime = new Date(analyzerData.earliest).getTime();

  // 1. Add plugin mount events with semantic mapping
  if (analyzerData.pluginMounts?.byPlugin) {
    Object.entries(analyzerData.pluginMounts.byPlugin).forEach(([pluginName, data]: [string, any]) => {
      if (data.successTimestamps && Array.isArray(data.successTimestamps)) {
        // Get semantic type mapping for this plugin
        const typeMapping = PLUGIN_TYPE_MAP[pluginName] || PLUGIN_TYPE_MAP.default;

        data.successTimestamps.forEach((timestamp: string, idx: number) => {
          const eventTime = new Date(timestamp).getTime() - baseTime;
          const duration = data.durations?.[idx] ?? 1;

          events.push({
            time: eventTime,
            duration: Math.max(duration, 1),
            name: `${typeMapping.displayName}`,
            type: typeMapping.type as TimelineEvent['type'],
            color: typeMapping.color,
            sourceTimestamp: new Date(timestamp).getTime(),
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

        const seqName: string | undefined = seqData.name || undefined;
        const mapping = (seqName && SEQUENCE_TYPE_MAP[seqName]) || SEQUENCE_TYPE_MAP.default;

        // Derive pins (beat markers). If we only have count and timestamps array, treat each timestamp as a beat position.
        let pins: TimelineEvent['pins'] | undefined;
        if (Array.isArray(seqData.timestamps) && seqData.timestamps.length > 0) {
          // If timestamps length > 1, map each to a pin offset (relative to first)
          if (seqData.timestamps.length > 1) {
            pins = seqData.timestamps.map((ts: string, idx: number) => {
              const pinAbs = new Date(ts).getTime();
              const pinOffset = pinAbs - new Date(seqData.timestamps[0]).getTime();
              return {
                offset: pinOffset,
                label: `Beat ${idx + 1}`,
                type: 'beat',
                color: '#f59e0b',
                sourceTimestamp: pinAbs,
              };
            });
          } else {
            // Single timestamp sequence: create a single pin at offset 0
            pins = [{ offset: 0, label: 'Beat 1', type: 'beat', color: '#f59e0b', sourceTimestamp: new Date(seqData.timestamps[0]).getTime() }];
          }
        }

        events.push({
          time: startTime,
          duration,
          name: mapping.displayName || (seqName ? seqName : `Sequence ${seqId.slice(0, 8)}`),
          type: mapping.type,
          color: mapping.color,
          sourceTimestamp: new Date(seqData.timestamps[0]).getTime(),
          details: {
            sequenceId: seqId,
            sequenceName: seqName || seqId,
            beats: seqData.timestamps.length,
            firstTimestamp: seqData.timestamps[0],
            lastTimestamp: seqData.timestamps[seqData.timestamps.length - 1],
          },
          pins,
        });
      }
    });
  }

  // 3. Add topic events with semantic mapping
  if (analyzerData.topics) {
    Object.entries(analyzerData.topics).forEach(([topicName, topicData]: [string, any]) => {
      if (topicData.firstSeen && topicData.lastSeen) {
        // Get semantic type mapping for this topic
        const typeMapping = TOPIC_TYPE_MAP[topicName] || TOPIC_TYPE_MAP.default;

        const startTime = new Date(topicData.firstSeen).getTime() - baseTime;
        const endTime = new Date(topicData.lastSeen).getTime() - baseTime;
        const duration = Math.max(endTime - startTime, 1);

        events.push({
          time: startTime,
          duration,
          name: typeMapping.displayName,
          type: typeMapping.type as TimelineEvent['type'],
          color: typeMapping.color,
          sourceTimestamp: new Date(topicData.firstSeen).getTime(),
          details: {
            topic: topicName,
            messages: topicData.count,
            firstSeen: topicData.firstSeen,
            lastSeen: topicData.lastSeen,
          },
        });
      }
    });
  }

  // 4. Add performance gaps with better categorization
  if (analyzerData.performance?.gaps && Array.isArray(analyzerData.performance.gaps)) {
    analyzerData.performance.gaps.forEach(gap => {
      const startTime = new Date(gap.start).getTime() - baseTime;
      const duration = gap.durationMs;

      // Categorize gaps by severity
      let gapType: TimelineEvent['type'] = 'gap';
      let gapColor = '#dc2626'; // Default red for gaps
      let gapName = `Gap`;

      // Highlight particularly long gaps as "blocked" (React or main thread)
      if (duration > 5000) {
        gapType = 'blocked';
        gapColor = '#ef4444';
        gapName = `⚠️ React Block (${(duration / 1000).toFixed(2)}s)`;
      } else if (duration > 2000) {
        gapType = 'gap';
        gapColor = '#dc2626';
        gapName = `Gap (${(duration / 1000).toFixed(2)}s)`;
      } else {
        gapType = 'gap';
        gapColor = '#fca5a5';
        gapName = `Gap (${(duration / 1000).toFixed(2)}s)`;
      }

      events.push({
        time: startTime,
        duration,
        name: gapName,
        type: gapType,
        color: gapColor,
        sourceTimestamp: new Date(gap.start).getTime(),
        details: {
          durationMs: duration,
          category: 'performance-gap',
          start: gap.start,
          end: gap.end,
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
