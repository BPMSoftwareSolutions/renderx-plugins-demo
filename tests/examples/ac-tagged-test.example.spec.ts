/**
 * Example Test with AC Tags
 *
 * This file demonstrates proper usage of AC tagging helpers
 * for the AC-to-Test Alignment system.
 *
 * See docs/TEST_TAGGING_GUIDE.md for full documentation.
 */

import { describe, it, expect } from 'vitest';
import { acTag, beatTag, acDescription, beatDescription, Sequences } from '../helpers/ac-tags';

// Example 1: Using beatTag for describe block
describe(beatTag('create', '1.1'), () => {
  it(acTag('create', '1.1', 1) + ' should serialize component deterministically', () => {
    const component = { id: 'test-123', type: 'button' };
    const serialized = JSON.stringify(component);

    expect(serialized).toBe('{"id":"test-123","type":"button"}');
  });

  it(acTag('create', '1.1', 2) + ' should validate payload schema', () => {
    const payload = { id: 'test-123', type: 'button' };

    expect(payload).toHaveProperty('id');
    expect(payload).toHaveProperty('type');
  });

  it(acTag('create', '1.1', 3) + ' should complete within 20ms', () => {
    const start = performance.now();

    // Simulate operation
    const component = { id: 'test-123', type: 'button' };
    JSON.stringify(component);

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(20);
  });
});

// Example 2: Using helper functions with descriptions
describe(beatDescription('select', '1.1', 'Selection Overlay'), () => {
  it(acDescription('select', '1.1', 1, 'shows overlay within 30ms'), () => {
    // Mock overlay creation
    const startTime = performance.now();
    const overlay = document.createElement('div');
    overlay.id = 'selection-overlay';
    const duration = performance.now() - startTime;

    expect(overlay).toBeDefined();
    expect(duration).toBeLessThan(30);
  });

  it(acDescription('select', '1.1', 2, 'aligns within 1px precision'), () => {
    const componentBounds = { top: 100, left: 200, width: 50, height: 30 };
    const overlayBounds = { top: 100, left: 200, width: 50, height: 30 };

    const topDiff = Math.abs(overlayBounds.top - componentBounds.top);
    const leftDiff = Math.abs(overlayBounds.left - componentBounds.left);

    expect(topDiff).toBeLessThan(1);
    expect(leftDiff).toBeLessThan(1);
  });
});

// Example 3: Using Sequences constants
describe(beatTag(Sequences.EXPORT, '1.1'), () => {
  it(acTag(Sequences.EXPORT, '1.1', 1) + ' should collect all CSS classes', () => {
    const element = document.createElement('div');
    element.className = 'class1 class2 class3';

    const classes = Array.from(element.classList);

    expect(classes).toEqual(['class1', 'class2', 'class3']);
  });

  it(acTag(Sequences.EXPORT, '1.1', 2) + ' should discover components from DOM', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div data-component="button">Button 1</div>
      <div data-component="input">Input 1</div>
    `;

    const components = container.querySelectorAll('[data-component]');

    expect(components.length).toBe(2);
  });
});

// Example 4: Multiple ACs in one test (use sparingly)
describe(beatTag(Sequences.UI_THEME, '1.1'), () => {
  it(`${acTag(Sequences.UI_THEME, '1.1', 1)} ${acTag(Sequences.UI_THEME, '1.1', 2)} resolves and applies theme`, () => {
    // AC 1.1:1 - Resolve current theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    expect(['light', 'dark']).toContain(currentTheme);

    // AC 1.1:2 - Apply theme to document
    document.documentElement.setAttribute('data-theme', currentTheme);
    expect(document.documentElement.getAttribute('data-theme')).toBe(currentTheme);
  });
});

// Example 5: Type-safe tag builder
import { tagBuilder } from '../helpers/ac-tags';

describe('Tag Builder Example', () => {
  const createTags = tagBuilder().withSequence('create').withBeat('2.1');

  it(createTags.ac(1) + ' should copy payload to clipboard', () => {
    const payload = { data: 'test' };
    const serialized = JSON.stringify(payload);

    expect(serialized).toContain('test');
  });

  it(createTags.ac(2) + ' should notify user of copy success', () => {
    const notificationShown = true;

    expect(notificationShown).toBe(true);
  });
});
