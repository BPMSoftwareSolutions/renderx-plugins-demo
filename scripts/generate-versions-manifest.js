// Generate a build versions manifest by scanning packages/* package.json files
// Writes to public/build-versions.json so the frontend can fetch it at runtime.

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function safeReadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function getCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function main() {
  const root = process.cwd();
  const packagesDir = path.resolve(root, 'packages');
  const outDir = path.resolve(root, 'public');
  const outPath = path.join(outDir, 'build-versions.json');

  const entries = [];
  try {
    for (const dirent of fs.readdirSync(packagesDir, { withFileTypes: true })) {
      if (!dirent.isDirectory()) continue;
      const pkgDir = path.join(packagesDir, dirent.name);
      const pkgJsonPath = path.join(pkgDir, 'package.json');
      if (!fs.existsSync(pkgJsonPath)) continue;
      const pkg = safeReadJson(pkgJsonPath);
      if (!pkg || !pkg.name || !pkg.version) continue;
      entries.push({ name: pkg.name, version: pkg.version });
    }
  } catch (e) {
    // ignore
  }

  const manifest = {
    builtAt: new Date().toISOString(),
    node: process.version,
    vite: undefined,
    commit: getCommitHash(),
    packages: entries.sort((a, b) => a.name.localeCompare(b.name)),
  };

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Wrote versions manifest: ${outPath}`);
}

main();

