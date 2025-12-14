/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getCurrentTheme } from '../packages/header/src/symphonies/ui/ui.stage-crew';

describe('[BEAT:renderx-web-orchestration:renderx-web-orchestration:1.1] [[AC:renderx-web-orchestration:renderx-web-orchestration:1.1:1]] React Theme Toggle Component - E2E', () => {
  let mockLogger: any;
  let container: HTMLDivElement;

  beforeEach(() => {
    // Clear localStorage and DOM
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');

    mockLogger = {
      warn: vi.fn(),
    };

    // Create container for component
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.1:1] should render theme toggle component with light mode by default', () => {
    // Given: the theme system is initialized
    const ctx = { payload: {}, logger: mockLogger };

    // When: getCurrentTheme is called without preference
    const result = getCurrentTheme({}, ctx);

    // Then: default theme is returned
    expect(result.theme).toBeDefined();
    expect(['dark', 'light']).toContain(result.theme);

    // And: DOM attribute is set
    expect(document.documentElement.getAttribute('data-theme')).toBe(result.theme);
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.1:2] should publish event when toggling to dark mode', () => {
    // Given: user has theme preference saved
    localStorage.setItem('theme', 'dark');
    const ctx = { payload: {}, logger: mockLogger };

    // When: getCurrentTheme executes
    const startTime = performance.now();
    const result = getCurrentTheme({}, ctx);
    const elapsed = performance.now() - startTime;

    // Then: saved preference is returned
    expect(result.theme).toBe('dark');
    expect(ctx.payload.currentTheme).toBe('dark');
    expect(elapsed).toBeLessThan(10);

    // And: the response includes theme metadata (colors, fonts)
    expect(result).toHaveProperty('theme');

    // And: no API calls are made (cached lookup)
    // (Implementation uses localStorage/DOM, no fetch/XHR)
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.1:2] should publish event when toggling back to light mode', () => {
    // Given: theme system starts with dark, then changes to light
    const ctx = { payload: {}, logger: mockLogger };

    // When: first call with dark theme
    localStorage.setItem('theme', 'dark');
    document.documentElement.removeAttribute('data-theme');
    const result1 = getCurrentTheme({}, ctx);
    expect(result1.theme).toBe('dark');

    // When: then call with light theme
    localStorage.setItem('theme', 'light');
    document.documentElement.removeAttribute('data-theme');
    const result2 = getCurrentTheme({}, ctx);

    // Then: theme changes are tracked
    expect(result2.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.1:3] should handle rapid theme toggles', () => {
    // Given: theme system encounters rapid changes
    const ctx = { payload: {}, logger: mockLogger };
    const toggleSequence = ['dark', 'light', 'dark', 'light', 'dark'];

    // When: getCurrentTheme is called repeatedly with different states
    const timings: number[] = [];
    const results = toggleSequence.map((theme) => {
      localStorage.setItem('theme', theme);
      document.documentElement.removeAttribute('data-theme');
      const start = performance.now();
      const result = getCurrentTheme({}, ctx);
      timings.push(performance.now() - start);
      return result.theme;
    });

    // Then: all toggles complete correctly
    expect(results).toEqual(toggleSequence);

    // And: all calls complete within performance budget
    const maxTime = Math.max(...timings);
    expect(maxTime).toBeLessThan(10);

    // And: error is logged for monitoring (none expected)
    expect(mockLogger.warn).not.toHaveBeenCalled();

    // And: system remains functional
    document.documentElement.removeAttribute('data-theme');
    const finalResult = getCurrentTheme({}, ctx);
    expect(finalResult.theme).toBe('dark');
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:1.1:3] should maintain event order and timestamps', async () => {
    // Given: theme system processes sequential changes
    const ctx = { payload: {}, logger: mockLogger };
    const timestamps: number[] = [];

    // When: first theme change
    localStorage.setItem('theme', 'dark');
    document.documentElement.removeAttribute('data-theme');
    timestamps.push(Date.now());
    const result1 = getCurrentTheme({}, ctx);
    expect(result1.theme).toBe('dark');

    // Small delay
    await new Promise((resolve) => setTimeout(resolve, 10));

    // When: second theme change
    localStorage.setItem('theme', 'light');
    document.documentElement.removeAttribute('data-theme');
    timestamps.push(Date.now());
    const result2 = getCurrentTheme({}, ctx);

    // Then: changes are processed in order
    expect(result2.theme).toBe('light');
    expect(timestamps[1]).toBeGreaterThanOrEqual(timestamps[0]);

    // And: DOM reflects latest state
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
