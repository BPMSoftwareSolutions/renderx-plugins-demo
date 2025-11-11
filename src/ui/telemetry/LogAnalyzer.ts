/**
 * In-browser log analyzer for parsing raw console logs
 * Extracts timestamps, plugins, sequences, topics, and performance gaps
 */

import { AnalyzerOutput } from './TimelineDataAdapter';

/**
 * Parse raw console log text and extract telemetry data
 */
export function parseRawLogFile(logText: string): AnalyzerOutput {
  const lines = logText.split(/\r?\n/).filter(Boolean);
  
  // Extract timestamps
  const timestamps: string[] = [];
  const pluginMounts: Record<string, any> = {};
  const sequences: Record<string, any> = {};
  const topics: Record<string, any> = {};
  const gaps: Array<{ start: string; end: string; durationMs: number }> = [];

  // Pattern to match ISO timestamps
  const isoPattern = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g;

  lines.forEach((line) => {
    // Extract all timestamps from this line
    const matches = line.matchAll(isoPattern);
    for (const match of matches) {
      timestamps.push(match[1]);
    }

    // Extract plugin mounts (look for __MC_PLUGIN patterns)
    if (line.includes('__MC_PLUGIN') || line.includes('Plugin mounted')) {
      const pluginMatch = line.match(/(?:__MC_PLUGIN|plugin)[\s:]*(\w+)/i);
      if (pluginMatch) {
        const pluginName = pluginMatch[1];
        if (!pluginMounts[pluginName]) {
          pluginMounts[pluginName] = {
            successTimestamps: [],
            durations: [],
          };
        }
        // Find timestamp on this line
        const tsMatch = line.match(isoPattern);
        if (tsMatch) {
          pluginMounts[pluginName].successTimestamps.push(tsMatch[0]);
          pluginMounts[pluginName].durations.push(1); // Default duration
        }
      }
    }

    // Extract sequences (look for sequence patterns)
    if (line.includes('sequence') || line.includes('Sequence')) {
      const seqMatch = line.match(/sequence[\s:]*([a-zA-Z0-9\-]+)/i);
      if (seqMatch) {
        const seqId = seqMatch[1];
        if (!sequences[seqId]) {
          sequences[seqId] = { timestamps: [] };
        }
        const tsMatch = line.match(isoPattern);
        if (tsMatch) {
          sequences[seqId].timestamps.push(tsMatch[0]);
        }
      }
    }

    // Extract topics (look for topic patterns)
    if (line.includes('topic') || line.includes('Topic')) {
      const topicMatch = line.match(/topic[\s:]*([a-zA-Z0-9\.\-_]+)/i);
      if (topicMatch) {
        const topicName = topicMatch[1];
        if (!topics[topicName]) {
          topics[topicName] = { firstSeen: null, lastSeen: null, count: 0 };
        }
        const tsMatch = line.match(isoPattern);
        if (tsMatch) {
          const ts = tsMatch[0];
          if (!topics[topicName].firstSeen) {
            topics[topicName].firstSeen = ts;
          }
          topics[topicName].lastSeen = ts;
          topics[topicName].count++;
        }
      }
    }
  });

  // Calculate gaps from timestamps
  if (timestamps.length > 1) {
    for (let i = 0; i < timestamps.length - 1; i++) {
      const current = new Date(timestamps[i]).getTime();
      const next = new Date(timestamps[i + 1]).getTime();
      const duration = next - current;

      // Only record significant gaps (>100ms)
      if (duration > 100) {
        gaps.push({
          start: timestamps[i],
          end: timestamps[i + 1],
          durationMs: duration,
        });
      }
    }
  }

  // Calculate session duration
  const sortedTimestamps = timestamps.sort();
  const earliest = sortedTimestamps[0] || new Date().toISOString();
  const latest = sortedTimestamps[sortedTimestamps.length - 1] || earliest;
  const durationMs = new Date(latest).getTime() - new Date(earliest).getTime();

  return {
    file: 'console-log',
    totalLines: lines.length,
    earliest,
    latest,
    durationMs: Math.max(durationMs, 1), // Ensure at least 1ms
    pluginMounts: { byPlugin: pluginMounts },
    sequences,
    topics,
    performance: { gaps, metrics: {} },
  };
}

/**
 * Attempt to detect if text is a raw log or pre-analyzed JSON
 */
export function detectFileType(content: string): 'log' | 'json' {
  try {
    JSON.parse(content);
    return 'json';
  } catch {
    return 'log';
  }
}

/**
 * Load and parse a file (either raw log or JSON)
 */
export async function loadAndParseFile(file: File): Promise<AnalyzerOutput> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const fileType = detectFileType(content);

        let analyzerOutput: AnalyzerOutput;
        if (fileType === 'json') {
          // Already analyzed JSON
          analyzerOutput = JSON.parse(content);
        } else {
          // Raw log file - parse it
          analyzerOutput = parseRawLogFile(content);
        }

        resolve(analyzerOutput);
      } catch (error) {
        reject(new Error(`Failed to process file: ${error}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
