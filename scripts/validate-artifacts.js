#!/usr/bin/env node
/**
 * Cross-manifest validator: schemaVersion consistency + pluginId references.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const artifactsDir = join(root, 'dist', 'artifacts');
function load(name) {
  try { return JSON.parse(readFileSync(join(artifactsDir, name),'utf-8')); } catch { return null; }
}
const interaction = load('interaction-manifest.json');
const topics = load('topics-manifest.json');
const layout = load('layout-manifest.json');
const manifestSet = load('manifest-set.json');

const schemaVersions = [interaction?.schemaVersion, topics?.schemaVersion, layout?.schemaVersion, manifestSet?.schemaVersion].filter(Boolean);
const uniqueSchema = Array.from(new Set(schemaVersions));
let failed = false;
if (uniqueSchema.length > 1) {
  console.error('❌ Inconsistent schemaVersion values:', uniqueSchema);
  failed = true;
}
const schemaVersion = uniqueSchema[0];
if (!schemaVersion) {
  console.error('❌ Missing schemaVersion in artifacts');
  failed = true;
}
// Collect pluginIds from sequences (interaction manifest) and topics manifest (if they embed plugin metadata)
const sequencePluginIds = new Set();
try {
  const routes = interaction?.routes || {};
  for (const r of Object.values(routes)) {
    // @ts-ignore
    if (r?.pluginId) sequencePluginIds.add(r.pluginId);
  }
} catch {}
// Plugin manifest (source or copied) for runtime plugin IDs
let pluginManifest = null;
try { pluginManifest = JSON.parse(readFileSync(join(root,'public','plugins','plugin-manifest.json'),'utf-8')); } catch {}
try { if (!pluginManifest) pluginManifest = JSON.parse(readFileSync(join(root,'json-plugins','plugin-manifest.json'),'utf-8')); } catch {}
const runtimePluginIds = new Set();
if (pluginManifest && Array.isArray(pluginManifest.plugins)) {
  for (const p of pluginManifest.plugins) runtimePluginIds.add(p.id);
}
// Report missing plugin sequence coverage
const missingSequences = Array.from(runtimePluginIds).filter(id => !Array.from(sequencePluginIds).some(seqId => seqId.toLowerCase().includes(id.replace(/plugin$/i,'').toLowerCase().replace(/[-]/g,''))));
if (missingSequences.length) {
  console.warn('⚠️ Plugins without obvious sequence coverage (heuristic):', missingSequences);
}
if (!failed) console.log('✅ Artifacts validation passed (schemaVersion', schemaVersion, ')');
process.exit(failed ? 1 : 0);
