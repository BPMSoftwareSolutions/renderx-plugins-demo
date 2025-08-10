import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * End-to-end interaction: run the actual app (via webServer),
 * drag a component from Element Library to Canvas, select it to show VisualTools,
 * and move it to a new location using pointer events.
 * Captures browser console logs and screenshots.
 */

test('Drag component to canvas, show VisualTools, and move it', async ({ page }) => {
  // Capture browser console logs
  const allLogs: string[] = [];
  const conductorLogs: string[] = [];
  const conductorPattern = /\uD83C\uDFBC|MusicalConductor|ConductorCore|Communication System|EventBus|Sequence|Conductor|Canvas|VisualTools|Library\./;

  page.on('console', (msg) => {
    const entry = `[${msg.type()}] ${msg.text()}`;
    allLogs.push(entry);
    if (conductorPattern.test(msg.text())) conductorLogs.push(entry);
  });

  // Open the app
  await page.goto('/');
  // Screenshot: initial app loaded
  await page.screenshot({ path: path.join(process.cwd(), 'renderx-drag-initial.png'), fullPage: false });

  // Wait for the Element Library to load items
  const libraryItem = page.locator('.element-library .element-item').first();
  await libraryItem.waitFor({ state: 'visible', timeout: 30000 });

  // Identify canvas drop target
  const canvas = page.locator('.canvas-content');
  await canvas.waitFor({ state: 'visible' });

  // Drag the first component from library to the canvas
  // Target a reasonable drop position within the canvas
  const canvasBox = await canvas.boundingBox();
  if (!canvasBox) throw new Error('Canvas bounding box not found');
  const targetPos = { x: canvasBox.x + 200, y: canvasBox.y + 200 };

  await libraryItem.dragTo(canvas, { force: true, targetPosition: { x: 200, y: 200 } });

  // Wait for a canvas element to appear
  const dropped = page.locator('.canvas-content [id^="rx-comp-"]').first();
  await dropped.waitFor({ state: 'visible', timeout: 20000 });

  // Record initial bounding box
  const before = await dropped.boundingBox();
  if (!before) throw new Error('Dropped element bounding box not found');

  // Click to select (should show VisualTools handles)
  await dropped.click();
  const handleSE = page.locator('.rx-resize-handle.rx-se');
  await expect(handleSE).toBeVisible({ timeout: 10000 });
  // Screenshot: selected element with VisualTools handles visible
  await page.screenshot({ path: path.join(process.cwd(), 'renderx-drag-selected.png'), fullPage: false });

  // Perform a pointer-based move: mouse down on element center, move to new location
  const startX = before.x + before.width / 2;
  const startY = before.y + before.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 120, startY + 80, { steps: 12 });
  await page.mouse.up();

  // Verify the element moved (in any direction)
  await page.waitForTimeout(300); // allow UI to update
  const after = await dropped.boundingBox();
  if (!after) throw new Error('After-move bounding box not found');
  const dx = after.x - before.x;
  const dy = after.y - before.y;
  console.log(`🎯 Element moved by dx=${dx}, dy=${dy}`);

  // Save screenshot and logs regardless of assertion outcome
  const projectRoot = process.cwd();
  const screenshotPath = path.join(projectRoot, 'renderx-drag-after.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const allPath = path.join(projectRoot, 'renderx-drag-session.log');
  const conductorPath = path.join(projectRoot, 'renderx-drag-conductor.log');
  fs.writeFileSync(allPath, allLogs.join('\n'), 'utf-8');
  fs.writeFileSync(conductorPath, conductorLogs.join('\n'), 'utf-8');

  // Emit a summary line so CI shows counts
  console.log(`🎼 Drag session complete. Conductor log entries: ${conductorLogs.length}`);

  // Assert a meaningful move occurred
  expect(Math.abs(dx)).toBeGreaterThan(5);
  expect(Math.abs(dy)).toBeGreaterThan(5);
});

