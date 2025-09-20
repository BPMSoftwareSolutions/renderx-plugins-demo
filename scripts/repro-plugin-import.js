#!/usr/bin/env node

/**
 * Minimal, isolated repro for a single plugin import in the browser.
 * - Starts a local Vite dev server programmatically (force re-optimize)
 * - Opens a headless Chromium page and tries `await import(<pkg>)`
 * - Prints success/failure and exits 0/1 accordingly
 *
 * Usage:
 *   node scripts/repro-plugin-import.js @renderx-plugins/library
 *   node scripts/repro-plugin-import.js @renderx-plugins/header
 */

import { chromium } from "playwright";
import { createServer } from "vite";

const pkg = process.argv[2];
if (!pkg) {
  console.error("Usage: node scripts/repro-plugin-import.js <package-name>");
  process.exit(2);
}

async function main() {
  // 1) Start Vite dev server for this repo, with forced optimization
  const port = Number(process.env.PORT) || 5173;
  const server = await createServer({
    root: process.cwd(),
    server: { port, strictPort: true },
    optimizeDeps: { force: true },
    logLevel: "info",
  });

  await server.listen();
  const info = server.resolvedUrls;
  const url = info?.local?.[0] || `http://localhost:${port}/`;
  console.log(`🟢 Vite dev server up at ${url}`);

  // 2) Launch browser and attempt a direct import of the package
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on("console", (msg) => console.log(`[BROWSER] ${msg.text()}`));
  page.on("pageerror", (err) =>
    console.error(`[PAGE ERROR] ${err?.message || err}`)
  );

  try {
    await page.goto(url);
    await page.waitForLoadState("domcontentloaded");

    const result = await page.evaluate(async (packageName) => {
      try {
        const mod = await import(packageName);
        return { ok: true, exports: Object.keys(mod) };
      } catch (e) {
        return { ok: false, error: e?.message || String(e) };
      }
    }, pkg);

    if (result.ok) {
      console.log(`✅ Browser import succeeded for ${pkg}`);
      console.log(`   Exports: ${result.exports.join(", ")}`);
      await browser.close();
      await server.close();
      process.exit(0);
    } else {
      console.error(`❌ Browser import failed for ${pkg}`);
      console.error(`   Error: ${result.error}`);
      await browser.close();
      await server.close();
      process.exit(1);
    }
  } catch (e) {
    console.error("❌ Repro failed to run:", e?.message || e);
    await browser.close();
    await server.close();
    process.exit(1);
  }
}

main();
