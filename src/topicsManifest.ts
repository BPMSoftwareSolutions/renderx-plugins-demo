export interface TopicRoute { pluginId: string; sequenceId: string }
export interface TopicDef {
  routes: TopicRoute[];
  payloadSchema?: any;
  visibility?: 'public' | 'internal';
  correlationKeys?: string[];
  perf?: { throttleMs?: number; debounceMs?: number; dedupeWindowMs?: number };
  notes?: string;
}

// Static JSON import ensures synchronous availability for tests and early runtime callers
// @ts-ignore - JSON assertion supported by bundler / TS
import topicsManifestJson from '../topics-manifest.json' with { type: 'json' };

let topics: Record<string, TopicDef> = (topicsManifestJson as any)?.topics || {};
let loaded = true;

// No-op to keep previous API surface
export async function initTopicsManifest(): Promise<void> { /* already loaded */ }

export function getTopicDef(key: string): TopicDef | undefined {
  return topics[key];
}

// test-only: allow injection of topics (maintain API)
export function __setTopics(map: Record<string, TopicDef>) {
  topics = map || {};
}

export function getTopicsManifestStats() { return { loaded, topicCount: Object.keys(topics).length }; }
