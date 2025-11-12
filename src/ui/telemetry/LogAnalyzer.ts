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
  
  // Extract all timestamps in chronological order
  const timestampSet = new Set<string>();
  const pluginMounts: Record<string, any> = {};
  const sequences: Record<string, any> = {};
  const topics: Record<string, any> = {};

  // Pattern to match ISO timestamps
  const isoPattern = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/;

  lines.forEach((line) => {
    // Extract timestamp from this line
    const tsMatch = line.match(isoPattern);
    if (tsMatch) {
      timestampSet.add(tsMatch[1]);
    }

    // Extract plugin mounts (look for "✅ Plugin mounted successfully" or "Attempting to mount plugin")
    if (line.includes('Plugin mounted successfully') || line.includes('Attempting to mount plugin')) {
      const pluginMatch = line.match(/(?:plugin|Plugin)[\s:]*(\w+Plugin|\w+)/i);
      if (pluginMatch) {
        const pluginName = pluginMatch[1];
        if (!pluginMounts[pluginName]) {
          pluginMounts[pluginName] = {
            successTimestamps: [],
            durations: [],
          };
        }
        if (tsMatch) {
          pluginMounts[pluginName].successTimestamps.push(tsMatch[1]);
          pluginMounts[pluginName].durations.push(50); // Estimated duration
        }
      }
    }

    // Extract sequences (look for Registration/Validation lines with explicit names and optional IDs)
    if (
      line.includes('Registered sequence') ||
      line.includes('Sequence registered') ||
      line.includes('SequenceRegistry: Sequence')
    ) {
      // Prefer explicit "Registered sequence \"NAME\" (id: SOME-ID)"
      let seqName: string | null = null;
      let seqId: string | null = null;

      // Pattern 1: Registered sequence "NAME" (id: some-id)
      const regWithId = line.match(/Registered sequence\s+"([^"]+)"\s*\(id:\s*([^\)]+)\)/i);
      if (regWithId) {
        seqName = regWithId[1];
        seqId = regWithId[2].trim();
      }

      // Pattern 2: Registered sequence "NAME" (name only)
      if (!seqName) {
        const regNameOnly = line.match(/Registered sequence\s+"([^"]+)"/i);
        if (regNameOnly) {
          seqName = regNameOnly[1];
        }
      }

      // Pattern 3: Sequence registered: NAME (legacy phrasing)
      if (!seqName) {
        const legacyReg = line.match(/Sequence registered:\s*([^\"\']+)/i);
        if (legacyReg) {
          seqName = legacyReg[1].trim();
        }
      }

      // Pattern 4: Validation passed lines e.g. SequenceRegistry: Sequence "NAME" validation passed
      if (!seqName) {
        const validation = line.match(/Sequence\s+"([^"]+)"\s+validation\s+passed/i);
        if (validation) {
          seqName = validation[1];
        }
      }

      if (seqName) {
        // Derive ID if not present
        const derivedId = (seqId || seqName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        if (!sequences[derivedId]) {
          sequences[derivedId] = { timestamps: [], name: seqName, id: derivedId, count: 0 };
        }
        if (tsMatch) {
          const ts = tsMatch[1];
          sequences[derivedId].timestamps.push(ts);
          sequences[derivedId].count += 1;
        }
      }
    }

    // Extract topics (look for "EventBus: Subscribed" which indicates topic subscription)
    if (line.includes('EventBus: Subscribed to')) {
      const topicMatch = line.match(/Subscribed to ["']([^"']+)["']/);
      if (topicMatch) {
        const topicName = topicMatch[1];
        if (!topics[topicName]) {
          topics[topicName] = { firstSeen: null, lastSeen: null, count: 0 };
        }
        if (tsMatch) {
          const ts = tsMatch[1];
          if (!topics[topicName].firstSeen) {
            topics[topicName].firstSeen = ts;
          }
          topics[topicName].lastSeen = ts;
          topics[topicName].count++;
        }
      }
    }
  });

  // Convert set to sorted array
  const sortedTimestamps = Array.from(timestampSet).sort();

  // Calculate gaps from unique timestamps
  const gaps: Array<{ start: string; end: string; durationMs: number }> = [];
  if (sortedTimestamps.length > 1) {
    for (let i = 0; i < sortedTimestamps.length - 1; i++) {
      const current = new Date(sortedTimestamps[i]).getTime();
      const next = new Date(sortedTimestamps[i + 1]).getTime();
      const duration = next - current;

      // Record gaps > 500ms (significant delays)
      if (duration > 500) {
        gaps.push({
          start: sortedTimestamps[i],
          end: sortedTimestamps[i + 1],
          durationMs: duration,
        });
      }
    }
  }

  // Calculate session duration
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
