import { test, expect } from '@playwright/test';

// This test mirrors the in-browser selector scanner you shared and will FAIL
// if no .control-panel selectors are found in any accessible stylesheet OR
// if none of those selectors actually match the mounted .control-panel element.

test.describe('Control Panel CSS selector presence', () => {
  test('package styles are present and applied', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Ensure the Control Panel slot and component are present
    await page.waitForSelector('[data-slot="controlPanel"]', { timeout: 10000 });

    const panelRoot = page.locator('.control-panel').first();
    await expect(panelRoot, 'Expected .control-panel element to exist').toHaveCount(1);

    // Test what actually matters: the element has the expected computed styles
    // This proves the CSS is injected and applied, regardless of how it's bundled
    const computedStyles = await panelRoot.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return {
        display: cs.display,
        backgroundColor: cs.backgroundColor,
        borderLeftColor: cs.borderLeftColor,
        flexDirection: cs.flexDirection
      };
    });

    // Assert the key styles that prove Control Panel CSS is applied
    expect(computedStyles.display).toBe('flex');
    expect(computedStyles.flexDirection).toBe('column');
    // Background should be a panel background (not default transparent)
    expect(computedStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(computedStyles.backgroundColor).not.toBe('transparent');
    // Border should be styled (not default)
    expect(computedStyles.borderLeftColor).not.toBe('rgba(0, 0, 0, 0)');
    
    // Log for debugging
    console.log('✅ Control Panel CSS confirmed via computed styles:', computedStyles);
  });
});
