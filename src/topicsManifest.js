// Static JSON import ensures synchronous availability for tests and early runtime callers
// @ts-ignore - JSON assertion supported by bundler / TS
import topicsManifestJson from '../topics-manifest.json' assert { type: 'json' };
let topics = topicsManifestJson?.topics || {};
let loaded = true;
// No-op to keep previous API surface
export async function initTopicsManifest() { }
export function getTopicDef(key) {
    return topics[key];
}
// test-only: allow injection of topics (maintain API)
export function __setTopics(map) {
    topics = map || {};
}
export function getTopicsManifestStats() { return { loaded, topicCount: Object.keys(topics).length }; }
//# sourceMappingURL=topicsManifest.js.map