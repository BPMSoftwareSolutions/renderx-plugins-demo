import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import PluginTreeExplorer, { PluginInfo } from './PluginTreeExplorer';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  if (root) {
    root.unmount();
  }
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
});

describe('PluginTreeExplorer', () => {
  const plugins: PluginInfo[] = [
    { id: 'plugin-canvas', ui: { slot: 'main', module: './m', export: 'E' }, runtime: { module: './r', export: 'R' } },
    { id: 'plugin-theme', ui: { slot: 'headerLeft', module: './t', export: 'T' } },
  ];

  it('renders header and plugin count', () => {
    root.render(<PluginTreeExplorer plugins={plugins} />);
    const title = container.querySelector('.panel-title');
    expect(title?.textContent).toContain('Plugin Tree Explorer');
    const count = container.querySelector('[data-testid="plugin-count"]');
    expect(count?.textContent).toBe(String(plugins.length));
  });

  it('filters plugins by search', async () => {
    root.render(<PluginTreeExplorer plugins={plugins} />);
    const input = container.querySelector('input.search-box') as HTMLInputElement;
    expect(input).toBeTruthy();
    input.value = 'theme';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    // plugin count should be 1
    const count = container.querySelector('[data-testid="plugin-count"]');
    expect(count?.textContent).toBe('1');
  });

  it('invokes onSelectNode when clicking Info item', async () => {
    const onSelect = vi.fn();
    root.render(<PluginTreeExplorer plugins={plugins} onSelectNode={onSelect} />);

    // Expand Plugins root (already expanded by default), then expand first plugin
    const pluginHeader = Array.from(container.querySelectorAll('.expandable')).find(el => el.textContent?.trim().includes('plugin-canvas')) as HTMLElement;
    expect(pluginHeader).toBeTruthy();
    pluginHeader.click();

    // Click Info line
    const infoLine = Array.from(container.querySelectorAll('.expandable')).find(el => el.textContent?.includes('Info')) as HTMLElement;
    expect(infoLine).toBeTruthy();
    infoLine.click();

    expect(onSelect).toHaveBeenCalled();
  });
});

