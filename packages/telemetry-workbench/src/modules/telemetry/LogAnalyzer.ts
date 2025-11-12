/**
 * In-browser log analyzer for parsing raw console logs (ported)
 */
import { AnalyzerOutput } from '../TimelineDataAdapter';

export function parseRawLogFile(logText: string): AnalyzerOutput {
  const lines = logText.split(/\r?\n/).filter(Boolean);
  const timestampSet = new Set<string>();
  const pluginMounts: Record<string, any> = {};
  const sequences: Record<string, any> = {};
  const topics: Record<string, any> = {};
  const isoPattern = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/;
  lines.forEach((line) => {
    const tsMatch = line.match(isoPattern);
    if (tsMatch) timestampSet.add(tsMatch[1]);
    if (line.includes('Plugin mounted successfully') || line.includes('Attempting to mount plugin')) {
      const pluginMatch = line.match(/(?:plugin|Plugin)[\s:]*(\w+Plugin|\w+)/i);
      if (pluginMatch) {
        const pluginName = pluginMatch[1];
        if (!pluginMounts[pluginName]) pluginMounts[pluginName] = { successTimestamps: [], durations: [] };
        if (tsMatch) { pluginMounts[pluginName].successTimestamps.push(tsMatch[1]); pluginMounts[pluginName].durations.push(50); }
      }
    }
    if (line.includes('Registered sequence') || line.includes('Sequence registered') || line.includes('SequenceRegistry: Sequence')) {
      let seqName: string | null = null; let seqId: string | null = null;
      const regWithId = line.match(/Registered sequence\s+"([^"]+)"\s*\(id:\s*([^\)]+)\)/i);
      if (regWithId) { seqName = regWithId[1]; seqId = regWithId[2].trim(); }
      if (!seqName) { const regNameOnly = line.match(/Registered sequence\s+"([^"]+)"/i); if (regNameOnly) seqName = regNameOnly[1]; }
      if (!seqName) { const legacyReg = line.match(/Sequence registered:\s*([^\"\']+)/i); if (legacyReg) seqName = legacyReg[1].trim(); }
      if (!seqName) { const validation = line.match(/Sequence\s+"([^"]+)"\s+validation\s+passed/i); if (validation) seqName = validation[1]; }
      if (seqName) {
        const derivedId = (seqId || seqName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        if (!sequences[derivedId]) sequences[derivedId] = { timestamps: [], name: seqName, id: derivedId, count: 0 };
        if (tsMatch) { const ts = tsMatch[1]; sequences[derivedId].timestamps.push(ts); sequences[derivedId].count += 1; }
      }
    }
    if (line.includes('EventBus: Subscribed to')) {
      const topicMatch = line.match(/Subscribed to ["']([^"']+)["']/);
      if (topicMatch) {
        const topicName = topicMatch[1];
        if (!topics[topicName]) topics[topicName] = { firstSeen: null, lastSeen: null, count: 0 };
        if (tsMatch) { const ts = tsMatch[1]; if (!topics[topicName].firstSeen) topics[topicName].firstSeen = ts; topics[topicName].lastSeen = ts; topics[topicName].count++; }
      }
    }
  });
  const sorted = Array.from(timestampSet).sort();
  const gaps: Array<{ start: string; end: string; durationMs: number }> = [];
  if (sorted.length > 1) {
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = new Date(sorted[i]).getTime();
      const next = new Date(sorted[i + 1]).getTime();
      const duration = next - current;
      if (duration > 500) gaps.push({ start: sorted[i], end: sorted[i + 1], durationMs: duration });
    }
  }
  const earliest = sorted[0] || new Date().toISOString();
  const latest = sorted[sorted.length - 1] || earliest;
  const durationMs = new Date(latest).getTime() - new Date(earliest).getTime();
  // Conform to AnalyzerOutput shape used by adapter
  return { earliest, latest, durationMs: Math.max(durationMs, 1), pluginMounts: { byPlugin: pluginMounts }, sequences, topics, performance: { gaps } };
}

export function detectFileType(content: string): 'log' | 'json' {
  try { JSON.parse(content); return 'json'; } catch { return 'log'; }
}

export async function loadAndParseFile(file: File): Promise<AnalyzerOutput> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const fileType = detectFileType(content);
        const analyzerOutput: AnalyzerOutput = fileType === 'json' ? JSON.parse(content) : parseRawLogFile(content);
        resolve(analyzerOutput);
      } catch (error) { reject(new Error(`Failed to process file: ${error}`)); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
