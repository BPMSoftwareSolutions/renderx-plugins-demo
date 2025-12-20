#!/usr/bin/env node

/**
 * Sync script to copy json-sequences/ to public/json-sequences/
 * Also copies sequences declared by installed renderx plugin packages.
 */

import { readdir, readFile, writeFile, mkdir, stat } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");
const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.findIndex(a => a === name || a.startsWith(name + '='));
  if (i === -1) return def;
  const eq = args[i].indexOf('=');
  if (eq > -1) return args[i].slice(eq + 1);
  const nxt = args[i + 1];
  if (nxt && !nxt.startsWith('--')) return nxt;
  return def;
}
const srcRoot = getArg('--srcRoot', rootDir);
const outPublic = getArg('--outPublic', join(rootDir, 'public'));

const sourceDir = join(srcRoot, "json-sequences");
const targetDir = join(outPublic, "json-sequences");

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
}

async function copyFile(source, target) {
  const content = await readFile(source);
  await writeFile(target, content);
}

async function copyTreeWithBase(src, dst, baseLabel) {
  await ensureDir(dst);
  const entries = await readdir(src, { withFileTypes: true }).catch((err) => {
    console.log(`⚠️  Failed to read directory ${src}: ${err.message}`);
    return [];
  });
  console.log(`📂 Reading ${src}: found ${entries.length} entries`);
  for (const ent of entries) {
    const srcPath = join(src, ent.name);
    const dstPath = join(dst, ent.name);
    let isDir = ent.isDirectory();
    let isFile = ent.isFile();
    if (ent.isSymbolicLink && ent.isSymbolicLink()) {
      const s = await stat(srcPath).catch(()=>null);
      if (s) { isDir = s.isDirectory(); isFile = s.isFile(); }
    }
    if (isDir) {
      await copyTreeWithBase(srcPath, dstPath, baseLabel);
    } else if (isFile && ent.name.endsWith(".json")) {
      await copyFile(srcPath, dstPath);
      const rel = srcPath.replace(baseLabel + "\\", "").replace(baseLabel + "/", "");
      console.log(`  ✅ Copied ${rel}`);
    }
  }
}

async function syncJsonSequences() {
  console.log("🔄 Syncing json-sequences/ to public/json-sequences/...");
  try {
    await ensureDir(targetDir);
    // Guardrail: prevent repo from carrying local library-component catalogs once externalized
    try {
      const localLibCompDir = join(sourceDir, 'library-component');
      const s = await stat(localLibCompDir).catch(() => null);
      if (s && s.isDirectory()) {
        console.error('❌ Detected local json-sequences/library-component in the host repo. This plugin\'s catalogs must come from @renderx-plugins/library-component. Please remove json-sequences/library-component/.');
        process.exit(1);
      }
    } catch {}

    // Copy repo-local sequences first (catalog/json-sequences/)
    await copyTreeWithBase(sourceDir, targetDir, sourceDir);

    // Discover sequences from domain registry (renderx-web domain) - single source of truth
    const domainRegistryPath = join(rootDir, 'domains', 'renderx-web', 'domain-registry.json');
    let domainRegistry = null;
    try {
      const registryContent = await readFile(domainRegistryPath, 'utf-8');
      domainRegistry = JSON.parse(registryContent);
    } catch (err) {
      console.error(`❌ Failed to read domain registry at ${domainRegistryPath}: ${err.message}`);
      process.exit(1);
    }

    if (!domainRegistry || !domainRegistry.plugins) {
      console.error(`❌ Domain registry missing plugins configuration`);
      process.exit(1);
    }

    console.log(`📋 Using domain registry to discover plugins from: domains/renderx-web/`);

    // Process runtime plugins
    if (Array.isArray(domainRegistry.plugins.runtime)) {
      for (const plugin of domainRegistry.plugins.runtime) {
        if (plugin.sequences && plugin.sequences.catalog) {
          const catalogPath = plugin.sequences.catalog;
          // Resolve relative path from domain root
          const seqRoot = join(rootDir, 'domains', 'renderx-web', catalogPath.replace('/index.json', ''));
          const pkgName = plugin.package || plugin.id;
          const pluginId = plugin.id;
          console.log(`📦 Including sequences from ${pkgName} (domain runtime plugin)`);
          // Create plugin subdirectory in target
          const pluginTargetDir = join(targetDir, pluginId);
          // Check if seqRoot has a subdirectory with the same name as pluginId (skip it)
          const potentialSubdir = join(seqRoot, pluginId);
          const actualSeqRoot = await stat(potentialSubdir).then(() => potentialSubdir).catch(() => seqRoot);
          await copyTreeWithBase(actualSeqRoot, pluginTargetDir, actualSeqRoot);
        }
      }
    }

    // Process UI plugins
    if (Array.isArray(domainRegistry.plugins.ui)) {
      for (const plugin of domainRegistry.plugins.ui) {
        if (plugin.sequences && plugin.sequences.catalog) {
          const catalogPath = plugin.sequences.catalog;
          // Resolve relative path from domain root
          const seqRoot = join(rootDir, 'domains', 'renderx-web', catalogPath.replace('/index.json', ''));
          const pkgName = plugin.package || plugin.id;
          const pluginId = plugin.id;
          console.log(`📦 Including sequences from ${pkgName} (domain UI plugin)`);
          // Create plugin subdirectory in target
          const pluginTargetDir = join(targetDir, pluginId);
          // Check if seqRoot has a subdirectory with the same name as pluginId (skip it)
          const potentialSubdir = join(seqRoot, pluginId);
          const actualSeqRoot = await stat(potentialSubdir).then(() => potentialSubdir).catch(() => seqRoot);
          await copyTreeWithBase(actualSeqRoot, pluginTargetDir, actualSeqRoot);
        }
      }
    }

    console.log("✨ Synced json-sequences catalogs");
  } catch (error) {
    console.error("❌ Failed to sync json-sequences:", error);
    process.exit(1);
  }
}

syncJsonSequences();
