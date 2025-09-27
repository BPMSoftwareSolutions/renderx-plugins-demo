/* @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react';
import { Simulate } from 'react-dom/test-utils';
import PluginTreeExplorer, { PluginInfo } from '../src/ui/PluginTreeExplorer';

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
    act(() => {
      root.render(<PluginTreeExplorer plugins={plugins} />);
    });
    const title = container.querySelector('.panel-title');
    expect(title?.textContent).toContain('Plugin Tree Explorer');
    const count = container.querySelector('.panel-badge');
    expect(count && count.textContent).toBe(String(plugins.length));
  });

  it('renders a search box', () => {
    act(() => {
      root.render(<PluginTreeExplorer plugins={plugins} />);
    });
    const input = container.querySelector('input.search-box') as HTMLInputElement;
    expect(!!input).toBe(true);
    // initial count reflects total plugins
    const count = container.querySelector('.panel-badge');
    expect(count && count.textContent).toBe(String(plugins.length));
  });

  it('invokes onSelectNode when clicking Info item', async () => {
    const onSelect = vi.fn();
    act(() => {
      root.render(<PluginTreeExplorer plugins={plugins} onSelectNode={onSelect} />);
    });

    const pluginHeader = Array.from(container.querySelectorAll('.expandable')).find(el => el.textContent?.trim().includes('plugin-canvas')) as HTMLElement;
    expect(!!pluginHeader).toBe(true);
    act(() => { pluginHeader.click(); });

    const infoLine = Array.from(container.querySelectorAll('.expandable')).find(el => el.textContent?.includes('Info')) as HTMLElement;
    expect(!!infoLine).toBe(true);
    act(() => { infoLine.click(); });

    expect(onSelect).toHaveBeenCalled();
  });
});

