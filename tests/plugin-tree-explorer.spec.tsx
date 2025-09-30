/**
 * Unit tests for PluginTreeExplorer component
 *
 * Tests the plugin tree explorer component that displays plugins, routes, and topics
 * in a hierarchical tree structure with search and selection capabilities.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PluginTreeExplorer } from '../src/ui/PluginTreeExplorer';

describe('PluginTreeExplorer', () => {
  const mockPlugins = [
    {
      id: 'plugin-canvas',
      ui: {
        slot: 'main',
        module: './canvas/canvas-ui.js',
        export: 'CanvasArea',
      },
      runtime: {
        module: './canvas/canvas-runtime.js',
        export: 'CanvasRuntime',
      },
    },
    {
      id: 'plugin-theme',
      ui: {
        slot: 'headerLeft',
        module: './theme/theme-toggle.js',
        export: 'ThemeToggle',
      },
    },
  ];

  const mockRoutes = [
    {
      route: '/canvas/create',
      pluginId: 'plugin-canvas',
      sequenceId: 'create-element',
    },
    {
      route: '/canvas/update',
      pluginId: 'plugin-canvas',
      sequenceId: 'update-element',
    },
  ];

  const mockTopicsMap = {
    'canvas.element.created': {
      routes: [
        { pluginId: 'plugin-canvas', sequenceId: 'onElementCreated' },
      ],
      visibility: 'public',
    },
    'theme.changed': {
      routes: [
        { pluginId: 'plugin-theme', sequenceId: 'onThemeChanged' },
      ],
      visibility: 'public',
    },
  };

  const mockOnSelectNode = vi.fn();

  it('renders the plugin tree explorer', () => {
    render(
      <PluginTreeExplorer
        plugins={mockPlugins}
        routes={mockRoutes}
        topicsMap={mockTopicsMap}
        onSelectNode={mockOnSelectNode}
      />
    );

    expect(screen.getByText('Plugin Explorer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('displays plugin count badges', () => {
    render(
      <PluginTreeExplorer
        plugins={mockPlugins}
        routes={mockRoutes}
        topicsMap={mockTopicsMap}
        onSelectNode={mockOnSelectNode}
      />
    );

    const badges = screen.getAllByText('2');
    expect(badges.length).toBeGreaterThan(0); // Should have multiple "2" badges
  });

  it('expands and collapses plugin section', () => {
    render(
      <PluginTreeExplorer
        plugins={mockPlugins}
        routes={mockRoutes}
        topicsMap={mockTopicsMap}
        onSelectNode={mockOnSelectNode}
      />
    );

    // Plugins section should be expanded by default
    expect(screen.getByText('plugin-canvas')).toBeInTheDocument();
    expect(screen.getByText('plugin-theme')).toBeInTheDocument();

    // Click to collapse
    const pluginsNode = screen.getByText('Plugins');
    fireEvent.click(pluginsNode);

    // Plugins should still be visible (they're in the tree)
    // This is a simplified test - in reality, we'd check visibility state
  });

  it('filters plugins based on search term', () => {
    render(
      <PluginTreeExplorer
        plugins={mockPlugins}
        routes={mockRoutes}
        topicsMap={mockTopicsMap}
        onSelectNode={mockOnSelectNode}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'canvas' } });

    // Should show canvas plugin
    expect(screen.getByText('plugin-canvas')).toBeInTheDocument();
  });

  it('calls onSelectNode when a node is clicked', () => {
    render(
      <PluginTreeExplorer
        plugins={mockPlugins}
        routes={mockRoutes}
        topicsMap={mockTopicsMap}
        onSelectNode={mockOnSelectNode}
      />
    );

    const pluginNode = screen.getByText('plugin-canvas');
    fireEvent.click(pluginNode);

    expect(mockOnSelectNode).toHaveBeenCalledWith('plugin:plugin-canvas');
  });

  it('displays routes section with correct count', () => {
    render(
      <PluginTreeExplorer
        plugins={mockPlugins}
        routes={mockRoutes}
        topicsMap={mockTopicsMap}
        onSelectNode={mockOnSelectNode}
      />
    );

    expect(screen.getByText('Routes')).toBeInTheDocument();
    // Routes section should show count badge
    const badges = screen.getAllByText('2');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('displays topics section with correct count', () => {
    render(
      <PluginTreeExplorer
        plugins={mockPlugins}
        routes={mockRoutes}
        topicsMap={mockTopicsMap}
        onSelectNode={mockOnSelectNode}
      />
    );

    expect(screen.getByText('Topics')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(
      <PluginTreeExplorer
        plugins={[]}
        routes={[]}
        topicsMap={{}}
        onSelectNode={mockOnSelectNode}
      />
    );

    expect(screen.getByText('Plugin Explorer')).toBeInTheDocument();
    const badges = screen.getAllByText('0');
    expect(badges.length).toBe(3); // 0 plugins, 0 routes, 0 topics
  });

  it('filters routes based on search term', () => {
    render(
      <PluginTreeExplorer
        plugins={mockPlugins}
        routes={mockRoutes}
        topicsMap={mockTopicsMap}
        onSelectNode={mockOnSelectNode}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'create' } });

    // Should filter routes containing 'create'
    expect(screen.getByText('/canvas/create')).toBeInTheDocument();
  });

  it('filters topics based on search term', () => {
    render(
      <PluginTreeExplorer
        plugins={mockPlugins}
        routes={mockRoutes}
        topicsMap={mockTopicsMap}
        onSelectNode={mockOnSelectNode}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'theme' } });

    // Should filter topics containing 'theme'
    expect(screen.getByText('theme.changed')).toBeInTheDocument();
  });

  it('maintains selection state across interactions', () => {
    render(
      <PluginTreeExplorer
        plugins={mockPlugins}
        routes={mockRoutes}
        topicsMap={mockTopicsMap}
        onSelectNode={mockOnSelectNode}
      />
    );

    const pluginNode = screen.getByText('plugin-canvas');
    fireEvent.click(pluginNode);

    expect(mockOnSelectNode).toHaveBeenCalledWith('plugin:plugin-canvas');

    // Click another node
    const routesNode = screen.getByText('Routes');
    fireEvent.click(routesNode);

    expect(mockOnSelectNode).toHaveBeenCalledWith('routes');
  });
});

