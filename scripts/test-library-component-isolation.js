#!/usr/bin/env node

/**
 * Test script to verify LibraryComponentPlugin isolation
 * This script sets the whitelist and starts the dev server
 */

const { spawn } = require("child_process");
const path = require("path");

console.log("🎼 Starting isolated LibraryComponentPlugin test...");

// Set the whitelist environment variable
process.env.__RENDERX_ONLY_PLUGINS = "LibraryComponentPlugin";

console.log("🎼 Whitelisted plugins:", process.env.__RENDERX_ONLY_PLUGINS);

// Start the dev server
const viteProcess = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  cwd: path.dirname(__filename),
  env: { ...process.env, __RENDERX_ONLY_PLUGINS: "LibraryComponentPlugin" },
});

viteProcess.on("close", (code) => {
  console.log(`🎼 Dev server exited with code ${code}`);
});

viteProcess.on("error", (err) => {
  console.error("🎼 Failed to start dev server:", err);
});
