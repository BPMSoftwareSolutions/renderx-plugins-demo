#!/usr/bin/env node

/**
 * Compare plugin structure between original and current branches
 * Shows where json-sequences and json-topics should be located
 */

import { execSync } from "child_process";

const plugins = {
  "canvas-component": { type: "runtime", original: "packages" },
  "library-component": { type: "runtime", original: "packages" },
  "control-panel": { type: "ui", original: "packages" },
  "header": { type: "ui", original: "packages" },
  "library": { type: "ui", original: "packages" },
  "canvas": { type: "ui", original: "packages" },
  "real-estate-analyzer": { type: "plugin", original: "packages" }
};

function getOriginalPath(plugin, type) {
  return `packages/${plugin}/${type}`;
}

function getCurrentPath(plugin, pluginType) {
  if (pluginType === "runtime") {
    return `domains/renderx-web/runtime/${plugin}`;
  } else {
    return `domains/renderx-web/ui-plugins/${plugin}`;
  }
}

function countFilesInGit(path, branch = "e93ba6e1") {
  try {
    const output = execSync(`git show ${branch}:${path} 2>&1`, { encoding: "utf-8", stdio: "pipe" });
    const lines = output.split('\n');
    return lines.filter(l => l.trim().endsWith('.json')).length;
  } catch {
    return 0;
  }
}

console.log("📋 PLUGIN MIGRATION MAPPING\n");
console.log("Plugin".padEnd(25) + "Type".padEnd(12) + "Sequences".padEnd(12) + "Topics".padEnd(12) + "Status");
console.log("─".repeat(90));

for (const [plugin, info] of Object.entries(plugins)) {
  const origSeqPath = getOriginalPath(plugin, "json-sequences");
  const origTopicPath = getOriginalPath(plugin, "json-topics");
  
  const origSeqCount = countFilesInGit(origSeqPath);
  const origTopicCount = countFilesInGit(origTopicPath);
  
  const currentPath = getCurrentPath(plugin, info.type);
  const currentSeqPath = `${currentPath}/json-sequences`;
  const currentTopicPath = `${currentPath}/json-topics`;
  
  const currentSeqCount = countFilesInGit(currentSeqPath, "HEAD");
  const currentTopicCount = countFilesInGit(currentTopicPath, "HEAD");
  
  const seqStatus = origSeqCount > 0 ? (currentSeqCount > 0 ? "✅" : "❌ MISSING") : "—";
  const topicStatus = origTopicCount > 0 ? (currentTopicCount > 0 ? "✅" : "❌ MISSING") : "—";
  
  const status = `${seqStatus} / ${topicStatus}`;
  
  console.log(
    plugin.padEnd(25) +
    info.type.padEnd(12) +
    `${origSeqCount}→${currentSeqCount}`.padEnd(12) +
    `${origTopicCount}→${currentTopicCount}`.padEnd(12) +
    status
  );
}

console.log("\n📊 SUMMARY\n");
console.log("Original branch (e93ba6e1): All plugins in packages/");
console.log("Current branch (HEAD): Plugins split between domains/renderx-web/runtime/ and domains/renderx-web/ui-plugins/");
console.log("\nMissing files need to be copied from original branch to current structure.");

