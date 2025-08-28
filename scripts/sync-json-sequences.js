#!/usr/bin/env node

/**
 * Sync script to copy json-sequences/ to public/json-sequences/
 * Ensures the dev server serves the latest sequence catalogs in the browser.
 */

import { readdir, readFile, writeFile, mkdir, stat } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const sourceDir = join(rootDir, "json-sequences");
const targetDir = join(rootDir, "public", "json-sequences");

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

async function copyTree(src, dst) {
  await ensureDir(dst);
  const entries = await readdir(src, { withFileTypes: true });
  for (const ent of entries) {
    const srcPath = join(src, ent.name);
    const dstPath = join(dst, ent.name);
    if (ent.isDirectory()) {
      await copyTree(srcPath, dstPath);
    } else if (ent.isFile() && ent.name.endsWith(".json")) {
      await copyFile(srcPath, dstPath);
      console.log(`  ✅ Copied ${srcPath.replace(sourceDir + "\\", "").replace(sourceDir + "/", "")}`);
    }
  }
}

async function syncJsonSequences() {
  console.log("🔄 Syncing json-sequences/ to public/json-sequences/...");
  try {
    await ensureDir(targetDir);
    await copyTree(sourceDir, targetDir);
    console.log("✨ Synced json-sequences catalogs");
  } catch (error) {
    console.error("❌ Failed to sync json-sequences:", error);
    process.exit(1);
  }
}

syncJsonSequences();

