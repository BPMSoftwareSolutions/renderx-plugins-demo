import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Smoke test: load app, verify conductor, capture browser console logs
// Run with a single project for speed: npx playwright test --project=chromium

test('RenderX app starts, exposes conductor, and logs are captured', async ({ page }) => {
  const allLogs: string[] = [];
  const conductorLogs: string[] = [];
  const conductorPattern = /🎼|MusicalConductor|ConductorCore|Communication System|EventBus|Sequence|Conductor/;

  page.on('console', (msg) => {
    const entry = `[${msg.type()}] ${msg.text()}`;
    allLogs.push(entry);
    if (conductorPattern.test(msg.text())) {
      conductorLogs.push(entry);
    }
  });

  await page.goto('/');

  // Wait for window.renderxCommunicationSystem.conductor to appear
  await page.waitForFunction(() => {
    // @ts-ignore
    return !!window.renderxCommunicationSystem?.conductor;
  }, { timeout: 20000 });

  const hasConductor = await page.evaluate(() => {
    // @ts-ignore
    return !!window.renderxCommunicationSystem?.conductor;
  });
  expect(hasConductor).toBeTruthy();

  // Write logs to files within the project directory
  const projectRoot = process.cwd();
  const allPath = path.join(projectRoot, 'renderx-browser-console.log');
  const conductorPath = path.join(projectRoot, 'renderx-conductor-console.log');
  fs.writeFileSync(allPath, allLogs.join('\n'), 'utf-8');
  fs.writeFileSync(conductorPath, conductorLogs.join('\n'), 'utf-8');

  // Also print a small summary line for CI visibility
  console.log(`🎼 Conductor console log entries captured: ${conductorLogs.length}`);
});
