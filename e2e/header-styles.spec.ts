import { test, expect } from '@playwright/test';

// E2E regression test: header buttons should have plugin CSS applied
// This catches cases where packaging/bundling drops the Header.css side-effect import
// and the UI falls back to unstyled native buttons (as seen in the screenshot).

test('header buttons are styled (Header.css applied)', async ({ page }) => {
  await page.goto('/');

  const toggle = page.getByTitle('Toggle Theme');
  await toggle.waitFor();

  // Wait for theme init to complete so [data-theme] is set
  await page.waitForFunction(() => {
    const v = document.documentElement.getAttribute('data-theme');
    return v === 'light' || v === 'dark';
  }, undefined, { timeout: 10_000 });

  // Ensure header action buttons exist
  const buttons = page.locator('.header-button');
  await expect(buttons).toHaveCount(3);

  // Validate computed styles for the first header button
  const firstBtn = buttons.first();
  const btnStyles = await firstBtn.evaluate((el) => {
    const cs = window.getComputedStyle(el as HTMLButtonElement);
    return {
      borderRadius: cs.borderRadius,
      backgroundColor: cs.backgroundColor,
      borderColor: cs.borderColor,
    };
  });

  // Border radius must match our design token
  expect(btnStyles.borderRadius).toBe('6px');

  // Background color must match one of the themed values
  // light: rgba(0, 0, 0, 0.05)
  // dark:  rgba(255, 255, 255, 0.1)
  expect([
    'rgba(0, 0, 0, 0.05)',
    'rgba(255, 255, 255, 0.1)'
  ]).toContain(btnStyles.backgroundColor);
});


test('theme toggle button is themed (background reflects current theme)', async ({ page }) => {
  await page.goto('/');

  const toggle = page.getByTitle('Toggle Theme');
  await toggle.waitFor();

  // Wait for initial theme
  await page.waitForFunction(() => {
    const v = document.documentElement.getAttribute('data-theme');
    return v === 'light' || v === 'dark';
  }, undefined, { timeout: 10_000 });

  // Read current theme and computed style
  const themeBefore = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const bgBefore = await toggle.evaluate((el) => getComputedStyle(el as HTMLButtonElement).backgroundColor);

  if (themeBefore === 'light') {
    // .header-theme-button background in light mode
    expect(bgBefore).toBe('rgb(31, 41, 55)'); // #1f2937
  } else {
    // .header-theme-button background in dark mode
    expect(bgBefore).toBe('rgb(245, 158, 11)'); // #f59e0b
  }

  // Toggle and re-check style switches accordingly
  await toggle.click();
  await page.waitForFunction(() => {
    const v = document.documentElement.getAttribute('data-theme');
    return v === 'light' || v === 'dark';
  }, undefined, { timeout: 10_000 });

  const themeAfter = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const bgAfter = await toggle.evaluate((el) => getComputedStyle(el as HTMLButtonElement).backgroundColor);

  if (themeAfter === 'light') {
    expect(bgAfter).toBe('rgb(31, 41, 55)');
  } else {
    expect(bgAfter).toBe('rgb(245, 158, 11)');
  }
});

