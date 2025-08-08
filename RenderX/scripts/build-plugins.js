#!/usr/bin/env node
/**
 * RenderX Plugin Build Script (no-op for dev)
 *
 * In dev, plugins are served directly from public/plugins as ESM.
 * This script exists to satisfy `npm run dev` pre-step.
 */

console.log("🎼 RenderX build-plugins: Skipping build (serving from public/plugins)");
process.exit(0);

