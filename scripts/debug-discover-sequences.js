#!/usr/bin/env node

import { discoverSequenceFiles } from "./derive-external-topics.js";

async function main() {
  console.log("🔍 Discovering sequences...\n");

  const sequences = await discoverSequenceFiles();

  console.log(`\n📊 Found ${sequences.length} sequences\n`);

  // Group by plugin
  const byPlugin = {};
  for (const seq of sequences) {
    const plugin = seq.pluginId || 'unknown';
    if (!byPlugin[plugin]) byPlugin[plugin] = [];
    byPlugin[plugin].push(seq);
  }

  console.log("📋 Sequences by plugin:");
  for (const [plugin, seqs] of Object.entries(byPlugin).sort()) {
    console.log(`\n  ${plugin}: ${seqs.length} sequences`);
    for (const seq of seqs.slice(0, 3)) {
      console.log(`    - ${seq.file}`);
    }
    if (seqs.length > 3) {
      console.log(`    ... and ${seqs.length - 3} more`);
    }
  }
}

main().catch(console.error);

