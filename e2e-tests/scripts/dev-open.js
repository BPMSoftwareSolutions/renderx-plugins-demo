#!/usr/bin/env node

// Minimal dev runner: builds are assumed done by npm script before this
// - Starts the E2E test server
// - Waits until it's ready
// - Launches Google Chrome (via Playwright) to /bundled
// - Keeps running until you close the browser window

const { spawn } = require('child_process');
const http = require('http');
const { chromium } = require('@playwright/test');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 3000;
const URL = `http://${HOST}:${PORT}/bundled`;

let serverProc;

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          retry();
        }
      });
      req.on('error', retry);
      req.setTimeout(3000, () => {
        req.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Server not ready after ${timeoutMs}ms`));
      } else {
        setTimeout(tryOnce, 500);
      }
    };
    tryOnce();
  });
}

async function main() {
  console.log('🎼 Dev: starting test server...');
  serverProc = spawn('node', ['server.js'], { stdio: 'inherit' });

  // Ensure server is stopped on exit
  const cleanup = () => {
    if (serverProc && !serverProc.killed) {
      console.log('\n🛑 Dev: stopping test server...');
      serverProc.kill();
    }
  };
  process.on('SIGINT', () => { cleanup(); process.exit(0); });
  process.on('SIGTERM', () => { cleanup(); process.exit(0); });
  process.on('exit', cleanup);

  console.log('⏳ Dev: waiting for server to be ready...');
  await waitForServer(`http://${HOST}:${PORT}/index-bundled.html`).catch(async (e) => {
    // Fallback to root if bundled path is not directly accessible yet
    await waitForServer(`http://${HOST}:${PORT}/`);
  });
  console.log('✅ Dev: server is ready');

  console.log('🌐 Dev: launching Chrome to', URL);
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(URL);

  console.log('🟢 Dev: App opened. Close the browser window to stop.');

  // Keep process alive until the browser closes
  await browser.on('disconnected', () => {
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('❌ Dev failed:', err);
  if (serverProc && !serverProc.killed) serverProc.kill();
  process.exit(1);
});

