import { test, expect } from '@playwright/test';

test.describe('Control Panel CSS injection', () => {
  test('package styles are present and applied', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Wait for control panel slot to mount
    await page.waitForSelector('[data-slot="controlPanel"]', { timeout: 10000 });
    // Wait for header element rendered by Control Panel component
    await page.waitForSelector('.control-panel-header', { timeout: 10000 });

    // 1) Check that the stylesheet with expected selector exists
    const hasRule = await page.evaluate(() => {
      const findRule = (cssText: string) => /\.control-panel-header\s*\{/.test(cssText) || /\.control-panel\s*\{/.test(cssText);
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          const cssRules = (sheet as CSSStyleSheet).cssRules || [];
          for (const rule of Array.from(cssRules) as any[]) {
            const text = (rule as CSSStyleRule).cssText || '';
            if (findRule(text)) return true;
          }
        } catch {
          // Cross-origin or constructed stylesheet without access
          continue;
        }
      }
      return false;
    });

    expect.soft(hasRule).toBe(true);

    // 2) Validate that computed styles reflect non-default styling from variables
    const header = page.locator('.control-panel-header').first();
    await expect(header).toBeVisible();

    const computed = await header.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return {
        padding: cs.padding,
        backgroundImage: cs.backgroundImage,
        backgroundColor: cs.backgroundColor,
        borderBottomColor: cs.borderBottomColor,
        hasSomeStyling: cs.padding !== '' && cs.padding !== '0px' && cs.borderBottomColor !== 'rgba(0, 0, 0, 0)'
      };
    });

    // Either background or border/padding should indicate CSS applied
    expect(computed.hasSomeStyling, `Expected styled header, got: ${JSON.stringify(computed)}`).toBe(true);
  });
});
